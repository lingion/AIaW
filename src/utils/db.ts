import Dexie, { type Table } from 'dexie'
import { defaultAvatar, genId } from './functions'
import { Workspace, Folder, Dialog, Message, Assistant, Artifact, StoredReactive, InstalledPlugin, AvatarImage, ImageCacheItem, StoredItem, CustomProvider } from './types'
import { AssistantDefaultPrompt, ExampleWsIndexContent } from './templates'
import { DexieDBURL } from './config'
import { i18n } from 'src/boot/i18n'

// 注意: 用本地 Table 别名替代 dexie-cloud-addon 的 DexieCloudTable 类型，
// 完全避免静态导入 dexie-cloud-addon（其顶层副作用会把 IndexedDB 版本号
// 推到 v70 并影响本地模式下的 useLiveQuery 响应性，导致白屏）。
type Db = Dexie & {
  workspaces: Table<Workspace | Folder, 'id'>
  dialogs: Table<Dialog, 'id'>
  messages: Table<Message, 'id'>
  assistants: Table<Assistant, 'id'>
  artifacts: Table<Artifact, 'id'>
  installedPluginsV2: Table<InstalledPlugin, 'id'>
  reactives: Table<StoredReactive, 'key'>
  avatarImages: Table<AvatarImage, 'id'>
  imageCache: Table<ImageCacheItem, 'url'>
  items: Table<StoredItem, 'id'>
  providers: Table<CustomProvider, 'id'>
}

// 注意: dexie-cloud-addon 即便 addons=[] 也会在 import 时执行顶层副作用，
// 强行把 IndexedDB 版本号抬到 v70+，破坏 useLiveQuery 响应性 → 白屏。
// 本地模式不传 addons；只有 DexieDBURL 真有值时才走 cloud 路径（动态 import）。
const db = new Dexie('data', { addons: [] }) as Db

if (DexieDBURL) {
  // 动态 import，避免本地模式加载 dexie-cloud-addon 的副作用
  import('dexie-cloud-addon').then((mod) => {
    const dexieCloud = mod.default
    db.open()
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.assign(db, dexieCloud)
        db.cloud.configure({
          databaseUrl: DexieDBURL,
          requireAuth: false,
          customLoginGui: true,
          nameSuffix: false
        })
        return db.open()
      })
      .catch((e) => {
        console.error('Failed to enable dexie cloud addon', e)
      })
  }).catch((e) => {
    console.error('Failed to load dexie-cloud-addon', e)
  })
}
const schema = {
  workspaces: 'id, type, parentId',
  dialogs: 'id, workspaceId',
  messages: 'id, type, dialogId',
  assistants: 'id, workspaceId',
  canvases: 'id, workspaceId', // deprecated
  artifacts: 'id, workspaceId',
  installedPluginsV2: 'key, id',
  reactives: 'key',
  avatarImages: 'id',
  imageCache: 'url',
  items: 'id, type, dialogId',
  providers: 'id'
}
db.version(6).stores({
  workspaces: 'id, type, parentId',
  dialogs: 'id, workspaceId',
  messages: 'id, type, dialogId',
  assistants: 'id, workspaceId',
  canvases: 'id, workspaceId',
  artifacts: 'id, workspaceId',
  installedPluginsV2: 'key, id',
  reactives: 'key',
  avatarImages: 'id',
  items: 'id, type, dialogId',
  providers: 'id'
})
db.version(7).stores(schema)

const defaultModelSettings = {
  temperature: 0.6,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  maxSteps: 4,
  maxRetries: 1
}

const { t } = i18n.global

db.on.populate.subscribe(() => {
  db.on.ready.subscribe((db: Db) => {
    const initialWorkspaceId = genId()
    const initialAssistantId = genId()
    db.workspaces.add({
      id: initialWorkspaceId,
      name: t('db.exampleWorkspace'),
      avatar: { type: 'icon', icon: 'sym_o_menu_book' },
      type: 'workspace',
      parentId: '$root',
      prompt: '',
      defaultAssistantId: initialAssistantId,
      indexContent: ExampleWsIndexContent,
      vars: {},
      listOpen: {
        assistants: true,
        artifacts: false,
        dialogs: true
      }
    } as Workspace)
    db.assistants.add({
      id: initialAssistantId,
      name: t('db.defaultAssistant'),
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
  // Migration to v1.8
  const { modelSettings } = assistant
  if ('maxTokens' in modelSettings) {
    modelSettings.maxOutputTokens = modelSettings.maxTokens as number
    delete modelSettings.maxTokens
  }
  return assistant
})
// Migration to v1.4
db.workspaces.hook('reading', workspace => {
  if (workspace.type === 'workspace') {
    workspace.listOpen ??= {
      assistants: true,
      artifacts: false,
      dialogs: true
    }
  }
  return workspace
})

db.messages.hook('reading', message => {
  const usage = message.usage as any
  if (usage && 'promptTokens' in usage) {
    message.usage = {
      inputTokens: usage.promptTokens,
      outputTokens: usage.completionTokens,
      totalTokens: usage.totalTokens
    }
  }
  return message
})

export { schema, db, defaultModelSettings }
export type { Db }
