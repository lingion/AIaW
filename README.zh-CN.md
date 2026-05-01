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

### 相对上游的主要改动范围

#### 1. 移动端打包与原生壳
涉及路径包括：
- `android/app/*`
- `android/capacitor.settings.gradle`
- `android/gradlew`
- `ios/App/App.xcodeproj/*`
- `ios/App/App.xcworkspace/*`
- `ios/App/AppDelegate.swift`
- `ios/App/App/Info.plist`
- `ios/App/App/Assets.xcassets/*`
- `ios/capacitor-cordova-ios-plugins/*`
- `capacitor.config.ts`

实际改动方向包括：
- Android 壳层与原生插件接线调整
- iOS 源码打包链长期维护
- iOS App Icon / Asset Catalog 恢复与同步
- 从源码直出移动包，而不是只假设 Web/PWA 就等于最终客户端效果

#### 2. 前端移动端聊天 / 对话界面
涉及路径包括：
- `src/App.vue`
- `src/components/MessageItem.vue`
- `src/views/DialogView.vue`
- `src/css/app.scss`
- `src/css/platform/android/index.scss`
- `src/css/platform/ios/index.scss`
- `src/layouts/MainLayout.vue`

实际改动方向包括：
- 移动端聊天布局排查与修复
- composer 输入区样式调整
- message spacing / preview 渲染链修复
- message catalog rail 在窄屏上的占位逻辑调整
- 调试包中临时关闭启动时 live update，避免远程 bundle 立刻覆盖本地前端

#### 3. 插件 / provider / MCP 工作流
涉及路径包括：
- `src/stores/plugins.ts`
- `src/stores/providers.ts`
- `src/utils/plugins.ts`
- `src/utils/platform-api.ts`
- `src/utils/config.ts`
- `src/utils/update.ts`
- `src/utils/values.ts`
- `src/components/AddMcpPluginDialog.vue`
- `src/components/CustomProviders.vue`
- `src/components/EnablePluginsItems.vue`
- `src/components/EnablePluginsMenu.vue`
- `src/components/InstalledPlugins.vue`
- `src/components/ProviderInputItems.vue`
- `src/components/TypesInput.vue`
- `src/components/UnifiedInput.vue`
- `src/components/GetModelList.vue`

实际改动方向包括：
- 自定义 provider 工作流变更
- MCP/provider 设置项显式暴露到 UI
- 插件启用/菜单行为修复
- 面向移动端的插件展示优化
- 面向打包客户端的更新链路调整

#### 4. 本地优先 / 原生文件与执行能力
涉及路径包括：
- `src/utils/local-fs-native-plugin.ts`
- `src/utils/local-fs-native.ts`
- `src/utils/file-ops-plugin.ts`
- `src/utils/code-exec-plugin.ts`
- `android/app/src/main/java/app/aiaw/LocalFsPlugin.java`

实际改动方向包括：
- 为打包客户端暴露更强的本地文件系统能力
- 面向设备侧的本地执行 / 文件处理适配
- 更实用的 on-device 工作流支持

#### 5. 内置数据 / 语言 / seed 行为
涉及路径包括：
- `src/utils/builtin-plugin-seed.ts`
- `src/i18n/en-US/components.ts`
- `src/i18n/en-US/composables.ts`
- `src/i18n/en-US/views.ts`
- `src/i18n/zh-CN/components.ts`
- `src/i18n/zh-CN/composables.ts`
- `src/i18n/zh-CN/views.ts`
- `src/version.json`

实际改动方向包括：
- built-in plugin migration / seeding 逻辑
- fork 特有流程下的 UI 文案变化
- 与本仓库版本线绑定的客户端行为调整

#### 6. Backend helper / 测试脚本 / 工程规则文档
涉及路径包括：
- `src-backend/app.py`
- `src-backend/requirements.txt`
- `scripts/test-export-import*.mjs`
- `ACTIVE_RUNTIME_CONFIG.md`
- `ARCHITECTURE_BOUNDARIES.md`
- `DELIVERY_RULES.md`
- `REGRESSION_CHECKLIST.md`
- `RISK_REGISTER.md`

实际改动方向包括：
- 面向本仓库工作流的 backend helper
- 项目特有的发布/调试规则
- 回归 / 风险 / 交付文档化

#### 7. iOS App 包内同步资源
涉及路径包括：
- `ios/App/App/public/*`

这些不是逐个手写的新功能源码，而是 iOS 打包所携带的同步前端产物；但相对上游，它们确实也是当前仓库差异的一部分。

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
