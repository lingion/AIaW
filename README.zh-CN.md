![](docs/public/combine.webp)

# AI as Workspace

![](https://badge.mcpx.dev?type=client 'MCP Client') ![](https://badge.mcpx.dev?type=client&features=resources,prompts,tools 'MCP client with features')

一个把对话、工具、文件、提示词、Artifacts 都组织进同一个工作台里的 AI 客户端，而不只是一个一次性聊天窗口。

[GitHub 仓库](https://github.com/lingion/AIaW) - [最新 Release](https://github.com/lingion/AIaW/releases/latest) - [English](README.md)

## 关于这个 fork

本仓库基于上游项目 [NitroRCr/AIaW](https://github.com/NitroRCr/AIaW)，但在其基础上进一步强化了打包客户端链路、原生 / 移动端可用性、内置 power tools，以及更实际的发布 / 调试工作流。

相较于上游 README 的基础结构，这个 fork 保留了原本的核心产品方向，同时把真正影响日常使用的部分继续往前推进：

- 把桌面 / 移动端打包验证当作一等公民，而不是只以浏览器表现为准
- 把内置 power tools 当作长期维护能力，而不是展示性功能
- MCP 安装与刷新工作流更实用
- 导出 / 导入更适合真实大数据量使用场景
- Android / iOS / native 路径的说明更完整

## 功能概览

### 跨平台运行形态

AIaW 不是单一 Web 页面，而是一套多运行时路径的统一产品：

- Web SPA
- 可安装的 PWA
- 基于 Tauri 的桌面打包客户端
- 基于 Capacitor 的 Android 打包客户端
- 仍保留在源码中的 iOS 构建路径

这个 fork 的核心目标包括：

- 尽量让浏览器与打包客户端行为保持一致
- 把移动端 / 原生链路明确写出来，而不是默认视为不重要
- 在这个仓库内部直接维护打包构建所需的前端同步与版本链路

### 平台支持矩阵

| 能力 | Web / SPA | PWA | 桌面端（Tauri） | Android（Capacitor） | iOS 路径 |
|---|---|---|---|---|---|
| 核心对话界面 | 支持 | 支持 | 支持 | 支持 | 源码路径保留 |
| 工作区 / 文件夹 / 助手 | 支持 | 支持 | 支持 | 支持 | 源码路径保留 |
| 附件 / 图片输入 | 支持 | 支持 | 支持 | 支持 | 源码路径保留 |
| MCP over HTTP / SSE | 支持 | 支持 | 支持 | 支持 | 支持 |
| MCP over STDIO | 不支持 | 不支持 | 支持 | 不支持 | 不支持 |
| 内置 Python 执行（Pyodide） | 支持 | 支持 | 支持 | 支持 | 预期沿 WebView 路径可用 |
| File Operations 工具 | 受浏览器沙箱限制 | 受浏览器沙箱限制 | 支持 | 支持 | 源码路径保留 |
| Local FS Native | 不支持 | 不支持 | 不支持 | 支持 | 不支持 |
| Artifacts | 支持 | 支持 | 支持 | 支持 | 源码路径保留 |
| 本地离线数据 | 支持 | 支持 | 支持 | 支持 | 源码路径保留 |

说明：

- STDIO MCP 需要桌面 Tauri 客户端。
- HTTP / SSE MCP 可跨平台使用。
- `Local FS Native` 是 Android 打包客户端侧的能力，用来做真实设备目录级工作流。

## 核心产品结构

### 多工作区、文件夹与助手体系

AIaW 的组织模型不是单一聊天列表，而是完整的 workspace 体系。

- 创建多个工作区，隔离不同主题、项目或角色
- 使用文件夹组织工作区，并支持嵌套
- 在同一工作区下维护多个助手
- 复用全局助手到多个工作区
- 维护工作区级别的主页 / index Markdown 内容

<img src="docs/usage/res/workspace-list.png" width="378">

### 对话页面

对话页面是面向长上下文、多分支、多工具调用工作流设计的：

- 用户输入预览
- 修改提问、重新生成以分叉形式呈现
- 对话内切换模型
- 自定义键盘快捷键
- 对齐到消息边界的快速滚动
- 引用历史消息中的局部内容发起追问
- 选中多行消息文本后复制 Markdown 原文
- 粘贴从 VSCode 复制的代码时自动补 fenced code block 与语言标记
- 可选消息目录 rail，适合长 Markdown 回答
- 在输入区直接启用 / 禁用插件

这个 fork 还持续修正 packaged client 的实际体验：

- 恢复移动端底部输入区圆角与撑满布局
- 调整 user / assistant 消息渲染链路
- 修正窄屏下消息目录 rail 的显示逻辑
- 修复打包客户端中的代码块操作图标渲染
- 更强调“设备内包体验已验证”而不是“浏览器里看起来没问题”

<img src="https://fs.krytro.com/aiaw/dialog.webp" width="600">

## AI 服务商与模型支持

AIaW 不是单服务商客户端，而是 provider-rich 的统一入口。

### 支持的 provider 家族

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

### 模型能力感知

客户端内部保留了按模型区分的输入能力元数据，而不是假设所有模型都能接受相同输入。

根据所选模型，AIaW 可以识别或限制：

- 文本输入
- 图片输入
- 音频输入
- PDF 输入
- 部分模型支持的图片输出

### 自定义 provider 编排

除了内建 provider，还可以在 AIaW 里自定义自己的 provider 层：

- 定义 custom provider
- 挂多个 subprovider
- 配置 fallback 行为
- 维护自己的模型 / provider 组合关系

这让它既能当普通终端用户客户端，也能当个人 AI 控制台来用。

## Local-first、同步与隐私模型

### 默认以本地为先

AIaW 的状态首先保存在本地，并优先从本地快速恢复。

包括但不限于：

- 工作区
- 对话
- 消息
- Artifacts
- 助手
- 插件安装状态
- 本地附件 / item 引用
- provider 配置

这使得整个应用能以本地状态为核心快速启动，并保持响应式更新。

### 离线友好

- 本地数据离线可访问
- PWA 可安装并作为 local-first 客户端使用
- 桌面 / 移动端打包路径不依赖浏览器标签页持续存在

### 这个 fork 对云同步的准确表述

更大的架构里仍有 Dexie Cloud 相关部件，但在这个 fork 里，cloud sync URL 默认是关闭的。

因此，对本仓库最准确的描述是：

- local-first 是核心
- 本地响应式更新是现成能力
- 不把 cloud sync 当作这个 fork 默认可直接开箱使用的服务来承诺

## MCP、插件与扩展能力

### MCP 协议

[MCP 文档](https://docs.aiaw.app/usage/mcp.html)

AIaW 是一个真正可用的 MCP client，而不是只有 badge。

支持的 MCP 概念：

- Tools
- Prompts
- Resources

支持的 MCP 连接方式：

- HTTP
- SSE
- 桌面 Tauri 客户端中的 STDIO

你可以：

- 在插件市场安装 MCP 类型插件
- 手动添加 MCP 服务器
- 配置 headers、环境变量、传输方式等细节

这个 fork 还把已安装 MCP 插件工作流做得更顺手：

- 已安装插件界面里支持 MCP 插件刷新
- 普通场景下，无需卸载重装即可刷新更新后的 manifest / dump 状态

### 插件系统

[插件系统文档](https://docs.aiaw.app/usage/plugins.html)

AIaW 的插件不只是简单 tool calling。

插件层可以覆盖：

- tools
- prompts
- file parsers
- 信息获取能力
- MCP 能力接入
- Gradio 应用集成
- 对部分 LobeChat 插件的兼容

你可以从插件市场安装插件，并按助手 / 工作流启用。

![](docs/public/plugin-market.png)

### 内置插件与 power tools

内置插件目录是这个 fork 最强的差异化部分之一。

当前内置或重点维护的能力包括：

- Web Search
- Calculator
- Video Transcript
- Whisper
- FLUX 图像生成
- Emotions
- Mermaid
- Document Parse
- Artifacts
- Code Execution (Pyodide)
- File Operations
- Local FS Native

#### Code Execution (Pyodide)

直接在客户端本地运行 Python，不依赖远程执行服务器。

适合：

- 快速计算
- 数据处理
- 小脚本验证
- 轻量分析
- 在客户端侧完成绘图等辅助任务

#### File Operations

给 AI 提供结构化文件操作能力。

不再只是“生成一段回答”，而是可以在支持的平台约束内参与真实文件任务，例如：

- 读取文件
- 写入文件
- 查看目录
- 移动 / 复制 / 删除内容

#### Local FS Native

面向 Android 打包客户端的原生本地文件系统能力。

它让 AI 可以围绕设备上的真实目录工作，而不再被普通浏览器文件能力限制住，是这个 fork 很核心的差异化点。

#### 另外持续维护

- 内置 Web Search 插件
- Document Parse 集成

## 联网搜索、抓取与检索

### Web Search

AIaW 自带联网搜索工作流，而不是把联网能力完全交给外部插件。

- 基于 SearXNG 的联网搜索
- 通过 URL 获取 / 抓取网页内容
- 支持并发搜索与并发抓取

这个 fork 持续在源码内维护 Web Search 插件本身。

## 多模态输入与文档解析

### 附件与输入体验

AIaW 支持结构化 message item，而不是把所有输入都塞进一个文本框里。

常见形式包括：

- 图片附件
- 文件附件
- 大文本附件
- quote 引用项

这些细节在真实使用里非常重要：

- 文本文件（代码、CSV 等）可作为附件传递，而不挤占主显示区域
- 大段文本可在输入框外 Ctrl + V 粘贴为附件
- 可从历史消息抽取片段做针对性追问

<img src="https://fs.krytro.com/aiaw/text-item.webp" width="600">
<img src="https://fs.krytro.com/aiaw/text-selection.webp" width="600">
<img src="https://fs.krytro.com/aiaw/paste-code.webp" width="600">

### 内置文档解析

[文件解析文档](https://docs.aiaw.app/usage/file-parse.html)

文档解析能力并不只是“上传 PDF”这么简单。

支持的解析路径包括：

- PDF 文本提取
- PDF 页面转图片
- DOCX
- XLSX
- PPTX
- 在特定场景下接入后端解析能力

这让 AIaW 更适合真实文档工作流，而不是只能处理纯聊天文本。

## Artifacts 与可编辑输出

[Artifacts 文档](https://docs.aiaw.app/usage/artifacts.html)

Artifacts 是 AIaW 的核心工作台能力之一。

你可以：

- 把助手回答的任意部分转成 Artifact
- 直接编辑 Artifact
- 使用带版本感知的 Artifact 工作流
- 控制助手对 Artifact 的读写权限
- 同时打开多个 Artifact
- 把 Artifact 留在 workspace 内，而不是淹没在聊天记录里

这让 AIaW 比“只会吐文本”的客户端更像真正的工作台。

<img src="https://fs.krytro.com/aiaw/convert-artifact.webp" width="600">

## 动态提示词与可复用 Prompt

[动态提示词文档](https://docs.aiaw.app/usage/prompt-vars.html)

AIaW 支持把 prompt engineering 直接做进应用本体里。

- 创建提示词变量
- 使用模板语法构建动态 prompt
- 把重复内容抽成 workspace 变量复用
- 构建参数化助手，而不是硬编码的一大段 system prompt

<img src="docs/usage/res/assistant-prompt-vars.png" width="378">

## 这个 fork 对移动端 / 原生路径的增强

这个 fork 明确把 packaged-client 现实问题当成长期维护对象。

重点包括：

- 持续维护 packaged mobile 聊天界面修复
- 改善打包客户端中的代码块操作图标渲染
- 强化移动端 / native 路径导出能力
- 在 UI 中提供 MCP 已安装插件刷新入口
- 在调试 packaged client 时可关闭 startup live-update，避免远程 bundle 覆盖本地前端验证结果
- 对轻量导出 / 导入场景下的大型真实数据更友好

## 导出 / 导入与数据可迁移性

这个 fork 把数据可迁移性从简短说明扩展成了更可落地的能力。

重点包括：

- 轻量导出模式：跳过体积很大的二进制 buffer
- 对轻量导出包保持导入兼容
- 移动端 / native 路径的文件导出支持

这在以下场景里尤其有用：

- 数据集很大
- 附件 buffer 太重，不适合每次一起打包
- 你想保留工作流结构和主数据，但不想每次都携带所有二进制对象

## 性能与交互体验

### 轻量且响应迅速

AIaW 的目标不是“一个套壳网页”，而是尽可能接近真正客户端体验。

- 启动迅速
- 切换对话流畅
- 本地响应式数据链路
- 以 workspace 为核心组织大规模历史记录

这个 fork 还加入了 packaged-client 调试期的 live-update 控制，避免本地前端修改在验证时立刻被远端 bundle 替换。

<img src="https://fs.krytro.com/aiaw/switch-dialog.webp" width="600">

### 其他交互增强

- 助手市场
- 深色模式
- 自定义主题色
- 文本选中动作
- reasoning 展示控制
- 面向 power user 的键盘与滚动偏好设置

## 构建、发布与版本同步

### 安装依赖

```bash
pnpm i
```

### 启动开发环境

```bash
quasar dev
```

### 代码检查

```bash
pnpm lint
```

### 构建生产版本

```bash
# SPA
quasar build

# PWA
quasar build -m pwa
```

### 仓库内已有的运行时 / 构建栈

- Quasar + Vue 3 前端
- PWA 构建路径
- Tauri 桌面端路径
- Capacitor 移动端路径
- Quasar 配置中的 Electron scaffold

### 版本同步流

这个 fork 维护了一套统一版本同步逻辑，而不是每次手工改多个 manifest。

版本源头：

- `src/version.json`

同步命令：

```bash
pnpm sync-version
```

它会至少同步到：

- `package.json`
- `src-tauri/tauri.conf.json`
- `android/app/build.gradle`

对打包客户端发布尤其重要，因为 Web、桌面端、Android 的版本元数据需要保持一致。

## 适合什么人

如果你要的不是“选个模型然后聊天”，而是一个更接近工作台的 AI 客户端，AIaW 会更合适。

它尤其适合这些需求：

- 用多工作区管理 AI 工作流
- 希望状态 local-first，而不是依赖远端网页标签页
- 需要 MCP 与插件扩展能力
- 有大量文档型工作流
- 希望把结果沉淀成可编辑 Artifact
- 需要原生 / 移动端打包路径
- 希望直接在设备侧用 Python、本地文件、原生目录能力

## 文档入口

- [MCP](https://docs.aiaw.app/usage/mcp.html)
- [插件系统](https://docs.aiaw.app/usage/plugins.html)
- [文件解析](https://docs.aiaw.app/usage/file-parse.html)
- [Artifacts](https://docs.aiaw.app/usage/artifacts.html)
- [动态提示词](https://docs.aiaw.app/usage/prompt-vars.html)
