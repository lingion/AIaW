/* eslint-disable no-useless-escape */
import { Boolean, Object, Optional, Static, String } from '@sinclair/typebox'

const GenDialogTitle =
`Create a concise, 3-5 word title with an emoji as a title for the chat history, in the given language. Suitable Emojis for the summary can be used to enhance understanding but avoid quotation marks or special formatting. RESPOND ONLY WITH THE TITLE TEXT.

Examples of titles:
📉 Stock Market Trends
🍪 Perfect Chocolate Chip Recipe
Evolution of Music Streaming
Remote Work Productivity Tips
Artificial Intelligence in Healthcare
🎮 Video Game Development Insights

<chat_history>
{%- for content in contents %}
{%- if content.type == 'user-message' %}
<user_message>
{{ content.text }}
</user_message>
{%- elsif content.type == 'assistant-message' %}
<assistant_message>
{{ content.text }}
</assistant_message>
{%- endif %}
{%- endfor %}
</chat_history>
`

const PluginsPrompt =
`<plugins>
{%- for plugin in plugins %}
<plugin id="{{ plugin.id }}">
{%- if plugin.prompt %}
<plugin_prompt>
{{ plugin.prompt }}
</plugin_prompt>
{%- endif %}
{%- for action in plugin.actions %}
<plugin_action name="{{ action.name }}">
{{ action.prompt }}
</plugin_action>
{%- endfor %}
</plugin>
{%- endfor %}
</plugins>
`

const ActionMessage =
`<!-- 助手调用 Action 的记录 -->
## action
{%- if action._content %}
<{{ action.pluginId }}-{{ action.name }} {{ action.args | json }}>
{{ action._content }}
</{{ action.pluginId }}-{{ action.name }}>
{%- else %}
<{{ action.pluginId }}-{{ action.name }} {{ action.args | json }} />
{%- endif %}
## status
{{ action.status }}
{%- if action.result %}
## result
{{ action.result }}
{%- endif %}
{%- if action.error %}
## error
{{ action.error }}
{%- endif %}
`

const AssistantDefaultPrompt =
`{%- if _rolePrompt %}
<role_prompt>
{{ _rolePrompt }}
</role_prompt>
{%- endif %}

{{ _pluginsPrompt }}
`

const DefaultWsIndexContent =
`## {{ workspace.name }}

### 使用指引

点击右侧边栏的「**新建对话**」即可开始对话

- 你可以在左侧边栏设置中更改发送消息的快捷键，默认为 Ctrl+Enter
- 本应用是跨平台的，可以在电脑、手机等不同设备上使用
- 点击右侧边栏中的助手，进入助手设置，可以设定提示词，以及启用各种插件
- 在左侧边栏，你可以创建多个工作区，将不同主题的对话分隔开
- 点击右上角设置图标进入工作区设置，可以切换默认助手、更改此处显示的内容

更多内容详见<a href="https://docs.aiaw.app/usage/" target="_blank">使用指南</a>

GitHub: <a href="https://github.com/NitroRCr/aiaw" target="_blank">NitroRCr/AIaW</a>
`

const ExtractArtifactSchema = Object({
  thinking: String({
    description: '在你判断助手回答中是否有适合提取为 Artifact 的独立内容的过程中，你思考的过程。'
  }),
  found: Boolean({
    description: '是否有适合提取为 Artifact 的独立内容'
  }),
  beginning: Optional(String({
    description: '提取的 Artifact 的开头，需原样复制，长度足够用于定位 Artifact 在 message 中的位置即可，不要太长。如果 Artifact 代码块，请**不要**包含开头的 "\`\`\`" 标记。'
  })),
  ending: Optional(String({
    description: '提取的 Artifact 的结尾，需原样复制，长度足够用于定位 Artifact 在 message 中的位置即可，不要太长。如果 Artifact 代码块，请**不要**包含结尾的 "\`\`\`" 标记。'
  })),
  name: Optional(String({
    description: '根据 Artifact 内容为 Artifact 命名。像文件名那样带后缀。命名格式需符合对应语言代码的文件命名规范。'
  })),
  language: Optional(String({
    description: '内容的代码语言，用于代码高亮。示例值："markdown", "javascript", "python" 等'
  }))
})
type ExtractArtifactResult = Static<typeof ExtractArtifactSchema>
const ExtractArtifactPrompt =
`
<instruction>
你的任务是判断用户与 AI 助手对话记录中是否有 Artifacts，如果有则将它提取出来。

Artifacts 可以是一长段完整的代码、一篇完整的文章、报告。用户可能会复用、修改这些内容，且内容较长（>15行），因此将它们提取出来。

对于其他内容（一般的问题解答、操作步骤等）则不提取，认为未找到 Artifact。

如果没有适合提取为 Artifact 的独立内容，返回 \`found\` 为 false 即可；
如果有，请确定 Artifact 在 assistant message 中的范围，给出 Artifact 的 beginning 和 ending，以及它的语言和命名。

如果 Artifact 是代码块，则它必须是完整的代码块，不能是代码块的一部分或者多个短代码块。不合适的情况认为没有找到 Artifact 即可。

回复为 json 格式，只回答 json 内容，不要用 "\`\`\`" 包裹。
</instruction>
<response_schema>
${JSON.stringify(ExtractArtifactSchema, null, 2)}
</response_schema>
<chat_history>
{%- for content in contents %}
{%- if content.type == 'user-message' %}
<user_message>
{{ content.text }}
</user_message>
{%- elsif content.type == 'assistant-message' %}
<assistant_message>
{{ content.text }}
</assistant_message>
{%- endif %}
{%- endfor %}
</chat_history>
`
const NameArtifactPrompt =
`请根据该文件的内容，为该文件命名（带后缀）。命名格式需符合对应语言代码的文件命名规范，如 "hello_world.py", "hello-world.js", "HelloWorld.java" 等。只回答文件名：

<file_content>
{{ content }}
</file_content>
`

const ExampleWsIndexContent = DefaultWsIndexContent

export {
  GenDialogTitle,
  PluginsPrompt,
  ActionMessage,
  AssistantDefaultPrompt,
  DefaultWsIndexContent,
  ExampleWsIndexContent,
  ExtractArtifactPrompt,
  ExtractArtifactSchema,
  NameArtifactPrompt
}

export type { ExtractArtifactResult }
