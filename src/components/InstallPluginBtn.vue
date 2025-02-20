<template>
  <q-btn
    :label="store.availableIds.includes(id) ? '已安装' : '安装'"
    :disable="store.availableIds.includes(id)"
    :loading
    @click="installIt"
  />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { useInstallPlugin } from 'src/composables/install-plugin'
import { usePluginsStore } from 'src/stores/plugins'
import { PluginManifest } from 'src/utils/types'
import { ref } from 'vue'

const props = defineProps<{
  id: string
  manifest: PluginManifest
}>()

const store = usePluginsStore()
const { install } = useInstallPlugin()
const loading = ref(false)
const $q = useQuasar()
function installIt() {
  loading.value = true
  install(props.manifest).catch(err => {
    console.error(err)
    $q.notify({
      message: `安装失败：${err.message}`,
      color: 'negative'
    })
  }).finally(() => {
    loading.value = false
  })
}
</script>
