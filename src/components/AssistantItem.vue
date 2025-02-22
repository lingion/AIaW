<template>
  <q-item>
    <q-item-section
      avatar
      min-w-0
    >
      <a-avatar
        v-if="assistant"
        size="30px"
        :avatar="assistant.avatar"
      />
      <q-icon
        v-else
        name="sym_o_error"
        text-warn
      />
    </q-item-section>
    <q-item-section>
      <q-item-label whitespace-nowrap>
        {{ assistant ? assistant.name : $t('assistantItem.unselected') }}
        <q-badge
          bg-pri-c
          text-on-pri-c
          ml-2
          py-1
          v-if="assistant && assistant.workspaceId === '$root'"
        >
          {{ $t('assistantItem.global') }}
        </q-badge>
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { Assistant } from 'src/utils/types'
import AAvatar from './AAvatar.vue'

defineProps<{
  assistant?: Assistant
}>()
</script>
