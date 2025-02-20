<template>
  <types-input
    v-if="component === 'input'"
    :type
    :options
    :lazy
    :label
    :hint="description"
    :input-props
    v-model="model"
    class="min-w-120px"
  />
  <q-item
    v-else-if="component === 'item'"
    v-bind="itemProps"
  >
    <q-item-section>
      <q-item-label>
        {{ label }}
      </q-item-label>
      <q-item-label
        v-if="description"
        caption
      >
        {{ description }}
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <types-input
        :type
        :options
        :lazy
        v-model="model"
        :input-props="{
          dense: true,
          filled: true,
          ...inputProps
        }"
        :class="{
          'xs:w-200px sm:w-250px': ['string', 'array'].includes(type) && !options,
          'xs:w-100px sm:w-150px': type === 'number'
        }"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import TypesInput from './TypesInput.vue'

defineProps<{
  type: 'string' | 'number' | 'boolean' | 'array'
  component: 'input' | 'item'
  options?: string[]
  label?: string
  description?: string
  inputProps?: Record<string, any>
  itemProps?: Record<string, any>
  lazy?: boolean
}>()

const model = defineModel<string | number | boolean | string[]>()
</script>
