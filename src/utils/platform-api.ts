import { Capacitor } from '@capacitor/core'
import { fetch as tauriFetch } from './tauri-stream'
import { readText } from '@tauri-apps/plugin-clipboard-manager'
import { Clipboard } from '@capacitor/clipboard'
import { platform } from '@tauri-apps/plugin-os'
import { fetch as capFetch } from 'capacitor-stream-fetch'

export const IsTauri = '__TAURI_INTERNALS__' in window
export const IsCapacitor = Capacitor.isNativePlatform()
export const IsWeb = !IsTauri && !IsCapacitor
export const TauriPlatform = IsTauri ? platform() : undefined

export const fetch = IsTauri ? tauriFetch : IsCapacitor ? capFetch : window.fetch

export async function clipboardReadText(): Promise<string> {
  if (IsTauri) {
    return await readText()
  } else if (IsCapacitor) {
    return (await Clipboard.read()).value
  } else {
    return navigator.clipboard.readText()
  }
}

export const PublicOrigin = IsTauri || IsCapacitor ? 'https://aiaw.app' : location.origin
