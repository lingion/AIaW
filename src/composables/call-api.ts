import { usePluginsStore } from 'src/stores/plugins'
import { Schema, Validator } from '@cfworker/json-schema'
import { ApiResultItem, Plugin, PluginApi } from 'src/utils/types'

export function useCallApi({ workspace, dialog }) {
  const pluginsStore = usePluginsStore()
  function getPluginSettings(plugin: Plugin) {
    const settings = pluginsStore.data[plugin.id].settings
    if (plugin.settings.properties._workspaceId) {
      settings._workspaceId = workspace.value.id
    }
    if (plugin.settings.properties._dialogId) {
      settings._dialogId = dialog.value.id
    }
    const { valid } = new Validator(plugin.settings as Schema).validate(settings)
    return { valid, settings }
  }

  async function callApi(plugin: Plugin, api: PluginApi, args): Promise<{ result?: ApiResultItem[], error?: string }> {
    const { valid: argValid } = new Validator(api.parameters as Schema).validate(args)
    if (!argValid) {
      return { result: [], error: '调用参数校验失败' }
    }
    const { valid: SettingsValid, settings } = getPluginSettings(plugin)
    if (!SettingsValid) {
      return { result: [], error: '插件设置校验失败，请检查插件设置' }
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
