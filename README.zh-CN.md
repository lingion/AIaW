![](docs/public/combine.webp)

# AI as Workspace

![](https://badge.mcpx.dev?type=client 'MCP Client') ![](https://badge.mcpx.dev?type=client&features=resources,prompts,tools 'MCP client with features')

> [!WARNING]
>
> 上游项目已弃用，并已由 [Nya AI](https://github.com/NitroRCr/nyaai) 接替，后者使用了新的技术栈重写。
>
> 这个仓库继续维护当前 AIaW 这一条线，重点放在移动端可用性、真实打包验证、以及设备侧可复现修复上。

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

**本仓库在这一块的持续改动：**
- 持续针对移动端聊天界面做源代码级修复，而不是只跟随上游默认布局
- 修复打包后移动端里代码块复制按钮 / 工具气泡图标渲染问题
- 调整 message catalog rail 的显示逻辑，避免在窄屏上错误占位
- 调试包中可临时禁用启动时 live update，确保本地前端修改不会被远程 bundle 覆盖

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

**本仓库在这一块的持续改动：**
- Android 打包产物里 md-editor 代码块复制图标（`content_copy` / `check` 等）已做设备侧修复
- 聊天页面问题以源码为主线排查，而不是继续依赖壳层补丁或口头推断

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

**本仓库在这一块的持续改动：**
- 移动端打包与调试流程被当作一等路径维护
- Android 调试 APK 用于快速验证真实 UI 效果
- iOS 源码打包链会显式同步当前前端产物，而不是假设包内资源总是最新的

### [动态提示词](https://docs.aiaw.app/usage/prompt-vars.html)

- 通过创建提示词变量，使用模板语法，构建动态可复用的提示词
- 抽离提示词中的重复部分，放入工作区变量，实现提示词的复用

<img src="docs/usage/res/assistant-prompt-vars.png" width="378">

### 其他功能

助手市场、深色模式、自定义主题色等。

## 本仓库的额外说明

### 移动端调试与发布口径

这个仓库把“打包是否真的携带了前端修改”视为功能的一部分。
一个 UI 修复不算完成，除非同时满足：

1. 源码里已经有改动
2. 最终安装包确实携带了新的前端资源
3. 用户在设备上确认行为已经变化

### 调试期间的更新策略

当前 Capacitor 构建包含 `@capawesome/capacitor-live-update`。
在调试本地 UI 问题时，可能需要暂时禁用启动时 live update，避免应用启动后被远程 bundle 覆盖，导致本地改动看不到效果。

### 本仓库最近维护的方向

- 恢复移动端聊天输入区圆角 / 撑满布局样式
- 修正 message catalog rail 在窄屏上的占位逻辑
- 修复 md-editor 代码块复制图标字体样式
- Android Java 21 打包链验证
- 用真实 APK 反复验证前端改动是否真的落地，而不是只在浏览器里观察

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
