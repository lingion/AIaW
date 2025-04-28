import { Object as TObject } from '@sinclair/typebox'
import { defineStore } from 'pinia'
import { useLiveQuery } from 'src/composables/live-query'
import { db } from 'src/utils/db'
import { genId, removeDuplicates } from 'src/utils/functions'
import { CustomProvider, Provider, ProviderType } from 'src/utils/types'
import { modelOptions as baseModelOptions, ProviderTypes } from 'src/utils/values'
import { computed, Ref } from 'vue'
import { useI18n } from 'vue-i18n'

export const useProvidersStore = defineStore('providers', () => {
  const providers: Ref<CustomProvider[]> = useLiveQuery(() => db.providers.toArray(), { initialValue: [] })
  function createProvider(provider: Provider, options, stack) {
    if (provider.type.startsWith('custom:')) {
      const p = providers.value.find(p => `custom:${p.id}` === provider.type)
      return p && createCustomProvider(p, options, stack)
    } else {
      return ProviderTypes.find(pt => pt.name === provider.type)?.constructor({ ...provider.settings, ...options })
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
  const modelOptions = computed(() => removeDuplicates([
    ...baseModelOptions,
    ...providers.value.flatMap(p => p.subproviders.flatMap(sp => Object.keys(sp.modelMap)))
  ]))
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
    add,
    update,
    put,
    delete: delete_
  }
})
