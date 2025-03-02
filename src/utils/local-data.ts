import { localReactive } from 'src/composables/local-reactive'

interface LocalData {
  lastReloadTimestamp: number | null
  visited: boolean
  language: 'en-US' | 'zh-CN' | 'zh-TW' | null
  ignoredUpdate: string
}

const localData = localReactive<LocalData>('local-data', {
  lastReloadTimestamp: null,
  visited: false,
  language: null,
  ignoredUpdate: null
})

export { localData }
