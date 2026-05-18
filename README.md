![](docs/public/combine.en.webp)

# AI as Workspace

![](https://badge.mcpx.dev?type=client 'MCP Client') ![](https://badge.mcpx.dev?type=client&features=resources,prompts,tools 'MCP client with features')

An elegant AI client that treats conversations, tools, files, prompts, and artifacts as part of one real workspace instead of one disposable chat box.

[GitHub Repository](https://github.com/lingion/AIaW) - [Latest Release](https://github.com/lingion/AIaW/releases/latest) - [简体中文](README.zh-CN.md)

## About this fork

This repository is based on the original upstream project by [NitroRCr/AIaW](https://github.com/NitroRCr/AIaW), but extends it with a stronger focus on packaged-client workflows, native/mobile usability, built-in power tools, and practical release/debugging paths.

Compared with the upstream README structure, this fork keeps the same core product direction while expanding the parts that matter most in day-to-day use:

- packaged desktop / mobile verification is treated as first-class, not as an afterthought behind browser-only behavior
- built-in power tools are emphasized and maintained in-source
- MCP installation and refresh workflow is more practical
- export / import behavior is more explicit for large real-world datasets
- Android / iOS / native path details are documented more clearly

## Features Overview

### Cross-platform runtime

AIaW is designed as one product with multiple runtime paths:

- Web SPA
- Installable PWA
- Desktop packaged app via Tauri
- Android packaged app via Capacitor
- iOS build path kept in-source

Key goals of this fork:

- keep browser and packaged-client behavior aligned
- keep mobile and native workflows documented instead of implicitly unsupported
- maintain frontend synchronization and release/version flow for packaged builds inside this repository

### Platform support matrix

| Capability | Web / SPA | PWA | Desktop (Tauri) | Android (Capacitor) | iOS path |
|---|---|---|---|---|---|
| Core chat UI | Yes | Yes | Yes | Yes | Source path maintained |
| Workspaces / folders / assistants | Yes | Yes | Yes | Yes | Source path maintained |
| Attachments / image input | Yes | Yes | Yes | Yes | Source path maintained |
| MCP over HTTP / SSE | Yes | Yes | Yes | Yes | Yes |
| MCP over STDIO | No | No | Yes | No | No |
| Built-in Python execution (Pyodide) | Yes | Yes | Yes | Yes | Expected via WebView path |
| File Operations tool | Partial by browser sandbox | Partial | Yes | Yes | Source path maintained |
| Local FS Native | No | No | No | Yes | No |
| Artifacts | Yes | Yes | Yes | Yes | Source path maintained |
| Offline local data | Yes | Yes | Yes | Yes | Source path maintained |

Notes:

- STDIO MCP requires the desktop Tauri app.
- HTTP / SSE MCP works cross-platform.
- `Local FS Native` is an Android packaged-client capability, intended for real device-side filesystem workflows.

## Core product architecture

### Multiple workspaces, folders, and assistants

AIaW is built around workspaces instead of a single flat chat list.

- Create multiple workspaces to separate themes, projects, or roles
- Group workspaces into folders, including nested folders
- Maintain multiple assistants per workspace
- Keep global assistants and reuse them across workspaces
- Store workspace-level home/index content as editable Markdown context

<img src="docs/usage/res/workspace-list.en.png" width="378">

### Conversation interface

The conversation UI is designed for long-running, tool-using, branch-heavy work:

- user input preview
- modifications and regenerations presented as branches
- per-dialog model switching
- customizable keyboard shortcuts
- quick scrolling to message boundaries
- quote selected content from previous messages into follow-up prompts
- select multiple lines of message text to copy original Markdown
- automatically wrap code pasted from VSCode in fenced code blocks with language hints
- optional message catalog rail for heading-rich answers
- plugin enable panel directly in the composer flow

This fork additionally keeps packaged-client chat behavior in better shape:

- rounded full-width bottom composer restoration on packaged mobile clients
- user / assistant message rendering adjustments for packaged clients
- narrow-screen message-catalog rail display logic
- code-block action icon rendering fixes on packaged mobile builds
- stronger focus on verifying fixes inside packaged builds, not only in the browser

<img src="https://fs.krytro.com/aiaw/dialog.webp" width="600">

## AI providers and model support

AIaW is provider-rich rather than vendor-locked.

### Supported provider families

- OpenAI
- OpenAI Compatible
- OpenAI Responses API
- Anthropic
- Google
- Azure OpenAI
- OpenRouter
- DeepSeek
- xAI
- Groq
- Together.ai
- Cohere
- Mistral
- Ollama
- Cerebras
- MiniMax
- BurnCloud

### Model capability awareness

The client keeps per-model input capability metadata instead of assuming every model behaves the same.

Depending on the selected model, AIaW can route or constrain:

- text input
- image input
- audio input
- PDF input
- image output in supported cases

### Custom provider composition

Beyond built-in providers, AIaW also lets you build your own provider layer:

- define custom providers
- attach multiple subproviders
- choose fallback behavior
- map model/provider combinations for your own environment

That makes it useful both as a normal end-user client and as a serious personal AI control surface.

## Local-first storage, sync, and privacy model

### Local-first by default

AIaW stores app state locally first and loads quickly from local storage.

- workspaces
- dialogs
- messages
- artifacts
- assistants
- plugin installation state
- local attachments / item references
- provider configuration

This makes the app usable with instant local state restoration and responsive multi-view updates.

### Offline-friendly behavior

- local data remains accessible offline
- PWA can be installed and used as a local-first client
- packaged desktop/mobile paths keep local state behavior without depending on a browser tab remaining open

### Important fork note about cloud sync

The broader architecture includes Dexie Cloud-related pieces, but in this fork the cloud sync URL is disabled by default.

So the most accurate summary for this repository is:

- local-first storage is fully central
- reactive local updates are present
- cloud sync is not advertised here as a default turnkey service unless you wire it yourself

## MCP, plugins, and extensibility

### MCP Protocol

[MCP documentation](https://docs.aiaw.app/usage/mcp.html)

AIaW is a real MCP client, not a badge-only integration.

Supported MCP concepts:

- Tools
- Prompts
- Resources

Supported MCP connection styles:

- HTTP
- SSE
- STDIO on desktop Tauri builds

You can:

- install MCP-type plugins from the plugin marketplace
- manually add MCP servers
- configure headers, environment variables, and transport details

This fork also adds a more practical installed-plugin workflow:

- MCP plugin refresh is available in the installed-plugins UI
- dumped or updated MCP manifests can be refreshed without forcing a full uninstall/reinstall cycle in the normal case

### Plugin system

[Plugin System documentation](https://docs.aiaw.app/usage/plugins.html)

AIaW plugins are more than simple tool calls.

The plugin layer can include:

- tools
- prompts
- file parsers
- information acquisition flows
- MCP-based capabilities
- Gradio app integration
- compatibility with selected LobeChat plugins

You can install plugins from the marketplace and enable them per assistant/workflow.

![](docs/public/plugin-market.en.webp)

### Built-in plugins and power tools

The built-in plugin catalog is one of the strongest differentiators of this fork.

Included or emphasized in-source:

- Web Search
- Calculator
- Video Transcript
- Whisper
- FLUX image generation
- Emotions
- Mermaid
- Document Parse
- Artifacts
- Code Execution (Pyodide)
- File Operations
- Local FS Native

#### Code Execution (Pyodide)

Run Python locally inside the client without depending on a remote execution server.

Useful for:

- quick calculations
- data transformation
- scripting
- lightweight analysis
- plotting inside a client-side workflow

#### File Operations

A structured file tool layer for AI workflows.

Instead of only generating text answers, the assistant can participate in practical file tasks such as:

- reading files
- writing files
- inspecting directories
- moving/copying/deleting content within supported runtime constraints

#### Local FS Native

Native local filesystem integration for packaged Android clients.

This is meant for real device-side workflows beyond normal browser limitations, including directory-aware operations via platform-native access.

#### Also actively maintained here

- built-in Web Search plugin
- Document Parse integration

## Search, retrieval, and browsing

### Web Search

AIaW includes a built-in web-search workflow instead of treating web access as someone else’s plugin problem.

- web search based on SearXNG
- URL crawling / fetch capability
- concurrent search and concurrent crawl flows

This fork keeps the built-in web-search plugin actively maintained inside source.

## Multimodal input and file parsing

### Attachments and input ergonomics

AIaW supports structured message items rather than forcing every input into one text box.

Examples:

- image attachments
- file attachments
- text attachments for large pasted content
- quote items for follow-up context

Design details that matter in practice:

- text files such as code or CSV can be attached without cluttering display layout
- large text blocks can be pasted outside the input box with Ctrl + V to become attachments
- message history can be quoted into targeted follow-up prompts

<img src="https://fs.krytro.com/aiaw/text-item.webp" width="600">
<img src="https://fs.krytro.com/aiaw/text-selection.webp" width="600">
<img src="https://fs.krytro.com/aiaw/paste-code.webp" width="600">

### Built-in document parsing

[File parsing documentation](https://docs.aiaw.app/usage/file-parse.html)

The document-parsing path is broader than a normal “upload PDF” feature.

Supported parsing flows include combinations of:

- PDF text extraction
- PDF page rendering to images
- DOCX
- XLSX
- PPTX
- backend-assisted parsing in supported cases

This makes AIaW useful for real document-heavy tasks instead of only raw chat input.

## Artifacts and editable outputs

[Artifacts documentation](https://docs.aiaw.app/usage/artifacts.html)

Artifacts are a core workspace feature.

You can:

- convert parts of assistant responses into artifacts
- edit artifacts directly
- keep version-aware artifact workflows
- control assistant read/write permissions for artifacts
- open multiple artifacts simultaneously
- keep artifacts scoped to the workspace instead of losing them in a chat log

This gives AIaW a stronger “working surface” model than clients that only output text.

<img src="https://fs.krytro.com/aiaw/convert-artifact.webp" width="600">

## Dynamic prompts and reusable prompting

[Dynamic Prompts documentation](https://docs.aiaw.app/usage/prompt-vars.html)

AIaW supports reusable prompt engineering inside the app itself.

- create prompt variables using template syntax
- extract repetitive content into reusable workspace variables
- build assistants with parameterized prompts instead of hardcoded walls of text

<img src="docs/usage/res/assistant-prompt-vars.png" width="378">

## Mobile and native-path improvements in this fork

This fork intentionally spends more effort on packaged-client reality.

Highlights:

- packaged-mobile chat layout fixes are maintained in-source
- packaged-client code-block action icon rendering is improved
- mobile/native export path support is strengthened
- MCP installed-plugin refresh is exposed in the UI
- startup live-update can be disabled in debugging workflows so local frontend verification is not immediately overridden by a remote bundle
- lightweight export/import workflows are better tolerated for large real-world datasets where bundling every binary payload is impractical

## Export / import and data portability

This fork expands the practical portability story beyond the original short mention.

Highlights:

- lightweight export mode that can skip heavy binary buffers
- import compatibility for lightweight export packages
- packaged-client file export support on mobile/native paths

This is especially useful when:

- datasets are large
- attachment buffers are expensive to ship around
- you want to preserve structure/workflow without always bundling every binary object in one archive

## Performance and UX polish

### Lightweight and responsive

AIaW aims to feel like a real client, not a loading screen around remote APIs.

- quick startup
- smooth conversation switching
- reactive local data flow
- workspace-oriented structure for large histories

This fork also includes a debugging mode where startup live-update can be disabled during packaged-client verification, so local frontend changes are not immediately replaced by a remote live-update bundle.

<img src="https://fs.krytro.com/aiaw/switch-dialog.webp" width="600">

### Additional UX features

- assistant marketplace
- dark mode
- customizable theme colors
- message selection actions
- reasoning display handling
- power-user keyboard and scrolling preferences

## Build, release, and versioning

### Install dependencies

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

### Runtime/build stacks present in-source

- Quasar + Vue 3 frontend
- PWA build path
- Tauri desktop app path
- Capacitor mobile app path
- Electron scaffold in Quasar config

### Version sync flow

This fork keeps versioning synchronized across the project instead of updating one manifest by hand.

Primary source of truth:

- `src/version.json`

Version sync command:

```bash
pnpm sync-version
```

That syncs version metadata into at least:

- `package.json`
- `src-tauri/tauri.conf.json`
- `android/app/build.gradle`

This is especially important for packaged-client releases where web, desktop, and Android metadata must stay aligned.

## Who this is for

AIaW is especially strong if you want a client that is more than just “choose a model and type”.

It fits well for people who want:

- multi-workspace AI organization
- local-first state instead of thin remote chat tabs
- MCP and plugin extensibility
- document-heavy workflows
- editable artifacts
- native/mobile packaging paths
- on-device power tools such as local Python execution and local file workflows

## Documentation links

- [MCP](https://docs.aiaw.app/usage/mcp.html)
- [Plugin System](https://docs.aiaw.app/usage/plugins.html)
- [File Parsing](https://docs.aiaw.app/usage/file-parse.html)
- [Artifacts](https://docs.aiaw.app/usage/artifacts.html)
- [Dynamic Prompts](https://docs.aiaw.app/usage/prompt-vars.html)
