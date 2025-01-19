import { Number, Object, Optional, String } from '@sinclair/typebox'
import { Artifact } from './types'
import { engine } from './template-engine'
import { db } from './db'
import { saveArtifactChanges } from './functions'
import { jsonSchema, tool as sdkTool } from 'ai'

const promptTemplate =
`Artifacts 是用户可能修改或复用的独立内容（代码、文章等），为了清晰地展示，将显示在单独的 UI 窗口中。

你可以通过调用工具 \`edit-artifact\` 修改 \`writable\` 属性为 \`true\` 的 Artifacts。若需要同时修改 Artifacts 和回答用户，请先回答用户，再调用工具修改 Artifacts。

{%- for artifact in artifacts %}
<artifact id="{{ artifact.id }}" name="{{ artifact.name }}" writable="{{ artifact.writable }}">
{{ artifact.versions[artifact.currIndex].text }}
</artifact>
{%- endfor %}
`

const actionsDescription =
`
可用的 action 有：
- overwrite: 使用 \`new_str\` 覆盖当前内容
- replace: 使用 \`new_str\` 替换当前内容中 \`old_str\` 部分
- insert: 将 \`new_str\` 插入到 \`insert_line\` 行
`

export function useArtifactsPlugin(artifacts: Artifact[]) {
  const enabledPlugin = {
    id: 'aiaw-artifacts',
    prompt: engine.parseAndRenderSync(promptTemplate, { artifacts: artifacts.filter(a => a.readable) }),
    actions: []
  }
  const tool = sdkTool({
    description: '修改 Artifact',
    parameters: jsonSchema(Object({
      id: String({
        description: '要修改的 Artifact 的 id'
      }),
      action: String({
        description: actionsDescription
      }),
      newStr: String({
        description: '新内容'
      }),
      oldStr: Optional(String({
        description: 'replace 时，要替换的旧内容'
      })),
      insertLine: Optional(Number({
        description: 'insert 时，会将新内容插入到第 `insertLine` 行之后；默认插入到末尾'
      })),
      newName: Optional(String({
        description: 'artifact 的新名称；默认不会更改名称'
      }))
    })),
    execute: async ({ id, action, newStr, oldStr, insertLine, newName }) => {
      const artifact = await db.artifacts.get(id)
      if (!artifact || !artifact.writable) throw new Error(`Artifact ${id} not found`)
      const oldContent = artifact.versions[artifact.currIndex].text
      if (action === 'overwrite') {
        artifact.tmp = newStr
      } else if (action === 'replace') {
        artifact.tmp = oldContent.replaceAll(oldStr, newStr)
      } else if (action === 'insert') {
        const lines = oldContent.split('\n')
        lines.splice(insertLine ?? lines.length, 0, newStr)
        artifact.tmp = lines.join('\n')
      }
      await db.artifacts.update(id, {
        ...saveArtifactChanges(artifact),
        tmp: artifact.tmp,
        name: newName ?? artifact.name
      })
      return [{
        type: 'text',
        contentText: '修改成功'
      }]
    }
  })
  return {
    enabledPlugin,
    tool
  }
}
