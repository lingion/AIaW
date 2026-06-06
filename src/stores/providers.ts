import { Object as TObject } from '@sinclair/typebox'
import { defineStore } from 'pinia'
import { useLiveQuery } from 'src/composables/live-query'
import { db } from 'src/utils/db'
import { genId, removeDuplicates } from 'src/utils/functions'
import { CustomProvider, Provider, ProviderType } from 'src/utils/types'
import { ProviderTypes } from 'src/utils/values'
import { computed, Ref } from 'vue'
import { useI18n } from 'vue-i18n'

export const useProvidersStore = defineStore('providers', () => {
  const providers: Ref<CustomProvider[]> = useLiveQuery(() => db.providers.toArray(), { initialValue: [] })
  function createProvider(provider: Provider, options, stack) {
    if (provider.type.startsWith('custom:')) {
      const p = providers.value.find(p => `custom:${p.id}` === provider.type)
      return p && createCustomProvider(p, options, stack)
    } else {
      let settings = { ...provider.settings, ...options }
      // Restore apiKey from localStorage backup if missing
      if (settings.apiKey === undefined || settings.apiKey === '') {
        try {
          const keys = Object.keys(localStorage).filter(k => k.startsWith('provider-backup-'))
          for (const k of keys) {
            const backup = JSON.parse(localStorage.getItem(k))
            if (backup.apiKey) {
              settings = { ...settings, ...backup }
              break
            }
          }
        } catch {}
      }
      return ProviderTypes.find(pt => pt.name === provider.type)?.constructor(settings)
    }
  }
  function createCustomProvider(provider: CustomProvider, options, stack = []) {
    return (modelId: string, modelOptions) => {
      if (stack.includes(provider.id)) return null
      for (const subprovider of provider.subproviders) {
        if (!subprovider.provider) continue
        if (modelId in subprovider.modelMap) {
          const p = createProvider(subprovider.provider, options, [...stack, provider.id])
          return p?.(subprovider.modelMap[modelId], modelOptions)
        }
      }
      if (provider.fallbackProvider) {
        return createProvider(provider.fallbackProvider, options, [...stack, provider.id])?.(modelId, modelOptions)
      }
      return null
    }
  }
  async function getModelList(provider: Provider, stack = []): Promise<string[]> {
    if (provider.type.startsWith('custom:')) {
      const p = providers.value.find(p => `custom:${p.id}` === provider.type)
      return p && await getCustomModelList(p, stack)
    } else {
      const pt = ProviderTypes.find(pt => pt.name === provider.type)
      return pt?.getModelList ? await pt.getModelList(provider.settings) : []
    }
  }
  async function getCustomModelList(provider: CustomProvider, stack = []) {
    if (stack.includes(provider.id)) return []
    const list = provider.subproviders.map(sp => Object.keys(sp.modelMap)).flat()
    provider.fallbackProvider && list.push(...await getModelList(provider.fallbackProvider, [...stack, provider.id]))
    return removeDuplicates(list)
  }
  const providerTypes = computed<ProviderType[]>(() => [
    ...providers.value.map(p => ({
      name: `custom:${p.id}`,
      label: p.name,
      avatar: p.avatar,
      settings: TObject({}),
      initialSettings: {},
      constructor: options => createCustomProvider(p, options),
      getModelList: () => getCustomModelList(p)
    })),
    ...ProviderTypes
  ])
  const modelOptions = computed(() => {
    // Build list with provider info, deduplicate by name+providerId
    const all = providers.value.flatMap(p =>
      p.subproviders.flatMap(sp =>
        Object.keys(sp.modelMap).map(name => ({ name, providerId: p.id, providerName: p.name }))
      )
    )
    // Count how many providers offer each model name
    const nameCount: Record<string, number> = {}
    for (const m of all) { nameCount[m.name] = (nameCount[m.name] || 0) + 1 }
    // If a name appears in multiple providers, suffix with (ProviderName)
    return all.map(m => ({
      name: m.name,
      providerId: m.providerId,
      providerName: m.providerName,
      displayName: nameCount[m.name] > 1 ? `${m.name} (${m.providerName})` : m.name
    }))
  })
  const { t } = useI18n()
  async function add(props: Partial<CustomProvider> = {}) {
    return await db.providers.add({
      name: t('stores.providers.newProvider'),
      id: genId(),
      avatar: {
        type: 'icon',
        icon: 'sym_o_dashboard_customize',
        hue: Math.floor(Math.random() * 360)
      },
      subproviders: [],
      ...props
    })
  }

  async function update(id: string, changes) {
    return await db.providers.update(id, changes)
  }

  async function put(provider: CustomProvider) {
    return await db.providers.put(provider)
  }

  async function delete_(id: string) {
    return await db.providers.delete(id)
  }

  return {
    providers,
    providerTypes,
    modelOptions,
    createProvider,
    getModelList,
    add,
    update,
    put,
    delete: delete_
  }
})
