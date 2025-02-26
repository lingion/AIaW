export default {
  routes: {
    settings: '設定',
    shortcutKeys: '鍵盤快捷鍵',
    pluginsMarket: '插件市場',
    assistantsMarket: '助手市場',
    account: '帳號',
    modelPricing: '模型價格'
  },
  values: {
    apiAddress: 'API 地址',
    defaultServiceAddress: '預設為該服務商官方地址',
    defaultOpenAIAddress: '預設為 OpenAI 官方地址',
    organization: '組織',
    project: '專案',
    optional: '可選',
    resourceName: '資源名稱',
    apiVersion: 'API 版本',
    defaultAnthropicAddress: '預設為 Anthropic 官方地址',
    defaultGoogleAddress: '預設為 Google 官方地址'
  },
  templates: {
    defaultWsIndexContent: `## {'{{ workspace.name }}'}

### 使用指引

點擊右側邊欄的「**新建對話**」即可開始對話

- 你可以在左側邊欄設定中更改發送訊息的快捷鍵，預設為 Ctrl+Enter
- 本應用是跨平台的，可以在電腦、手機等不同裝置上使用
- 點擊右側邊欄中的助手，進入助手設定，可以設定提示詞，以及啟用各種插件
- 在左側邊欄，你可以創建多個工作區，將不同主題的對話分隔開
- 點擊右上角設定圖示進入工作區設定，可以切換預設助手、更改此處顯示的內容

更多內容詳見<a href="https://docs.aiaw.app/usage/" target="_blank">使用指南</a>

GitHub: <a href="https://github.com/NitroRCr/aiaw" target="_blank">NitroRCr/AIaW</a>
`
  },
  mcpClient: {
    connectingMcpServer: '正在連接 MCP 伺服器...'
  },
  plugins: {
    time: {
      title: '時間和日期',
      description: '讓 AI 獲取目前的時間和日期（沒什麼用。可用於測試工具調用是否正常）',
      prompt: '獲取目前的時間和日期'
    },
    calculator: {
      title: '計算器',
      description: '提供一個計算器，讓 AI 能夠完成更加複雜的計算'
    },
    whisper: {
      title: '語音識別：Whisper',
      description: '上傳音訊檔案，通過 Whisper 模型將語音轉換為文字',
      transcribe: {
        description: '將語音轉換為文字'
      },
      taskType: '任務類型'
    },
    flux: {
      title: '圖像生成: FLUX',
      description: '讓 AI 調用 FLUX 模型生成圖像。通過 🤗 Spaces 調用，因此是免費的'
    },
    videoTranscript: {
      title: '影片轉文字',
      description: '提取影片中的音訊，再將其轉換為文字。以向 AI 提問影片內容',
      transcribe: {
        description: '將影片轉換為文字'
      },
      audioEncoderError: '目前瀏覽器不支援音訊編碼。建議使用最新版的 Chrome/Edge 瀏覽器。',
      rangeInput: {
        label: '時間範圍'
      }
    },
    emotions: {
      title: '表情包',
      description: '讓 AI 在回答中使用表情包，使回答更生動',
      displayWidth: {
        label: '顯示大小'
      }
    },
    mermaid: {
      title: 'Mermaid 圖表',
      description: '讓 AI 在回答中使用 Mermaid 語法創建圖表',
      prompt: '在回答中，如果需要繪製圖表，你可以直接使用 mermaid 語法創建圖表，它們能夠被正常渲染。'
    },
    docParse: {
      title: '文檔解析',
      description: '解析文檔（PDF、Word、Excel、PPT 等）內容，並轉換為 Markdown 文本',
      parse: {
        description: '解析文檔內容'
      },
      rangeInput: {
        label: '頁碼範圍',
        hint: '例：1-3,5'
      },
      ocrLanguage: 'OCR 語言'
    },
    mcp: {
      runCommand: '運行命令',
      cwd: '工作目錄'
    }
  },
  artifactsPlugin: {
    description: '修改 Artifact'
  },
  registerSW: {
    updating: '更新中...'
  },
  stores: {
    plugins: {
      stdioRequireDesktop: '僅桌面版支持 STDIO 類型 MCP 插件'
    },
    assistants: {
      newAssistant: '新助手'
    },
    workspaces: {
      newFolder: '新文件夾',
      newWorkspace: '新工作區'
    }
  }
}
