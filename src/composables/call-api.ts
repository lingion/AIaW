import { usePluginsStore } from 'src/stores/plugins'
import { Schema, Validator } from '@cfworker/json-schema'
import { ApiResultItem, Plugin, PluginApi } from 'src/utils/types'
import { removeUndefinedProps } from 'src/utils/functions'
import { toRaw } from 'vue'
import { useI18n } from 'vue-i18n'

export function useCallApi({ workspace, dialog }) {
  const pluginsStore = usePluginsStore()
  const { t } = useI18n()

  function getPluginSettings(plugin: Plugin) {
    const settings = toRaw(pluginsStore.data[plugin.id].settings)
    if (plugin.settings.properties._workspaceId) {
      settings._workspaceId = workspace.value.id
    }
    if (plugin.settings.properties._dialogId) {
      settings._dialogId = dialog.value.id
    }
    removeUndefinedProps(settings)
    const { valid } = new Validator(plugin.settings as Schema).validate(settings)
    return { valid, settings }
  }

  async function callApi(plugin: Plugin, api: PluginApi, args): Promise<{ result?: ApiResultItem[], error?: string }> {
    const { valid: argValid } = new Validator(api.parameters as Schema).validate(args)
    if (!argValid) {
      return { result: [], error: t('callApi.argValidationFailed') }
    }
    const { valid: SettingsValid, settings } = getPluginSettings(plugin)
    if (!SettingsValid) {
      return { result: [], error: t('callApi.settingsValidationFailed') }
    }
    try {
      const result = await api.execute(args, settings)
      return { result, error: null }
    } catch (e) {
      return { result: [], error: e.message }
    }
  }
  return { getPluginSettings, callApi }
}
