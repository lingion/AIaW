![](docs/public/combine.en.webp)

# AI as Workspace (Fork)

![](https://badge.mcpx.dev?type=client 'MCP Client') ![](https://badge.mcpx.dev?type=client&features=resources,prompts,tools 'MCP client with features')

Fork of [NitroRCr/AIaW](https://github.com/NitroRCr/AIaW) with enhancements.

## Downloads

| Platform | Link |
|----------|------|
| Android | [Debug APK](https://github.com/lingion/AIaW/releases/latest) |
| Web (PWA) | [Latest Deployment](https://feat-mcp-refresh.aiaw-dqx.pages.dev) |
| Desktop | Build from source (requires Tauri) |

## Fork Changes

### MCP Plugin Refresh

Each installed MCP plugin shows a **🔄 refresh button**. Click to re-fetch the tool list from the server without reinstalling.

### Camera Capture

A dedicated **📷 camera button** sits to the left of the image picker in the chat input bar. On mobile devices it opens the device camera directly (`capture="environment"` → rear camera). On desktop it falls back to a file picker.

### MCP Install Retry

When MCP plugin installation fails, a dialog shows the error message with a **Retry** button. The original configuration is preserved so you can retry immediately without re-entering anything.

### CORS Fix for Web/PWA

MCP workers have been patched to include `mcp-protocol-version` and `mcp-session-id` in `Access-Control-Allow-Headers`, fixing "Failed to fetch" errors when connecting from browser-based PWA deployments.

## Original Features

- Supported platforms: Windows, Linux, macOS, Android, Web (PWA)
- Multiple AI providers: OpenAI, Anthropic, Google, DeepSeek, xAI, Azure, OpenRouter, Ollama, and any OpenAI-compatible endpoint
- MCP Protocol: Tools, Prompts, Resources via STDIO / HTTP / SSE
- Plugin system with marketplace (LobeChat & Gradio compatible)
- Web search (SearXNG), Artifacts, document parsing, image generation
- Multiple workspaces, assistant marketplace, dynamic prompts
- Local-first storage with optional cloud sync
- Dark mode, customizable themes

For the full feature list, see the [upstream README](https://github.com/NitroRCr/AIaW#readme).

## Build from Source

```bash
pnpm i
quasar dev          # Development
quasar build        # SPA build
quasar build -m pwa # PWA build
```

Android: `quasar build` → `npx cap sync android` → `cd android && ./gradlew assembleDebug`

## Related Projects

- [Upstream: NitroRCr/AIaW](https://github.com/NitroRCr/AIaW)
