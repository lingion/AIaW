import type { Assistant, AssistantPlugin, Plugin } from './types'
import webSearchPlugin from './web-search-plugin'
import docParsePlugin from './doc-parse-plugin'
import artifacts from './artifacts-plugin'
import codeExecPlugin from './code-exec-plugin'
import fileOpsPlugin from './file-ops-plugin'
import localFsNativePlugin from './local-fs-native-plugin'
import { calculatorPlugin, timePlugin, whisperPlugin, videoTranscriptPlugin, fluxPlugin, emotionsPlugin, mermaidPlugin } from './plugins'

const builtinPlugins: Plugin[] = [
  webSearchPlugin.plugin,
  calculatorPlugin,
  videoTranscriptPlugin,
  whisperPlugin,
  fluxPlugin,
  emotionsPlugin,
  mermaidPlugin,
  timePlugin,
  docParsePlugin.plugin,
  artifacts.plugin,
  codeExecPlugin.plugin,
  fileOpsPlugin.plugin,
  localFsNativePlugin.plugin,
]

function buildAssistantPlugin(plugin: Plugin): AssistantPlugin {
  const assistantPlugin: AssistantPlugin = { enabled: false, infos: [], tools: [], resources: [], vars: {} }
  plugin.apis.forEach(api => {
    if (api.type === 'tool') assistantPlugin.tools.push({ name: api.name, enabled: true })
    else if (api.type === 'info') assistantPlugin.infos.push({ name: api.name, enabled: true, args: {} })
  })
  return assistantPlugin
}

export function reconcileAssistantBuiltinPlugins(assistant: Assistant): Assistant {
  assistant.plugins ||= {}
  for (const plugin of builtinPlugins) {
    const existing = assistant.plugins[plugin.id]
    if (!existing) {
      assistant.plugins[plugin.id] = buildAssistantPlugin(plugin)
      continue
    }
    existing.tools ||= []
    existing.infos ||= []
    existing.resources ||= []
    existing.vars ||= {}
    const toolNames = new Set(existing.tools.map(t => t.name))
    const infoNames = new Set(existing.infos.map(i => i.name))
    plugin.apis.forEach(api => {
      if (api.type === 'tool' && !toolNames.has(api.name)) existing.tools.push({ name: api.name, enabled: true })
      else if (api.type === 'info' && !infoNames.has(api.name)) existing.infos.push({ name: api.name, enabled: true, args: {} })
    })
  }
  return assistant
}
