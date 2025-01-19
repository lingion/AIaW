import Dexie from 'dexie'
import { defaultAvatar, genId } from './functions'
import { Workspace, Folder, Dialog, Message, Assistant, Artifact, StoredReactive, InstalledPlugin, AvatarImage, StoredItem } from './types'
import { AssistantDefaultPrompt, ExampleWsIndexContent } from './templates'
import dexieCloud, { DexieCloudTable } from 'dexie-cloud-addon'
import { DexieDBURL } from './config'

type Db = Dexie & {
  workspaces: DexieCloudTable<Workspace | Folder, 'id'>
  dialogs: DexieCloudTable<Dialog, 'id'>
  messages: DexieCloudTable<Message, 'id'>
  assistants: DexieCloudTable<Assistant, 'id'>
  artifacts: DexieCloudTable<Artifact, 'id'>
  installedPluginsV2: DexieCloudTable<InstalledPlugin, 'id'>
  reactives: DexieCloudTable<StoredReactive, 'key'>
  avatarImages: DexieCloudTable<AvatarImage, 'id'>
  items: DexieCloudTable<StoredItem, 'id'>
}

const db = new Dexie('data', { addons: DexieDBURL ? [dexieCloud] : [] }) as Db

if (DexieDBURL) {
  db.cloud.configure({
    databaseUrl: DexieDBURL,
    requireAuth: false,
    customLoginGui: true,
    nameSuffix: false
  })
}
db.version(5).stores({
  workspaces: 'id, type, parentId',
  dialogs: 'id, workspaceId',
  messages: 'id, type, dialogId',
  assistants: 'id, workspaceId',
  artifacts: 'id, workspaceId',
  installedPluginsV2: 'key, id',
  reactives: 'key',
  avatarImages: 'id',
  items: 'id, type, dialogId'
})

const defaultModelSettings = {
  temperature: 0.6,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  maxSteps: 4,
  maxRetries: 1
}

db.on.populate.subscribe(() => {
  db.on.ready.subscribe((db: Db) => {
    const initialWorkspaceId = genId()
    const initialAssistantId = genId()
    db.workspaces.add({
      id: initialWorkspaceId,
      name: '示例工作区',
      avatar: { type: 'icon', icon: 'sym_o_menu_book' },
      type: 'workspace',
      parentId: '$root',
      prompt: '',
      defaultAssistantId: initialAssistantId,
      indexContent: ExampleWsIndexContent,
      vars: {}
    } as Workspace)
    db.assistants.add({
      id: initialAssistantId,
      name: '默认助手',
      avatar: defaultAvatar('AI'),
      workspaceId: initialWorkspaceId,
      prompt: '',
      promptTemplate: AssistantDefaultPrompt,
      promptVars: [],
      provider: null,
      model: null,
      modelSettings: { ...defaultModelSettings },
      plugins: {},
      promptRole: 'system',
      stream: true
    })
    db.reactives.add({
      key: '#user-data',
      value: {
        lastWorkspaceId: initialWorkspaceId
      }
    })
  }, false)
})

// Migration
db.assistants.hook('reading', assistant => {
  assistant.promptRole ??= 'system'
  assistant.stream ??= true
  return assistant
})

export { db, defaultModelSettings }
export type { Db }
