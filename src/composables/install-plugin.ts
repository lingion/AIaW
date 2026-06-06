import { usePluginsStore } from 'src/stores/plugins'
import { GradioPluginManifestSchema, HuggingPluginManifestSchema, LobePluginManifestSchema, McpPluginManifestSchema } from 'src/utils/types'
import { Validator } from '@cfworker/json-schema'
import { toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'src/composables/useToast'
import { fetch, IsCapacitor, CapacitorPlatform, IsTauri } from 'src/utils/platform-api'

export function useInstallPlugin() {
  const store = usePluginsStore()
  const { t } = useI18n()
  const { toastError } = useToast()
  async function install(source) {
    let manifest
    if (typeof source === 'string') {
      if (source.startsWith('http')) {
        try {
          manifest = await fetch(source).then(res => res.json())
        } catch (err) {
          console.error(err)
          toastError(t('installPlugin.fetchFailed', { message: err.message }))
          return
        }
      } else {
        try {
          manifest = JSON.parse(source)
        } catch (err) {
          toastError(t('installPlugin.formatError'))
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
      if (manifest.transport.type === 'stdio' && !IsTauri) {
        toastError(t('installPlugin.installFailed', { message: 'STDIO MCP plugins require desktop/Tauri.' }))
        return
      }
      if (IsCapacitor && CapacitorPlatform === 'ios' && manifest.transport.type === 'stdio') {
        toastError(t('installPlugin.installFailed', { message: 'iOS only supports HTTP/SSE MCP plugins.' }))
        return
      }
      await store.installMcpPlugin(manifest).catch(err => {
        console.error(err)
        toastError(t('installPlugin.installFailed', { message: err.message }))
      })
    } else {
      toastError(t('installPlugin.unsupportedFormat'))
    }
  }
  return { install }
}
