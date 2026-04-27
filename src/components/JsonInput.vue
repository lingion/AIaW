<template>
  <template
    v-for="(sch, key) in schema.properties"
    :key="key"
  >
    <json-input
      v-if="sch.type === 'object'"
      :schema="sch as PluginSchema"
      :prefix="keyPath(key as string)"
      :component
      :lazy
      :context="context"
      v-model="model[key] as unknown as Model"
      :input-props
    />
    <unified-input
      v-else
      :type="sch.type as any"
      :options="sch.enum as any"
      :label="sch.title || key as string"
      :description="sch.description"
      :component
      :lazy
      :context="{
        ...context,
        secretField: keyPath(key as string)
      }"
      v-model="model[key] as any"
      :input-props="{
        type: sch.format === 'password' ? 'password' : undefined,
        placeholder: sch.default,
        ...inputProps
      }"
      :item-props
    />
  </template>
</template>

<script setup lang="ts">
import { PluginSchema } from '@lobehub/chat-plugin-sdk'
import UnifiedInput from './UnifiedInput.vue'
import { computed } from 'vue'

const props = defineProps<{
  schema: PluginSchema
  prefix?: string
  component: 'input' | 'item'
  inputProps?: Record<string, any>
  itemProps?: Record<string, any>
  lazy?: boolean
  context?: Record<string, any>
}>()

interface Model {
  [key: string]: string | number | boolean | string[]
}

const model = defineModel<Model>()
model.value ??= {}

function keyPath(key: string) {
  return props.prefix ? `${props.prefix}.${key}` : key
}
</script>
