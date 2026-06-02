![](docs/public/combine.webp)

# AI as Workspace

![](https://badge.mcpx.dev?type=client 'MCP Client') ![](https://badge.mcpx.dev?type=client&features=resources,prompts,tools 'MCP client with features')

一个优雅的 AI 客户端——将对话、工具、文件、提示词和 Artifacts 整合为一个真正的 Workspace，而不是一次性的聊天框。

[GitHub 仓库](https://github.com/lingion/AIaW) · [最新 Release](https://github.com/lingion/AIaW/releases/latest) · [English](README.md)

---

## 为什么要有这个 Fork

本项目基于 [NitroRCr/AIaW](https://github.com/NitroRCr/AIaW)——一个优秀的 AI 客户端，在多工作区组织、MCP 扩展性和 Artifact 工作流方面有扎实的基础。

这个 Fork 只做一件事：**让 AIaW 成为你真正能在手机上日常使用的生产力工具，同时完全掌控自己的数据。**

| 核心维度 | 上游 (NitroRCr/AIaW) | 本 Fork |
|---|---|---|
| **移动端体验** | Web 优先，打包客户端被视为附属。手势冲突、长按死锁、缺少相机调用。 | **原生优先。** 全屏手势缩放看图、聊天内原生相机、上划消失通知、专属保存目录，全部真机验证。 |
| **数据主权** | 默认开启云同步，引导注册托管服务。 | **纯本地优先。** 云同步已禁用，无托管服务，无需注册。数据不经任何第三方。 |
| **导出与便携性** | 无对话导出。大数据量导出在移动端会崩溃。 | **离线完美 HTML + 原始 Markdown 导出。** 公式、表格、代码块与 App 内显示完全一致。分块数据库导出带进度条。 |
| **稳定性** | WebView 边界情况未处理，DOM 错误可导致整个 UI 冻结。 | **全链路错误防护。** Dialog-first 架构防止死锁，每条导出路径都有 try-catch 降级。优雅降级，从不静默失败。 |
| **AI 提供商** | 基础提供商集合，自定义提供商需手动激活。 | **+Cerebras、+MiniMax。** 自定义提供商自动激活，模型列表失败时可手动输入。MiniMax think block 提取。 |
| **iOS** | 源码路径保留，未验证。 | **完整 Xcode 项目。** 真机测试通过，MCP 门控、相机权限、提供商兼容性均已硬化。 |

**223 commits · 69 个文件变更 · 5000+ 行聚焦改进**

[查看完整技术审计（含 commit 证据链）→](AUDIT_TABLE.md)

---

## 移动端原生体验

大多数 AI 客户端把移动端当作缩小版的网页。这个 Fork 把移动端当作一等公民。

### 触摸你的图片，而不是和它打架

上游项目中，在 Android 上长按图片会触发系统震动和手势死锁——App 直接卡死。本 Fork 完全禁用了 WebView 的长按拦截，然后在上面构建了一个正经的图片查看器：

- **全屏沙箱** — 点击打开，纯黑背景，无 UI 干扰
- **Pivot-Point 双指缩放** — 手指放在哪就以哪为中心放大，图片围绕那个点缩放
- **单指拖拽平移**，**点击空白区域关闭**
- **下载按钮** — 直接保存到 `Documents/AiaW/`，时间戳命名，无系统弹窗，不用找文件

所有图标使用内联 SVG，不依赖任何字体图标包（Android WebView 上字体图标可能渲染成巨大文字）。

### 聊天内调用相机

输入框旁边就有相机按钮。拍照 → 直接进入对话。不用切 App，不用翻相册。

### 尊重你屏幕的通知

每条状态消息——保存成功、导出完成、错误——都通过为触屏定制的通知层：

- ✅ **正面**: 绿色 + 勾号 → 1.2 秒自动消失
- ❌ **负面**: 红色 + 叉号 → 2.5 秒 + 错误详情
- 上划即刻消失。通知永远不会挡住你的屏幕，也不会和 WebView 手势打架。

### 移动端 UI 加固

- Capacitor 构建恢复圆角底部输入框
- 代码块操作图标在打包客户端正确渲染
- 消息目录栏适配窄屏
- 密码字段支持显示/隐藏切换（配置 API Key 不用盲打）
- Token 历史下拉，按提供商隔离 + 备注

### iOS — 真机验证通过

完整 Xcode 项目，MCP 门控、提供商兼容性修复、相机权限均已在真机上测试——不只是"源码路径保留"。

> **iOS 可用性：** 完整 Xcode 项目支持原生构建。我们正在评估 Apple Developer Program 方案；目前 iOS 高级用户需通过 Xcode 直接侧载安装。

---

## 数据主权

### 你的数据只存在于你的设备上

云同步（`dexie-cloud`）已默认禁用。托管服务登录已从引导流程中移除。无需创建账号，无需信任任何服务器。你的对话、工作区和 API Key 只存在于你的设备上。

### 对话导出：无妥协地分享

点击任意对话的导出 → 选择格式：

**HTML** — 直接抓取 App 内 Markdown 预览已渲染的 DOM。KaTeX 公式、结构化表格、语法高亮代码块——与你看到的一模一样。KaTeX CSS 从运行中的页面内联，文件完全离线可用，无 CDN 依赖。文件名取对话内容前几字 + 时间戳（如 `AIaW_量子力学讨论_20260602_133805.html`）。

**Markdown** — 原始源码，公式、表格、代码块完整保留。用任何 Markdown 编辑器打开，或喂给另一个 AI。

导出管线设计上就是容错的：格式选择对话框先弹出，DOM 抓取只在确认后执行。任何环节失败，你会看到清晰的错误通知——绝不会静默卡死。

### 大数据库导出

在移动端导出几百 MB 的聊天记录以前会导致内存溢出崩溃。现在使用分块写入 + 进度条 + 轻量模式（跳过大附件缓冲区）。

---

## 提供商增强

### 内置提供商

OpenAI / OpenAI Compatible / OpenAI Responses API · Anthropic · Google · Azure OpenAI · OpenRouter · DeepSeek · xAI · Groq · Together.ai · Cohere · Mistral · Ollama · **Cerebras** *(Fork 新增)* · **MiniMax** *(Fork 新增)* · BurnCloud

### 自定义提供商改进

- **自动激活** — 新建的提供商立即生效，无需手动切换
- **手动模型输入** — 模型列表获取失败时（不支持的 API、网络问题），直接输入模型名
- **按提供商 Token 历史** — 下拉选择 + 删除 + 备注 + 提供商间隔离
- **运行时解析修复** — 自定义提供商在发送时被正确解析，不只是配置时

### MiniMax 专项处理

- 多个 think block 在 tool call 后正确提取
- tool run 以 think-only 结束时合成最终回答
- 流式失败优雅降级为非流式响应

---

## 跨平台

| | Web/SPA | PWA | 桌面端 (Tauri) | Android | iOS |
|---|---|---|---|---|---|
| 核心对话 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 原生相机 | — | — | — | ✅ | ✅ |
| 手势图片查看器 | 基础 | 基础 | 基础 | ✅ 完整 | ✅ 完整 |
| MCP HTTP/SSE | ✅ | ✅ | ✅ | ✅ | ✅ |
| MCP STDIO | — | — | ✅ | — | — |
| 代码执行 (Pyodide) | ✅ | ✅ | ✅ | ✅ | WebView |
| 文件操作 | 部分 | 部分 | ✅ | ✅ | ✅ |
| 本地文件系统 | — | — | — | ✅ | — |
| 对话导出 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 离线数据 | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 工作区、对话与 Artifacts

### 多工作区组织

AIaW 以工作区为核心，不是扁平的聊天列表。按主题、项目、角色创建工作区。放入嵌套文件夹。每个工作区维护独立的助手。复用全局助手。工作区首页存储为可编辑的 Markdown。

<img src="docs/usage/res/workspace-list.en.png" width="378">

### 对话界面

- 修改和重新生成以分支形式呈现
- 按对话切换模型
- 引用选中内容到后续提示词
- 多行选择复制原始 Markdown
- 自动将粘贴的代码包裹在带语言标记的代码块中
- 消息目录栏（适合标题丰富的回复）
- 输入框中的插件启用面板

<img src="https://fs.krytro.com/aiaw/dialog.webp" width="600">

### Artifacts 与可编辑输出

[Artifacts 文档 →](https://docs.aiaw.app/usage/artifacts.html)

将 AI 回复转化为可编辑的 Artifacts。维护版本感知的工作流。控制读写权限。同时打开多个 Artifacts。限定在工作区范围内。

<img src="https://fs.krytro.com/aiaw/convert-artifact.webp" width="600">

### 动态提示词

[动态提示词文档 →](https://docs.aiaw.app/usage/prompt-vars.html)

基于模板的提示词变量。可复用的工作区级内容。参数化助手。

<img src="docs/usage/res/assistant-prompt-vars.png" width="378">

---

## MCP、插件与生产力工具

### MCP 协议 ([文档](https://docs.aiaw.app/usage/mcp.html))

真正的 MCP 客户端——通过 HTTP、SSE 或 STDIO 支持 Tools、Prompts、Resources。

本 Fork 新增：
- **插件刷新** — 更新 MCP 清单无需卸载重装
- **移动端插件过滤** — 在移动端隐藏不支持的 STDIO 插件
- **MCP 提供商设置** — 按插件暴露配置项

### 插件市场

从市场安装，按助手/工作区启用。兼容 LobeChat 插件。

![](docs/public/plugin-market.en.webp)

### 内置生产力工具

| 工具 | 能力 |
|---|---|
| Web 搜索 | 基于 SearXNG + URL 抓取 |
| 计算器 | 快速计算 |
| 视频转录 | 从视频 URL 提取字幕 |
| Whisper | 音频转文字 |
| FLUX | 图片生成 |
| Mermaid | 图表渲染 |
| 文档解析 | PDF、DOCX、XLSX、PPTX |
| Artifacts | 可编辑的 AI 输出 |
| 代码执行 | 本地 Python (Pyodide) |
| 文件操作 | 结构化文件读写 |
| 本地文件系统 | 真实设备文件系统访问 (Android) |

---

## 多模态输入

结构化消息项：图片附件、文件附件、大段文本附件、引用项。

<img src="https://fs.krytro.com/aiaw/text-item.webp" width="600">

文档解析：PDF 文本 + 页面渲染、DOCX、XLSX、PPTX——不只是"上传 PDF"。

---

<details>
<summary><strong>构建、开发与贡献</strong></summary>

### 安装

```bash
pnpm i
```

### 开发

```bash
quasar dev
```

### 构建

```bash
# SPA
quasar build

# PWA
quasar build -m pwa

# Android (quasar build + rsync 后)
cd android && ./gradlew assembleDebug
```

### 版本同步

```bash
pnpm sync-version
```

将 `src/version.json` 同步到 `package.json`、`src-tauri/tauri.conf.json` 和 `android/app/build.gradle`。

</details>

---

## 适合谁

AIaW 适合想要更多而不仅仅是"选个模型然后打字"的人：

- **手机是主力设备** — 相机、手势、导出、离线
- **数据主权** — 除非你选择，否则数据不离开你的设备
- **多工作区组织** — 不是扁平聊天列表
- **MCP 和插件扩展** — 真正的工具集成
- **文档密集型工作流** — PDF、DOCX、XLSX、PPTX
- **可编辑 Artifacts** — AI 输出是资产，不是一次性文字
- **设备端生产力工具** — 本地 Python、本地文件系统

---

<details>
<summary><strong>技术审计追踪</strong></summary>

以上声称的每一项功能，都有 commit 级证据链。详见 [AUDIT_TABLE.md](AUDIT_TABLE.md)。

本 Fork 引入的关键新文件：

| 文件 | 用途 |
|---|---|
| `src/components/ViewImageDialog.vue` | 全屏图片沙箱，手势缩放 |
| `src/components/GlobalToast.vue` | 统一的上划消失通知 |
| `src/composables/useToast.ts` | 全局 Toast 状态管理 |
| `src/composables/export-pdf.ts` | HTML/Markdown 双通道导出 |
| `src/utils/local-fs-native.ts` | 原生文件系统访问 |
| `src/utils/local-fs-native-plugin.ts` | AI 工作流文件系统插件 |
| `ios/` | 完整 Xcode 项目 |

与上游的完整对比: [NitroRCr/AIaW → lingion:AIaW](https://github.com/NitroRCr/AIaW/compare/master...lingion:AIaW:master)

</details>

---

## 文档

- [MCP](https://docs.aiaw.app/usage/mcp.html)
- [插件系统](https://docs.aiaw.app/usage/plugins.html)
- [文件解析](https://docs.aiaw.app/usage/file-parse.html)
- [Artifacts](https://docs.aiaw.app/usage/artifacts.html)
- [动态提示词](https://docs.aiaw.app/usage/prompt-vars.html)
