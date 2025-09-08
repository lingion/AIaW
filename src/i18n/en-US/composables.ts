export default {
  firstVisit: {
    title: 'Welcome to AI as Workspace',
    messageWithLogin: 'In order to use AI models, you need to manually <b>configure the service provider</b>, or <b>log in</b> to use the model service we provide. <br>In addition, after logging in, you can also experience the real-time cloud synchronization across devices.',
    messageWithoutLogin: 'In order to use AI models, you need to manually <b>configure the service provider</b>',
    cancel: 'Configure Provider',
    ok: 'Log In'
  },
  createDialog: {
    newDialog: 'New Dialog'
  },
  callApi: {
    argValidationFailed: 'Call argument validation failed',
    settingsValidationFailed: 'Plugin settings validation failed, please check the plugin settings'
  },
  order: {
    failure: 'Order failed'
  },
  login: {
    register: 'Log In / Register',
    next: 'Next',
    otp: 'OTP Code',
    enterOtp: 'Please enter the OTP code from the verification email',
    logout: 'Log Out',
    confirmLogout: 'Are you sure you want to log out?',
    loggedIn: 'Logged in: {email}',
    privacyPolicy: 'By logging in, you agree to our <a href="https://docs.aiaw.app/privacy-policy/" text-pri target="_blank">Privacy Policy</a>'
  },
  installPlugin: {
    fetchFailed: 'Failed to get plugin configuration: {message}',
    installFailed: 'Plugin installation failed: {message}',
    formatError: 'Format error',
    unsupportedFormat: 'Unsupported plugin format'
  },
  workspace: {
    newWorkspace: 'New Workspace',
    name: 'Name',
    create: 'Create',
    defaultAssistant: 'Default Assistant',
    newFolder: 'New Folder',
    rename: 'Rename',
    deleteWorkspace: 'Delete Workspace',
    deleteFolder: 'Delete Folder',
    confirmDeleteWorkspace: 'Are you sure you want to delete the workspace "{name}"? All conversations and assistants inside it will be deleted',
    confirmDeleteFolder: 'Are you sure you want to delete the folder "{name}"? All workspaces inside it will be deleted',
    delete: 'Delete'
  },
  subscriptionNotify: {
    evalExpired: 'Cloud sync trial has expired, you can choose to subscribe',
    evalExpiring: 'Cloud sync trial is about to expire, you can choose to subscribe',
    prodExpired: 'Your cloud sync subscription has expired',
    prodExpiring: 'Your cloud sync subscription is about to expire',
    renewal: 'Renew',
    subscribe: 'Subscribe'
  }
}
