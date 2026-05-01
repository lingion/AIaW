![](docs/public/combine.webp)

# AI as Workspace

![](https://badge.mcpx.dev?type=client 'MCP Client') ![](https://badge.mcpx.dev?type=client&features=resources,prompts,tools 'MCP client with features')

更好的 AI 客户端。

[网站链接](https://aiaw.app) - [下载构建包](https://github.com/lingion/AIaW/releases/latest) - [使用文档](https://docs.aiaw.app/zh/) - [English](README.md)

<a href="https://apps.microsoft.com/detail/9NVMXSXJMWP8?referrer=appbadge&mode=direct">
	<img src="https://get.microsoft.com/images/zh-cn%20dark.svg" width="200"/>
</a>

## 功能概览

### 全平台一致体验

- 支持平台：Windows, Linux, Mac OS, Android, Web (PWA)
- 多服务商支持：OpenAI, Anthropic, Google, DeepSeek, xAI, Azure 等

### 对话页面

- 用户输入预览
- 修改提问、重新生成以分叉的形式呈现
- 自定义键盘快捷键
- 对齐到消息开头/结尾的快速滚动

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

### 细节设计

- 支持将文本类型文件（代码、csv等）作为附件，AI 能看到文件内容和文件名；避免文件内容占据显示空间
- 对于大段的文本，可在**输入框外**使用 Ctrl + V 粘贴，也将作为附件；避免大段内容占据显示空间

<img src="https://fs.krytro.com/aiaw/text-item.webp" width="600">

- 可在用户输入中引用先前消息中的内容，方便对助手回答的部分内容针对性地追问
- 选中多行消息文本后，可直接复制 Markdown 原文

<img src="https://fs.krytro.com/aiaw/text-selection.webp" width="600">

- 粘贴从 VSCode 复制的代码时，自动用代码块包裹，并标明语言

<img src="https://fs.krytro.com/aiaw/paste-code.webp" width="600">

### [MCP 协议](https://docs.aiaw.app/usage/mcp.html)

- 支持 MCP Tools, Prompts, Resources
- 支持 STDIO 和 HTTP 连接方式
- 可在插件市场安装 MCP 类型插件，或者手动添加 MCP 服务器

### 联网搜索

- 基于 SearXNG，开箱即用的联网搜索
- 同时提供通过 URL 爬取网页内容的功能
- 支持并发搜索和并发爬取

### [Artifacts](https://docs.aiaw.app/usage/artifacts.html)

- 可将助手回答的任意部分转为 Artifacts
- 用户可编辑，带版本控制，代码高亮
- 可控制助手对 Artifacts 的读写权限
- 可同时打开多个 Artifacts

<img src="https://fs.krytro.com/aiaw/convert-artifact.webp" width="600">

### [插件系统](https://docs.aiaw.app/usage/plugins.html)

- 内置计算器、[文档解析、视频解析](https://docs.aiaw.app/usage/file-parse.html)、图像生成等插件
- 可在插件市场安装更多插件
- 可将 Gradio 应用配置为插件；兼容部分 LobeChat 插件
- 插件不只是工具调用

![](docs/public/plugin-market.png)

### 轻量，高性能

- 启动迅速，无需等待
- 切换对话丝滑流畅

<img src="https://fs.krytro.com/aiaw/switch-dialog.webp" width="600">

### [动态提示词](https://docs.aiaw.app/usage/prompt-vars.html)

- 通过创建提示词变量，使用模板语法，构建动态可复用的提示词
- 抽离提示词中的重复部分，放入工作区变量，实现提示词的复用

<img src="docs/usage/res/assistant-prompt-vars.png" width="378">

### 其他功能

助手市场、深色模式、自定义主题色等。

## 本仓库：`lingion/AIaW`

这个仓库不是简单的重新打包镜像。相对于 `NitroRCr/AIaW`，它已经有大量源码改动，重点放在移动端可用性、真实打包验证、原生壳改造，以及设备侧可复现修复。

## 这个 fork 里明确新增 / 强化的功能条目

### 移动端聊天与 UI 修复

这个仓库在移动端聊天页做了直接源码级修复，而不是只跟随上游默认布局：

- 恢复底部输入区圆角、撑满布局、发送按钮单独占位
- 修复聊天页在 Android 打包后才出现的布局问题
- 调整 message catalog rail 的显示逻辑，避免在窄屏上错误占位
- 对用户消息 / assistant 消息渲染链做设备侧验证，而不是只在浏览器里看结果

### 插件刷新能力

这个仓库明确增加了 **MCP 插件刷新** 能力：

- 在已安装插件列表中为 MCP 插件提供刷新按钮
- 用户无需卸载重装插件，就可以重新刷新 MCP manifest / dump 状态
- 相关文件：
  - `src/stores/plugins.ts`
  - `src/components/InstalledPlugins.vue`

### 导出 / 导入优化

这个仓库明确做了导出导入优化，而不只是内部重构：

- **轻量导出模式**
  - 跳过图片 / 附件等二进制大字段
  - 降低 Android 侧大数据导出时崩溃或失败概率
  - 导出文件名明确区分 full / light
- **轻量导入兼容说明**
  - 轻量导出包只恢复数据库主数据，不恢复图片 / 附件二进制内容
- **缺失二进制内容时的运行时保护**
  - 对话渲染中如果 `contentBuffer` 缺失，会跳过二进制 payload，而不是假设永远存在
- 相关文件：
  - `src/components/ExportDataDialog.vue`
  - `src/components/ImportDataDialog.vue`
  - `src/views/DialogView.vue`
  - `src/utils/platform-api.ts`

### 内置插件增强

这个仓库明确维护并增强了多种内置插件，而不只是“保留原样”：

- **Web Search 插件**
  - 基于 SearXNG 的联网搜索
  - 基于 Jina 的网页抓取
  - 支持并发搜索与并发抓取
  - 文件：`src/utils/web-search-plugin.ts`

- **Code Execution (Pyodide) 插件**
  - 在客户端内直接进行 Python 执行
  - 文件：`src/utils/code-exec-plugin.ts`

- **File Operations 插件**
  - 面向客户端的结构化文件操作能力
  - 文件：`src/utils/file-ops-plugin.ts`

- **Local FS Native 插件**
  - 为打包客户端提供原生 / 本地文件系统访问路径
  - 文件：
    - `src/utils/local-fs-native-plugin.ts`
    - `src/utils/local-fs-native.ts`
    - `android/app/src/main/java/app/aiaw/LocalFsPlugin.java`

- **Document Parse 插件维护**
  - 文件：`src/utils/doc-parse-plugin.ts`

也就是说，你说的“3 个内置插件”不仅应该写，而且实际上这里已经明确能写出 4 个主要条目。

### 更新链路调试控制

这个仓库还加入了专门面向调试的更新链路控制：

- 调试 packaged client 的 UI 问题时，可以临时关闭启动时 live update
- 否则本地前端改动可能在应用启动后立即被远程 bundle 覆盖
- 相关文件：
  - `src/App.vue`
  - `src/utils/update.ts`

### 原生壳与打包链维护

相对上游，这个仓库还长期维护了原生壳和打包路径：

- Android 原生壳改动与插件接线
- iOS 源码打包路径在仓库内维护
- iOS App Icon / Asset Catalog 恢复
- iOS App 包内前端资源同步，保证设备验证时看到的真的是当前源码产物

相关路径包括：
- `android/app/*`
- `android/capacitor.settings.gradle`
- `ios/App/App.xcodeproj/*`
- `ios/App/App/Assets.xcassets/*`
- `ios/App/App/public/*`
- `capacitor.config.ts`

## 本仓库的工作假设

这个仓库把“打包是否真的携带了前端修改”视为功能的一部分。
一个前端/UI 修复不算完成，除非同时满足：

1. 源码里已经有改动
2. 最终安装包确实携带了新的前端资源
3. 用户在设备上确认行为已经变化

这点很重要，因为打包客户端和浏览器行为可能不同，而且 update 路径 / 原生壳 / bundle 覆盖都可能让“源码看起来对”不等于“设备上真的对”。

## LightHouse

| Desktop | Mobile |
| :-----: | :----: |
| ![](docs/public/lighthouse_score_desktop.png) | ![](docs/public/lighthouse_score_mobile.png) |

## 相关项目

- [New API](https://github.com/Calcium-Ion/new-api): AI模型接口管理与分发系统，支持将多种大模型转为 OpenAI 兼容格式调用

## 安装依赖

```bash
pnpm i
```

### 开发模式启动

```bash
quasar dev
```

### Lint

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

### 本地构建 Android

```bash
pnpm build
npx cap sync android
cd android
./gradlew assembleDebug
```

### 本地构建 iOS

```bash
pnpm build
npx cap copy ios
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -archivePath ../build/App.xcarchive archive
```
