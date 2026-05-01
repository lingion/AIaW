![](docs/public/combine.en.webp)

# AI as Workspace

![](https://badge.mcpx.dev?type=client 'MCP Client') ![](https://badge.mcpx.dev?type=client&features=resources,prompts,tools 'MCP client with features')

An elegant AI client.

[GitHub Repository](https://github.com/lingion/AIaW) - [Latest Release](https://github.com/lingion/AIaW/releases/latest) - [简体中文](README.zh-CN.md)

## Features Overview

### Consistent Experience Across All Platforms

- Supported platforms: Windows, Linux, Mac OS, Android, Web (PWA)
- Multiple AI providers: OpenAI, Anthropic, Google, DeepSeek, xAI, Azure, etc.
- This fork keeps the **Android / iOS packaged client path** actively maintained in source, instead of treating browser behavior as the only truth.
- iOS app icon assets and packaged frontend synchronization are maintained directly in this repository.

### Conversation Interface

- User input preview
- Modifications and regenerations presented as branches
- Customizable keyboard shortcuts
- Quick scrolling to the beginning/end of a message
- This fork additionally fixes several packaged-mobile chat issues at source level:
  - rounded full-width bottom composer restoration
  - user / assistant message rendering adjustments
  - message-catalog rail display logic for narrow screens
  - code-block action icon rendering in packaged clients

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
- This fork also adds a more practical packaged-client debugging assumption: a fix is not treated as complete until the packaged build is verified on device.

### Design Details

- Support for text files (code, csv, etc.) as attachments; AI can see file contents and names without occupying display space
- For large text blocks, use Ctrl + V **outside the input box** to paste as an attachment; prevents large content from cluttering the display
- Quote content from previous messages to user inputs for targeted follow-up questions
- Select multiple lines of message text to copy the original Markdown
- Automatically wrap code pasted from VSCode in code blocks with language specification
- This fork additionally improves:
  - packaged mobile code-block copy / check icon rendering
  - runtime tolerance when lightweight exports omit binary attachment payloads

<img src="https://fs.krytro.com/aiaw/text-item.webp" width="600">
<img src="https://fs.krytro.com/aiaw/text-selection.webp" width="600">
<img src="https://fs.krytro.com/aiaw/paste-code.webp" width="600">

### [MCP Protocol](https://docs.aiaw.app/usage/mcp.html)

- Support for MCP Tools, Prompts, Resources
- STDIO and HTTP connection methods
- Install MCP-type plugins from the plugin marketplace or manually add MCP servers
- This fork adds **MCP plugin refresh** in the installed-plugins UI, so dumped MCP manifests can be refreshed without uninstall/reinstall.

### Web Search

- Web search based on SearXNG, ready to use out of the box.
- Also provides the functionality to crawl web content via URL.
- Supports concurrent search and concurrent crawling.
- This fork keeps the built-in web-search plugin actively maintained inside source.

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
- Plugin menu / enable panel / provider-facing workflow has also been adjusted for mobile packaged clients.

![](docs/public/plugin-market.en.webp)

#### Built-in power tools emphasized in this fork

##### Code Execution (Pyodide)
Run Python locally inside the client without relying on a remote execution server. Useful for quick calculations, data transformation, scripting, and lightweight analysis directly on-device.

##### File Operations
A structured file tool layer for AI workflows. Lets the assistant read, write, inspect, and manipulate files as part of real tasks instead of only generating text answers.

##### Local FS Native
Native local filesystem integration for packaged clients. Enables directory-aware, device-side file workflows beyond normal browser limitations, making AIaW much closer to a real on-device workspace.

##### Also maintained here
- Web Search plugin
- Document Parse integration

### Lightweight and High Performance

- Quick startup with no waiting
- Smooth conversation switching
- This fork also includes a debugging mode where startup live-update can be disabled, so local frontend changes are not immediately overridden by a remote bundle during packaged-client verification.

<img src="https://fs.krytro.com/aiaw/switch-dialog.webp" width="600">

### [Dynamic Prompts](https://docs.aiaw.app/usage/prompt-vars.html)

- Create prompt variables using template syntax for dynamic, reusable prompts
- Extract repetitive parts into workspace variables for prompt reusability

<img src="docs/usage/res/assistant-prompt-vars.png" width="378">

### Additional Features

Assistant marketplace, dark mode, customizable theme colors, and more.

- This fork also strengthens export/import workflow with:
  - **lightweight export mode** that skips heavy binary buffers
  - import compatibility for lightweight export packages
  - explicit packaged-client file export support on mobile/native paths

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
