import { Capacitor } from '@capacitor/core'
import { fetch as tauriFetch } from './tauri-stream'
import { readText } from '@tauri-apps/plugin-clipboard-manager'
import { Clipboard } from '@capacitor/clipboard'
import { platform } from '@tauri-apps/plugin-os'
import { fetch as capFetch } from 'capacitor-stream-fetch'
import { exportFile as webExportFile } from 'quasar'
import { blobToBase64 } from './functions'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { ExportFile } from 'capacitor-export-file'
export const IsTauri = '__TAURI_INTERNALS__' in window
export const IsCapacitor = Capacitor.isNativePlatform()
export const IsWeb = !IsTauri && !IsCapacitor
export const TauriPlatform = IsTauri ? platform() : undefined
export const CapacitorPlatform = IsCapacitor ? Capacitor.getPlatform() : undefined

// capacitor-stream-fetch is not implemented on iOS; fall back to web fetch there.
export const fetch = IsTauri
  ? tauriFetch
  : IsCapacitor
    ? (CapacitorPlatform === 'ios' ? window.fetch.bind(window) : capFetch)
    : window.fetch.bind(window)

export async function clipboardReadText(): Promise<string> {
  if (IsTauri) {
    return await readText()
  } else if (IsCapacitor) {
    return (await Clipboard.read()).value
  } else {
    return navigator.clipboard.readText()
  }
}

// In this fork, mobile/desktop should not default users to the upstream web app.
export const PublicOrigin = location.origin

async function writeBlobInChunks(filename: string, blob: Blob) {
  const chunkSize = 256 * 1024
  let first = true
  for (let offset = 0; offset < blob.size; offset += chunkSize) {
    const chunk = blob.slice(offset, Math.min(offset + chunkSize, blob.size))
    const base64 = (await blobToBase64(chunk)).replace(/^data:.*,/, '')
    if (first) {
      await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Cache,
        recursive: true
      })
      first = false
    } else {
      await Filesystem.appendFile({
        path: filename,
        data: base64,
        directory: Directory.Cache
      })
    }
  }
}

export async function exportFile(filename, data: Blob | string | ArrayBuffer) {
  if (!IsCapacitor) return webExportFile(filename, data)

  // Write directly to Download/AiaW/ without prompting
  const filePath = `AiaW/${filename}`

  if (typeof data === 'string') {
    await Filesystem.writeFile({
      path: filePath,
      data,
      directory: Directory.Documents,
      recursive: true
    })
    return
  }

  // For Blob/ArrayBuffer: convert to base64 and write
  const blob = data instanceof Blob ? data : new Blob([data])
  const base64 = await blobToBase64(blob)
  await Filesystem.writeFile({
    path: filePath,
    data: base64,
    directory: Directory.Documents,
    recursive: true
  })
}
