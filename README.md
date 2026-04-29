![](docs/public/combine.en.webp)

# AI as Workspace (Lingion Fork)

![](https://badge.mcpx.dev?type=client 'MCP Client') ![](https://badge.mcpx.dev?type=client&features=resources,prompts,tools 'MCP client with features')

A maintained fork of AIaW focused on **mobile usability**, **local-first workflows**, and **real on-device file operations**.

## What this fork changes

This fork is opinionated around practical day-to-day use on phones and tablets:

- better mobile UX for provider / key configuration
- safer local-first storage behavior
- improved plugin management on constrained platforms
- Android-native real directory access via a new `LocalFs` bridge
- iterative fixes for mobile file tools, attachments, and runtime stability

## Current focus

### Mobile file operations

Two layers exist in this fork:

1. **Legacy file tools** (`read` / `write` / `list` etc.)
   - useful for quick local sandbox workflows
   - partially bridged to external Android paths
   - still less authoritative than the native layer

2. **LocalFs (Android native)**
   - built on Android Storage Access Framework
   - intended for true user-authorized local directory access
   - supports mounted directory workflows and segmented file reads
   - forms the long-term foundation for a real local file agent on Android

### Plugin / assistant stability

This fork also includes work on:
- restoring missing builtin plugin entries for existing assistants
- safer mobile plugin registration
- more predictable assistant/plugin behavior across upgrades

## Features

- Platforms: Web, Android, iOS, desktop source tree preserved
- Multiple providers: OpenAI, Anthropic, Google, DeepSeek, xAI, Azure, OpenRouter, Ollama, OpenAI-compatible endpoints
- MCP client support: tools / prompts / resources
- Multiple workspaces and assistants
- Artifacts, document parsing, web search, image generation
- Local-first storage by default
- Mobile-first adjustments for provider and plugin workflows

## Android status

Android is the primary target of this fork right now.

Implemented and actively iterated:
- provider settings UX improvements
- local file tools improvements
- Android-native `LocalFs` plugin for true directory authorization
- release APKs uploaded through GitHub Releases

## iOS status

iOS is still supported in source and packaging flow, but capabilities are not fully equivalent to Android.

What to expect:
- core app can still be built and packaged
- provider / assistant / plugin UX improvements apply
- Android-specific shell behavior does **not** carry over
- native real-directory agent features are currently **Android-first**

## Build from source

```bash
pnpm i
quasar dev
quasar build
```

### Android

```bash
quasar build -m spa --skip-pkg
npx cap sync android
cd android
./gradlew assembleDebug
```

### iOS

```bash
quasar build -m spa --skip-pkg
npx cap sync ios
cd ios/App
pod install
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug -destination 'generic/platform=iOS' build
```

## Releases

Latest builds for this fork are published in:

- https://github.com/lingion/AIaW/releases

## Notes

- This fork intentionally prioritizes working mobile workflows over upstream purity.
- Some features may temporarily exist in parallel while Android-native replacements are being introduced.
- Release/update paths should point to `lingion/AIaW` for this fork.
