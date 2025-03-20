<template>
  <q-select
    v-model="model"
    use-input
    use-chips
    multiple
    new-value-mode="add-unique"
    hide-dropdown-icon
    :input-debounce="0"
    :options="filteredOptions"
    @filter="filterFn"
  >
    <template #option="{ opt, selected, itemProps }">
      <model-item
        :model="opt"
        :selected
        v-bind="itemProps"
      />
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { useFilterOptions } from 'src/composables/filter-options'
import ModelItem from './ModelItem.vue'
import { modelOptions } from 'src/utils/values'

const model = defineModel<string[]>()

const { filteredOptions, filterFn } = useFilterOptions(modelOptions)
</script>
