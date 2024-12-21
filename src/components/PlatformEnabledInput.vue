<template>
  <q-select
    v-model="model"
    :options="options"
    map-options
    emit-value
  />
</template>

<script setup lang="ts">
import { PlatformEnabled } from 'src/utils/types'

const model = defineModel<PlatformEnabled>()
const options = [
  { label: '始终启用', value: 'always' },
  { label: '仅桌面端', value: 'desktop-only' },
  { label: '仅移动端', value: 'mobile-only' },
  { label: '始终禁用', value: 'never' }
]
</script>
