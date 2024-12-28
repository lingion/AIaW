<template>
  <view-common-header @toggle-drawer="$emit('toggle-drawer')">
    <div>
      <assistant-item
        clickable
        :assistant
        v-if="dialog"
        text-base
        dense
        item-rd
      />
      <q-menu>
        <q-list>
          <assistant-item
            clickable
            v-for="a in assistants"
            :key="a.id"
            :assistant="a"
            @click="dialog.assistantId = a.id"
            v-close-popup
          />
        </q-list>
      </q-menu>
    </div>
    <div
      v-if="model"
      text-on-sur-var
      my-2
      of-hidden
      whitespace-nowrap
      text-ellipsis
      cursor-pointer
    >
      <q-icon
        name="sym_o_neurology"
        size="24px"
      />
      <code
        bg-sur-c-high
        px="6px"
        py="3px"
        text="xs"
      >{{ sdkModel.modelId }}</code>
      <q-menu important:max-w="300px">
        <q-list>
          <template v-if="assistant.model">
            <q-item-label
              header
              pb-2
            >
              助手模型
            </q-item-label>
            <model-item
              v-if="assistant.model"
              :model="assistant.model.name"
              @click="dialog.modelOverride = null"
              :selected="!dialog.modelOverride"
              clickable
              v-close-popup
            />
          </template>
          <template v-else-if="perfs.model">
            <q-item-label
              header
              pb-2
            >
              全局默认
            </q-item-label>
            <model-item
              v-if="perfs.model"
              :model="perfs.model.name"
              @click="dialog.modelOverride = null"
              :selected="!dialog.modelOverride"
              clickable
              v-close-popup
            />
          </template>
          <q-separator spaced />
          <q-item-label
            header
            py-2
          >
            常用模型
          </q-item-label>
          <a-tip
            tip-key="configure-common-models"
            dense
            rd-0
          >
            可以在 <router-link
              to="/settings#ui"
              pri-link
            >
              设置
            </router-link> 中配置 常用模型
          </a-tip>
          <model-item
            v-for="m of perfs.commonModelOptions"
            :key="m"
            clickable
            :model="m"
            @click="dialog.modelOverride = models.find(model => model.name === m) || { name: m, inputTypes: InputTypes.default }"
            :selected="dialog.modelOverride?.name === m"
            v-close-popup
          />
        </q-list>
      </q-menu>
    </div>
    <q-space />
  </view-common-header>
  <q-page-container
    bg-sur-c-low
    v-if="dialog"
  >
    <q-page
      flex
      flex-col
      :style-fn="pageFhStyle"
    >
      <div
        grow
        bg-sur
        of-y-auto
        py-4
        ref="scrollContainer"
        pos-relative
        :class="{ 'rd-r-lg': rightDrawerAbove }"
      >
        <template
          v-for="(i, index) in chain"
          :key="i"
        >
          <message-item
            class="message-item"
            v-if="messageMap[i] && i !== '$root'"
            :model-value="dialog.msgRoute[index - 1] + 1"
            :message="messageMap[i]"
            :child-num="dialog.msgTree[chain[index - 1]].length"
            @update:model-value="switchChain(index - 1, $event - 1)"
            @edit="edit(index)"
            @regenerate="regenerate(index)"
            @quote="addInputItems([$event])"
            pt-2
            pb-4
          />
        </template>
      </div>
      <div
        bg-sur-c-low
        p-2
        pos-relative
      >
        <div
          v-if="inputMessageContent?.items.length"
          pos-absolute
          z-3
          top-0
          left-0
          translate-y="-100%"
          flex
          items-end
          p-2
          gap-2
        >
          <message-image
            v-for="image in inputContentItems.filter(i => i.mimeType?.startsWith('image/'))"
            :key="image.id"
            :image
            removable
            h="100px"
            @remove="removeItem(image)"
            shadow
          />
          <message-file
            v-for="file in inputContentItems.filter(i => !i.mimeType?.startsWith('image/'))"
            :key="file.id"
            :file
            removable
            @remove="removeItem(file)"
            shadow
          />
        </div>
        <div
          v-if="isPlatformEnabled(perfs.dialogScrollBtn)"
          pos-absolute
          top--1
          right-2
          flex="~ col"
          text-sec
          translate-y="-100%"
          z-1
        >
          <q-btn
            flat
            round
            dense
            icon="sym_o_first_page"
            rotate-90
            @click="scroll('top')"
          />
          <q-btn
            flat
            round
            dense
            icon="sym_o_keyboard_arrow_up"
            @click="scroll('up')"
          />
          <q-btn
            flat
            round
            dense
            icon="sym_o_keyboard_arrow_down"
            @click="scroll('down')"
          />
          <q-btn
            flat
            round
            dense
            icon="sym_o_last_page"
            rotate-90
            @click="scroll('bottom')"
          />
        </div>
        <div
          flex
          text-sec
          items-center
        >
          <q-btn
            v-if="model && mimeTypeMatch('image/webp', model.inputTypes.user)"
            flat
            icon="sym_o_image"
            title="添加图片"
            round
            @click="imageInput.click()"
          >
            <input
              ref="imageInput"
              type="file"
              multiple
              accept="image/*"
              @change="onInputFiles"
              un-hidden
            >
          </q-btn>
          <q-btn
            flat
            icon="sym_o_folder"
            title="添加文件"
            round
            @click="fileInput.click()"
          >
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="*"
              @change="onInputFiles"
              un-hidden
            >
          </q-btn>
          <q-btn
            v-if="assistant?.promptVars.length"
            flat
            icon="sym_o_tune"
            :title="showVars ? '隐藏变量' : '显示变量'"
            round
            @click="showVars = !showVars"
            :class="{ 'text-ter': showVars }"
          />
          <q-space />
          <div
            v-if="assistant && activePlugins.length"
            my-2
            @click="$router.push(`../assistants/${assistant.id}#plugins`)"
            cursor-pointer
          >
            <q-icon
              name="sym_o_extension"
              size="24px"
            />
            <code
              bg-sur-c-high
              px-2
              py-1
            >{{ activePlugins.length }}</code>
            <q-tooltip>
              已启用插件
              <template
                v-for="p of activePlugins"
                :key="p.id"
              >
                <br>- {{ p.title }}
              </template>
            </q-tooltip>
          </div>
          <div
            v-if="usage"
            my-2
            ml-2
          >
            <q-icon
              name="sym_o_generating_tokens"
              size="24px"
            />
            <code
              bg-sur-c-high
              px-2
              py-1
            >{{ usage.promptTokens }}+{{ usage.completionTokens }}</code>
            <q-tooltip>
              上条消息 Token 消耗<br>
              提示：{{ usage.promptTokens }}，补全：{{ usage.completionTokens }}
            </q-tooltip>
          </div>
          <abortable-btn
            icon="sym_o_send"
            label="发送"
            @click="send"
            @abort="abortController?.abort()"
            :loading="!!messageMap[chain.at(-2)]?.generatingSession"
            ml-4
            self-stretch
          />
        </div>
        <div
          flex
          v-if="assistant"
          v-show="showVars"
        >
          <prompt-var-input
            class="mt-2 mr-2"
            v-for="promptVar of assistant.promptVars"
            :key="promptVar.id"
            :prompt-var="promptVar"
            v-model="dialog.inputVars[promptVar.name]"
            :input-props="{
              dense: true,
              outlined: true
            }"
            component="input"
          />
        </div>
        <q-input
          class="mt-2"
          max-h-50vh
          of-y-auto
          :model-value="inputMessageContent?.text"
          @update:model-value="inputMessageContent && updateInputText($event)"
          outlined
          autogrow
          clearable
          placeholder="输入聊天内容..."
          @keydown.enter="onEnter"
          @paste="onTextPaste"
        />
      </div>
    </q-page>
  </q-page-container>
  <error-not-found v-else />
</template>

<script setup lang="ts">
import { computed, inject, onUnmounted, provide, ref, Ref, toRaw, toRef, watch, nextTick } from 'vue'
import { db } from 'src/utils/db'
import { useLiveQueryWithDeps } from 'src/composables/live-query'
import { almostEqual, escapeRegex, genId, isPlatformEnabled, isTextFile, mimeTypeMatch, pageFhStyle, textBeginning, wrapCode } from 'src/utils/functions'
import { useAssistantsStore } from 'src/stores/assistants'
import { streamText, CoreMessage, generateText, tool, jsonSchema } from 'ai'
import { useModel } from 'src/composables/model'
import { throttle, useQuasar } from 'quasar'
import AssistantItem from 'src/components/AssistantItem.vue'
import { useSystemModel } from 'src/composables/system-model'
import { ActionMessage, GenDialogTitle, PluginsPrompt } from 'src/utils/templates'
import sessions from 'src/utils/sessions'
import PromptVarInput from 'src/components/PromptVarInput.vue'
import { MessageContent, PluginApi, ApiCallError, Plugin, Dialog, Message, Workspace, UserMessageContent, StoredItem, ModelSettings, ApiResultItem } from 'src/utils/types'
import { usePluginsStore } from 'src/stores/plugins'
import MessageItem from 'src/components/MessageItem.vue'
import { scaleBlob } from 'src/utils/image-process'
import MessageImage from 'src/components/MessageImage.vue'
import { engine } from 'src/utils/template-engine'
import { useCallApi } from 'src/composables/call-api'
import { until } from '@vueuse/core'
import ViewCommonHeader from 'src/components/ViewCommonHeader.vue'
import { syncRef } from 'src/composables/sync-ref'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import ModelItem from 'src/components/ModelItem.vue'
import ParseFilesDialog from 'src/components/ParseFilesDialog.vue'
import MessageFile from 'src/components/MessageFile.vue'
import { dialogOptions, InputTypes, models } from 'src/utils/values'
import { useUserDataStore } from 'src/stores/user-data'
import ErrorNotFound from 'src/pages/ErrorNotFound.vue'
import { useRoute, useRouter } from 'vue-router'
import AbortableBtn from 'src/components/AbortableBtn.vue'
import { MaxMessageFileSizeMB } from 'src/utils/config'
import ATip from 'src/components/ATip.vue'
import { useListenKey } from 'src/composables/listen-key'

const props = defineProps<{
  id: string
}>()

const rightDrawerAbove = inject('rightDrawerAbove')

const dialogs: Ref<Dialog[]> = inject('dialogs')
const liveData = useLiveQueryWithDeps(() => props.id, async () => {
  const [dialog, messages, items] = await Promise.all([
    db.dialogs.get(props.id),
    db.messages.where('dialogId').equals(props.id).toArray(),
    db.items.where('dialogId').equals(props.id).toArray()
  ])
  return { dialog, messages, items }
}, { initialValue: { dialog: null, messages: [], items: [] } as { dialog: Dialog, messages: Message[], items: StoredItem[] } })
const dialog = syncRef<Dialog>(
  () => liveData.value.dialog,
  val => { db.dialogs.put(toRaw(val)) },
  { valueDeep: true }
)
const assistantsStore = useAssistantsStore()
const workspace: Ref<Workspace> = inject('workspace')
const assistants = computed(() => assistantsStore.assistants.filter(
  a => [workspace.value.id, '$root'].includes(a.workspaceId)
))
const assistant = computed(() => assistantsStore.assistants.find(a => a.id === dialog.value?.assistantId))
provide('dialog', dialog)

const chain = computed(() => liveData.value.dialog ? getChain('$root', liveData.value.dialog.msgRoute)[0] : [])
const historyChain = ref<string[]>([])
function switchChain(index, value) {
  const route = [...dialog.value.msgRoute.slice(0, index), value]
  updateChain(route)
}
function updateChain(route) {
  const res = getChain('$root', route)
  historyChain.value = res[0]
  db.dialogs.update(dialog.value.id, { msgRoute: res[1] })
}
watch([() => liveData.value.messages.length, () => liveData.value.dialog?.id], () => {
  liveData.value.dialog && updateChain(liveData.value.dialog.msgRoute)
})
function getChain(node, route: number[]) {
  const children = liveData.value.dialog.msgTree[node]
  const r = route.at(0) || 0
  if (children[r]) {
    const [restChain, restRoute] = getChain(children[r], route.slice(1))
    return [[node, ...restChain], [r, ...restRoute]]
  } else {
    return [[node], [r]]
  }
}

async function edit(index) {
  const target = chain.value[index - 1]
  const { type, contents } = messageMap.value[chain.value[index]]
  switchChain(index - 1, dialog.value.msgTree[target].length)
  await db.transaction('rw', db.dialogs, db.messages, db.items, () => {
    appendMessage(target, {
      type,
      contents,
      status: 'inputing'
    })
    const content = contents[0] as UserMessageContent
    saveItems(content.items.map(id => itemMap.value[id]))
  })
}
async function regenerate(index) {
  const target = chain.value[index - 1]
  switchChain(index - 1, dialog.value.msgTree[target].length)
  await stream(target, false)
}

async function appendMessage(target, info: Partial<Message>, insert = false) {
  const id = genId()
  await db.transaction('rw', db.dialogs, db.messages, async () => {
    await db.messages.add({
      id,
      dialogId: dialog.value.id,
      workspaceId: dialog.value.workspaceId,
      ...info
    } as Message)
    const d = await db.dialogs.get(props.id)
    const children = d.msgTree[target]
    const changes = insert ? {
      [target]: [id],
      [id]: children
    } : {
      [target]: [...children, id],
      [id]: []
    }
    await db.dialogs.update(props.id, {
      msgTree: { ...d.msgTree, ...changes }
    })
  })
  return id
}

async function updateInputText(text) {
  await db.messages.update(chain.value.at(-1), {
    // use shallow keyPath to avoid dexie's sync bug
    contents: [{
      ...inputMessageContent.value,
      text
    }]
  })
}

const inputMessageContent = computed(() => messageMap.value[chain.value.at(-1)]?.contents[0] as UserMessageContent)
const inputContentItems = computed(() => inputMessageContent.value.items.map(id => itemMap.value[id]).filter(x => x))
const messageMap = computed<Record<string, Message>>(() => {
  const map = {}
  liveData.value.messages.forEach(m => { map[m.id] = m })
  return map
})
const itemMap = computed<Record<string, StoredItem>>(() => {
  const map = {}
  liveData.value.items.forEach(i => { map[i.id] = i })
  return map
})
provide('messageMap', messageMap)
provide('itemMap', itemMap)
const inputEmpty = computed(() => !inputMessageContent.value?.text && !inputMessageContent.value?.items.length)

function onTextPaste(ev: ClipboardEvent) {
  if (!perfs.codePasteOptimize) return
  const { clipboardData } = ev
  const i = clipboardData.types.findIndex(t => t === 'vscode-editor-data')
  if (i !== -1) {
    const code = clipboardData.getData('text/plain')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
    if (!/\s/.test(code)) return
    const data = clipboardData.getData('vscode-editor-data')
    const lang = JSON.parse(data).mode ?? ''
    if (lang === 'markdown') return
    const wrappedCode = wrapCode(code, lang)
    document.execCommand('insertText', false, wrappedCode)
    ev.preventDefault()
  }
}

const imageInput = ref()
const fileInput = ref()
function onInputFiles({ target }) {
  const files = target.files
  parseFiles(files)
  target.value = ''
}
function onPaste(ev: ClipboardEvent) {
  const { clipboardData } = ev
  if (clipboardData.types.includes('text/plain')) {
    if (!['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName)) {
      const text = clipboardData.getData('text/plain')
      addInputItems([{
        type: 'text',
        name: `粘贴文本：${textBeginning(text, 10)}`,
        contentText: text
      }])
    }
    return
  }
  parseFiles(Array.from(clipboardData.files) as File[])
}
addEventListener('paste', onPaste)
onUnmounted(() => removeEventListener('paste', onPaste))
async function removeItem(item: StoredItem) {
  const items = [...inputMessageContent.value.items]
  items.splice(items.indexOf(item.id), 1)
  await db.transaction('rw', db.messages, db.items, () => {
    db.messages.update(chain.value.at(-1), {
      contents: [{
        ...inputMessageContent.value,
        items
      }]
    })
    item.references--
    item.references === 0 ? db.items.delete(item.id) : db.items.update(item.id, { references: item.references })
  })
}
async function parseFiles(files: File[]) {
  if (!files.length) return
  const textFiles = []
  const supportedFiles = []
  const otherFiles = []
  for (const file of files) {
    if (await isTextFile(file)) textFiles.push(file)
    else if (mimeTypeMatch(file.type, model.value.inputTypes.user)) supportedFiles.push(file)
    else otherFiles.push(file)
  }

  const parsedFiles: ApiResultItem[] = []
  for (const file of textFiles) {
    parsedFiles.push({
      type: 'text',
      name: file.name,
      contentText: await file.text()
    })
  }
  for (const file of supportedFiles) {
    if (file.size > MaxMessageFileSizeMB * 1024 * 1024) {
      $q.notify({ message: `文件太大（>${MaxMessageFileSizeMB}MB）`, color: 'negative' })
      continue
    }
    const f = file.type.startsWith('image/') && file.size > 512 * 1024 ? await scaleBlob(file, 2048 * 2048) : file
    parsedFiles.push({
      type: 'file',
      name: file.name,
      mimeType: file.type,
      contentBuffer: await f.arrayBuffer()
    })
  }
  addInputItems(parsedFiles)

  otherFiles.length && $q.dialog({
    component: ParseFilesDialog,
    componentProps: { files: otherFiles, plugins: assistant.value.plugins }
  }).onOk((files: ApiResultItem[]) => {
    addInputItems(files)
  })
}
async function addInputItems(items: ApiResultItem[]) {
  const storedItems = items.map(i => ({ ...i, id: genId(), dialogId: props.id, references: 0 }))
  const ids = storedItems.map(i => i.id)
  await db.transaction('rw', db.messages, db.items, () => {
    db.messages.update(chain.value.at(-1), {
      // use shallow keyPath to avoid dexie's sync bug
      contents: [{
        ...inputMessageContent.value,
        items: [...inputMessageContent.value.items, ...ids]
      }]
    })
    saveItems(storedItems)
  })
}

async function saveItems(items: StoredItem[]) {
  items.forEach(i => {
    i.references++
  })
  await db.items.bulkPut(items)
}

function getChainMessages() {
  const val: CoreMessage[] = []
  historyChain.value
    .slice(1)
    .slice(-assistant.value.contextNum || 0)
    .filter(id => messageMap.value[id].status !== 'inputing')
    .map(id => messageMap.value[id].contents)
    .flat()
    .forEach(content => {
      if (content.type === 'user-message') {
        val.push({
          role: 'user',
          content: [
            { type: 'text', text: content.text },
            ...content.items.map(id => itemMap.value[id]).map(i => {
              if (i.contentText) {
                if (i.type === 'file') {
                  return { type: 'text' as const, text: `<file_content filename="${i.name}">\n${i.contentText}\n</file_content>` }
                } else if (i.type === 'quote') {
                  return { type: 'text' as const, text: `<quote name="${i.name}">${i.contentText}</quote>` }
                } else {
                  return { type: 'text' as const, text: i.contentText }
                }
              } else {
                if (!mimeTypeMatch(i.mimeType, model.value.inputTypes.user)) {
                  return null
                } else if (i.mimeType.startsWith('image/')) {
                  return { type: 'image' as const, image: i.contentBuffer, mimeType: i.mimeType }
                } else {
                  return { type: 'file' as const, mimeType: i.mimeType, data: i.contentBuffer }
                }
              }
            }).filter(x => x)
          ]
        })
      } else if (content.type === 'assistant-message') {
        val.push({
          role: 'assistant',
          content: [
            { type: 'text', text: content.text }
          ]
        })
      } else if (content.type === 'assistant-tool') {
        if (content.status !== 'completed') return
        const { name, args, result } = content
        const id = genId()
        val.push({
          role: 'assistant',
          content: [{
            type: 'tool-call',
            toolName: name,
            toolCallId: id,
            args
          }]
        })
        val.push({
          role: 'tool',
          content: [{
            type: 'tool-result',
            toolName: name,
            toolCallId: id,
            result: result.map(id => itemMap.value[id])
          }]
        })
      } else if (content.type === 'assistant-action') {
        val.push({
          role: 'assistant',
          content: [{
            type: 'text',
            text: engine.parseAndRenderSync(ActionMessage, { action: content })
          }]
        })
      }
    })
  return val
}

function getSystemPrompt(enabledPlugins) {
  try {
    const prompt = engine.parseAndRenderSync(assistant.value.promptTemplate, {
      ...getCommonVars(),
      ...workspace.value.vars,
      ...dialog.value.inputVars,
      _pluginsPrompt: enabledPlugins.length
        ? engine.parseAndRenderSync(PluginsPrompt, { plugins: enabledPlugins })
        : '',
      _rolePrompt: assistant.value.prompt
    })
    return prompt.trim() ? prompt : undefined
  } catch (e) {
    console.error(e)
    $q.notify({ message: '提示词解析失败，请检查助手提示词模板', color: 'negative' })
    throw e
  }
}

function getCommonVars() {
  return {
    _currentTime: new Date().toString(),
    _userLanguage: navigator.language,
    _workspaceId: workspace.value.id,
    _workspaceName: workspace.value.name,
    _assistantId: assistant.value.id,
    _assistantName: assistant.value.name,
    _dialogId: dialog.value.id,
    _modelId: model.value.name,
    _isDarkMode: $q.dark.isActive,
    _platform: $q.platform
  }
}

const pluginsStore = usePluginsStore()

const { callApi } = useCallApi({ workspace, dialog })

const { sdkModel, model } = useModel(computed(() => assistant.value?.provider), computed(() => dialog.value?.modelOverride || assistant.value?.model))
const $q = useQuasar()
const { data } = useUserDataStore()
async function send() {
  if (!assistant.value) {
    $q.notify({ message: '请设置助手', color: 'negative' })
    return
  }
  if (!sdkModel.value) {
    $q.notify({ message: '请配置服务商、模型或者登录', color: 'negative' })
    return
  }
  if (!data.noobAlertDismissed && chain.value.length > 10 && dialogs.value.length < 3) {
    $q.dialog({
      title: '是否需要新建对话？',
      message: '一个新用户常见的误区是，始终在一个对话中提问，即使问题之间没有关联。\n实际上，当你问一个与前文无关的新问题时，就应该新建一个对话，以避免上下文的累计导致输入开销不断增大',
      persistent: true,
      ok: '我会新建一个对话',
      cancel: '我知道这些，无需提醒',
      ...dialogOptions
    }).onCancel(() => {
      data.noobAlertDismissed = true
      send()
    })
    return
  }
  showVars.value = false
  if (inputEmpty.value) {
    await stream(chain.value.at(-2), true)
  } else {
    const target = chain.value.at(-1)
    await db.messages.update(target, { status: 'default' })
    until(chain).changed().then(() => {
      nextTick().then(() => {
        scroll('bottom')
      })
    })
    await stream(target, false)
  }
  perfs.autoGenTitle && chain.value.length === 4 && genTitle()
}

const abortController = ref<AbortController>()
async function stream(target, insert = false) {
  const settings: Partial<ModelSettings> = {}
  for (const key in assistant.value.modelSettings) {
    const val = assistant.value.modelSettings[key]
    if (val || val === 0) {
      settings[key] = val
    }
  }
  let messageContent: MessageContent = {
    type: 'assistant-message',
    text: ''
  }
  const contents: MessageContent[] = [messageContent]
  let id
  await db.transaction('rw', db.dialogs, db.messages, async () => {
    id = await appendMessage(target, {
      type: 'assistant',
      assistantId: assistant.value.id,
      contents,
      status: 'pending',
      generatingSession: sessions.id,
      modelName: model.value.name
    }, insert)
    !insert && await appendMessage(id, {
      type: 'user',
      contents: [{
        type: 'user-message',
        text: '',
        items: []
      }],
      status: 'inputing'
    })
  })

  const update = throttle(() => db.messages.update(id, { contents }), 50)
  async function callTool(plugin: Plugin, api: PluginApi, args) {
    const content: MessageContent = {
      type: 'assistant-tool',
      pluginId: plugin.id,
      name: api.name,
      args,
      status: 'calling'
    }
    contents.push(content)
    update()
    const { result, error } = await callApi(plugin, api, args)
    if (error) {
      content.status = 'failed'
      content.error = error
    } else {
      content.status = 'completed'
      content.result = result.map(i => i.id)
    }
    update()
    return { result, error }
  }
  const { plugins } = assistant.value
  const tools = {}
  const actions = []
  const enabledPlugins = []
  let noRoundtrip = true
  await Promise.all(activePlugins.value.map(async p => {
    noRoundtrip &&= p.noRoundtrip
    const plugin = plugins[p.id]
    const pluginVars = {
      ...getCommonVars(),
      ...plugin.vars
    }
    plugin.tools.forEach(api => {
      if (!api.enabled) return
      const a = p.apis.find(a => a.name === api.name)
      const { name, prompt } = a
      tools[`${p.id}-${name}`] = tool({
        description: engine.parseAndRenderSync(prompt, pluginVars),
        parameters: jsonSchema(a.parameters),
        async execute(args) {
          const { result, error } = await callTool(p, a, args)
          if (error) throw new ApiCallError(error)
          return result
        },
        experimental_toToolResultContent(items: StoredItem[]) {
          const val = []
          for (const item of items) {
            if (item.type === 'text') {
              val.push({ type: 'text', text: item.contentText })
            } else if (mimeTypeMatch(item.mimeType, model.value.inputTypes.tool)) {
              val.push({ type: item.mimeType.startsWith('image/') ? 'image' : 'file', mimeType: item.mimeType, data: item.contentBuffer })
            }
          }
          return val
        }
      })
    })
    const pluginInfos = {}
    await Promise.all(plugin.infos.map(async api => {
      if (!api.enabled) return
      const a = p.apis.find(a => a.name === api.name)
      try {
        pluginInfos[a.name] = await callApi(p, a, api.args)
      } catch (e) {
        $q.notify({ message: `调用插件信息失败：${e.message}`, color: 'negative' })
      }
    }))

    const pluginActions = []
    plugin.actions.forEach(api => {
      if (!api.enabled) return
      const a = p.apis.find(a => a.name === api.name)
      const { name, prompt } = a
      actions.push({
        pluginId: p.id,
        name
      })

      pluginActions.push({
        name,
        prompt: engine.parseAndRenderSync(prompt, pluginVars)
      })
    })
    try {
      enabledPlugins.push({
        id: p.id,
        prompt: p.prompt && engine.parseAndRenderSync(p.prompt, { ...pluginVars, infos: pluginInfos }),
        actions: pluginActions
      })
    } catch (e) {
      $q.notify({ message: `插件「${p.title}」提示词模板解析失败`, color: 'negative' })
    }
  }))

  try {
    if (noRoundtrip) settings.maxSteps = 1
    abortController.value = new AbortController()
    const messages = getChainMessages()
    const prompt = getSystemPrompt(enabledPlugins.filter(p => p.prompt || p.actions.length))
    prompt && messages.unshift({ role: assistant.value.promptRole, content: prompt })
    const params = {
      model: sdkModel.value,
      messages,
      tools,
      ...settings,
      abortSignal: abortController.value.signal
    }
    let result
    if (assistant.value.stream) {
      result = await streamText(params)
      await db.messages.update(id, { status: 'streaming' })
      for await (const textDelta of result.textStream) {
        messageContent.text += textDelta
        for (const action of actions) {
          const tag = `${action.pluginId}-${action.name}`
          const openReg = new RegExp(`<${escapeRegex(tag)} +(\\{.*\\}) *>\\n`)
          const closeReg = new RegExp(`\\n</${escapeRegex(tag)} *>`)
          const selfCloseReg = new RegExp(`<${escapeRegex(tag)} +(\\{.*\\}) */>`)
          const openMatch = messageContent.text.match(openReg)
          const closeMatch = messageContent.text.match(closeReg)
          const selfCloseMatch = messageContent.text.match(selfCloseReg)
          if (openMatch) {
            if (messageContent.type !== 'assistant-message') continue
            try {
              const args = JSON.parse(openMatch[1])
              const [prevText, currText] = messageContent.text.split(openMatch[0])
              messageContent.text = prevText
              messageContent = {
                type: 'assistant-action',
                pluginId: action.pluginId,
                name: action.name,
                args,
                text: currText,
                status: 'streaming'
              }
              contents.push(messageContent)
            } catch (e) {
              continue
            }
          } else if (closeMatch) {
            if (messageContent.type !== 'assistant-action' || messageContent.name !== action.name) continue
            const [prevText, currText] = messageContent.text.split(closeMatch[0])
            messageContent.text = prevText
            messageContent.status = 'ready'
            messageContent = {
              type: 'assistant-message',
              text: currText
            }
            contents.push(messageContent)
          } else if (selfCloseMatch) {
            if (messageContent.type !== 'assistant-message') continue
            try {
              const args = JSON.parse(selfCloseMatch[1])
              const [prevText, currText] = messageContent.text.split(selfCloseMatch[0])
              messageContent.text = prevText
              messageContent = {
                type: 'assistant-action',
                pluginId: action.pluginId,
                name: action.name,
                args,
                status: 'ready'
              }
              contents.push(messageContent)
              messageContent = {
                type: 'assistant-message',
                text: currText
              }
              contents.push(messageContent)
            } catch (e) {
              continue
            }
          }
        }
        update()
      }
    } else {
      result = await generateText(params)
      messageContent.text = await result.text
    }

    const usage = await result.usage
    const warnings = (await result.warnings).map(w => (w.type === 'unsupported-setting' || w.type === 'unsupported-tool') ? w.details : w.message)
    await db.messages.update(id, { contents, status: 'default', generatingSession: null, warnings, usage })
  } catch (e) {
    console.error(e)
    if (e.data?.error?.type === 'budget_exceeded') {
      $q.notify({
        message: '模型服务额度不足',
        color: 'err-c',
        textColor: 'on-err-c',
        actions: [{ label: '充值', color: 'on-sur', handler() { router.push('/account') } }]
      })
    }
    await db.messages.update(id, { contents, error: e.message, status: 'failed', generatingSession: null })
  }
}
const activePlugins = computed<Plugin[]>(() => pluginsStore.plugins.filter(p => p.available && assistant.value.plugins[p.id]?.enabled))
const usage = computed(() => messageMap.value[chain.value.at(-2)]?.usage)

const systemModel = useSystemModel()
async function genTitle() {
  try {
    const { text } = await generateText({
      model: systemModel.sdkModel.value,
      prompt: engine.parseAndRenderSync(GenDialogTitle, {
        contents: chain.value.slice(1, -1).map(id => messageMap.value[id].contents).flat(),
        lang: 'zh-CN'
      })
    })
    dialog.value.name = text
  } catch (e) {
    console.error(e)
    $q.notify({ message: '总结对话失败，请检查系统助手设置', color: 'negative' })
  }
}
const route = useRoute()
const router = useRouter()
watch(route, to => {
  db.workspaces.update(workspace.value.id, { lastDialogId: props.id } as Partial<Workspace>)

  if (to.hash === '#genTitle') {
    until(dialog).toMatch(val => val?.id === props.id).then(() => {
      genTitle()
      router.replace({ hash: '' })
    })
  }
}, { immediate: true })

function onEnter(ev) {
  if (perfs.sendKey === 'ctrl+enter') {
    ev.ctrlKey && send()
  } else if (perfs.sendKey === 'shift+enter') {
    ev.shiftKey && send()
  } else {
    if (ev.ctrlKey) document.execCommand('insertText', false, '\n')
    else if (!ev.shiftKey) send()
  }
}

const showVars = ref(true)

const scrollContainer = ref<HTMLElement>()
function getEls() {
  const container = scrollContainer.value
  const items: HTMLElement[] = Array.from(document.querySelectorAll('.message-item'))
  return { container, items }
}
function itemInView(item: HTMLElement, container: HTMLElement) {
  return item.offsetTop <= container.scrollTop + container.clientHeight &&
  item.offsetTop + item.clientHeight > container.scrollTop
}
function switchTo(target: 'prev' | 'next' | 'first' | 'last') {
  const { container, items } = getEls()
  const index = items.findIndex((item, i) =>
    itemInView(item, container) &&
    dialog.value.msgTree[chain.value[i]].length > 1
  )
  if (index === -1) return

  const id = chain.value[index]
  let to
  const curr = dialog.value.msgRoute[index]
  const num = dialog.value.msgTree[id].length
  if (target === 'first') {
    to = 0
  } else if (target === 'last') {
    to = num - 1
  } else if (target === 'prev') {
    to = curr - 1
  } else if (target === 'next') {
    to = curr + 1
  }
  if (to < 0 || to >= num || to === curr) return
  switchChain(index, to)
}
function scroll(action: 'up' | 'down' | 'top' | 'bottom') {
  const { container, items } = getEls()

  if (action === 'top') {
    container.scrollTo({ top: 0, behavior: 'smooth' })
    return
  } else if (action === 'bottom') {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    return
  }

  // Get current position
  const index = items.findIndex(item => itemInView(item, container))
  const itemTypes = items.map(i => i.clientHeight > container.clientHeight ? 'partial' : 'entire')
  let position: 'start' | 'inner' | 'end' | 'out'
  const item = items[index]
  const type = itemTypes[index]
  if (type === 'partial') {
    if (almostEqual(container.scrollTop, item.offsetTop, 5)) {
      position = 'start'
    } else if (almostEqual(container.scrollTop + container.clientHeight, item.offsetTop + item.clientHeight, 5)) {
      position = 'end'
    } else if (container.scrollTop + container.clientHeight < item.offsetTop + item.clientHeight) {
      position = 'inner'
    } else {
      position = 'out'
    }
  } else {
    if (almostEqual(container.scrollTop, item.offsetTop, 5)) {
      position = 'start'
    } else {
      position = 'out'
    }
  }

  // Scroll
  let top
  if (type === 'entire') {
    if (action === 'up') {
      if (position === 'start') {
        if (index === 0) return
        top = itemTypes[index - 1] === 'entire'
          ? items[index - 1].offsetTop
          : items[index - 1].offsetTop + items[index - 1].clientHeight - container.clientHeight
      } else {
        top = item.offsetTop
      }
    } else {
      if (index === items.length - 1) return
      top = items[index + 1].offsetTop
    }
  } else {
    if (action === 'up') {
      if (position === 'start') {
        if (index === 0) return
        top = itemTypes[index - 1] === 'entire'
          ? items[index - 1].offsetTop
          : items[index - 1].offsetTop + items[index - 1].clientHeight - container.clientHeight
      } else if (position === 'out') {
        top = item.offsetTop + item.clientHeight - container.clientHeight
      } else {
        top = item.offsetTop
      }
    } else {
      if (position === 'end' || position === 'out') {
        if (index === items.length - 1) return
        top = items[index + 1].offsetTop
      } else {
        top = item.offsetTop + item.clientHeight - container.clientHeight
      }
    }
  }
  container.scrollTo({ top: top + 2, behavior: 'smooth' })
}
function regenerateCurr() {
  const { container, items } = getEls()
  const index = items.findIndex(
    (item, i) => itemInView(item, container) && messageMap.value[chain.value[i + 1]].type === 'assistant'
  )
  if (index === -1) return
  regenerate(index + 1)
}
function editCurr() {
  const { container, items } = getEls()
  const index = items.findIndex(
    (item, i) => itemInView(item, container) && messageMap.value[chain.value[i + 1]].type === 'user'
  )
  if (index === -1) return
  edit(index + 1)
}
const { perfs } = useUserPerfsStore()
if (isPlatformEnabled(perfs.enableShortcutKey)) {
  useListenKey(toRef(perfs, 'scrollUpKeyV2'), () => scroll('up'))
  useListenKey(toRef(perfs, 'scrollDownKeyV2'), () => scroll('down'))
  useListenKey(toRef(perfs, 'scrollTopKey'), () => scroll('top'))
  useListenKey(toRef(perfs, 'scrollBottomKey'), () => scroll('bottom'))
  useListenKey(toRef(perfs, 'switchPrevKeyV2'), () => switchTo('prev'))
  useListenKey(toRef(perfs, 'switchNextKeyV2'), () => switchTo('next'))
  useListenKey(toRef(perfs, 'switchFirstKey'), () => switchTo('first'))
  useListenKey(toRef(perfs, 'switchLastKey'), () => switchTo('last'))
  useListenKey(toRef(perfs, 'regenerateCurrKey'), () => regenerateCurr())
  useListenKey(toRef(perfs, 'editCurrKey'), () => editCurr())
}

defineEmits(['toggle-drawer'])
</script>
