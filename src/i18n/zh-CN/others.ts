export default {
  routes: {
    settings: '设置',
    shortcutKeys: '键盘快捷键',
    pluginsMarket: '插件市场',
    assistantsMarket: '助手市场',
    account: '账号',
    modelPricing: '模型价格'
  },
  values: {
    apiAddress: 'API 地址',
    defaultServiceAddress: '默认为该服务商官方地址',
    defaultOpenAIAddress: '默认为 OpenAI 官方地址',
    organization: '组织',
    project: '项目',
    optional: '可选',
    resourceName: '资源名称',
    apiVersion: 'API 版本',
    defaultAnthropicAddress: '默认为 Anthropic 官方地址',
    defaultGoogleAddress: '默认为 Google 官方地址'
  },
  templates: {
    defaultWsIndexContent: `## {'{{ workspace.name }}'}

### 使用指引

点击右侧边栏的「**新建对话**」即可开始对话

- 你可以在左侧边栏设置中更改发送消息的快捷键，默认为 Ctrl+Enter
- 本应用是跨平台的，可以在电脑、手机等不同设备上使用
- 点击右侧边栏中的助手，进入助手设置，可以设定提示词，以及启用各种插件
- 在左侧边栏，你可以创建多个工作区，将不同主题的对话分隔开
- 点击右上角设置图标进入工作区设置，可以切换默认助手、更改此处显示的内容

更多内容详见<a href="https://docs.aiaw.app/usage/" target="_blank">使用指南</a>

GitHub: <a href="https://github.com/NitroRCr/aiaw" target="_blank">NitroRCr/AIaW</a>
`
  },
  mcpClient: {
    connectingMcpServer: '正在连接 MCP 服务器...'
  },
  plugins: {
    time: {
      title: '时间和日期',
      description: '让 AI 获取当前的时间和日期（没什么用。可用于测试工具调用是否正常）',
      prompt: '获取当前的时间和日期'
    },
    calculator: {
      title: '计算器',
      description: '提供一个计算器，让 AI 能够完成更加复杂的计算'
    },
    whisper: {
      title: '语音识别：Whisper',
      description: '上传音频文件，通过 Whisper 模型将语音转换为文字',
      transcribe: {
        description: '将语音转换为文字'
      },
      taskType: '任务类型'
    },
    flux: {
      title: '图像生成: FLUX',
      description: '让 AI 调用 FLUX 模型生成图像。通过 🤗 Spaces 调用，因此是免费的'
    },
    videoTranscript: {
      title: '视频转文字',
      description: '提取视频中的音频，再将其转换为文字。以向 AI 提问视频内容',
      transcribe: {
        description: '将视频转换为文字'
      },
      audioEncoderError: '当前浏览器不支持音频编码。建议使用最新版的 Chrome/Edge 浏览器。',
      rangeInput: {
        label: '时间范围'
      }
    },
    emotions: {
      title: '表情包',
      description: '让 AI 在回答中使用表情包，使回答更生动',
      displayWidth: {
        label: '显示大小'
      }
    },
    mermaid: {
      title: 'Mermaid 图表',
      description: '让 AI 在回答中使用 Mermaid 语法创建图表',
      prompt: '在回答中，如果需要绘制图表，你可以直接使用 mermaid 语法创建图表，它们能够被正常渲染。'
    },
    docParse: {
      title: '文档解析',
      description: '解析文档（PDF、Word、Excel、PPT 等）内容，并转换为 Markdown 文本',
      parse: {
        description: '解析文档内容'
      },
      rangeInput: {
        label: '页码范围',
        hint: '例：1-3,5'
      },
      ocrLanguage: 'OCR 语言'
    },
    mcp: {
      runCommand: '运行命令',
      cwd: '工作目录'
    }
  },
  artifactsPlugin: {
    description: '修改 Artifact'
  },
  update: {
    updating: '更新中...',
    updateFound: '发现新版本：{version}',
    download: '下载',
    ignore: '忽略',
    update: '更新',
    installedNewVersion: '已安装新版本：{version}',
    relaunch: '重启'
  },
  stores: {
    plugins: {
      stdioRequireDesktop: '仅桌面版支持 STDIO 类型 MCP 插件'
    },
    assistants: {
      newAssistant: '新助手'
    },
    workspaces: {
      newFolder: '新文件夹',
      newWorkspace: '新工作区'
    }
  },
  db: {
    exampleWorkspace: '示例工作区',
    defaultAssistant: '默认助手'
  }
}
