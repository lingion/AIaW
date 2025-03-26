export default {
  accountPage: {
    accountTitle: '帳號',
    infoHeader: '資訊',
    emailLabel: '電子郵件',
    cloudSyncHeader: '雲同步',
    cloudSyncDescription:
      '跨裝置即時雲同步服務，能夠同步工作區、對話、助手、設定、插件等所有資料。',
    cloudSyncPrice: '價格為{price}元/月',
    statusLabel: '狀態',
    evalLabel: '試用中',
    evalDaysLeft: '剩餘試用天數：{days}',
    subscribeButton: '訂閱',
    subscribedLabel: '已訂閱',
    validUntil: '有效期至 {date}',
    renewButton: '續訂',
    modelServicesHeader: '模型服務',
    modelServicesDescription:
      '一站式地使用不同服務商的各種先進模型，包括 deepseek-reasoner、claude-3-5-sonnet、o3-mini 等，無需配置。額度隨用隨充，永久有效。按照官方API原價扣費（按USD/CNY=7計算）。',
    modelPricingLink: '模型價格',
    usingDefaultService: '正在使用（作為全域預設服務商）',
    customService: '未使用（已配置全域預設服務商）',
    remainingBudget: '剩餘額度',
    topupButton: '儲值',
    orderHistoryHeader: '歷史訂單',
    contactDeveloper:
      '若訂單遇到異常，請聯絡開發者，Email：',
    logoutButton: '登出',
    licenseOk: '已啟用',
    licenseExpired: '已過期',
    licenseDeactivated: '已停用',
    licenseUnknown: '未知',
    orderId: '訂單號',
    paymentTime: '支付時間',
    orderType: '類型',
    syncServiceType: '雲同步服務',
    apiBudgetType: '模型額度',
    amount: '數量'
  },
  modelPricing: {
    modelPrice: '模型價格',
    modelPerformance: '模型效能',
    modelPerformanceDescription: '模型效能排行榜可參考',
    freeModelDisclaimer:
      '下方還有幾個價格為 0 的免費模型，它們主要是實驗模型。免費模型不保證可用性。',
    performanceNote: '模型指標/排行僅供參考，模型效果以實際使用為準',
    usageCalculator: '用量計算機',
    budgetLabel: '使用額度（元）',
    modelLabel: '模型',
    outputLabel: '輸出字數',
    availableModels: '可用模型',
    getModelPriceFailed: '獲取模型價格失敗',
    inputPrice: '輸入價格',
    outputPrice: '輸出價格',
    usageDescription: '所有模型以各服務商官方API價格扣費，按USD/CNY=7匯率計算。',
    tokenOutputNote: '按每Token輸出1.4個漢字（新GPT模型）或1個漢字（其他模型）或1.8個漢字（國產模型）計算。實際比率有波動，平均而言略大於此值，但還需考慮輸入開銷',
    currencyCNY: '￥',
    currencyUSD: '$',
    unitKTokens: 'K Tokens',
    unitMTokens: 'M Tokens',
    modelName: '模型'
  },
  pluginsPage: {
    installedPlugins: '已安裝插件'
  },
  setProviderPage: {
    providerSet: '已設定服務商為：{baseURL}',
    restore: '還原',
    providerSetFailed: '設定服務商失敗：格式錯誤'
  },
  shortcutKeysPage: {
    keyboardShortcuts: '鍵盤快捷鍵',
    enableKeyboardShortcuts: '啟用鍵盤快捷鍵',
    dialogPage: '對話頁面',
    scrollUp: '向上滾動',
    scrollDown: '向下滾動',
    scrollToTop: '滾動到頂部',
    scrollToBottom: '滾動到底部',
    switchToPreviousThread: '切換到前一條訊息鏈',
    switchToNextThread: '切換到後一條訊息鏈',
    switchToFirstThread: '切換到第一條訊息鏈',
    switchToLastThread: '切換到最後一條訊息鏈',
    regenerateAssistantMessage: '重新生成助手訊息',
    editUserMessage: '編輯使用者訊息',
    focusInputBox: '聚焦輸入框',
    dialogList: '對話列表',
    createDialog: '新建對話',
    editArtifacts: '編輯 Artifacts',
    saveArtifact: '儲存 Artifact'
  },
  settingsPage: {
    customProviders: '自訂服務商',
    customProviderUsage: '可參考自訂服務商的',
    usageGuide: '使用指南'
  },
  errorNotFound: {
    message: '這裡什麼都沒有...'
  },
  assistantsPage: {
    globalAssistant: '全域助手'
  },
  workspacePage: {
    closeArtifact: '關閉',
    closeAllArtifacts: '關閉全部 Artifacts',
    workspaceHome: '工作區主頁',
    workspaceSettings: '工作區設定',
    dialogs: '對話'
  },
  mainLayout: {
    workspace: '工作區',
    assistants: '助手',
    plugins: '插件',
    settings: '設定',
    usageGuide: '使用指南',
    currentVersion: '目前版本',
    changeLog: '更新日誌'
  }
}
