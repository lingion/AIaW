import { registerPlugin } from '@capacitor/core'

export interface LocalFsHealthResult {
  ok: boolean
  plugin: string
}

export interface LocalFsPickDirectoryResult {
  uri: string
  name?: string
}

export interface LocalFsChildItem {
  name?: string
  uri: string
  isDirectory: boolean
  isFile: boolean
  canRead: boolean
  canWrite: boolean
  lastModified: number
  length: number
}

export interface LocalFsListChildrenResult {
  items: LocalFsChildItem[]
}

export interface LocalFsPlugin {
  health(): Promise<LocalFsHealthResult>
  pickDirectory(): Promise<LocalFsPickDirectoryResult>
  listChildren(options: { uri: string }): Promise<LocalFsListChildrenResult>
  readText(options: { uri: string, offset?: number, maxChars?: number }): Promise<{ content: string, offset: number, returnedChars: number, totalChars: number, hasMore: boolean }>
  writeText(options: { uri: string, content: string, append?: boolean }): Promise<{ ok: boolean }>
  createDirectory(options: { parentUri: string, name: string }): Promise<{ uri: string, name?: string }>
  createTextFile(options: { parentUri: string, name: string, content?: string }): Promise<{ uri: string, name?: string }>
  deleteDocument(options: { uri: string }): Promise<{ ok: boolean }>
  renameDocument(options: { uri: string, newName: string }): Promise<{ uri: string, name?: string }>
  copyDocument(options: { sourceUri: string, targetDirUri: string, newName?: string }): Promise<{ uri: string, name?: string }>
  moveDocument(options: { sourceUri: string, targetDirUri: string, newName?: string }): Promise<{ uri: string, name?: string }>
}

export const LocalFs = registerPlugin<LocalFsPlugin>('LocalFs')

const KEY = 'aiaw_localfs_dir_mount_v1'

export type LocalFsMountedDir = {
  uri: string
  name?: string
  mountedAt: number
}

export function getMountedDir(): LocalFsMountedDir | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveMountedDir(mount: LocalFsMountedDir | null) {
  if (!mount) localStorage.removeItem(KEY)
  else localStorage.setItem(KEY, JSON.stringify(mount))
}

export async function ensureMountedDir(): Promise<LocalFsMountedDir> {
  const existing = getMountedDir()
  if (existing?.uri) return existing
  const picked = await LocalFs.pickDirectory()
  const mount = { uri: picked.uri, name: picked.name, mountedAt: Date.now() }
  saveMountedDir(mount)
  return mount
}

export async function remountDir(): Promise<LocalFsMountedDir> {
  const picked = await LocalFs.pickDirectory()
  const mount = { uri: picked.uri, name: picked.name, mountedAt: Date.now() }
  saveMountedDir(mount)
  return mount
}

export function unmountDir() {
  saveMountedDir(null)
}
