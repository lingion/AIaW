<template>
  <a-input
    v-bind="$attrs"
    :model-value="modelValue"
    @change="$emit('update:modelValue', $event)"
  >
    <template #prepend>
      <slot name="prepend" />
    </template>
    <template #append>
      <slot name="append" />
    </template>
    <template #before>
      <slot name="before" />
    </template>
    <template #after>
      <slot name="after" />
    </template>
  </a-input>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

defineProps<{
  modelValue
}>()
defineEmits(['update:modelValue'])
</script>
