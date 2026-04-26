export default {
  firstVisit: {
    title: '欢迎使用 AI as Workspace',
    messageWithLogin: '为了使用 AI 模型，请手动<b>配置服务商</b>。这个 fork 默认是本地优先，不依赖上游托管模型服务，也不默认启用云同步。',
    messageWithoutLogin: '为了使用 AI 模型，你需要<b>配置服务商</b>。这个 fork 默认是本地优先。',
    cancel: '配置服务商',
    ok: '确定'
  },
  createDialog: {
    newDialog: '新对话'
  },
  callApi: {
    argValidationFailed: '调用参数校验失败',
    settingsValidationFailed: '插件设置校验失败，请检查插件设置'
  },
  order: {
    failure: '下单失败'
  },
  login: {
    register: '账号',
    next: '下一步',
    otp: 'OTP验证码',
    enterOtp: '请输入验证邮件中的OTP验证码',
    logout: '退出登录',
    confirmLogout: '确定要退出登录吗？',
    loggedIn: '已登录：{email}',
    privacyPolicy: '登录即代表同意我们的<a href="https://docs.aiaw.app/zh/privacy-policy/" text-pri target="_blank">隐私政策</a>'
  },
  installPlugin: {
    fetchFailed: '获取插件配置失败：{message}',
    installFailed: '插件安装失败：{message}',
    formatError: '格式错误',
    unsupportedFormat: '不支持的插件格式'
  },
  workspace: {
    newWorkspace: '新建工作区',
    name: '名称',
    create: '创建',
    defaultAssistant: '默认助手',
    newFolder: '新建文件夹',
    rename: '重命名',
    deleteWorkspace: '删除工作区',
    deleteFolder: '删除文件夹',
    confirmDeleteWorkspace: '确定要删除工作区「{name}」吗？其内部的所有对话和助手都将被删除',
    confirmDeleteFolder: '确定要删除文件夹「{name}」吗？其内部的所有工作区都将被删除',
    delete: '删除'
  },
  subscriptionNotify: {
    evalExpired: '这个 fork 默认不启用云同步',
    evalExpiring: '这个 fork 默认不启用云同步',
    prodExpired: '这个 fork 默认不启用云同步',
    prodExpiring: '这个 fork 默认不启用云同步',
    renewal: '确定',
    subscribe: '确定'
  }
}
