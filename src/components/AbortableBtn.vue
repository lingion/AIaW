<template>
  <q-btn
    unelevated
    @click="loading ? $emit('abort') : $emit('click')"
    :color="loading ? 'sec-c' : 'pri'"
    :text-color="loading ? 'on-sec-c' : 'on-pri'"
  >
    <q-spinner v-if="loading" />
    <q-icon
      :name="icon"
      v-else
    />
    <span ml-2>{{ loading ? $t('abortableBtn.stop') : label }}</span>
  </q-btn>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  icon: string
  loading: boolean
}>()
defineEmits(['click', 'abort'])
</script>
