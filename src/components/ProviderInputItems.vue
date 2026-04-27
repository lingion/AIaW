<template>
  <q-item>
    <q-item-section>
      <q-item-label>
        {{ label || $t('providerInputItems.provider') }}
      </q-item-label>
      <q-item-label
        caption
        v-if="caption"
      >
        {{ caption }}
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-select
        class="w-200px"
        :model-value="provider?.type"
        @update:model-value="switchProvider"
        :options="providerOptions"
        emit-value
        map-options
        filled
        dense
        clearable
      >
        <template #option="{ opt, itemProps }">
          <q-item
            v-bind="itemProps"
            min-h-0
          >
            <q-item-section
              avatar
              min-w-0
              pr-2
            >
              <a-avatar
                size="24px"
                :avatar="allProviderTypes.find(p => p.name === opt.value)?.avatar || fallbackAvatar(opt.value)"
              />
            </q-item-section>
            <q-item-section>{{ opt.label }}</q-item-section>
          </q-item>
        </template>
      </q-select>
    </q-item-section>
  </q-item>
  <json-input
    v-if="provider && providerType"
    :schema="providerType.settings"
    v-model="provider.settings"
    component="item"
    lazy
    :context="{
      secretScope: provider.type,
      secretLabelPrefix: providerType.label
    }"
    :input-props="{
      clearable: true
    }"
  />
</template>

<script setup lang="ts">
import JsonInput from './JsonInput.vue'
import { Provider } from 'src/utils/types'
import AAvatar from 'src/components/AAvatar.vue'
import { computed } from 'vue'
import { useProvidersStore } from 'src/stores/providers'
import { Object as TObject, String as TString } from '@sinclair/typebox'

defineProps<{
  label?: string
  caption?: string
}>()

const provider = defineModel<Provider>()
const store = useProvidersStore()

const preferredOrder = [
  'openai-compatible',
  'openai',
  'openai-responses',
  'anthropic',
  'google',
  'minimax',
  'cerebras',
  'openrouter',
  'deepseek',
  'xai',
  'groq',
  'cohere',
  'togetherai',
  'azure',
  'mistral',
  'ollama',
  'burncloud'
]

function fallbackAvatar(type: string) {
  if (type === 'openai-compatible') return { type: 'svg', name: 'openai', hue: 210 }
  return { type: 'icon', icon: 'sym_o_api' }
}

const fallbackOpenAICompatible = {
  name: 'openai-compatible',
  label: 'OpenAI Compatible',
  avatar: { type: 'svg', name: 'openai', hue: 210 },
  settings: TObject({
    baseURL: TString({ title: 'API Address' }),
    apiKey: TString({ title: 'API Key', format: 'password' })
  }),
  initialSettings: {
    baseURL: 'https://api.openai.com/v1'
  }
}

const allProviderTypes = computed(() => {
  const list = [...store.providerTypes]
  if (!list.some(p => p.name === 'openai-compatible')) {
    list.unshift(fallbackOpenAICompatible as any)
  }
  return list
})

const providerOptions = computed(() => {
  const all = allProviderTypes.value.map(p => ({
    label: p.label,
    value: p.name
  }))

  if (!all.some(p => p.value === 'openai-compatible')) {
    all.unshift({
      label: 'OpenAI Compatible',
      value: 'openai-compatible'
    })
  }

  return all.slice().sort((a, b) => {
    const ai = preferredOrder.indexOf(a.value)
    const bi = preferredOrder.indexOf(b.value)
    if (ai === -1 && bi === -1) return a.label.localeCompare(b.label)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
})

const providerType = computed(() => allProviderTypes.value.find(p => p.name === provider.value?.type))
function switchProvider(type: string) {
  if (type) {
    const matched = allProviderTypes.value.find(p => p.name === type)
    if (matched) {
      provider.value = { type, settings: { ...matched.initialSettings } }
    }
  } else {
    provider.value = null
  }
}
</script>
