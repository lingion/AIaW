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
import { fetch } from 'src/utils/platform-api'

const props = defineProps<{
  provider: Provider
}>()

const models = defineModel<string[]>()

const $q = useQuasar()
const { t } = useI18n()

const providersStore = useProvidersStore()

async function openaiCompatibleGetModelList(settings) {
  const baseURL = String(settings?.baseURL || 'https://api.openai.com/v1').replace(/\/+$/, '')
  const apiKey = settings?.apiKey
  const candidates = [
    `${baseURL}/models`,
    baseURL.endsWith('/v1') ? null : `${baseURL}/v1/models`
  ].filter(Boolean)
  const errors: string[] = []
  for (const url of candidates) {
    try {
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json'
        }
      })
      if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`)
      const payload = await resp.json()
      const list = Array.isArray(payload?.data)
        ? payload.data.map(m => m?.id || m?.name).filter(Boolean)
        : Array.isArray(payload?.models)
          ? payload.models.map(m => m?.id || m?.name || m).filter(Boolean)
          : Array.isArray(payload)
            ? payload.map(m => m?.id || m?.name || m).filter(Boolean)
            : []
      if (!list.length) throw new Error('No models returned')
      return list
    } catch (err) {
      errors.push(`${url} -> ${err.message}`)
    }
  }
  throw new Error(errors.join(' | '))
}

const providerType = computed(() => {
  const found = providersStore.providerTypes.find(pt => pt.name === props.provider?.type)
  if (found) return found
  if (props.provider?.type === 'openai-compatible') {
    return {
      name: 'openai-compatible',
      getModelList: openaiCompatibleGetModelList
    }
  }
  return null
})

function getModelList() {
  providerType.value.getModelList(props.provider.settings).then(modelList => {
    $q.dialog({
      title: t('getModelList.selectModels'),
      options: {
        type: 'checkbox',
        model: models.value.filter(m => modelList.includes(m)),
        items: modelList.sort().map(m => ({ label: m, value: m }))
      },
      cancel: true,
      ...dialogOptions
    }).onOk(val => {
      models.value = val
    })
  }).catch(err => {
    console.error(err)
    $q.dialog({
      title: t('getModelList.getModelListFailed'),
      message: `${err.message}\n\nYou can still enter model names manually, one per line:`,
      prompt: {
        model: (models.value || []).join('\n'),
        type: 'textarea'
      },
      cancel: true,
      ...dialogOptions
    }).onOk(val => {
      models.value = String(val).split('\n').map(v => v.trim()).filter(Boolean)
    })
  })
}
</script>
