export default {
  firstVisit: {
    title: '欢迎使用 AI as Workspace',
    messageWithLogin: '为了使用 AI 模型，你需要手动<b>配置服务商</b>，或者<b>登录</b>以使用我们提供的模型服务。<br>此外，登录之后还可以使用跨设备实时云同步功能。',
    messageWithoutLogin: '为了使用 AI 模型，你需要<b>配置服务商</b>。',
    cancel: '配置服务商',
    ok: '登录'
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
    register: '登录/注册',
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
    evalExpired: '云同步试用已过期，可选择订阅',
    evalExpiring: '云同步试用即将过期，可选择订阅',
    prodExpired: '您的云同步订阅已过期',
    prodExpiring: '您的云同步订阅即将过期',
    renewal: '续订',
    subscribe: '订阅'
  }
}
