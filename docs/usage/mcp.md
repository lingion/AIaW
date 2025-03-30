# MCP Plugin

[MCP](https://modelcontextprotocol.io/introduction) (Model Context Protocol) is a standardized protocol proposed by Anthropic for providing context to LLMs.

Clients can use the MCP protocol to call tools and obtain Prompts and Resources. The MCP protocol has gained wide support, and there are now MCP servers with various functions: file systems, web searches, databases, Docker, command lines, etc. Any client that supports the MCP protocol can call them!

AIaW added support for the MCP protocol in version v1.4, supporting the following MCP features: Tools, Prompts, and Resources.

## Prerequisites

Currently, most MCP servers are STDIO type, which are called locally via `npx` or `uvx` commands. Therefore, you need:

- AIaW desktop version (Windows, Linux, MacOS local client)
- Installed [NodeJS](https://nodejs.org/)
- Installed [Python](https://www.python.org/) and [uv](https://github.com/astral-sh/uv)

If it is an SSE type MCP server, the above requirements are not required and it can be used on any platform.

## Install MCP Plugin

In AIaW, MCP servers are called through MCP type plugins. You can install MCP type plugins on the "Plugins" page.

In addition to the plugins already in the plugin market, you can also click the plus sign in the upper right corner to manually add MCP plugins.

You can find more MCP servers on websites such as [MCP Official Website](https://modelcontextprotocol.io/examples), [Smithery](https://smithery.ai/), [Glama](https://glama.ai/mcp/servers), etc. But remember to **only add MCP servers from trusted sources**, because STDIO type MCP servers are third-party programs running locally on your machine and have high privileges.

After installation, you can enable the plugin in the assistant settings, and then use it in the conversation.

## Configuration File

When manually adding MCP plugins, you cannot modify all the properties of the plugin. If you need to change more properties or share them with others, you can write a plugin configuration file and then add the plugin through the configuration file.

::: code-group
```json [Example Value]
{
  "id": "mcp-searxng",
  "title": "SearXNG",
  "description": "Web search via SearXNG",
  "transport": {
    "type": "stdio",
    "command": "uvx mcp-searxng",
    "env": {
      "SEARXNG_URL": "http://localhost:8080"
    }
  },
  "author": "TerminalMan",
  "homepage": "https://github.com/SecretiveShell/MCP-searxng",
  "avatar": {
    "type": "icon",
    "icon": "sym_o_search",
    "hue": 225
  }
}
```
```typescript [TS Type Definition]
interface McpPluginManifest {
  id: string
  title: string
  transport: {
    type: "stdio"
    command: string
    cwd?: string;
    env?: {
      [x: string]: string
    }
  } | {
    type: "sse"
    url: string
  }
  avatar?: Avatar
  description?: string
  author?: string
  homepage?: string
  noRoundtrip?: boolean
}
```
:::

For the meaning of some attributes, you can refer to [Gradio Plugin](plugin-dev#gradio-plugin)

## Update

If the MCP server has breaking updates, you need to uninstall and reinstall the corresponding MCP plugin to avoid conflicts caused by API changes.
