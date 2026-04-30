![](docs/public/combine.en.webp)

# AI as Workspace (Lingion Fork)

![](https://badge.mcpx.dev?type=client 'MCP Client') ![](https://badge.mcpx.dev?type=client&features=resources,prompts,tools 'MCP client with features')

A maintained fork of AIaW focused on **mobile usability**, **source-first packaging**, and **practical on-device workflows**.

## What this fork is optimizing for

This fork is not trying to stay visually or structurally identical to upstream at all costs.
It is optimized for:

- better **mobile chat usability**
- more reliable **Android/iOS packaging and release iteration**
- safer **local-first** behavior
- practical **plugin / assistant** workflows on constrained devices
- source-controlled fixes that actually survive packaging

## Current mobile status

### Android

Android is currently the primary target.

Working areas actively maintained:
- chat-first mobile UI
- provider / assistant / plugin workflow fixes
- attachment and file-handling improvements
- plugin menu fixes (icons, scrolling, dialog behavior)
- rounded composer / message layout tuning
- release APKs published in GitHub Releases

### iOS

iOS is also being actively packaged and tested.

Current known-good direction:
- source-built IPA packaging works
- iOS app icon assets have been restored in-source
- iOS packaged frontend is now explicitly synced from the current built web assets
- chat UI parity with Android is being improved through source changes, not old shell patching

Important project lesson from this fork:
- iOS behavior should be diagnosed from the **actual packaged source-built artifact**, not guessed from source files alone

## Recent release line

### v1.8.13

This release line includes the latest mobile polish work from this fork, including:

- iOS app icon restoration from source asset catalog
- iOS packaged frontend synchronized to the same current frontend asset set used by Android
- dialog composer input refinements
- send button layout refinements
- message spacing / alignment refinements
- right-side message content catalog rail behavior for wider layouts
- plugin dialog/menu fixes from earlier hotfixes

## Packaging philosophy in this fork

This fork now treats packaging as part of the feature itself.
A UI fix is not considered complete until:

1. the fix is present in source
2. the built package actually contains the new assets/styles
3. the user verifies the behavior on device

## Build from source

```bash
pnpm i
quasar dev
quasar build
```

### Android

```bash
pnpm build
npx cap sync android
cd android
./gradlew assembleDebug
```

Note for this environment:
- after `cap sync android`, Gradle files may need Java/Kotlin target correction back to 17 if the local machine is not on JDK 21

### iOS

```bash
pnpm build
npx cap copy ios
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -sdk iphoneos \
  -archivePath ios/build/App.xcarchive archive
xcodebuild -exportArchive \
  -archivePath ios/build/App.xcarchive \
  -exportOptionsPlist ios/build-src/exportOptions-dev.plist \
  -exportPath ios/build/export
```

Notes:
- for iOS frontend parity work, `npx cap copy ios` matters because the packaged `public/` assets must match the current built frontend
- packaging validation should compare final packaged assets, not just local source edits

## Releases

Latest builds for this fork are published here:

- https://github.com/lingion/AIaW/releases

## Repository direction

This fork currently prioritizes:
- mobile chat usability
- practical packaging reliability
- real-world deployment iteration
- direct user-verified fixes

Release/update paths for this fork should always point to:
- `lingion/AIaW`
