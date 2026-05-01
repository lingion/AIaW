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

This repository is not just a repackaging mirror. Compared with `NitroRCr/AIaW`, it contains substantial source changes focused on practical mobile delivery, local workflows, and debugging-on-device.

### Major change areas compared with upstream

#### 1. Mobile app packaging and native shells
Changed areas include:
- `android/app/*`
- `android/capacitor.settings.gradle`
- `android/gradlew`
- `ios/App/App.xcodeproj/*`
- `ios/App/App.xcworkspace/*`
- `ios/App/AppDelegate.swift`
- `ios/App/App/Info.plist`
- `ios/App/App/Assets.xcassets/*`
- `ios/capacitor-cordova-ios-plugins/*`
- `capacitor.config.ts`

What changed in practice:
- Android shell adjustments and native plugin wiring
- iOS source-built packaging path maintained in-repo
- iOS app icon and asset-catalog restoration
- direct packaging iteration from source instead of only web/PWA assumptions

#### 2. Frontend mobile chat / dialog behavior
Changed areas include:
- `src/App.vue`
- `src/components/MessageItem.vue`
- `src/views/DialogView.vue`
- `src/css/app.scss`
- `src/css/platform/android/index.scss`
- `src/css/platform/ios/index.scss`
- `src/layouts/MainLayout.vue`

What changed in practice:
- mobile chat layout debugging and fixes
- composer styling adjustments
- message spacing / preview rendering adjustments
- message catalog rail behavior fixes for narrow screens
- explicit disabling of startup live-update path during debugging builds so local frontend changes are not immediately overridden by remote bundles

#### 3. Plugin / provider / MCP workflow changes
Changed areas include:
- `src/stores/plugins.ts`
- `src/stores/providers.ts`
- `src/utils/plugins.ts`
- `src/utils/platform-api.ts`
- `src/utils/config.ts`
- `src/utils/update.ts`
- `src/utils/values.ts`
- `src/components/AddMcpPluginDialog.vue`
- `src/components/CustomProviders.vue`
- `src/components/EnablePluginsItems.vue`
- `src/components/EnablePluginsMenu.vue`
- `src/components/InstalledPlugins.vue`
- `src/components/ProviderInputItems.vue`
- `src/components/TypesInput.vue`
- `src/components/UnifiedInput.vue`
- `src/components/GetModelList.vue`

What changed in practice:
- custom provider workflow changes
- MCP/provider settings exposure in UI
- plugin enable/disable and menu behavior fixes
- mobile-oriented plugin presentation improvements
- update flow differences for packaged clients

#### 4. Local-first / native file and execution support
Changed areas include:
- `src/utils/local-fs-native-plugin.ts`
- `src/utils/local-fs-native.ts`
- `src/utils/file-ops-plugin.ts`
- `src/utils/code-exec-plugin.ts`
- `android/app/src/main/java/app/aiaw/LocalFsPlugin.java`

What changed in practice:
- native/local filesystem capabilities exposed for packaged app workflows
- mobile/local execution-oriented adaptations
- more practical on-device file handling

#### 5. Built-in data / language / seed behavior
Changed areas include:
- `src/utils/builtin-plugin-seed.ts`
- `src/i18n/en-US/components.ts`
- `src/i18n/en-US/composables.ts`
- `src/i18n/en-US/views.ts`
- `src/i18n/zh-CN/components.ts`
- `src/i18n/zh-CN/composables.ts`
- `src/i18n/zh-CN/views.ts`
- `src/version.json`

What changed in practice:
- built-in plugin migration / seeding behavior
- UI copy changes for fork-specific flows
- packaged-client behavior tied to this repo’s version line

#### 6. Backend helpers / test and process documents
Changed areas include:
- `src-backend/app.py`
- `src-backend/requirements.txt`
- `scripts/test-export-import*.mjs`
- `ACTIVE_RUNTIME_CONFIG.md`
- `ARCHITECTURE_BOUNDARIES.md`
- `DELIVERY_RULES.md`
- `REGRESSION_CHECKLIST.md`
- `RISK_REGISTER.md`

What changed in practice:
- supporting backend helpers for this repo’s workflow
- project-specific release/debug rules
- repository-specific regression and delivery documentation

#### 7. Synced built assets under iOS app bundle
A large number of files under:
- `ios/App/App/public/*`

These are not hand-authored feature code one by one. They are the synced built frontend assets used by packaged iOS builds, but they are still part of the repository delta relative to upstream.

## Repository-specific working assumptions

This repository treats packaging as part of the feature itself.
A frontend fix is not considered complete until:

1. the source change exists
2. the packaged build actually contains the changed assets
3. the behavior is verified on device

This matters because packaged clients may differ from browser behavior, and because update paths / native shells / bundled assets can hide or override what looks correct in source.

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
