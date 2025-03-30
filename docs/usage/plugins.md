# Plugin System

::: tip
MCP type plugins are now also supported, see [MCP Plugins](mcp) for details
:::

## Plugin Installation

AIaW has several built-in plugins. In addition, you can install more plugins from the [Plugin Market](https://aiaw.app/plugins); you can also manually add plugin configuration files by clicking the plus sign in the upper right corner of the plugin market page.

## Plugin Settings

Through the "Installed Plugins" list in the right sidebar of the plugin market, you can enter the settings page of each plugin. Here you can set the icon of each plugin, disable/enable file parsers, adjust call parameters, etc. (if any). This is the global setting of the plugin.

In addition, after enabling the plugin on the assistant page, you can enter the plugin function page. There you can disable/enable a tool of the plugin, modify variable values (if any). This setting is only valid for the current assistant.

## Plugin Features

In AIaW, "Tools" are only a part of "Plugins". A plugin can have multiple tools, as well as file parsers, prompts, and information acquisition. Plugins with only file parsers/prompts and no tools are also possible.

### Tool Call

The most common function of plugins is to provide AI with tool calls to expand its capabilities.

For example, providing a calculator allows AI to call it for calculations, so that AI can complete more complex calculations while ensuring the accuracy of the calculations. AIaW has a built-in "Calculator" plugin, which you can enable directly in the assistant settings.

For another example, providing the ability to call an image generation model allows you to directly tell AI what you want to draw, and AI will write prompts and generate images by itself. The built-in "Image Generation: FLUX" is such a plugin, and it is called through HuggingFace Spaces, so no configuration is required and it is free.

### File Parser

In addition to tool calls, AIaW's plugins also provide file parsers. See the [File Parsing](file-parse) page for details.

### Prompt

In addition, the plugin itself can also contain prompts. The "prompt" here is different from the prompt of the tool. The prompt of the tool is generally passed to the model as the `description` of the tool function. The prompt of the plugin is independent of the tool. It will be put into the system prompt as part of `_pluginsPrompt` in the prompt template.

Therefore, plugins can also contain only prompts without file parsers and tools. The built-in "Emoji" plugin and "Mermaid Chart" plugin are like this.

The principle of the emoji plugin is that AIaW has built-in some emoji pictures, so you only need to tell AI the link of each emoji and prompt AI to use the img tag to introduce the picture in the answer. The Mermaid chart is also supported by AIaW's Markdown rendering component, so you only need to prompt AI to use it in the answer. Of course, it is the same to write the prompt in the role setting or user message. Encapsulating it as a plugin is just for more convenient use.

Plugin prompts also support prompt variables. For example, the emoji plugin has a "Display Size" variable, which can be adjusted on the plugin function page; it is used in the prompt to tell AI to set the width of the img tag, thereby affecting the display size of the emoji.

## Plugin Configuration and Development

Refer to [Plugin Configuration and Development](plugin-dev)
