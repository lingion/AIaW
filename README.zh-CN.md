![](docs/public/combine.webp)

# AI as Workspace

![](https://badge.mcpx.dev?type=client 'MCP Client') ![](https://badge.mcpx.dev?type=client&features=resources,prompts,tools 'MCP client with features')

更好的 AI 客户端

[GitHub 仓库](https://github.com/lingion/AIaW) - [最新 Release](https://github.com/lingion/AIaW/releases/latest)

## 功能概览

### 全平台一致体验

- 支持平台：Windows, Linux, Mac OS, Android, Web (PWA)
- 多服务商支持：OpenAI, Anthropic, Google, DeepSeek, xAI, Azure 等
- 这个 fork 额外长期维护 **Android / iOS 打包客户端链路**，而不是只把浏览器表现当成最终结果
- iOS App Icon 资源与打包前端同步逻辑也在本仓库内直接维护

### 对话页面

- 用户输入预览
- 修改提问、重新生成 以分叉的形式呈现
- 自定义键盘快捷键
- 对齐到消息开头/结尾的快速滚动
- 这个 fork 额外在源码层修过多项移动端聊天界面问题，包括：
  - 底部输入区圆角与撑满布局恢复
  - user / assistant 消息渲染链路调整
  - 窄屏下 message-catalog rail 占位逻辑修正
  - 打包客户端里代码块复制按钮图标渲染修复

<img src="https://fs.krytro.com/aiaw/dialog.webp" width="600">

### 多工作区

- 创建多个工作区，将不同主题的对话分隔开
- 可将多个工作区放入一个文件夹中；支持嵌套
- 一个工作区中可创建多个助手，也可以创建全局助手

<img src="docs/usage/res/workspace-list.png" width="378">

### 数据储存

- 数据首先储存在本地，无需加载且离线可浏览
- 登录后可使用云同步，跨设备实时同步
- 多窗口协同支持：同一浏览器打开多个标签，数据响应式同步
- 这个 fork 额外强化了打包客户端验证口径：只有源码改动、包内资源、设备表现三者一致，修复才算完成

### 细节设计

- 支持将文本类型文件（代码、csv等）作为附件，AI 能看到文件内容和文件名；避免文件内容占据显示空间
- 对于大段的文本，可在**输入框外**使用 Ctrl + V 粘贴，也将作为附件；避免大段内容占据显示空间
- 可在用户输入中引用先前消息中的内容，方便对助手回答的部分内容针对性地追问
- 选中多行消息文本后，可直接复制 Markdown 原文
- 粘贴从 VSCode 复制的代码时，自动用代码块包裹，并标明语言
- 这个 fork 还额外改善了：
  - packaged mobile 里的 `content_copy` / `check` 图标渲染
  - 轻量导出缺少二进制附件时的运行时容错

<img src="https://fs.krytro.com/aiaw/text-item.webp" width="600">
<img src="https://fs.krytro.com/aiaw/text-selection.webp" width="600">
<img src="https://fs.krytro.com/aiaw/paste-code.webp" width="600">

### [MCP 协议](https://docs.aiaw.app/usage/mcp.html)

- 支持 MCP Tools, Prompts, Resources
- 支持 STDIO 和 HTTP 连接方式
- 可在插件市场安装 MCP 类型插件，或者手动添加 MCP 服务器
- 这个 fork 额外加入了 **MCP 插件刷新按钮**，已安装 MCP 插件可以在不卸载的前提下刷新 manifest / dump 状态

### 联网搜索

- 基于 SearXNG，开箱即用的联网搜索
- 同时提供通过 URL 爬取网页内容的功能
- 支持并发搜索和并发爬取
- 本仓库继续维护了内置 Web Search 插件本身，而不只是沿用上游默认状态

### [Artifacts](https://docs.aiaw.app/usage/artifacts.html)

- 可将助手回答的任意部分转为 Artifacts
- 用户可编辑，带版本控制，代码高亮
- 可控制助手对 Artifacts 的读写权限
- 可同时打开多个 Artifacts

<img src="https://fs.krytro.com/aiaw/convert-artifact.webp" width="600">

### [插件系统](https://docs.aiaw.app/usage/plugins.html)

- 内置计算器、[文档解析、视频解析](https://docs.aiaw.app/usage/file-parse.html)、图像生成等插件
- 可在插件市场安装更多插件
- 可将 Gradio 应用配置为插件；兼容部分 LobeChat 插件；
- 插件不只是工具调用
- 同时也对插件菜单、插件启用面板、provider 相关插件工作流做了面向移动端的调整

![](docs/public/plugin-market.png)

#### 这个 fork 重点强化的内置能力

##### Code Execution (Pyodide)
直接在客户端本地运行 Python，不依赖远程执行服务器。适合快速计算、数据处理、脚本验证和轻量分析，让 AI 助手在设备侧就能完成一部分实际工作。

##### File Operations
给 AI 提供结构化文件操作能力，让助手能读、写、检查、处理文件，而不是只停留在聊天输出层。这是把 AIaW 从“对话工具”推进到“工作台”的关键能力之一。

##### Local FS Native
面向打包客户端的原生本地文件系统接入层。让 AI 可以围绕设备上的真实目录和文件工作，突破普通浏览器文件能力的限制，是这个 fork 非常核心的差异化能力。

##### 另外还在持续维护
- Web Search 插件
- Document Parse 集成

### 轻量，高性能

- 启动迅速，无需等待
- 切换对话丝滑流畅
- 这个 fork 还加入了调试期更新链控制：在排查 packaged client 的 UI 问题时，可暂时关闭启动时 live update，避免远程 bundle 覆盖本地前端修改

<img src="https://fs.krytro.com/aiaw/switch-dialog.webp" width="600">

### [动态提示词](https://docs.aiaw.app/usage/prompt-vars.html)

- 通过创建提示词变量，使用模板语法，构建动态可复用的提示词
- 抽离提示词中的重复部分，放入工作区变量，实现提示词的复用

<img src="docs/usage/res/assistant-prompt-vars.png" width="378">

### 其他功能

- 助手市场
- 深色模式
- 自定义主题色
- 这个 fork 额外强化了导出/导入链路：
  - **轻量导出模式**：跳过图片/附件二进制大字段
  - **轻量导入兼容**：恢复数据库主数据，不强依赖二进制内容
  - **移动端原生文件导出能力**：让 packaged client 的导出链路更可靠

## Install the dependencies
```bash
pnpm i
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
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
