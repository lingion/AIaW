import { Capacitor } from '@capacitor/core'
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'

export const IsTauri = '__TAURI_INTERNALS__' in window
export const IsCapacitor = Capacitor.isNativePlatform()

export const fetch = IsTauri ? tauriFetch : window.fetch
