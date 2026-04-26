export default {
  firstVisit: {
    title: 'Welcome to AI as Workspace',
    messageWithLogin: 'To use AI models, please manually <b>configure a provider</b>. This fork is local-first and does not rely on the upstream hosted model service or cloud sync by default.',
    messageWithoutLogin: 'To use AI models, please <b>configure a provider</b>. This fork is local-first by default.',
    cancel: 'Configure Provider',
    ok: 'OK'
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
    register: 'Account',
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
    evalExpired: 'Cloud sync is disabled in this fork by default',
    evalExpiring: 'Cloud sync is disabled in this fork by default',
    prodExpired: 'Cloud sync is disabled in this fork by default',
    prodExpiring: 'Cloud sync is disabled in this fork by default',
    renewal: 'OK',
    subscribe: 'OK'
  }
}
