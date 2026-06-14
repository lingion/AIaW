import { db } from './db'
import { fetch as platformFetch } from './platform-api'

/**
 * Image cache layer: transparently caches external image URLs into IndexedDB
 * so that images embedded in markdown (e.g. MCP-generated image URLs with
 * short-lived TTLs) remain viewable and downloadable even after the source
 * URL expires.
 *
 * Flow:
 *   1. injectImageCache() scans rendered DOM for <img> with external src
 *   2. Fetches image → stores ArrayBuffer in Dexie `imageCache` table
 *   3. Replaces img.src with a blob: URL (in-memory, valid for page lifetime)
 *   4. On click, ViewImageDialog receives the cached arrayBuffer → download works
 */

// In-memory: original URL → { blobUrl, arrayBuffer, mimeType }
interface MemEntry {
  blobUrl: string
  arrayBuffer: ArrayBuffer
  mimeType: string
}
const memCache = new Map<string, MemEntry>()

// Reverse map: blobUrl → original URL (for click handler lookups)
const blobUrlToOriginal = new Map<string, string>()

const inFlight = new Map<string, Promise<MemEntry | null>>()

/** Only cache http/https URLs (skip data:, blob:, relative paths) */
export function isExternalImageUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

/**
 * Ensure an external image URL is cached. Returns the in-memory entry
 * (blobUrl + arrayBuffer) or null if caching failed.
 */
export async function ensureCached(url: string): Promise<MemEntry | null> {
  if (!isExternalImageUrl(url)) return null

  // Already in memory
  const existing = memCache.get(url)
  if (existing) return existing

  // Dedupe concurrent requests for the same URL
  const flight = inFlight.get(url)
  if (flight) return flight

  const promise = (async (): Promise<MemEntry | null> => {
    try {
      // Check IndexedDB first
      const dbEntry = await db.imageCache.get(url)
      if (dbEntry) {
        const blob = new Blob([dbEntry.contentBuffer], { type: dbEntry.mimeType })
        const blobUrl = URL.createObjectURL(blob)
        const entry: MemEntry = {
          blobUrl,
          arrayBuffer: dbEntry.contentBuffer,
          mimeType: dbEntry.mimeType
        }
        memCache.set(url, entry)
        blobUrlToOriginal.set(blobUrl, url)
        return entry
      }

      // Fetch from remote
      const response = await platformFetch(url)
      if (!response.ok) return null
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const mimeType = blob.type || 'image/png'

      // Store in IndexedDB
      await db.imageCache.put({
        url,
        contentBuffer: arrayBuffer,
        mimeType,
        cachedAt: Date.now()
      })

      const blobUrl = URL.createObjectURL(blob)
      const entry: MemEntry = { blobUrl, arrayBuffer, mimeType }
      memCache.set(url, entry)
      blobUrlToOriginal.set(blobUrl, url)
      return entry
    } catch {
      return null
    } finally {
      inFlight.delete(url)
    }
  })()

  inFlight.set(url, promise)
  return promise
}

/**
 * Get cached ArrayBuffer for a URL (or blob URL). Returns null if not cached.
 * Used by ViewImageDialog.downloadImage().
 */
export async function getCachedArrayBuffer(url: string): Promise<{ buffer: ArrayBuffer; mimeType: string } | null> {
  // If it's a blob URL from our cache
  const originalFromBlob = blobUrlToOriginal.get(url)
  if (originalFromBlob) {
    const entry = memCache.get(originalFromBlob)
    if (entry) return { buffer: entry.arrayBuffer, mimeType: entry.mimeType }
  }

  // Check memory cache by original URL
  const memEntry = memCache.get(url)
  if (memEntry) return { buffer: memEntry.arrayBuffer, mimeType: memEntry.mimeType }

  // Check IndexedDB
  try {
    const dbEntry = await db.imageCache.get(url)
    if (dbEntry) {
      return { buffer: dbEntry.contentBuffer, mimeType: dbEntry.mimeType }
    }
  } catch {}
  return null
}

/**
 * Get the original URL from a blob URL (reverse lookup).
 */
export function getOriginalUrl(blobUrl: string): string | undefined {
  return blobUrlToOriginal.get(blobUrl)
}

/**
 * Scan a DOM container for <img> elements with external src and replace
 * them with cached blob URLs. Called after markdown render completes.
 *
 * Also stores the original URL in a data attribute for click handler lookups.
 */
export async function injectImageCache(container: HTMLElement): Promise<void> {
  const imgs = container.querySelectorAll<HTMLImageElement>('img[src]')
  const externalImgs: HTMLImageElement[] = []

  imgs.forEach(img => {
    const src = img.getAttribute('src') || ''
    // Skip already-injected images (data-original-url set)
    if (img.dataset.originalUrl) return
    // Skip blob: and data: URLs (already local)
    if (!isExternalImageUrl(src)) return
    externalImgs.push(img)
  })

  for (const img of externalImgs) {
    const src = img.getAttribute('src')!
    img.dataset.originalUrl = src
    img.loading = 'lazy'

    ensureCached(src).then(entry => {
      if (entry) {
        // Only replace if the img hasn't been removed from DOM
        if (img.isConnected) {
          img.src = entry.blobUrl
        }
      }
      // If caching failed, leave original src (may still work if not expired yet)
    })
  }
}
