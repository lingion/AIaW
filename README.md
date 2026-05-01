![](docs/public/combine.en.webp)

# AI as Workspace

![](https://badge.mcpx.dev?type=client 'MCP Client') ![](https://badge.mcpx.dev?type=client&features=resources,prompts,tools 'MCP client with features')

An elegant AI client.

[Web Version](https://aiaw.app) - [Download Builds](https://github.com/lingion/AIaW/releases/latest) - [Docs](https://docs.aiaw.app/) - [简体中文](README.zh-CN.md)

<a href="https://apps.microsoft.com/detail/9NVMXSXJMWP8?referrer=appbadge&mode=direct">
	<img src="https://get.microsoft.com/images/en-us%20dark.svg" width="200"/>
</a>

## Features Overview

### Consistent Experience Across All Platforms

- Supported platforms: Windows, Linux, Mac OS, Android, Web (PWA)
- Multiple AI providers: OpenAI, Anthropic, Google, DeepSeek, xAI, Azure, etc.

### Conversation Interface

- User input preview
- Modifications and regenerations presented as branches
- Customizable keyboard shortcuts
- Quick scrolling to the beginning/end of a message

<img src="https://fs.krytro.com/aiaw/dialog.webp" width="600">

### Multiple Workspaces

- Create multiple workspaces to separate conversations by themes
- Group workspaces into folders; supports nesting
- Create multiple assistants within a workspace or global assistants

<img src="docs/usage/res/workspace-list.en.png" width="378">

### Data Storage

- Data is stored locally first, accessible offline and loads instantly
- Cloud synchronization available after login for cross-device syncing
- Multi-window collaboration: open multiple tabs in the same browser with responsive data synchronization

### Design Details

- Support for text files (code, csv, etc.) as attachments; AI can see file contents and names without occupying display space
- For large text blocks, use Ctrl + V **outside the input box** to paste as an attachment; prevents large content from cluttering the display

<img src="https://fs.krytro.com/aiaw/text-item.webp" width="600">

- Quote content from previous messages to user inputs for targeted follow-up questions
- Select multiple lines of message text to copy the original Markdown

<img src="https://fs.krytro.com/aiaw/text-selection.webp" width="600">

- Automatically wrap code pasted from VSCode in code blocks with language specification

<img src="https://fs.krytro.com/aiaw/paste-code.webp" width="600">

### [MCP Protocol](https://docs.aiaw.app/usage/mcp.html)

- Support for MCP Tools, Prompts, Resources
- STDIO and HTTP connection methods
- Install MCP-type plugins from the plugin marketplace or manually add MCP servers

### Web Search

- Web search based on SearXNG, ready to use out of the box
- Also provides the functionality to crawl web content via URL
- Supports concurrent search and concurrent crawling

### [Artifacts](https://docs.aiaw.app/usage/artifacts.html)

- Convert any part of assistant responses into Artifacts
- User-editable with version control and code highlighting
- Control assistant read/write permissions for Artifacts
- Open multiple Artifacts simultaneously

<img src="https://fs.krytro.com/aiaw/convert-artifact.webp" width="600">

### [Plugin System](https://docs.aiaw.app/usage/plugins.html)

- Built-in calculator, [document parsing, video parsing](https://docs.aiaw.app/usage/file-parse.html), image generation plugins
- Install additional plugins from the marketplace
- Configure Gradio applications as plugins; compatible with some LobeChat plugins
- Plugins are more than just tool calling

![](docs/public/plugin-market.en.webp)

### Lightweight and High Performance

- Quick startup with no waiting
- Smooth conversation switching

<img src="https://fs.krytro.com/aiaw/switch-dialog.webp" width="600">

### [Dynamic Prompts](https://docs.aiaw.app/usage/prompt-vars.html)

- Create prompt variables using template syntax for dynamic, reusable prompts
- Extract repetitive parts into workspace variables for prompt reusability

<img src="docs/usage/res/assistant-prompt-vars.png" width="378">

### Additional Features

Assistant marketplace, dark mode, customizable theme colors, and more.

## This Repository: `lingion/AIaW`

This repository is not just a repackaging mirror. Compared with `NitroRCr/AIaW`, it contains substantial source changes focused on practical mobile delivery, local workflows, packaging verification, plugin workflows, and on-device debugging.

## Explicit feature additions and improvements in this fork

### Mobile chat / UI fixes

This repository contains direct source-level fixes for packaged mobile clients, including:

- restoration of the rounded full-width bottom composer layout (`dialog-main-input`, `dialog-composer-row`)
- fixes for chat-page layout regressions that only appeared on packaged Android builds
- message catalog rail visibility logic corrected so it only occupies space when the screen is actually wide enough
- repeated device-side verification of user/assistant message rendering instead of relying on browser-only assumptions

### Plugin management improvements

This repository adds concrete plugin-management improvements, not just internal refactors:

- **MCP plugin refresh button** in installed plugins UI
  - users can refresh an MCP plugin’s dumped manifest/state without uninstalling and reinstalling it
  - files involved include:
    - `src/stores/plugins.ts`
    - `src/components/InstalledPlugins.vue`
- plugin menu / enable panel fixes for mobile usage
- provider / plugin settings exposure improvements in the UI

### Export / import improvements

This repository includes explicit export/import improvements:

- **lightweight export mode** for user data
  - skips large binary fields such as attachment/image buffers
  - reduces Android-side export failures / crashes on large datasets
  - output filename distinguishes lightweight export from full export
- **import compatibility notes** for lightweight exports
  - lightweight export packages restore database structure and metadata, but do not restore binary attachment payloads
- **runtime guard for missing binary payloads**
  - conversation rendering skips missing `contentBuffer` entries gracefully instead of assuming full binary payloads always exist
- files involved include:
  - `src/components/ExportDataDialog.vue`
  - `src/components/ImportDataDialog.vue`
  - `src/views/DialogView.vue`
  - `src/utils/platform-api.ts`

### Built-in plugin additions / maintenance

This repository explicitly maintains and ships additional built-in plugins in source.
Notable built-in plugin work includes:

- **Web Search plugin**
  - SearXNG-based search
  - Jina-based URL crawling
  - concurrent search / crawl support
  - file: `src/utils/web-search-plugin.ts`

- **Code Execution (Pyodide) plugin**
  - on-device Python execution in the client
  - file: `src/utils/code-exec-plugin.ts`

- **File Operations plugin**
  - structured file operation workflow for the client
  - file: `src/utils/file-ops-plugin.ts`

- **Local FS Native plugin**
  - native/local filesystem access path for packaged clients
  - files:
    - `src/utils/local-fs-native-plugin.ts`
    - `src/utils/local-fs-native.ts`
    - `android/app/src/main/java/app/aiaw/LocalFsPlugin.java`

- **Document Parse plugin** maintenance and integration
  - file: `src/utils/doc-parse-plugin.ts`

### Update-path debugging control

This repository also includes debugging-oriented update-path control:

- startup live-update path can be temporarily disabled while debugging UI issues on packaged clients
- this is important because remote bundles can otherwise override local frontend changes immediately after install
- files involved include:
  - `src/App.vue`
  - `src/utils/update.ts`

### Native shell and packaging changes

Compared with upstream, this repo also contains significant shell/package-level changes:

- Android native shell changes and native plugin wiring
- iOS source-built packaging path maintained in-repo
- iOS app icon and asset-catalog restoration
- packaged frontend assets synchronized into iOS app bundle for real device verification

Relevant paths include:
- `android/app/*`
- `android/capacitor.settings.gradle`
- `ios/App/App.xcodeproj/*`
- `ios/App/App/Assets.xcassets/*`
- `ios/App/App/public/*`
- `capacitor.config.ts`

## Repository-specific working assumptions

This repository treats packaging as part of the feature itself.
A frontend fix is not considered complete until:

1. the source change exists
2. the packaged build actually contains the changed assets
3. the behavior is verified on device

That matters here because packaged clients can behave differently from browser runs, and because update paths / native shells / bundled assets can hide or override what looks correct in source.

## LightHouse

| Desktop | Mobile |
| :-----: | :----: |
| ![](docs/public/lighthouse_score_desktop.png) | ![](docs/public/lighthouse_score_mobile.png) |

## Related Projects

- [New API](https://github.com/Calcium-Ion/new-api): AI model interface management and distribution system, supporting various large models with OpenAI-compatible format

## Install the dependencies

```bash
pnpm i
```

### Start the app in development mode

```bash
quasar dev
```

### Lint the files

```bash
pnpm lint
```

### Build the app for production

```bash
# SPA
quasar build

# PWA
quasar build -m pwa
```

### Build Android locally

```bash
pnpm build
npx cap sync android
cd android
./gradlew assembleDebug
```

### Build iOS locally

```bash
pnpm build
npx cap copy ios
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -archivePath ../build/App.xcarchive archive
```
