export default {
  firstVisit: {
    title: 'Welcome to AI as Workspace',
    messageWithLogin: 'AIaW is a full-featured, lightweight, and extensible AI client.<br><br>To use AI models, you need to <b>configure a provider (API)</b> or <b>log in</b>.<br>After logging in, you can also use real-time cloud synchronization across devices.',
    messageWithoutLogin: 'AIaW is a full-featured, lightweight, and extensible AI client.<br><br>To use AI models, you need to <b>configure a provider (API)</b>.',
    cancel: 'Configure Provider',
    ok: 'Log In'
  },
  createDialog: {
    newDialog: 'New Dialog'
  },
  callApi: {
    argValidationFailed: 'Call argument validation failed',
    settingsValidationFailed: 'Plugin settings validation failed, please check plugin settings'
  },
  order: {
    failure: 'Order failed'
  },
  login: {
    register: 'Log In / Register',
    next: 'Next',
    otp: 'OTP Verification Code',
    enterOtp: 'Please enter the OTP verification code in the verification email',
    logout: 'Log Out',
    confirmLogout: 'Are you sure you want to log out?',
    loggedIn: 'Logged in: {email}'
  },
  plugin: {
    fetchFailed: 'Failed to get plugin config: {message}',
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
    confirmDeleteWorkspace: 'Are you sure you want to delete the workspace "{name}"? All dialogs and assistants inside it will be deleted',
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
