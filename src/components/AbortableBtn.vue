<template>
  <q-btn
    unelevated
    round
    @click="loading ? $emit('abort') : $emit('click')"
    :color="loading ? 'sec-c' : 'pri'"
    :text-color="loading ? 'on-sec-c' : 'on-pri'"
    class="abortable-icon-btn"
  >
    <q-spinner v-if="loading" />
    <q-icon
      :name="icon"
      v-else
    />
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
