![](docs/public/combine.en.webp)

# AI as Workspace

![](https://badge.mcpx.dev?type=client 'MCP Client') ![](https://badge.mcpx.dev?type=client&features=resources,prompts,tools 'MCP client with features')

An elegant AI client that treats conversations, tools, files, prompts, and artifacts as part of one real workspace instead of one disposable chat box.

**Finally, a production-ready AI client for your phone that respects your privacy and works offline.**

[GitHub Repository](https://github.com/lingion/AIaW) · [Latest Release](https://github.com/lingion/AIaW/releases/latest) · [简体中文](README.zh-CN.md)

---

## Why this fork

This repository is based on [NitroRCr/AIaW](https://github.com/NitroRCr/AIaW) — an excellent AI client with strong foundations in multi-workspace organization, MCP extensibility, and artifact workflows.

This fork extends it with one specific goal: **make AIaW something you can actually use as your daily driver on mobile, with full control over your data.**

| What matters | Upstream (NitroRCr/AIaW) | This fork |
|---|---|---|
| **Mobile experience** | Web-first. Packaged builds treated as secondary. Gesture conflicts, long-press deadlocks, missing camera access. | **Native-first.** Full-screen gesture zoom image viewer. Native camera in chat. Swipe-to-dismiss notifications. Dedicated save directory. All verified on real devices. |
| **Data sovereignty** | Cloud sync enabled by default. Hosted service login in onboarding. | **Pure local-first.** Cloud sync disabled. No hosted service. No account required. Your data never leaves your device unless you choose. |
| **Export & portability** | No conversation export. Large database exports can crash on mobile. | **Offline-perfect HTML + raw Markdown export.** Formulas, tables, code blocks rendered identically to in-app view. Chunked database export with progress bar. |
| **Stability** | WebView edge cases untreated — DOM errors can freeze the entire UI. | **Full error-chain protection.** Dialog-first architecture prevents deadlocks. Every export path has try-catch fallback. Graceful degradation, never silent failure. |
| **AI providers** | Core provider set. Custom providers require manual activation. | **+Cerebras, +MiniMax.** Custom providers auto-activate. Manual model entry when listing fails. MiniMax think-block extraction. |
| **iOS** | Source path kept, not verified. | **Full Xcode project.** Real-device tested. MCP gating, camera permissions, provider compatibility hardened. |

**223 commits · 69 files changed · 5000+ lines of focused improvements**

[Full technical audit with commit evidence →](AUDIT_TABLE.md)

---

## Mobile-native experience

Most AI clients treat mobile as a web page squeezed into a smaller screen. This fork treats it as a first-class platform.

### Touch your images, not fight them

In the upstream project, long-pressing an image on Android triggers a system vibration and gesture deadlock — the app becomes unresponsive. This fork disables the WebView's long-press interception entirely, then builds a proper image viewer on top:

- **Full-screen sandbox** opens on tap — black background, no UI clutter
- **Pivot-point pinch zoom** — your fingers stay on the exact spot you pinched, the image scales around that point
- **Single-finger pan** when zoomed in, **tap blank area** to close
- **Download button** saves directly to `Documents/AiaW/` with a timestamp filename — no system file picker, no "where did it save?"

Every icon is inline SVG. No font-based icon packs that can render as giant text on Android WebView.

### Camera in the chat

A camera button sits right next to the image picker in the composer. Take a photo → it's in the conversation. No app switching, no gallery browsing.

### Notifications that respect your screen

Every status message — save success, export complete, errors — goes through a custom notification layer built for touch:

- ✅ **Positive**: green + checkmark → 1.2 seconds, auto-gone
- ❌ **Negative**: red + X → 2.5 seconds with error details
- Swipe up to dismiss instantly. Notifications never block your screen or fight with WebView gestures.

### Mobile-hardened UI

- Rounded bottom composer restored for Capacitor builds
- Code block action icons render correctly on packaged clients
- Message catalog rail adapts to narrow screens
- Password fields have show/hide toggles for API key configuration
- Token history dropdown with per-provider isolation and notes

### iOS — actually verified

A full Xcode project with MCP gating, provider compatibility fixes, and camera permissions tested on real devices — not just "source path maintained."

> **iOS Availability:** Full Xcode project supported for native builds. We are evaluating Apple Developer Program options; currently, direct sideloading via Xcode is required for iOS power users.

---

## Data sovereignty

### Your data stays on your device

Cloud sync (`dexie-cloud`) is disabled by default. The hosted service login is removed from onboarding. There is no account to create, no server to trust. Your conversations, workspaces, and API keys live on your device.

### Conversation export: share without compromise

Tap export on any conversation → choose your format:

**HTML** — grabs the already-rendered DOM from the in-app Markdown preview. KaTeX formulas, structured tables, syntax-highlighted code blocks — all preserved exactly as you see them. KaTeX CSS is inlined from the running page, so the file renders perfectly offline with no CDN dependency. Files are named after your conversation content + timestamp (e.g., `AIaW_量子力学讨论_20260602_133805.html`).

**Markdown** — raw source with formulas, tables, and code blocks intact. Open in any Markdown editor, feed it to another AI, or archive it.

The export pipeline is resilient by design: the format picker dialog shows first, DOM capture only runs after you confirm. If anything fails, you get a clear error notification — never a silent freeze.

### Large database export

Exporting hundreds of megabytes of chat history on mobile used to cause out-of-memory crashes. This fork uses chunked writes with a progress bar and a lightweight mode that skips heavy attachment buffers.

---

## Provider enhancements

### Built-in providers

OpenAI / OpenAI Compatible / OpenAI Responses API · Anthropic · Google · Azure OpenAI · OpenRouter · DeepSeek · xAI · Groq · Together.ai · Cohere · Mistral · Ollama · **Cerebras** *(fork)* · **MiniMax** *(fork)* · BurnCloud

### Custom provider improvements

- **Auto-activation** — newly created providers become active immediately, no manual switching
- **Manual model entry** — when model listing fails (unsupported API, network issue), type the model name directly
- **Per-provider token history** — dropdown with delete, notes, and isolation between providers
- **Runtime resolution fixes** — custom providers are correctly resolved at send time, not just at configuration time

### MiniMax-specific handling

- Multiple think blocks extracted after tool calls
- Final answer synthesized when tool runs end with think-only output
- Stream failures gracefully fall back to non-stream response

---

## Cross-platform

| | Web/SPA | PWA | Desktop (Tauri) | Android | iOS |
|---|---|---|---|---|---|
| Core chat | ✅ | ✅ | ✅ | ✅ | ✅ |
| Native camera | — | — | — | ✅ | ✅ |
| Gesture image viewer | Basic | Basic | Basic | ✅ Full | ✅ Full |
| MCP HTTP/SSE | ✅ | ✅ | ✅ | ✅ | ✅ |
| MCP STDIO | — | — | ✅ | — | — |
| Code Execution (Pyodide) | ✅ | ✅ | ✅ | ✅ | WebView |
| File Operations | Partial | Partial | ✅ | ✅ | ✅ |
| Local FS Native | — | — | — | ✅ | — |
| Conversation export | ✅ | ✅ | ✅ | ✅ | ✅ |
| Offline data | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Workspaces, conversations, and artifacts

### Multi-workspace organization

AIaW is built around workspaces, not a flat chat list. Create workspaces for themes, projects, or roles. Group them into nested folders. Maintain per-workspace assistants. Reuse global assistants across workspaces. Store workspace-level home content as editable Markdown.

<img src="docs/usage/res/workspace-list.en.png" width="378">

### Conversation interface

- Modifications and regenerations as branches
- Per-dialog model switching
- Quote selected content into follow-up prompts
- Copy multi-line selections as original Markdown
- Auto-wrap pasted code in fenced blocks with language hints
- Message catalog rail for heading-rich responses
- Plugin enable panel in the composer flow

<img src="https://fs.krytro.com/aiaw/dialog.webp" width="600">

### Artifacts and editable outputs

[Artifacts docs →](https://docs.aiaw.app/usage/artifacts.html)

Convert AI responses into editable artifacts. Maintain version-aware workflows. Control read/write permissions. Open multiple artifacts simultaneously. Keep them scoped to workspaces.

<img src="https://fs.krytro.com/aiaw/convert-artifact.webp" width="600">

### Dynamic prompts

[Dynamic Prompts docs →](https://docs.aiaw.app/usage/prompt-vars.html)

Template-based prompt variables. Reusable workspace-level content. Parameterized assistants.

<img src="docs/usage/res/assistant-prompt-vars.png" width="378">

---

## MCP, plugins, and power tools

### MCP Protocol ([docs](https://docs.aiaw.app/usage/mcp.html))

Real MCP client — Tools, Prompts, Resources via HTTP, SSE, or STDIO.

This fork adds:
- **Plugin refresh** — update MCP manifests without full uninstall/reinstall
- **Mobile plugin filtering** — hide unsupported STDIO plugins on mobile
- **MCP provider settings** — per-plugin configuration exposed in UI

### Plugin marketplace

Install from the marketplace. Enable per assistant/workspace. Compatible with LobeChat plugins.

![](docs/public/plugin-market.en.webp)

### Built-in power tools

| Tool | Capability |
|---|---|
| Web Search | SearXNG-based + URL crawling |
| Calculator | Quick computation |
| Video Transcript | Extract from video URLs |
| Whisper | Audio transcription |
| FLUX | Image generation |
| Mermaid | Diagram rendering |
| Document Parse | PDF, DOCX, XLSX, PPTX |
| Artifacts | Editable AI outputs |
| Code Execution | Local Python via Pyodide |
| File Operations | Structured file read/write |
| Local FS Native | Real device filesystem (Android) |

---

## Multimodal input

Structured message items: image attachments, file attachments, text attachments for large pastes, quote items for follow-up context.

<img src="https://fs.krytro.com/aiaw/text-item.webp" width="600">

Document parsing: PDF text + page rendering, DOCX, XLSX, PPTX — not just "upload PDF."

---

<details>
<summary><strong>Build, develop, and contribute</strong></summary>

### Install

```bash
pnpm i
```

### Develop

```bash
quasar dev
```

### Build

```bash
# SPA
quasar build

# PWA
quasar build -m pwa

# Android (after quasar build + rsync)
cd android && ./gradlew assembleDebug
```

### Version sync

```bash
pnpm sync-version
```

Syncs `src/version.json` into `package.json`, `src-tauri/tauri.conf.json`, and `android/app/build.gradle`.

</details>

---

## Who this is for

AIaW is for people who want more than "choose a model and type":

- **Mobile as primary device** — camera, gestures, export, offline
- **Data sovereignty** — nothing leaves your device unless you choose
- **Multi-workspace organization** — not a flat chat list
- **MCP and plugin extensibility** — real tool integration
- **Document-heavy workflows** — PDF, DOCX, XLSX, PPTX
- **Editable artifacts** — AI outputs are assets, not disposable text
- **On-device power tools** — local Python, local filesystem

---

<details>
<summary><strong>Technical audit trail</strong></summary>

For every feature claimed above, there is a commit-level evidence chain. See [AUDIT_TABLE.md](AUDIT_TABLE.md) for the full breakdown.

Key new files introduced by this fork:

| File | Purpose |
|---|---|
| `src/components/ViewImageDialog.vue` | Full-screen image sandbox with gesture zoom |
| `src/components/GlobalToast.vue` | Unified swipe-to-dismiss notification |
| `src/composables/useToast.ts` | Global toast state management |
| `src/composables/export-pdf.ts` | HTML/Markdown dual-channel export |
| `src/utils/local-fs-native.ts` | Native filesystem access |
| `src/utils/local-fs-native-plugin.ts` | Filesystem plugin for AI workflows |
| `ios/` | Complete Xcode project |

Full diff against upstream: [NitroRCr/AIaW → lingion:AIaW](https://github.com/NitroRCr/AIaW/compare/master...lingion:AIaW:master)

</details>

---

## Documentation

- [MCP](https://docs.aiaw.app/usage/mcp.html)
- [Plugin System](https://docs.aiaw.app/usage/plugins.html)
- [File Parsing](https://docs.aiaw.app/usage/file-parse.html)
- [Artifacts](https://docs.aiaw.app/usage/artifacts.html)
- [Dynamic Prompts](https://docs.aiaw.app/usage/prompt-vars.html)
- **[Operation Guide](https://blog.qdp.qzz.io/docs/aiaw/overview)** — step-by-step user manual covering install, architecture, providers, plugins, workspaces, and mobile platforms
- **[Technical Write-up](https://blog.qdp.qzz.io/aiaw-mobile-fork)** — deep-dive: 8 new files, Camera + LocalFs + Pyodide + PDF.js integration
