export default {
  addMcpPluginDialog: {
    stdio: 'STDIO',
    sse: 'SSE',
    pluginName: 'Plugin Name',
    pluginNameCaption: 'Any name will do',
    command: 'Run Command',
    commandCaption: 'The command to run on the MCP server',
    workDir: 'Working Directory',
    workDirCaption: 'Optional',
    envVars: 'Environment Variables',
    inputVarsPlaceholder: 'Enter variable value...',
    url: 'URL',
    cancel: 'Cancel',
    install: 'Install',
    installFailed: 'Installation failed'
  },
  abortableBtn: {
    stop: 'Stop'
  },
  artifactsList: {
    searchPlaceholder: 'Search Artifacts...',
    close: 'Close'
  },
  artifactItemMenu: {
    save: 'Save',
    rename: 'Rename',
    moveTo: 'Move To',
    download: 'Download',
    delete: 'Delete',
    deleteConfirmTitle: 'Delete Artifact',
    deleteConfirmMessage: 'Are you sure you want to delete the artifact "{name}"?',
    deleteConfirmOk: 'Delete'
  },
  addInfoBtn: {
    attachment: 'Attachment',
    parameter: 'Parameter'
  },
  accountBtn: {
    account: 'Account',
    login: 'Log In'
  },
  copyBtn: {
    title: 'Copy',
    copyFailed: 'Copy failed'
  },
  convertArtifactDialog: {
    title: 'Convert to Artifact',
    name: 'Name',
    lang: 'Language',
    reserveOriginal: 'Reserve Original',
    cancel: 'Cancel',
    autoName: 'Auto Name',
    ok: 'OK'
  },
  aTip: {
    tip: 'TIP',
    dismiss: 'Dismiss'
  },
  assistantList: {
    newDialog: 'New Dialog',
    moveToGlobal: 'Move to Global',
    moveToWorkspace: 'Move to Workspace',
    delete: 'Delete',
    deleteConfirmTitle: 'Delete Assistant',
    deleteConfirmMessage: 'Are you sure you want to delete the assistant "{name}"?',
    newAssistant: 'New Assistant'
  },
  assistantItem: {
    unselected: 'Unselected',
    global: 'Global'
  },
  importDataDialog: {
    title: 'Import User Data',
    fileLabel: 'Data File',
    overwrite: 'Overwrite Existing Data',
    force: 'Force Write',
    clear: 'Clear Existing Data Before Import',
    cancel: 'Cancel',
    import: 'Import',
    importSuccess: 'Import successful',
    importFailed: 'Import failed: {message}'
  },
  imageInputArea: {
    clickToSelect: 'Click to Select Image',
    dragHere: 'Drag Here',
    paste: 'Or Ctrl+V to Paste'
  },
  hueSliderDialog: {
    title: 'Pick a Color',
    hue: 'Hue',
    cancel: 'Cancel',
    ok: 'OK'
  },
  filesInputDialog: {
    clickToSelect: 'Click to Select Image',
    dragHere: 'Drag Here',
    paste: 'Or Ctrl+V to Paste'
  },
  dialogList: {
    newDialog: 'New Dialog',
    searchPlaceholder: 'Search Dialogs...',
    renameTitle: 'Rename Title',
    summarizeDialog: 'Summarize Title',
    title: 'Title',
    moveTo: 'Move To',
    delete: 'Delete',
    deleteConfirmTitle: 'Delete Dialog',
    deleteConfirmMessage: 'Are you sure you want to delete the dialog "{name}"?',
    deleteConfirmOk: 'Delete'
  },
  darkSwitchBtn: {
    switchToDark: 'Switch to Dark Mode',
    switchToLight: 'Switch to Light Mode',
    switchToAuto: 'Switch to Auto'
  },
  messageInfoDialog: {
    userMessageInfo: 'User Message Info',
    assistantMessageInfo: 'Assistant Message Info',
    id: 'ID',
    createdAt: 'Created At',
    textLength: 'Text Length',
    model: 'Model',
    tokenUsage: 'Token Usage',
    prompt: 'Prompt:',
    completion: 'Completion:',
    ok: 'OK'
  },
  installPluginBtn: {
    installed: 'Installed',
    install: 'Install',
    installFailed: 'Installation failed:'
  },
  installedPlugins: {
    uninstallPlugin: 'Uninstall Plugin',
    uninstallConfirm: 'Are you sure you want to uninstall the plugin "{title}"?',
    uninstall: 'Uninstall'
  },
  messageItem: {
    quote: 'Quote',
    copyMarkdown: 'Copy Original Markdown Text',
    convertToArtifact: 'Convert to Artifact',
    regenerate: 'Regenerate',
    edit: 'Edit',
    more: 'More',
    showSourceCode: 'Show Source Code',
    directEdit: 'Direct Edit',
    moreInfo: 'More Info',
    userMessageQuote: 'User Message Quote',
    assistantMessageQuote: 'Assistant Message Quote',
    editMessage: 'Edit Message',
    convertToArtifactTitle: 'Convert to Artifact',
    convertToArtifactBtn: 'Convert to Artifact',
    copyCode: 'Copy Code',
    fold: 'Fold',
    reasoningContent: 'Reasoning Content'
  },
  parseFilesDialog: {
    parseFiles: 'Parse Files',
    noParserAvailable: 'No parser available for this type',
    cancel: 'Cancel',
    parse: 'Parse',
    parser: 'Parser',
    parseFailed: 'Failed to parse "{file}": {error}'
  },
  modelInputItems: {
    model: 'Model',
    multimodalCapabilities: 'Multimodal Capabilities',
    multimodalCapabilitiesCaption: 'Modify the multimodal capabilities configuration of the model',
    userInputTypes: 'User Input Support Types',
    assistantMessageTypes: 'Assistant Message Support Types',
    toolResultTypes: 'Tool Result Support Types'
  },
  platformEnabledInput: {
    alwaysEnabled: 'Always Enabled',
    desktopOnly: 'Desktop Only',
    mobileOnly: 'Mobile Only',
    alwaysDisabled: 'Always Disabled'
  },
  pickAvatarDialog: {
    ai: 'AI',
    icon: 'Icon',
    text: 'Text',
    image: 'Image',
    aiCompany: 'AI & Company',
    color: 'Color',
    aiCompanyQuestion: 'AI? & Company?',
    preview: 'Preview',
    showBackground: 'Show Background',
    backgroundColor: 'Background Color',
    cancel: 'Cancel',
    confirm: 'Confirm',
    textLabel: 'Text',
    textHint: 'Support Emoji'
  },
  payDialog: {
    pay: 'Pay',
    payWithAlipay: 'Use Alipay to scan the code to pay {price} yuan',
    cancelOrder: 'Cancel Order',
    orderCancelled: 'Order Cancelled',
    cancelOrderFailed: 'Failed to Cancel Order',
    paymentSuccess: 'Payment Successful',
    checkOrderStatusFailed: 'Failed to Check Order Status'
  },
  saveDialog: {
    title: 'Save Changes',
    message: 'Do you want to save the changes to "{name}"?',
    cancel: 'Cancel',
    dontSave: 'Don\'t Save',
    save: 'Save'
  },
  jsonInputDialog: {
    cancel: 'Cancel',
    ok: 'OK'
  },
  providerInputItems: {
    provider: 'Provider'
  },
  promptVarItem: {
    variableName: 'Variable Name',
    label: 'Label',
    type: 'Type',
    options: 'Options',
    defaultValue: 'Default Value',
    remove: 'Remove',
    clearable: 'Clearable',
    text: 'Text',
    number: 'Number',
    toggle: 'Toggle',
    select: 'Select',
    multiSelect: 'Multi Select'
  },
  promptVarEditor: {
    addVariable: 'Add Variable'
  },
  pluginTypeBadge: {
    builtin: 'Built-in',
    lobechat: 'LobeChat',
    gradio: 'Gradio',
    mcp: 'MCP'
  },
  textareaDialog: {
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  subscribeDialog: {
    title: 'Subscribe to Cloud Sync Service',
    duration: 'Subscription Duration (Months)',
    amountDue: 'Amount Due',
    paymentMethod: 'Payment Method',
    alipayOnly: 'Alipay is currently the only supported method',
    cancel: 'Cancel',
    order: 'Order'
  },
  selectWorkspaceDialog: {
    selectWorkspace: 'Select Workspace',
    selectFolder: 'Select Folder',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  selectFileBtn: {
    clickToSelect: 'Click to Select Image',
    dragHere: 'Drag Here',
    paste: 'Or Ctrl+V to Paste'
  },
  viewFileDialog: {
    fileSize: 'File Size',
    fileType: 'File Type',
    copy: 'Copy',
    download: 'Download',
    ok: 'OK'
  },
  varsInput: {
    addVariable: 'Add Variable',
    variableName: 'Variable Name'
  },
  topupDialog: {
    title: 'Recharge Model Service',
    amount: 'Recharge Amount (Yuan)',
    amountCaption: 'Please enter an integer between 1 and 999',
    payableAmount: 'Payable Amount',
    paymentMethod: 'Payment Method',
    alipayOnly: 'Alipay is currently the only supported method',
    cancel: 'Cancel',
    order: 'Order'
  },
  toolContent: {
    toolCall: 'Tool Call',
    callParams: 'Call Parameters',
    callResult: 'Call Result',
    errorMessage: 'Error Message'
  },
  workspaceNav: {
    workspace: 'Workspace',
    folder: 'Folder'
  },
  workspaceListSelect: {
    root: 'Root Directory'
  },
  workspaceListItem: {
    rename: 'Rename',
    changeIcon: 'Change Icon',
    newWorkspace: 'New Workspace',
    newFolder: 'New Folder',
    moveTo: 'Move To',
    delete: 'Delete'
  },
  modelOptionsBtn: {
    modelOptions: 'Model Options',
    reasoningEffort: 'Reasoning Effort',
    useSearchGrounding: 'Use Search'
  }
}
