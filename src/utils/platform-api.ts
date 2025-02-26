import { Capacitor } from '@capacitor/core'
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { readText } from '@tauri-apps/plugin-clipboard-manager'
import { Clipboard } from '@capacitor/clipboard'

export const IsTauri = '__TAURI_INTERNALS__' in window
export const IsCapacitor = Capacitor.isNativePlatform()

export const fetch = IsTauri ? tauriFetch : window.fetch
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
