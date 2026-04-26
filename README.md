![](docs/public/combine.en.webp)

# AI as Workspace (Lingion Fork)

![](https://badge.mcpx.dev?type=client 'MCP Client') ![](https://badge.mcpx.dev?type=client&features=resources,prompts,tools 'MCP client with features')

A maintained fork focused on **mobile usability**, **local-first storage**, and **practical MCP support**.

## Downloads

| Platform | Link |
|----------|------|
| Android | [Latest Release APK](https://github.com/lingion/AIaW/releases/latest) |
| iOS | [Latest Release IPA](https://github.com/lingion/AIaW/releases/latest) |
| Web (PWA) | [Latest Deployment](https://feat-mcp-refresh.aiaw-dqx.pages.dev) |
| Desktop | Build from source (Tauri / Capacitor source included) |

## Fork Focus

This fork is optimized around:
- mobile-first usability fixes
- local-first data storage
- practical provider management
- MCP compatibility improvements on constrained platforms

## Fork Changes

### Provider / API Key UX
- Show / hide toggle for token fields
- Mobile-friendly password input behavior
- API key history dropdown for faster switching
- Per-key delete button in history list
- Local backup / restore protection against accidental token loss

### MCP Improvements
- Refresh button for installed MCP plugins
- Retry dialog on MCP install failure
- Better platform-aware MCP error messages
- iOS transport fallback fixes
- Desktop-only stdio MCP plugins are blocked earlier on mobile platforms

### Camera / Attachments
- Dedicated camera button in chat input
- Native camera integration on mobile builds
- iOS permission strings fixed for camera and photo library access

## Core Features
- Supported platforms: Windows, Linux, macOS, Android, iOS, Web (PWA)
- Multiple AI providers: OpenAI, Anthropic, Google, DeepSeek, xAI, Azure, OpenRouter, Ollama, and OpenAI-compatible endpoints
- MCP Protocol: Tools, Prompts, Resources via STDIO / HTTP / SSE
- Plugin system with marketplace support
- Web search, Artifacts, document parsing, image generation
- Multiple workspaces and assistants
- **Local-first storage by default**
- Dark mode and customizable themes

## Build from Source

```bash
pnpm i
quasar dev          # Development
quasar build        # SPA build
quasar build -m pwa # PWA build
```

Android:
```bash
quasar build -m spa --skip-pkg
npx cap sync android
cd android && ./gradlew assembleDebug
```

iOS:
```bash
quasar build -m spa --skip-pkg
npx cap sync ios
cd ios/App && pod install
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug -destination 'generic/platform=iOS' build
```

## Notes
- This fork disables cloud sync by default unless you explicitly wire your own backend.
- Release/update endpoints point to `lingion/AIaW`, not upstream.
