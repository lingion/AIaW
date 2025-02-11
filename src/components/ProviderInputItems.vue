<template>
  <q-item>
    <q-item-section>服务商</q-item-section>
    <q-item-section side>
      <q-select
        class="w-150px"
        :model-value="provider?.type"
        @update:model-value="switchProvider"
        :options="providerOptions"
        emit-value
        map-options
        filled
        dense
        clearable
      >
        <template #option="{ opt, itemProps }">
          <q-item
            v-bind="itemProps"
            min-h-0
          >
            <q-item-section
              avatar
              min-w-0
              pr-2
            >
              <a-avatar
                size="24px"
                :avatar="ProviderTypes.find(p => p.name === opt.value).avatar"
              />
            </q-item-section>
            <q-item-section>{{ opt.label }}</q-item-section>
          </q-item>
        </template>
      </q-select>
    </q-item-section>
  </q-item>
  <json-input
    v-if="provider"
    :schema="providerType.settings"
    v-model="provider.settings"
    component="item"
    lazy
    :input-props="{
      clearable: true
    }"
  />
  <json-input
    v-if="provider && providerType.options"
    :schema="providerType.options"
    v-model="provider.settings"
    component="item"
    lazy
    :input-props="{
      clearable: true
    }"
  />
</template>

<script setup lang="ts">
import { ProviderTypes } from 'src/utils/values'
import JsonInput from './JsonInput.vue'
import { Provider } from 'src/utils/types'
import AAvatar from 'src/components/AAvatar.vue'
import { computed } from 'vue'

const provider = defineModel<Provider>()
const providerOptions = ProviderTypes.map(p => ({
  label: p.label,
  value: p.name
}))
const providerType = computed(() => ProviderTypes.find(p => p.name === provider.value?.type))
function switchProvider(type: string) {
  if (type) {
    provider.value = { type, settings: ProviderTypes.find(p => p.name === type).initialSettings }
  } else {
    provider.value = null
  }
}
</script>
