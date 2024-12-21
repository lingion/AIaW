import { defineStore } from 'pinia'
import { Dark, extend } from 'quasar'
import { persistentReactive } from 'src/composables/persistent-reactive'
import { Avatar, Model, PlatformEnabled, Provider, ShortcutKey } from 'src/utils/types'
import { models } from 'src/utils/values'
import { watchEffect } from 'vue'

interface Perfs {
  darkMode: boolean | 'auto'
  themeHue: number
  provider: Provider
  model: Model
  systemProvider: Provider
  systemModel: Model
  userAvatar: Avatar
  commonModelOptions: string[]
  autoGenTitle: boolean
  sendKey: 'ctrl+enter' | 'shift+enter' | 'enter'
  messageQuoteBtn: boolean
  codePasteOptimize: boolean
  dialogScrollBtn: PlatformEnabled
  enableShortcutKey: PlatformEnabled
  scrollUpKey: ShortcutKey
  scrollDownKey: ShortcutKey
  scrollTopKey: ShortcutKey
  scrollBottomKey: ShortcutKey
  switchPrevKey: ShortcutKey
  switchNextKey: ShortcutKey
  switchFirstKey: ShortcutKey
  switchLastKey: ShortcutKey
}

export const useUserPerfsStore = defineStore('user-perfs', () => {
  const defaultPerfs: Perfs = {
    darkMode: 'auto',
    themeHue: 300,
    provider: null,
    model: models.find(m => m.name === 'gpt-4o'),
    systemProvider: null,
    systemModel: models.find(m => m.name === 'gpt-4o-mini'),
    userAvatar: {
      type: 'text',
      text: 'U',
      hue: 300
    },
    commonModelOptions: [
      'gpt-4o',
      'gpt-4o-2024-08-06',
      'gpt-4o-mini',
      'o1-mini',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ],
    autoGenTitle: true,
    sendKey: 'ctrl+enter',
    messageQuoteBtn: true,
    codePasteOptimize: true,
    dialogScrollBtn: 'always',
    enableShortcutKey: 'desktop-only',
    scrollUpKey: { key: 'ArrowUp' },
    scrollDownKey: { key: 'ArrowDown' },
    scrollTopKey: { key: 'ArrowUp', withShift: true },
    scrollBottomKey: { key: 'ArrowDown', withShift: true },
    switchPrevKey: { key: 'ArrowLeft' },
    switchNextKey: { key: 'ArrowRight' },
    switchFirstKey: { key: 'ArrowLeft', withShift: true },
    switchLastKey: { key: 'ArrowRight', withShift: true }
  }
  const [perfs, ready] = persistentReactive('#user-perfs', { ...defaultPerfs })
  watchEffect(() => {
    Dark.set(perfs.darkMode)
  })
  function restore() {
    extend(true, perfs, defaultPerfs)
  }
  return { perfs, ready, restore }
})
