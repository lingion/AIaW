import { usePluginsStore } from 'src/stores/plugins'
import { GradioPluginManifestSchema, HuggingPluginManifestSchema, LobePluginManifestSchema, McpPluginManifestSchema } from 'src/utils/types'
import { Validator } from '@cfworker/json-schema'
import { toRaw } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

export function useInstallPlugin() {
  const store = usePluginsStore()
  const $q = useQuasar()
  const { t } = useI18n()
  async function install(source) {
    let manifest
    if (typeof source === 'string') {
      if (source.startsWith('http')) {
        try {
          manifest = await fetch(source).then(res => res.json())
        } catch (err) {
          console.error(err)
          $q.notify({
            message: t('plugin.fetchFailed', { message: err.message }),
            color: 'negative'
          })
          return
        }
      } else {
        try {
          manifest = JSON.parse(source)
        } catch (err) {
          $q.notify({
            message: t('plugin.formatError'),
            color: 'negative'
          })
          return
        }
      }
    } else if (typeof source === 'object') {
      manifest = toRaw(source)
    }
    if (new Validator(GradioPluginManifestSchema).validate(manifest).valid) {
      await store.installGradioPlugin(manifest)
    } else if (new Validator(HuggingPluginManifestSchema).validate(manifest).valid) {
      await store.installHuggingPlugin(manifest)
    } else if (new Validator(LobePluginManifestSchema).validate(manifest).valid) {
      await store.installLobePlugin(manifest)
    } else if (new Validator(McpPluginManifestSchema).validate(manifest).valid) {
      await store.installMcpPlugin(manifest)
    } else {
      $q.notify({
        message: t('plugin.unsupportedFormat'),
        color: 'negative'
      })
    }
  }
  return { install }
}
