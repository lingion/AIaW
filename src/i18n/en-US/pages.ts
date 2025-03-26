export default {
  accountPage: {
    accountTitle: 'Account',
    infoHeader: 'Information',
    emailLabel: 'Email',
    cloudSyncHeader: 'Cloud Sync',
    cloudSyncDescription:
      'Real-time cloud synchronization service across devices, which can synchronize all data such as workspaces, conversations, assistants, settings, and plugins.',
    cloudSyncPrice: 'Price is {price} yuan/month',
    statusLabel: 'Status',
    evalLabel: 'Trial',
    evalDaysLeft: 'Remaining trial days: {days}',
    subscribeButton: 'Subscribe',
    subscribedLabel: 'Subscribed',
    validUntil: 'Valid until {date}',
    renewButton: 'Renew',
    modelServicesHeader: 'Model Services',
    modelServicesDescription:
      'Use various advanced models from different service providers in one stop, including deepseek-reasoner, claude-3-5-sonnet, o3-mini, etc., without configuration. The quota is charged as you go and is permanently valid. Charges are deducted according to the official API original price (calculated at USD/CNY=7).',
    modelPricingLink: 'Model Pricing',
    usingDefaultService: 'Using (as global default provider)',
    customService: 'Not used (global custom provider configured)',
    remainingBudget: 'Remaining Budget',
    topupButton: 'Top Up',
    orderHistoryHeader: 'Order History',
    contactDeveloper:
      'If you encounter any abnormalities in your order, please contact the developer, Email:',
    logoutButton: 'Log Out',
    licenseOk: 'Enabled',
    licenseExpired: 'Expired',
    licenseDeactivated: 'Deactivated',
    licenseUnknown: 'Unknown',
    orderId: 'Order ID',
    paymentTime: 'Payment Time',
    orderType: 'Type',
    syncServiceType: 'Cloud Sync Service',
    apiBudgetType: 'Model Quota',
    amount: 'Amount'
  },
  modelPricing: {
    modelPrice: 'Model Price',
    modelPerformance: 'Model Performance',
    modelPerformanceDescription: 'Model performance leaderboard for reference',
    freeModelDisclaimer:
      'Below are a few free models with a price of 0, which are mainly experimental models. Availability of free models is not guaranteed.',
    performanceNote: 'Model metrics/rankings are for reference only. The actual effect of the model shall prevail.',
    usageCalculator: 'Usage Calculator',
    budgetLabel: 'Budget (CNY)',
    modelLabel: 'Model',
    outputLabel: 'Output Words',
    availableModels: 'Available Models',
    getModelPriceFailed: 'Failed to get model price',
    inputPrice: 'Input Price',
    outputPrice: 'Output Price',
    usageDescription: 'All models are charged according to the official API price of each service provider, calculated at an exchange rate of USD/CNY=7.',
    tokenOutputNote: 'Calculated as 1.4 Chinese characters per Token output (new GPT model) or 1 Chinese character (other models) or 1.8 Chinese characters (domestic models). The actual ratio fluctuates and is slightly larger on average, but input costs also need to be considered.',
    currencyCNY: '￥',
    currencyUSD: '$',
    unitKTokens: 'K Tokens',
    unitMTokens: 'M Tokens',
    modelName: 'Model'
  },
  pluginsPage: {
    installedPlugins: 'Installed Plugins'
  },
  setProviderPage: {
    providerSet: 'Provider set to: {baseURL}',
    restore: 'Restore',
    providerSetFailed: 'Failed to set provider: incorrect format'
  },
  shortcutKeysPage: {
    keyboardShortcuts: 'Keyboard Shortcuts',
    enableKeyboardShortcuts: 'Enable Keyboard Shortcuts',
    dialogPage: 'Dialog Page',
    scrollUp: 'Scroll Up',
    scrollDown: 'Scroll Down',
    scrollToTop: 'Scroll to Top',
    scrollToBottom: 'Scroll to Bottom',
    switchToPreviousThread: 'Switch to Previous Thread',
    switchToNextThread: 'Switch to Next Thread',
    switchToFirstThread: 'Switch to First Thread',
    switchToLastThread: 'Switch to Last Thread',
    regenerateAssistantMessage: 'Regenerate Assistant Message',
    editUserMessage: 'Edit User Message',
    focusInputBox: 'Focus Input Box',
    dialogList: 'Dialog List',
    createDialog: 'Create Dialog',
    editArtifacts: 'Edit Artifacts',
    saveArtifact: 'Save Artifact'
  },
  settingsPage: {
    customProviders: 'Custom Providers',
    customProviderUsage: 'Refer to the custom provider\'s',
    usageGuide: 'Usage Guide'
  },
  errorNotFound: {
    message: 'There\'s nothing here...'
  },
  assistantsPage: {
    globalAssistant: 'Global Assistant'
  },
  workspacePage: {
    closeArtifact: 'Close',
    closeAllArtifacts: 'Close All Artifacts',
    workspaceHome: 'Workspace Home',
    workspaceSettings: 'Workspace Settings',
    dialogs: 'Dialogs'
  },
  mainLayout: {
    workspace: 'Workspace | Workspaces',
    assistants: 'Assistants',
    plugins: 'Plugins',
    settings: 'Settings',
    usageGuide: 'Usage Guide',
    currentVersion: 'Current Version',
    changeLog: 'Change Log'
  }
}
