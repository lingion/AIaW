export default {
  addMcpPluginDialog: {
    stdio: 'STDIO',
    sse: 'SSE',
    pluginName: '插件名稱',
    pluginNameCaption: '任意名稱即可',
    command: '執行命令',
    commandCaption: 'MCP服務端的執行命令',
    workDir: '工作目錄',
    workDirCaption: '可選',
    envVars: '環境變數',
    inputVarsPlaceholder: '輸入變數值...',
    url: 'URL',
    cancel: '取消',
    install: '安裝',
    installFailed: '安裝失敗',
    stdioPlatformTip: '僅桌面版支援 STDIO 類型 MCP 插件，當前平台僅支援 SSE 類型'
  },
  abortableBtn: {
    stop: '停止'
  },
  artifactsList: {
    searchPlaceholder: '搜尋 Artifacts...',
    close: '關閉'
  },
  artifactItemMenu: {
    save: '儲存',
    rename: '重新命名',
    moveTo: '移動至',
    download: '下載',
    delete: '刪除',
    deleteConfirmTitle: '刪除 Artifact',
    deleteConfirmMessage: '確定要刪除 Artifact「{name}」嗎？',
    deleteConfirmOk: '刪除'
  },
  addInfoBtn: {
    attachment: '附件',
    parameter: '參數'
  },
  accountBtn: {
    account: '帳號',
    login: '登入'
  },
  copyBtn: {
    title: '複製',
    copyFailed: '複製失敗'
  },
  convertArtifactDialog: {
    title: '轉換為 Artifact',
    name: '名稱',
    lang: '語言',
    reserveOriginal: '保留原文',
    cancel: '取消',
    autoName: '自動命名',
    ok: '確定'
  },
  aTip: {
    tip: 'TIP',
    dismiss: '不再提示'
  },
  assistantList: {
    newDialog: '新建對話',
    moveToGlobal: '移至全域',
    moveToWorkspace: '移至工作區',
    delete: '刪除',
    deleteConfirmTitle: '刪除助手',
    deleteConfirmMessage: '確定要刪除助手「{name}」嗎？',
    newAssistant: '新建助手'
  },
  assistantItem: {
    unselected: '未選擇',
    global: '全域'
  },
  importDataDialog: {
    title: '導入使用者資料',
    fileLabel: '資料檔案',
    overwrite: '覆蓋已有資料',
    force: '強制寫入',
    clear: '導入前清空現有資料',
    cancel: '取消',
    import: '導入',
    importSuccess: '導入成功',
    importFailed: '導入失敗：{message}'
  },
  imageInputArea: {
    clickToSelect: '點擊選擇圖片',
    dragHere: '拖曳到此處',
    paste: '或者 Ctrl+V 貼上'
  },
  hueSliderDialog: {
    title: '選取顏色',
    hue: 'Hue',
    cancel: '取消',
    ok: '確定'
  },
  filesInputDialog: {
    clickToSelect: '點擊選擇圖片',
    dragHere: '拖曳到此處',
    paste: '或者 Ctrl+V 貼上'
  },
  dialogList: {
    newDialog: '新建對話',
    searchPlaceholder: '搜尋對話...',
    renameTitle: '修改標題',
    summarizeDialog: '總結標題',
    title: '標題',
    moveTo: '移動至',
    delete: '刪除',
    deleteConfirmTitle: '刪除對話',
    deleteConfirmMessage: '確定要刪除對話「{name}」嗎？',
    deleteConfirmOk: '刪除'
  },
  darkSwitchBtn: {
    switchToDark: '切換至深色',
    switchToLight: '切換至淺色',
    switchToAuto: '切換至自動'
  },
  messageInfoDialog: {
    userMessageInfo: '使用者訊息資訊',
    assistantMessageInfo: '助手訊息資訊',
    id: 'ID',
    createdAt: '建立時間',
    textLength: '文本長度',
    model: '模型',
    tokenUsage: 'Token 開銷',
    prompt: '提示：',
    completion: '補全：',
    ok: '確定'
  },
  installPluginBtn: {
    installed: '已安裝',
    install: '安裝',
    installFailed: '安裝失敗：'
  },
  installedPlugins: {
    uninstallPlugin: '卸載插件',
    uninstallConfirm: '確定要卸載插件「{title}」嗎？',
    uninstall: '卸載'
  },
  messageItem: {
    quote: '引用',
    copyMarkdown: 'Markdown',
    convertToArtifact: '轉換為 Artifact',
    regenerate: '重新生成',
    edit: '修改',
    more: '更多',
    showSourceCode: '顯示原始碼',
    directEdit: '直接編輯',
    moreInfo: '更多資訊',
    userMessageQuote: '使用者訊息引用',
    assistantMessageQuote: '助手訊息引用',
    editMessage: '編輯訊息',
    convertToArtifactTitle: '轉換為 Artifact',
    convertToArtifactBtn: '轉換為 Artifact',
    copyCode: '複製程式碼',
    fold: '摺疊',
    reasoningContent: '思考內容'
  },
  parseFilesDialog: {
    parseFiles: '解析檔案',
    noParserAvailable: '該類型無可用解析器',
    cancel: '取消',
    parse: '解析',
    parser: '解析器',
    parseFailed: '"{file}" 解析失敗: {error}'
  },
  modelInputItems: {
    model: '模型',
    multimodalCapabilities: '多模態能力',
    multimodalCapabilitiesCaption: '修改模型的多模態能力配置',
    userInputTypes: '使用者輸入支援類型',
    assistantMessageTypes: '助手訊息支援類型',
    toolResultTypes: '工具結果支援類型'
  },
  platformEnabledInput: {
    alwaysEnabled: '始終啟用',
    desktopOnly: '僅桌面端',
    mobileOnly: '僅移動端',
    alwaysDisabled: '始終禁用'
  },
  pickAvatarDialog: {
    ai: 'AI',
    icon: '圖示',
    text: '文字',
    image: '圖片',
    aiCompany: 'AI & 公司',
    color: '彩色',
    aiCompanyQuestion: 'AI? & 公司?',
    preview: '預覽',
    showBackground: '顯示背景',
    backgroundColor: '背景色',
    cancel: '取消',
    confirm: '確定',
    textLabel: '文字',
    textHint: '支援 Emoji'
  },
  payDialog: {
    pay: '支付',
    payWithAlipay: '使用支付寶，掃碼支付{price}元',
    cancelOrder: '取消訂單',
    orderCancelled: '訂單已取消',
    cancelOrderFailed: '取消訂單失敗',
    paymentSuccess: '支付成功',
    checkOrderStatusFailed: '檢查訂單狀態失敗'
  },
  saveDialog: {
    title: '儲存修改',
    message: '是否儲存對「{name}」的修改？',
    cancel: '取消',
    dontSave: '不儲存',
    save: '儲存'
  },
  jsonInputDialog: {
    cancel: '取消',
    ok: '確定'
  },
  providerInputItems: {
    provider: '服務商'
  },
  promptVarItem: {
    variableName: '變數名',
    label: '標籤',
    type: '類型',
    options: '選項',
    defaultValue: '預設值',
    remove: '移除',
    clearable: '清除',
    text: '文本',
    number: '數字',
    toggle: '開關',
    select: '選擇',
    multiSelect: '多選'
  },
  promptVarEditor: {
    addVariable: '新增變數'
  },
  pluginTypeBadge: {
    builtin: '內建',
    lobechat: 'Lobe',
    gradio: 'Gradio',
    mcp: 'MCP'
  },
  textareaDialog: {
    cancel: '取消',
    confirm: '確定'
  },
  subscribeDialog: {
    title: '訂閱雲同步服務',
    duration: '訂閱時長（月）',
    amountDue: '應付金額',
    paymentMethod: '支付方式',
    alipayOnly: '目前僅支援支付寶',
    cancel: '取消',
    order: '下單'
  },
  selectWorkspaceDialog: {
    selectWorkspace: '選擇工作區',
    selectFolder: '選擇資料夾',
    cancel: '取消',
    confirm: '確定'
  },
  selectFileBtn: {
    clickToSelect: '點擊選擇圖片',
    dragHere: '拖曳到此處',
    paste: '或者 Ctrl+V 貼上'
  },
  viewFileDialog: {
    fileSize: '檔案大小',
    fileType: '檔案類型',
    copy: '複製',
    download: '下載',
    ok: '確定'
  },
  varsInput: {
    addVariable: '新增變數',
    variableName: '變數名'
  },
  topupDialog: {
    title: '模型服務儲值',
    amount: '儲值額度（元）',
    amountCaption: '請輸入 1 到 999 之間的整數',
    payableAmount: '應付金額',
    paymentMethod: '支付方式',
    alipayOnly: '目前僅支援支付寶',
    cancel: '取消',
    order: '下單'
  },
  toolContent: {
    toolCall: '工具呼叫',
    callParams: '呼叫參數',
    callResult: '呼叫結果',
    errorMessage: '錯誤訊息'
  },
  workspaceNav: {
    workspace: '工作區',
    folder: '資料夾'
  },
  workspaceListSelect: {
    root: '根目錄'
  },
  workspaceListItem: {
    rename: '重新命名',
    changeIcon: '更換圖示',
    newWorkspace: '新建工作區',
    newFolder: '新建資料夾',
    moveTo: '移動至',
    delete: '刪除'
  },
  modelOptionsBtn: {
    modelOptions: '模型選項',
    reasoningEffort: '推理力度',
    useSearchGrounding: '使用搜尋'
  }
}
