<template>
  <q-item
    min-h-0
    :class="{ 'bg-sec-c text-on-sec-c': selected }"
  >
    <q-item-section
      avatar
      pr-2
      min-w-0
    >
      <a-avatar
        :avatar="avatar"
        size="24px"
      />
    </q-item-section>
    <q-item-section>
      {{ model }}
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { Avatar } from 'src/utils/types'
import { computed } from 'vue'
import AAvatar from 'src/components/AAvatar.vue'
import { defaultAvatar } from 'src/utils/functions'

const props = defineProps<{
  model: string
  selected?: boolean
}>()

const avatar = computed<Avatar>(() => {
  const m = props.model
  if (m.includes('gpt-4')) return { type: 'svg', name: 'openai', hue: 307 }
  if (m.includes('gpt')) return { type: 'svg', name: 'openai', hue: 160 }
  if (m.startsWith('o1') || m.startsWith('o3')) return { type: 'svg', name: 'openai', hue: 88 }
  if (m.startsWith('claude') || m.startsWith('c-')) return { type: 'svg', name: 'claude-c' }
  if (m.startsWith('gemini')) return { type: 'svg', name: 'gemini-c' }
  if (m.startsWith('gemma')) return { type: 'svg', name: 'gemma-c' }
  if (m.startsWith('llama')) return { type: 'svg', name: 'meta-c' }
  if (m.startsWith('mistral')) return { type: 'svg', name: 'mistral-c' }
  if (m.startsWith('qwen')) return { type: 'svg', name: 'qwen-c' }
  if (m.startsWith('deepseek')) return { type: 'svg', name: 'deepseek-c' }
  if (m.startsWith('grok')) return { type: 'svg', name: 'grok' }
  return defaultAvatar(m[0].toUpperCase())
})
</script>
