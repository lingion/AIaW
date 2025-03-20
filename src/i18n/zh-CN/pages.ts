export default {
  accountPage: {
    accountTitle: '账号',
    infoHeader: '信息',
    emailLabel: '电子邮箱',
    cloudSyncHeader: '云同步',
    cloudSyncDescription:
      '跨设备实时云同步服务，能够同步工作区、对话、助手、设置、插件等所有数据。',
    cloudSyncPrice: '价格为{price}元/月',
    statusLabel: '状态',
    evalLabel: '试用中',
    evalDaysLeft: '剩余试用天数：{days}',
    subscribeButton: '订阅',
    subscribedLabel: '已订阅',
    validUntil: '有效期至 {date}',
    renewButton: '续订',
    modelServicesHeader: '模型服务',
    modelServicesDescription:
      '一站式地使用不同服务商的各种先进模型，包括 deepseek-reasoner、claude-3-5-sonnet、o3-mini 等，无需配置。额度随用随充，永久有效。按照官方API原价扣费（按USD/CNY=7计算）。',
    modelPricingLink: '模型价格',
    usingDefaultService: '正在使用（作为全局默认服务商）',
    customService: '未使用（已配置全局默认服务商）',
    remainingBudget: '剩余额度',
    topupButton: '充值',
    orderHistoryHeader: '历史订单',
    contactDeveloper:
      '若订单遇到异常，请联系开发者，Email：',
    logoutButton: '退出登录',
    licenseOk: '已启用',
    licenseExpired: '已过期',
    licenseDeactivated: '已停用',
    licenseUnknown: '未知',
    orderId: '订单号',
    paymentTime: '支付时间',
    orderType: '类型',
    syncServiceType: '云同步服务',
    apiBudgetType: '模型额度',
    amount: '数量'
  },
  modelPricing: {
    modelPrice: '模型价格',
    modelPerformance: '模型性能',
    modelPerformanceDescription: '模型性能排行榜可参考',
    freeModelDisclaimer:
      '下方还有几个价格为 0 的免费模型，它们主要是实验模型。免费模型不保证可用性。',
    performanceNote: '模型指标/排行仅供参考，模型效果以实际使用为准',
    usageCalculator: '用量计算器',
    budgetLabel: '使用额度（元）',
    modelLabel: '模型',
    outputLabel: '输出字数',
    availableModels: '可用模型',
    getModelPriceFailed: '获取模型价格失败',
    inputPrice: '输入价格',
    outputPrice: '输出价格',
    usageDescription: '所有模型以各服务商官方API价格扣费，按USD/CNY=7汇率计算。',
    tokenOutputNote: '按每Token输出1.4个汉字（新GPT模型）或1个汉字（其他模型）或1.8个汉字（国产模型）计算。实际比率有波动，平均而言略大于此值，但还需考虑输入开销',
    currencyCNY: '￥',
    currencyUSD: '$',
    unitKTokens: 'K Tokens',
    unitMTokens: 'M Tokens',
    modelName: '模型'
  },
  pluginsPage: {
    installedPlugins: '已安装插件'
  },
  setProviderPage: {
    providerSet: '已设置服务商为：{baseURL}',
    restore: '还原',
    providerSetFailed: '设置服务商失败：格式错误'
  },
  shortcutKeysPage: {
    keyboardShortcuts: '键盘快捷键',
    enableKeyboardShortcuts: '启用键盘快捷键',
    dialogPage: '对话页面',
    scrollUp: '向上滚动',
    scrollDown: '向下滚动',
    scrollToTop: '滚动到顶部',
    scrollToBottom: '滚动到底部',
    switchToPreviousThread: '切换到前一条消息链',
    switchToNextThread: '切换到后一条消息链',
    switchToFirstThread: '切换到第一条消息链',
    switchToLastThread: '切换到最后一条消息链',
    regenerateAssistantMessage: '重新生成助手消息',
    editUserMessage: '编辑用户消息',
    focusInputBox: '聚焦输入框',
    dialogList: '对话列表',
    newDialog: '新建对话',
    editArtifacts: '编辑 Artifacts',
    saveArtifact: '保存 Artifact'
  },
  settingsPage: {
    customProviders: '自定义服务商',
    customProviderUsage: '可参考自定义服务商的',
    usageGuide: '使用指南'
  },
  errorNotFound: {
    message: '这里什么都没有...'
  },
  assistantsPage: {
    globalAssistant: '全局助手'
  },
  workspacePage: {
    closeArtifact: '关闭',
    closeAllArtifacts: '关闭全部 Artifacts',
    workspaceHome: '工作区主页',
    workspaceSettings: '工作区设置',
    assistants: '助手',
    artifactsGuide: '可参考',
    artifactsGuideLink: 'Artifacts 使用指南',
    create: '创建',
    selectFile: '选择文件',
    dialogs: '对话',
    createArtifact: '创建 Artifact',
    name: '名称',
    nonTextFile: '非文本文件：{name}'
  },
  mainLayout: {
    workspace: '工作区',
    assistants: '助手',
    plugins: '插件',
    settings: '设置',
    usageGuide: '使用指南',
    currentVersion: '当前版本',
    changeLog: '更新日志'
  }
}
