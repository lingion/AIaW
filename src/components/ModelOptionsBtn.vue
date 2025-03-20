<template>
  <q-btn
    icon="sym_o_page_info"
    :title="$t('modelOptionsBtn.modelOptions')"
    v-if="schema"
  >
    <q-menu
      anchor="top left"
      self="bottom left"
    >
      <json-input
        :schema
        v-model="options"
        component="item"
        lazy
        :item-props="{
          class: 'px-3 py-1'
        }"
      />
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { Boolean as TBoolean, Object as TObject, Optional, Unsafe } from '@sinclair/typebox'
import { computed, watch } from 'vue'
import JsonInput from './JsonInput.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  providerName: string
  modelId: string
}>()

const rules = [{
  match: (provider: string, model: string) => {
    return provider === 'openai.chat' && ['o1', 'o3-mini', 'o3-mini-2025-01-31'].includes(model)
  },
  options: {
    reasoningEffort: Optional(Unsafe({
      title: t('modelOptionsBtn.reasoningEffort'),
      type: 'string',
      enum: ['low', 'medium', 'high']
    }))
  }
}, {
  match: (provider: string, model: string) => {
    return provider === 'google.generative-ai' && /^gemini-2\.0-(flash|pro)(-(exp|latest|00\d))?$/.test(model)
  },
  options: {
    useSearchGrounding: Optional(TBoolean({ title: t('modelOptionsBtn.useSearchGrounding') }))
  }
}]

const options = defineModel<Record<string, any>>()

const schema = computed(() => {
  let options = {}
  const matched = rules.filter((rule) => rule.match(props.providerName, props.modelId))
  if (!matched.length) return null
  matched.forEach((rule) => {
    options = {
      ...options,
      ...rule.options
    }
  })
  return TObject(options)
})

watch(schema, () => {
  options.value = {}
})
</script>
