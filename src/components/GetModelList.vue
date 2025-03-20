<template>
  <a
    v-if="providerType?.getModelList"
    pri-link
    href="javascript:void(0)"
    @click="getModelList"
  >
    {{ $t('getModelList.getModelList') }}
  </a>
</template>

<script setup lang="ts">
import { Provider } from 'src/utils/types'
import { dialogOptions } from 'src/utils/values'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useProvidersStore } from 'src/stores/providers'
import { computed } from 'vue'

const props = defineProps<{
  provider: Provider
}>()

const models = defineModel<string[]>()

const $q = useQuasar()
const { t } = useI18n()

const providersStore = useProvidersStore()

const providerType = computed(() => providersStore.providerTypes.find(pt => pt.name === props.provider?.type))

function getModelList() {
  providerType.value.getModelList(props.provider.settings).then(modelList => {
    modelList.sort()
    $q.dialog({
      title: t('getModelList.selectModels'),
      options: {
        type: 'checkbox',
        model: modelList.filter(m => models.value.includes(m)),
        items: modelList.map(m => ({ label: m, value: m }))
      },
      cancel: true,
      ...dialogOptions
    }).onOk(val => {
      models.value = val
    })
  }).catch(err => {
    console.error(err)
    $q.notify({
      message: t('getModelList.getModelListFailed'),
      color: 'negative'
    })
  })
}
</script>
