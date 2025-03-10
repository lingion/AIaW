export default {
  addMcpPluginDialog: {
    stdio: 'STDIO',
    sse: 'SSE',
    pluginName: '插件名称',
    pluginNameCaption: '任意名称即可',
    command: '运行命令',
    commandCaption: 'MCP服务端的运行命令',
    workDir: '工作目录',
    workDirCaption: '可选',
    envVars: '环境变量',
    inputVarsPlaceholder: '输入变量值...',
    url: 'URL',
    cancel: '取消',
    install: '安装',
    installFailed: '安装失败',
    stdioPlatformTip: '仅桌面版支持 STDIO 类型 MCP 插件，当前平台仅支持 SSE 类型'
  },
  abortableBtn: {
    stop: '停止'
  },
  artifactsList: {
    searchPlaceholder: '搜索 Artifacts...',
    close: '关闭'
  },
  artifactItemMenu: {
    save: '保存',
    rename: '重命名',
    moveTo: '移动至',
    download: '下载',
    delete: '删除',
    deleteConfirmTitle: '删除 Artifact',
    deleteConfirmMessage: '确定要删除 Artifact「{name}」吗？',
    deleteConfirmOk: '删除'
  },
  addInfoBtn: {
    attachment: '附件',
    parameter: '参数'
  },
  accountBtn: {
    account: '账号',
    login: '登录'
  },
  copyBtn: {
    title: '复制',
    copyFailed: '复制失败'
  },
  convertArtifactDialog: {
    title: '转换为 Artifact',
    name: '名称',
    lang: '语言',
    reserveOriginal: '保留原文',
    cancel: '取消',
    autoName: '自动命名',
    ok: '确定'
  },
  aTip: {
    tip: 'TIP',
    dismiss: '不再提示'
  },
  assistantList: {
    newDialog: '新建对话',
    moveToGlobal: '移至全局',
    moveToWorkspace: '移至工作区',
    delete: '删除',
    deleteConfirmTitle: '删除助手',
    deleteConfirmMessage: '确定要删除助手「{name}」吗？',
    newAssistant: '新建助手'
  },
  assistantItem: {
    unselected: '未选择',
    global: '全局'
  },
  importDataDialog: {
    title: '导入用户数据',
    fileLabel: '数据文件',
    overwrite: '覆盖已有数据',
    force: '强制写入',
    clear: '导入前清空现有数据',
    cancel: '取消',
    import: '导入',
    importSuccess: '导入成功',
    importFailed: '导入失败：{message}'
  },
  imageInputArea: {
    clickToSelect: '点击选择图片',
    dragHere: '拖拽到此处',
    paste: '或者 Ctrl+V 粘贴'
  },
  hueSliderDialog: {
    title: '选取颜色',
    hue: 'Hue',
    cancel: '取消',
    ok: '确定'
  },
  filesInputDialog: {
    clickToSelect: '点击选择图片',
    dragHere: '拖拽到此处',
    paste: '或者 Ctrl+V 粘贴'
  },
  dialogList: {
    newDialog: '新建对话',
    searchPlaceholder: '搜索对话...',
    renameTitle: '修改标题',
    summarizeDialog: '总结标题',
    title: '标题',
    moveTo: '移动至',
    delete: '删除',
    deleteConfirmTitle: '删除对话',
    deleteConfirmMessage: '确定要删除对话「{name}」吗？',
    deleteConfirmOk: '删除'
  },
  darkSwitchBtn: {
    switchToDark: '切换至深色',
    switchToLight: '切换至浅色',
    switchToAuto: '切换至自动'
  },
  messageInfoDialog: {
    userMessageInfo: '用户消息信息',
    assistantMessageInfo: '助手消息信息',
    id: 'ID',
    createdAt: '创建时间',
    textLength: '文本长度',
    model: '模型',
    tokenUsage: 'Token 开销',
    prompt: '提示：',
    completion: '补全：',
    ok: '确定'
  },
  installPluginBtn: {
    installed: '已安装',
    install: '安装',
    installFailed: '安装失败：'
  },
  installedPlugins: {
    uninstallPlugin: '卸载插件',
    uninstallConfirm: '确定要卸载插件「{title}」吗？',
    uninstall: '卸载'
  },
  messageItem: {
    quote: '引用',
    copyMarkdown: 'Markdown',
    convertToArtifact: '转换为 Artifact',
    regenerate: '重新生成',
    edit: '修改',
    more: '更多',
    showSourceCode: '显示源代码',
    directEdit: '直接编辑',
    moreInfo: '更多信息',
    userMessageQuote: '用户消息引用',
    assistantMessageQuote: '助手消息引用',
    editMessage: '编辑消息',
    convertToArtifactTitle: '转换为 Artifact',
    convertToArtifactBtn: '转换为 Artifact',
    copyCode: '复制代码',
    fold: '折叠',
    reasoningContent: '思考内容'
  },
  parseFilesDialog: {
    parseFiles: '解析文件',
    noParserAvailable: '该类型无可用解析器',
    cancel: '取消',
    parse: '解析',
    parser: '解析器',
    parseFailed: '"{file}" 解析失败: {error}'
  },
  modelInputItems: {
    model: '模型',
    multimodalCapabilities: '多模态能力',
    multimodalCapabilitiesCaption: '修改模型的多模态能力配置',
    userInputTypes: '用户输入支持类型',
    assistantMessageTypes: '助手消息支持类型',
    toolResultTypes: '工具结果支持类型'
  },
  platformEnabledInput: {
    alwaysEnabled: '始终启用',
    desktopOnly: '仅桌面端',
    mobileOnly: '仅移动端',
    alwaysDisabled: '始终禁用'
  },
  pickAvatarDialog: {
    ai: 'AI',
    icon: '图标',
    text: '文字',
    image: '图片',
    aiCompany: 'AI & 公司',
    color: '彩色',
    aiCompanyQuestion: 'AI? & 公司?',
    preview: '预览',
    showBackground: '显示背景',
    backgroundColor: '背景色',
    cancel: '取消',
    confirm: '确定',
    textLabel: '文字',
    textHint: '支持 Emoji'
  },
  payDialog: {
    pay: '支付',
    payWithAlipay: '使用支付宝，扫码支付{price}元',
    cancelOrder: '取消订单',
    orderCancelled: '订单已取消',
    cancelOrderFailed: '取消订单失败',
    paymentSuccess: '支付成功',
    checkOrderStatusFailed: '检查订单状态失败'
  },
  saveDialog: {
    title: '保存修改',
    message: '是否保存对「{name}」的修改？',
    cancel: '取消',
    dontSave: '不保存',
    save: '保存'
  },
  jsonInputDialog: {
    cancel: '取消',
    ok: '确定'
  },
  providerInputItems: {
    provider: '服务商'
  },
  promptVarItem: {
    variableName: '变量名',
    label: '标签',
    type: '类型',
    options: '选项',
    defaultValue: '默认值',
    remove: '移除',
    clearable: '清除',
    text: '文本',
    number: '数字',
    toggle: '开关',
    select: '选择',
    multiSelect: '多选'
  },
  promptVarEditor: {
    addVariable: '添加变量'
  },
  pluginTypeBadge: {
    builtin: '内置',
    lobechat: 'Lobe',
    gradio: 'Gradio',
    mcp: 'MCP'
  },
  textareaDialog: {
    cancel: '取消',
    confirm: '确定'
  },
  subscribeDialog: {
    title: '订阅云同步服务',
    duration: '订阅时长（月）',
    amountDue: '应付金额',
    paymentMethod: '支付方式',
    alipayOnly: '目前仅支持支付宝',
    cancel: '取消',
    order: '下单'
  },
  selectWorkspaceDialog: {
    selectWorkspace: '选择工作区',
    selectFolder: '选择文件夹',
    cancel: '取消',
    confirm: '确定'
  },
  selectFileBtn: {
    clickToSelect: '点击选择图片',
    dragHere: '拖拽到此处',
    paste: '或者 Ctrl+V 粘贴'
  },
  viewFileDialog: {
    fileSize: '文件大小',
    fileType: '文件类型',
    copy: '复制',
    download: '下载',
    ok: '确定'
  },
  varsInput: {
    addVariable: '添加变量',
    variableName: '变量名'
  },
  topupDialog: {
    title: '模型服务充值',
    amount: '充值额度（元）',
    amountCaption: '请输入 1 到 999 之间的整数',
    payableAmount: '应付金额',
    paymentMethod: '支付方式',
    alipayOnly: '目前仅支持支付宝',
    cancel: '取消',
    order: '下单'
  },
  toolContent: {
    toolCall: '工具调用',
    callParams: '调用参数',
    callResult: '调用结果',
    errorMessage: '错误信息'
  },
  workspaceNav: {
    workspace: '工作区',
    folder: '文件夹'
  },
  workspaceListSelect: {
    root: '根目录'
  },
  workspaceListItem: {
    rename: '重命名',
    changeIcon: '更换图标',
    newWorkspace: '新建工作区',
    newFolder: '新建文件夹',
    moveTo: '移动至',
    delete: '删除'
  },
  modelOptionsBtn: {
    modelOptions: '模型选项',
    reasoningEffort: '推理力度',
    useSearchGrounding: '使用搜索'
  }
}
