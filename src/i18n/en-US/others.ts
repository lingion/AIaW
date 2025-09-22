export default {
  routes: {
    settings: 'Settings',
    shortcutKeys: 'Shortcut Keys',
    pluginsMarket: 'Plugins',
    assistantsMarket: 'Assistants',
    account: 'Account',
    modelPricing: 'Model Pricing'
  },
  values: {
    apiAddress: 'API Address',
    defaultServiceAddress: 'Default to the official address of the service provider',
    defaultOpenAIAddress: 'Default to OpenAI official address',
    organization: 'Organization',
    project: 'Project',
    optional: 'Optional',
    resourceName: 'Resource Name',
    apiVersion: 'API Version',
    defaultAnthropicAddress: 'Default to Anthropic official address',
    defaultGoogleAddress: 'Default to Google official address',
    openaiCompatible: 'OpenAI Compatible',
    required: 'Required',
    burncloudKeyDescription: 'Obtainable at ai.burncloud.com'
  },
  templates: {
    defaultWsIndexContent: `## {'{{ workspace.name }}'}

### Usage Guide

Click "**Create Dialog**" in the right sidebar to start a conversation.

- You can change the shortcut keys for sending messages in the settings on the left sidebar. The default is Ctrl+Enter.
- This application is cross-platform and can be used on different devices such as computers and mobile phones.
- Click on the assistant in the right sidebar to enter the assistant settings, where you can set prompts and enable various plugins.
- In the left sidebar, you can create multiple workspaces to separate conversations with different themes.
- Click the settings icon in the upper right corner to enter the workspace settings, where you can switch the default assistant and change the content displayed here.

For more information, see <a href="https://docs.aiaw.app/usage/" target="_blank">Usage Guide</a>

GitHub: <a href="https://github.com/NitroRCr/aiaw" target="_blank">NitroRCr/AIaW</a>
`
  },
  mcpClient: {
    connectingMcpServer: 'Connecting to MCP server...'
  },
  plugins: {
    time: {
      title: 'Time and Date',
      description: 'Let AI get the current time and date (not very useful. Can be used to test whether tool calls are normal)',
      prompt: 'Get the current time and date'
    },
    calculator: {
      title: 'Calculator',
      description: 'Provide a calculator to allow AI to complete more complex calculations'
    },
    whisper: {
      title: 'Speech Recognition: Whisper',
      description: 'Upload audio files and convert speech to text using the Whisper model',
      transcribe: {
        description: 'Convert speech to text'
      },
      taskType: 'Task Type'
    },
    flux: {
      title: 'Image Generation: FLUX',
      description: 'Let AI call the FLUX model to generate images. Called through 🤗 Spaces, so it is free'
    },
    videoTranscript: {
      title: 'Video to Text',
      description: 'Extract audio from video and convert it to text. To ask AI about video content',
      transcribe: {
        description: 'Convert video to text'
      },
      audioEncoderError: 'The current browser does not support audio encoding. It is recommended to use the latest version of Chrome/Edge browser.',
      rangeInput: {
        label: 'Time Range'
      }
    },
    emotions: {
      title: 'Emoticons',
      description: 'Let AI use emoticons in its answers to make them more vivid',
      displayWidth: {
        label: 'Display Size'
      }
    },
    mermaid: {
      title: 'Mermaid Chart',
      description: 'Let AI use Mermaid syntax to create charts in its answers',
      prompt: 'In the answer, if you need to draw a chart, you can directly use mermaid syntax to create the chart, which can be rendered normally.'
    },
    mcp: {
      runCommand: 'Run Command',
      cwd: 'Working Directory',
      timeout: 'Timeout',
      timeoutDescription: 'The maximum time for a single call, in seconds'
    }
  },
  artifactsPlugin: {
    description: 'Modify Artifact'
  },
  update: {
    updating: 'Updating...',
    updateFound: 'Update found: {version}',
    download: 'Download',
    ignore: 'Ignore',
    install: 'Install',
    downloadedNewVersion: 'New version downloaded: {version}',
    installedNewVersion: 'New version installed: {version}',
    relaunch: 'Relaunch'
  },
  stores: {
    plugins: {
      stdioRequireDesktop: 'STDIO type MCP plugins are only supported on the desktop version'
    },
    assistants: {
      newAssistant: 'New Assistant'
    },
    workspaces: {
      newFolder: 'New Folder',
      newWorkspace: 'New Workspace'
    },
    providers: {
      newProvider: 'New Provider'
    }
  },
  db: {
    exampleWorkspace: 'Example Workspace',
    defaultAssistant: 'Default Assistant'
  },
  webSearchPlugin: {
    title: 'Web Search & Crawl',
    description: 'Provide the ability to use search engines and crawl web content',
    searxngURLCaption: 'Customize the address of the SearXNG instance',
    jinaApiKeyCaption: 'Fill in to improve the rate limit of web crawling, available on jina.ai',
    toolSearchCaption: 'Call search engines to search the web',
    toolCrawlCaption: 'Crawl web content',
    defaultEngines: 'Default Search Engines',
    defaultEnginesCaption: 'Comma-separated list of search engines, leave blank to follow the server configuration',
    resultsLimit: 'Results Limit',
    resultsLimitCaption: 'Limit the number of search results per time',
    configureSearxngMessage: 'Please configure SearXNG instance in the server, or configure SearXNG URL in the plugin settings'
  },
  docParsePlugin: {
    title: 'Document Parsing',
    description: 'Parse document (PDF, Word, Excel, PPT, etc.) content and convert it to Markdown text',
    llamaParseDescription: 'Call LlamaParse to parse document',
    pdfExtractTextLabel: 'Extract PDF Text',
    pdfExtractTextDescription: 'Extract text content from PDF',
    pdfScreenshotLabel: 'PDF Screenshot',
    pdfScreenshotDescription: 'Screenshot PDF content',
    docxParseLabel: 'Docx parsing',
    docxParseDescription: 'Convert Word document to HTML',
    xlsxParseLabel: 'Xlsx parsing',
    xlsxParseDescription: 'Convert Excel spreadsheet to Markdown table',
    pptxParseLabel: 'PPTX parsing',
    pptxParseDescription: 'Extract text content from PPTX',
    rangeInput: {
      label: 'Page Range',
      hint: 'e.g. 1-3,5'
    },
    ocrLanguage: 'OCR Language',
    ocrLanguageDescription: 'The OCR language specified when calling LlamaParse',
    pagesLimitDialog: {
      title: 'Too Many Pages',
      message: 'The number of document screenshots to be rendered is too large (>{limit}). Too many images may cause slow loading and affect the understanding of the model. It is recommended to specify a page range and re-parse. Continue parsing?',
      cancel: 'Cancel',
      continue: 'Continue Parsing'
    },
    emptyPagesDialog: {
      title: 'Too Many Empty Pages',
      message: 'More than half of the page parsing results are empty. This may be because the PDF document consists of scanned images, and this parser can only extract text from the document. It is recommended to re-parse using the "@:{docParsePlugin.pdfScreenshotLabel}" parser.'
    }
  }
}
