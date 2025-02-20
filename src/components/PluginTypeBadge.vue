<template>
  <q-badge
    :label
    :class="{
      'bg-pri-c text-on-pri-c': props.type === 'builtin',
      'bg-50-48-90-a text-50-48-10-a': props.type === 'lobechat',
      'bg-90-48-90-a text-90-48-10-a': props.type === 'gradio',
      'bg-250-48-90-a text-250-48-10-a': props.type === 'mcp'
    }"
  />
</template>

<script setup lang="ts">
import { Plugin } from 'src/utils/types'
import { computed } from 'vue'

const props = defineProps<{
  type: Plugin['type']
}>()

const label = computed(() => {
  switch (props.type) {
    case 'builtin':
      return '内置'
    case 'lobechat':
      return 'Lobe'
    case 'gradio':
      return 'Gradio'
    case 'mcp':
      return 'MCP'
    default:
      return ''
  }
})
</script>
