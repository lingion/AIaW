<template>
  <q-btn
    icon="sym_o_page_info"
    :title="$t('providerOptionsBtn.providerOptions')"
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
        :input-props="{
          filled: false,
          class: 'min-w-80px'
        }"
      />
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { Boolean as TBoolean, Object as TObject, Number as TNumber, Optional, Unsafe } from '@sinclair/typebox'
import { computed, ref, watchEffect } from 'vue'
import JsonInput from './JsonInput.vue'
import { useI18n } from 'vue-i18n'
import { google } from '@ai-sdk/google'
import { inputValueEmpty, mergeObjects } from 'src/utils/functions'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'

const { t } = useI18n()

const props = defineProps<{
  providerName: string
  modelId: string
}>()

interface Rule {
  match: (provider: string, model: string) => boolean
  options: Record<string, any>
  default: Record<string, any>
  exec: (options: Record<string, any>) => { providerOptions: Record<string, any>, tools: Record<string, any> }
}

const rules: Rule[] = [{
  match: (provider: string, model: string) =>
    provider.startsWith('openai.responses') &&
    (model.startsWith('o3') || model.startsWith('o4') || model.startsWith('gpt-5') || model === 'o1'),
  options: {},
  default: {},
  exec: () => ({
    providerOptions: {
      openai: {
        reasoningSummary: 'auto'
      }
    },
    tools: {}
  })
}, {
  match: (provider: string) => provider.startsWith('openai.responses'),
  options: {
    webSearch: Optional(TBoolean({ title: t('providerOptionsBtn.webSearch') })),
    codeExecution: Optional(TBoolean({ title: t('providerOptionsBtn.codeExecution') })),
    textVerbosity: Optional(Unsafe({
      title: t('providerOptionsBtn.textVerbosity'),
      type: 'string',
      enum: ['low', 'medium', 'high']
    }))
  },
  default: {
    textVerbosity: 'medium'
  },
  exec: options => {
    const { webSearch, codeExecution, textVerbosity } = options
    const tools: Record<string, any> = {}
    if (webSearch) tools.web_search_preview = openai.tools.webSearchPreview({})
    if (codeExecution) tools.code_interpreter = openai.tools.codeInterpreter({})

    return {
      providerOptions: {
        openai: {
          textVerbosity
        }
      },
      tools
    }
  }
}, {
  match: (provider: string, model: string) =>
    (provider.startsWith('openai.') || provider.startsWith('openai-compatible.')) &&
    (model.startsWith('o3') || model.startsWith('o4') || model.startsWith('gpt-5') || model === 'o1'),
  options: {
    reasoningEffort: Optional(Unsafe({
      title: t('providerOptionsBtn.reasoningEffort'),
      type: 'string',
      enum: ['low', 'medium', 'high']
    }))
  },
  default: {},
  exec: ({ reasoningEffort }) => {
    return {
      providerOptions: {
        openai: { reasoningEffort },
        'openai-compatible': { reasoningEffort }
      },
      tools: {}
    }
  }
}, {
  match: (provider: string, model: string) => provider.startsWith('google.') && /^gemini-2\.[05]/.test(model),
  options: {
    webSearch: Optional(TBoolean({ title: t('providerOptionsBtn.webSearch') })),
    codeExecution: Optional(TBoolean({ title: t('providerOptionsBtn.codeExecution') })),
    urlContext: Optional(TBoolean({ title: t('providerOptionsBtn.urlContext') })),
    thinkingBudget: Optional(TNumber({ title: t('providerOptionsBtn.thinkingBudget') }))
  },
  default: {},
  exec: options => {
    const tools: Record<string, any> = {}
    if (options.webSearch) tools.google_search = google.tools.googleSearch({})
    if (options.codeExecution) tools.code_execution = google.tools.codeExecution({})
    if (options.urlContext) tools.url_context = google.tools.urlContext({})

    const googleOptions: Record<string, any> = {
      thinkingConfig: {
        includeThoughts: true
      }
    }
    if (!inputValueEmpty(options.thinkingBudget)) {
      googleOptions.thinkingConfig.thinkingBudget = options.thinkingBudget
    }
    return {
      providerOptions: {
        google: googleOptions
      },
      tools
    }
  }
}, {
  match: (provider: string, model: string) =>
    provider.startsWith('anthropic.') &&
    (model.startsWith('claude-opus-4') || model.startsWith('claude-sonnet-4') || model.startsWith('claude-3-7')),
  options: {
    webSearch: Optional(TBoolean({ title: t('providerOptionsBtn.webSearch') })),
    codeExecution: Optional(TBoolean({ title: t('providerOptionsBtn.codeExecution') })),
    extendedThinking: Optional(TBoolean({ title: t('providerOptionsBtn.extendedThinking') })),
    thinkingBudget: Optional(TNumber({ title: t('providerOptionsBtn.thinkingBudget'), default: 32000 }))
  },
  default: {},
  exec: options => {
    const tools: Record<string, any> = {}
    if (options.webSearch) tools.web_search = anthropic.tools.webSearch_20250305()
    if (options.codeExecution) tools.code_execution = anthropic.tools.codeExecution_20250522()

    const anthropicOptions: Record<string, any> = {}
    if (options.extendedThinking) {
      anthropicOptions.thinking = {
        type: 'enabled',
        budgetTokens: inputValueEmpty(options.thinkingBudget) ? 32000 : options.thinkingBudget
      }
    }
    return {
      providerOptions: {
        anthropic: anthropicOptions
      },
      tools
    }
  }
}]

const options = ref({})
const providerOptions = defineModel<Record<string, any>>('providerOptions')
const tools = defineModel<Record<string, any>>('tools')

const activeRules = computed(() => rules.filter(rule => rule.match(props.providerName, props.modelId)))

const schema = computed(() => {
  const matched = activeRules.value
  if (!matched.length) return null
  return TObject(mergeObjects(matched.map(rule => rule.options), 0))
})

watchEffect(() => {
  options.value = mergeObjects(activeRules.value.map(r => r.default), 0)
})

watchEffect(() => {
  const results = activeRules.value.map(r => r.exec(options.value))
  providerOptions.value = mergeObjects(results.map(r => r.providerOptions), 1)
  tools.value = mergeObjects(results.map(r => r.tools), 0)
})
</script>
