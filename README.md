![](https://raw.githubusercontent.com/NitroRCr/AIaW/refs/heads/master/docs/public/combine.webp)

# AI as Workspace

AIaW 是新一代 LLM 客户端，全功能、轻量级、可拓展。

[网站链接](https://aiaw.app) - [使用文档](https://docs.aiaw.app/) - [自部署指南](https://docs.aiaw.app/self-host/)

## 基本功能

- 流式传输、上传图片、latex公式…… 这些基本的功能自然都有，无需多提

- [跨平台](https://docs.aiaw.app/usage/cross-platform.html)：响应式界面设计，适配手机、电脑等不同大小和比例的屏幕

- 多服务商支持：支持 OpenAI、Anthropic、Google 等不同服务商

- 修改提问、重新生成 以分叉的形式实现，像 Chatgpt 官网那样（整个对话呈现“树”的结构）

- [文件解析](https://docs.aiaw.app/usage/file-parse.html)：支持上传 Word、PDF、PPT、Excel等格式文档，自动解析为文本输入

- 视频解析：支持选择视频文件并指定时长范围，将自动转稿为文本输入，以此实现对视频内容的提问

- [插件系统](https://docs.aiaw.app/usage/plugins.html)：内置了计算器、图像生成等插件。此外可在插件商店安装更多插件

- 助手市场：获取各种各样定制提示词的助手（提示词来自[lobe-chat-agents](https://github.com/lobehub/lobe-chat-agents)）

- 本地优先+实时云同步：所有数据储存在本地，因此无需加载且离线可浏览。登录即可启用跨设备实时云同步

- 界面主题：Material 3 设计风格；支持深色/浅色模式；支持自定义主题色

## 拓展使用

- [多工作区](https://docs.aiaw.app/usage/workspaces.html)：在左侧边栏，你可以创建多个工作区，将不同主题的对话、不同类型的助手分隔开；还可以创建文件夹，将多个工作区放入其中；支持嵌套

- [提示词变量](https://docs.aiaw.app/usage/prompt-vars.html)：除了在助手的“角色设定”中设置普通的静态提示词外，你可以通过创建提示词变量、编辑提示词模板，来构建动态且可复用的提示词

- 插件拓展性：支持将任意 Gradio 应用配置为插件，同时兼容部分 LobeChat 插件；插件不仅仅提供工具调用，文件解析功能也可以通过插件拓展；工具调用支持多模态的结果

## 细节设计

- 用户输入预览：提供正在输入的内容的实时预览；借鉴自NextChat

- 代码粘贴优化：在输入框粘贴从 VSCode 复制的代码时，自动用 markdown 代码块包裹，并标明语言

- 文本文件支持：支持直接添加文本类型文件（代码、csv等）到用户输入中，文件内容和文件名将作为用户输入的一部分。相比于手动将文件内容粘贴到输入框，此方法更快捷且文件内容不会占据显示空间

- 添加文件：无论是添加文档、视频还是文本文件，均可以通过点击文件图标按钮或者Ctrl+V粘贴来添加

- 引用：用鼠标拖选对话消息内容后，点击“引用”，即可在用户输入中引用该内容。此功能相当于手动复制消息内容并粘贴到输入框中的快捷方式，方便对助手回答的部分内容针对性地追问

[网站链接](https://aiaw.app) - [使用文档](https://docs.aiaw.app/) - [自部署指南](https://docs.aiaw.app/self-host/)

## Roadmap

- [ ] 补全文档

- [x] Docker 自部署

- [ ] i18n

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
