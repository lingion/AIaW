<template>
  <q-btn
    :label="store.availableIds.includes(id)
      ? $t('installPluginBtn.installed')
      : disabled
        ? (disabledReason || 'Unavailable')
        : $t('installPluginBtn.install')"
    :disable="store.availableIds.includes(id) || disabled"
    :loading
    @click="installIt"
  />
</template>

<script setup lang="ts">
import { useToast } from 'src/composables/useToast'
import { useInstallPlugin } from 'src/composables/install-plugin'
import { usePluginsStore } from 'src/stores/plugins'
import { PluginManifest } from 'src/utils/types'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  id: string
  manifest: PluginManifest
  disabled?: boolean
  disabledReason?: string
}>()

const store = usePluginsStore()
const { install } = useInstallPlugin()
const loading = ref(false)
const { toastInfo } = useToast()
function installIt() {
  if (props.disabled) return
  loading.value = true
  install(props.manifest).catch(err => {
    console.error(err)
    toastError(`${t('installPluginBtn.installFailed')}${err.message}`)
  }).finally(() => {
    loading.value = false
  })
}
</script>
