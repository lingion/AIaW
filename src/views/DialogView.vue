<template>
  <view-common-header
    @toggle-drawer="$emit('toggle-drawer')"
    @contextmenu="createDialog"
  >
    <div>
      <assistant-item
        clickable
        :assistant
        v-if="dialog"
        text-base
        item-rd
        py-1
        min-h-0
      />
      <q-menu>
        <q-list class="dialog-header-assistant-menu">
          <assistant-item
            clickable
            v-for="a in assistants"
            :key="a.id"
            :assistant="a"
            @click="dialog.assistantId = a.id"
            v-close-popup
            py-1.5
            min-h-0
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
      >{{ model.name }}</code>
      <q-menu important:max-w="300px">
        <q-list>
          <q-item>
            <q-item-section>
              <autocomplete-input
                :model-value="dialog.modelOverride?.name"
                @update:model-value="setModel"
                :options="providersStore.modelOptions"
                dense
                :label="$t('dialogView.model')"
              >
                <template #option="{ opt, selected, itemProps }">
                  <model-item
                    :model="opt"
                    :selected
                    v-bind="itemProps"
                  />
                </template>
              </autocomplete-input>
            </q-item-section>
          </q-item>
          <template v-if="assistant.model">
            <q-item-label
              header
              py-2
            >
              {{ $t('dialogView.assistantModel') }}
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
              py-2
            >
              {{ $t('dialogView.globalDefault') }}
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
          <q-item-label
            header
            py-2
          >
            {{ $t('dialogView.commonModels') }}
          </q-item-label>
          <a-tip
            tip-key="configure-common-models"
            rd-0
          >
            {{ $t('dialogView.modelsConfigGuide1') }}
            <router-link
              to="/settings"
              pri-link
            >
              {{ $t('dialogView.settings') }}
            </router-link> {{ $t('dialogView.modelsConfigGuide2') }}
          </a-tip>
          <model-item
            v-for="m of perfs.commonModelOptions"
            :key="m"
            clickable
            :model="m"
            @click="setModel(m)"
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
      class="dialog-page"
      flex
      flex-col
      pos-relative
      :style-fn="pageFhStyle"
    >
      <div
        class="dialog-content-shell"
        :class="{ 'dialog-content-shell--with-catalog': showDesktopCatalog }"
      >
        <div
          grow
          bg-sur
          of-y-auto
          py-4
          ref="scrollContainer"
          pos-relative
          :class="['dialog-scroll-container', { 'rd-r-lg': rightDrawerAbove }]"
          @scroll="onScroll"
        >
          <template
            v-for="(i, index) in chain"
            :key="i"
          >
            <message-item
              class="message-item"
              v-if="messageMap[i] && i !== '$root'"
              :data-message-id="i"
              :data-render-index="index - 1"
              :model-value="dialog.msgRoute[index - 1] + 1"
              :message="messageMap[i]"
              :child-num="dialog.msgTree[chain[index - 1]].length"
              :branch-control="getMessageBranchControl(index)"
              :scroll-container
              @update:model-value="switchChain(index - 1, $event - 1)"
              @edit="edit(index)"
              @regenerate="regenerate(index)"
              @delete="deleteBranch(index)"
              @quote="quote"
              @extract-artifact="extractArtifact(messageMap[i], ...$event)"
              @rendered="onMessageRendered(messageMap[i])"
              pt-2
              pb-4
            />
          </template>
          <div
            class="dialog-composer-spacer"
            :style="{ height: `${composerAreaHeight}px` }"
            aria-hidden="true"
          />
        </div>
        <aside
          v-if="showDesktopCatalog"
          class="dialog-catalog-sidebar"
        >
          <div class="dialog-catalog-sidebar__inner pos-sticky top-0">
            <md-catalog
              v-if="activeCatalogMessageId"
              :key="activeCatalogMessageId"
              px-2
              pb-4
              :editor-id="activeCatalogMessageId"
              :scroll-element="scrollContainer"
              :md-heading-id="mdPreviewProps.mdHeadingId"
            />
            <div
              class="dialog-catalog-sidebar__spacer"
              :style="{ height: `${composerAreaHeight}px` }"
              aria-hidden="true"
            />
          </div>
        </aside>
      </div>
      <div
        ref="composerArea"
        class="dialog-composer-area"
        pos-absolute
        left-0
        right-0
        bottom-0
        z-5
      >
        <div
          v-if="inputMessageContent?.items?.length"
          class="dialog-composer-attachments"
          pos-absolute
          z-3
          top-0
          left-0
          flex
          items-end
          p-2
          gap-2
          of-x-auto
        >
          <message-image
            v-for="image in inputContentItems.filter(i => i.mimeType?.startsWith('image/'))"
            :key="image.id"
            :image
            removable
            h="100px"
            shrink-0
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
          class="dialog-scroll-nav"
          :class="{ 'dialog-scroll-nav--expanded': scrollNavMode }"
          :style="{ right: scrollNavRightOffset }"
          pos-fixed
          top="50%"
          flex="~ col"
          text-sec
          translate-y="-50%"
          z-10
        >
          <button
            ref="scrollTopBtn"
            type="button"
            class="dialog-scroll-nav-btn dialog-scroll-nav-btn--top"
            :class="{ 'dialog-scroll-nav-btn--visible': scrollNavMode }"
          >
            <i class="material-symbols-outlined dialog-scroll-nav-btn__icon dialog-scroll-nav-btn__icon--rotated">first_page</i>
          </button>
          <button
            ref="scrollUpBtn"
            type="button"
            class="dialog-scroll-nav-btn"
            :class="{ 'dialog-scroll-nav-btn--active': scrollNavHoverAction === 'up' }"
          >
            <i class="material-symbols-outlined dialog-scroll-nav-btn__icon">keyboard_arrow_up</i>
          </button>
          <button
            ref="scrollDownBtn"
            type="button"
            class="dialog-scroll-nav-btn"
            :class="{ 'dialog-scroll-nav-btn--active': scrollNavHoverAction === 'down' }"
          >
            <i class="material-symbols-outlined dialog-scroll-nav-btn__icon">keyboard_arrow_down</i>
          </button>
          <button
            ref="scrollBottomBtn"
            type="button"
            class="dialog-scroll-nav-btn dialog-scroll-nav-btn--bottom"
            :class="{ 'dialog-scroll-nav-btn--visible': scrollNavMode }"
          >
            <i class="material-symbols-outlined dialog-scroll-nav-btn__icon dialog-scroll-nav-btn__icon--rotated">last_page</i>
          </button>
        </div>
        <div
          class="dialog-composer-floating-wrap"
          flex
          items-end
          gap-3
        >
          <div class="dialog-dock-shell">
            <div
              class="dialog-toolbar-row dialog-dock-toolbar"
              flex
              justify-end
              text-sec
              items-center
            >
              <q-btn
                class="dialog-toolbar-btn"
                flat
                icon="sym_o_photo_camera"
                :title="$t('dialogView.takePhoto')"
                round
                min-w="2.4em"
                min-h="2.4em"
                @click="takePhoto"
              />
              <q-btn
                v-if="model && mimeTypeMatch('image/webp', model.inputTypes.user)"
                class="dialog-toolbar-btn"
                flat
                icon="sym_o_image"
                :title="$t('dialogView.addImage')"
                round
                min-w="2.4em"
                min-h="2.4em"
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
                class="dialog-toolbar-btn"
                flat
                icon="sym_o_folder"
                :title="$t('dialogView.addFile')"
                round
                min-w="2.4em"
                min-h="2.4em"
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
                class="dialog-toolbar-btn"
                flat
                icon="sym_o_tune"
                :title="showVars ? $t('dialogView.hideVars') : $t('dialogView.showVars')"
                round
                min-w="2.4em"
                min-h="2.4em"
                @click="showVars = !showVars"
                :class="[{ 'text-ter': showVars }, 'dialog-toolbar-btn']"
              />
              <provider-options-btn
                v-if="sdkModel"
                class="dialog-toolbar-btn"
                :provider-name="sdkModel.provider"
                :model-id="sdkModel.modelId"
                v-model:provider-options="providerOptions"
                v-model:tools="providerTools"
                flat
                round
                min-w="2.4em"
                min-h="2.4em"
              />
              <add-info-btn
                v-if="assistant"
                class="dialog-toolbar-btn"
                :plugins="activePlugins"
                :assistant-plugins="assistant.plugins"
                @add="addInputItems"
                flat
                round
                min-w="2.4em"
                min-h="2.4em"
              />
              <q-btn
                v-if="assistant"
                class="dialog-toolbar-btn dialog-toolbar-plugin-btn"
                flat
                :round="!activePlugins.length"
                :class="{ 'px-2': activePlugins.length }"
                min-w="2.4em"
                min-h="2.4em"
                icon="sym_o_extension"
                :title="$t('dialogView.plugins')"
              >
                <code
                  v-if="activePlugins.length"
                  class="dialog-toolbar-plugin-count"
                  bg-sur-c-high
                  px="4px"
                >{{ activePlugins.length }}</code>
                <enable-plugins-menu :assistant-id="assistant.id" />
              </q-btn>
              <q-space />
              <div
                v-if="usage"
                class="dialog-usage-chip"
                ml-2
              >
                <q-icon
                  name="sym_o_generating_tokens"
                  size="16px"
                />
                <code
                  class="dialog-usage-chip__code"
                  bg-sur-c-high
                  px="6px"
                  py="2px"
                >{{ usage.inputTokens }}+{{ usage.outputTokens }}</code>
                <q-tooltip>
                  {{ $t('dialogView.messageTokens') }}<br>
                  {{ $t('dialogView.tokenPrompt') }}：{{ usage.inputTokens }}，{{ $t('dialogView.tokenCompletion') }}：{{ usage.outputTokens }}
                </q-tooltip>
              </div>
            </div>
            <div
              class="dialog-dock-vars"
              flex
              items-end
              gap-2
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
            <div class="dialog-composer-row dialog-dock-input-row" flex items-end>
              <a-input
                ref="messageInput"
                class="dialog-main-input"
                max-h-50vh
                of-y-auto
                :model-value="inputText"
                @update:model-value="inputMessageContent && updateInputText($event ?? '')"
                outlined
                autogrow
                clearable
                :debounce="perfs.userInputDebounce"
                :placeholder="''"
                @keydown.enter="onEnter"
                @paste="onTextPaste"
              />
            </div>
          </div>
          <div class="dialog-send-shell">
            <abortable-btn
              class="dialog-send-fab"
              :icon="composerActionIcon"
              :label="composerActionLabel"
              @click="onComposerAction"
              @abort="abortController?.abort()"
              :loading="generating"
              :disable="composerActionDisabled"
              min-h="48px"
            />
          </div>
        </div>
      </div>
    </q-page>
  </q-page-container>
  <error-not-found v-else />
</template>

<script setup lang="ts">
import { computed, inject, onUnmounted, provide, ref, Ref, shallowRef, toRaw, toRef, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { db } from 'src/utils/db'
import { useLiveQueryWithDeps } from 'src/composables/live-query'
import { almostEqual, displayLength, genId, inputValueEmpty, isPlatformEnabled, isTextFile, JSONEqual, mimeTypeMatch, pageFhStyle, textBeginning, wrapCode, wrapQuote } from 'src/utils/functions'
import { useAssistantsStore } from 'src/stores/assistants'
import { streamText, generateText, tool, jsonSchema, StreamTextResult, GenerateTextResult, ModelMessage, stepCountIs } from 'ai'
import { copyToClipboard, throttle, useQuasar } from 'quasar'
import AssistantItem from 'src/components/AssistantItem.vue'
import { DialogContent, ExtractArtifactPrompt, ExtractArtifactResult, GenDialogTitle, NameArtifactPrompt, PluginsPrompt } from 'src/utils/templates'
import sessions from 'src/utils/sessions'
import PromptVarInput from 'src/components/PromptVarInput.vue'
import { MessageContent, PluginApi, ApiCallError, Plugin, Dialog, Message, Workspace, UserMessageContent, StoredItem, ModelSettings, ApiResultItem, Artifact, ConvertArtifactOptions, AssistantMessageContent } from 'src/utils/types'
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
import { useSetTitle } from 'src/composables/set-title'
import { useCreateArtifact } from 'src/composables/create-artifact'
import artifactsPlugin from 'src/utils/artifacts-plugin'
import providerOptionsBtn from 'src/components/ProviderOptionsBtn.vue'
import AddInfoBtn from 'src/components/AddInfoBtn.vue'
import { useI18n } from 'vue-i18n'
import Mark from 'mark.js'
import { MdCatalog } from 'md-editor-v3'
import { useCreateDialog } from 'src/composables/create-dialog'
import EnablePluginsMenu from 'src/components/EnablePluginsMenu.vue'
import { useGetModel } from 'src/composables/get-model'
import { useUiStateStore } from 'src/stores/ui-state'
import AutocompleteInput from 'src/components/AutocompleteInput.vue'
import { useProvidersStore } from 'src/stores/providers'
import { useMdPreviewProps } from 'src/composables/md-preview-props'
import { collectChainMessageContents, collectConversationMessageContents, collectDialogContents, collectReferencedItemIds, getMessageRecord } from 'src/utils/dialog-message-map'

const { t, locale } = useI18n()

const props = defineProps<{
  id: string
}>()

const rightDrawerAbove = inject('rightDrawerAbove')

const dialogs: Ref<Dialog[]> = inject('dialogs')
const liveDialog = useLiveQueryWithDeps(() => props.id, () => db.dialogs.get(props.id), {
  initialValue: null as Dialog | null
})
const liveMessages = useLiveQueryWithDeps(() => props.id, () => db.messages.where('dialogId').equals(props.id).toArray(), {
  initialValue: [] as Message[]
})
const liveItems = useLiveQueryWithDeps(() => props.id, () => db.items.where('dialogId').equals(props.id).toArray(), {
  initialValue: [] as StoredItem[]
})
const dialog = syncRef<Dialog>(
  () => liveDialog.value,
  val => { db.dialogs.put(toRaw(val)) },
  { valueDeep: true }
)
const assistantsStore = useAssistantsStore()
const workspace: Ref<Workspace> = inject('workspace')
const assistants = computed(() => assistantsStore.assistants.filter(
  a => [workspace.value.id, '$root'].includes(a.workspaceId)
))
const assistant = computed(() => {
  const val = assistantsStore.assistants.find(a => a.id === dialog.value?.assistantId)
  return val && { ...val } // force trigger updates
})
provide('dialog', dialog)

const chain = computed<string[]>(() => liveDialog.value ? getChain('$root', liveDialog.value.msgRoute)[0] : [])
const normalizedRoute = computed<number[]>(() => liveDialog.value ? getChain('$root', liveDialog.value.msgRoute)[1] : [])
const historyChain = ref<string[]>([])
function switchChain(index, value) {
  if (!dialog.value?.msgRoute) return
  const route = [...dialog.value.msgRoute.slice(0, index), value]
  updateChain(route)
}
function setRoute(route: number[]) {
  if (!dialog.value?.id) return
  db.dialogs.update(dialog.value.id, { msgRoute: route })
}
function updateChain(route) {
  if (!dialog.value?.id || !liveDialog.value?.msgTree?.$root) return
  const res = getChain('$root', route)
  historyChain.value = res[0]
  db.dialogs.update(dialog.value.id, { msgRoute: res[1] })
}
watch([() => liveMessages.value.length, () => liveDialog.value?.id], () => {
  if (!liveDialog.value?.msgTree?.$root || !liveDialog.value?.msgRoute) return
  if (editingDraftState.value && !messageMap.value[editingDraftState.value.draftId]) {
    editingDraftState.value = null
  }
  const route = normalizedRoute.value
  if (!JSONEqual(route, liveDialog.value.msgRoute)) {
    db.dialogs.update(liveDialog.value.id, { msgRoute: route })
  }
})
function getChain(node, route: number[]) {
  const tree = liveDialog.value?.msgTree || {}
  const children = tree[node]
  const r = route.at(0) || 0
  if (!Array.isArray(children) || children.length === 0) {
    return [[node], [r]]
  }
  const nextNode = children[r]
  if (nextNode) {
    const [restChain, restRoute] = getChain(nextNode, route.slice(1))
    return [[node, ...restChain], [r, ...restRoute]]
  } else {
    return [[node], [Math.min(Math.max(r, 0), children.length - 1)]]
  }
}

const messageInput = ref()
const editingDraftState = ref<{ parentId: string, draftId: string } | null>(null)
const activeInputMessageId = computed(() => editingDraftState.value?.draftId || chain.value.at(-1))

async function discardEditingDraftIfEmpty() {
  const state = editingDraftState.value
  if (!state) return false
  const draft = messageMap.value[state.draftId]
  if (!draft) {
    editingDraftState.value = null
    return false
  }
  const content = draft.contents[0] as UserMessageContent
  if (content?.text || content?.items?.length) return false
  await deleteMessageBranch(state.parentId, state.draftId)
  editingDraftState.value = null
  inputText.value = ''
  return true
}

async function exitEditingMode() {
  const state = editingDraftState.value
  if (!state) return
  const draft = messageMap.value[state.draftId]
  editingDraftState.value = null
  if (!draft) {
    inputText.value = ''
    return
  }
  const content = draft.contents[0] as UserMessageContent
  if (content?.text || content?.items?.length) {
    await deleteMessageBranch(state.parentId, state.draftId)
  }
  inputText.value = ''
}

async function onComposerAction() {
  if (editingDraftEmpty.value) {
    await exitEditingMode()
    return
  }
  await send()
}

function focusInput() {
  isPlatformEnabled(perfs.autoFocusDialogInput) && messageInput.value?.focus()
}
async function edit(index) {
  const target = chain.value[index - 1]
  const currentId = chain.value[index]
  const currentMessage = messageMap.value[currentId]
  if (currentMessage?.type !== 'user') return
  const existingDraftId = dialog.value.msgTree[target].find(id => messageMap.value[id]?.status === 'inputing')

  if (existingDraftId) {
    editingDraftState.value = {
      parentId: target,
      draftId: existingDraftId
    }
    await nextTick()
    focusInput()
    return
  }

  const content = currentMessage.contents[0] as UserMessageContent
  const draftId = await appendMessage(target, {
    type: 'user',
    contents: [{
      ...content,
      items: [...(content.items || [])]
    }],
    status: 'inputing'
  })
  await db.transaction('rw', db.items, () => {
    saveItems((content.items || []).map(id => itemMap.value[id]).filter(Boolean))
  })
  editingDraftState.value = {
    parentId: target,
    draftId
  }
  await nextTick()
  focusInput()
}
async function regenerate(index) {
  if (!assistant.value) {
    $q.notify({ message: t('dialogView.errors.setAssistant'), color: 'negative' })
    return
  }
  const runtimeSdkModel = await resolveRuntimeSdkModel()
  if (!runtimeSdkModel) {
    $q.notify({ message: t('dialogView.errors.configModel'), color: 'negative' })
    return
  }
  const target = chain.value[index - 1]
  await stream(target, false, ({ branchIndex }) => {
    const nextRoute = [...(dialog.value?.msgRoute || []).slice(0, index - 1), branchIndex, 0]
    setRoute(nextRoute)
  })
}
async function deleteMessageBranch(parent: string, anchor: string) {
  const ids = expandMessageTree(anchor)
  const itemIds = collectReferencedItemIds(ids, messageMap.value)
  await db.transaction('rw', db.dialogs, db.messages, db.items, () => {
    db.messages.bulkDelete(ids)
    itemIds.forEach(id => {
      let { references } = itemMap.value[id]
      references--
      references === 0 ? db.items.delete(id) : db.items.update(id, { references })
    })
    const msgTree = { ...toRaw(dialog.value.msgTree) }
    msgTree[parent] = msgTree[parent].filter(id => id !== anchor)
    ids.forEach(id => {
      delete msgTree[id]
    })
    db.dialogs.update(props.id, { msgTree })
  })
}

async function deleteBranch(index) {
  const parent = chain.value[index - 1]
  const anchor = chain.value[index]
  const branch = dialog.value.msgRoute[index - 1]
  branch === dialog.value.msgTree[parent].length - 1 && switchChain(index - 1, branch - 1)
  await deleteMessageBranch(parent, anchor)
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
function expandMessageTree(root): string[] {
  return [root, ...dialog.value.msgTree[root].flatMap(id => expandMessageTree(id))]
}

const inputMessageContent = computed(() => messageMap.value[activeInputMessageId.value]?.contents[0] as UserMessageContent)
const inputContentItems = computed(() => inputMessageContent.value.items.map(id => itemMap.value[id]).filter(x => x))
const messageMap = shallowRef<Record<string, Message>>({})
const itemMap = shallowRef<Record<string, StoredItem>>({})

watch(liveMessages, messages => {
  const prev = messageMap.value
  const next: Record<string, Message> = {}
  messages.forEach(message => {
    next[message.id] = prev[message.id] === message ? prev[message.id] : message
  })
  messageMap.value = next
  if (editingDraftState.value && !next[editingDraftState.value.draftId]) {
    editingDraftState.value = null
  }
}, { immediate: true })

watch(liveItems, items => {
  const prev = itemMap.value
  const next: Record<string, StoredItem> = {}
  items.forEach(item => {
    next[item.id] = prev[item.id] === item ? prev[item.id] : item
  })
  itemMap.value = next
}, { immediate: true })
provide('messageMap', messageMap)
provide('itemMap', itemMap)
const generating = computed(() => !!messageMap.value[chain.value.at(-2)]?.generatingSession)
const inputEmpty = computed(() => !inputText.value && !inputMessageContent.value?.items?.length)
const editingDraftEmpty = computed(() => !!editingDraftState.value && inputEmpty.value)
const composerActionIcon = computed(() => editingDraftEmpty.value ? 'sym_o_close' : 'sym_o_send')
const composerActionLabel = computed(() => editingDraftEmpty.value ? t('common.cancel') : t('dialogView.send'))
const composerActionDisabled = computed(() => !generating.value && !editingDraftState.value && inputEmpty.value)

const inputText = ref('')
const pendingTexts = []
let pendingTimeout = null
async function updateInputText(text) {
  inputText.value = text
  pendingTexts.push(text)
  clearTimeout(pendingTimeout)
  pendingTimeout = window.setTimeout(() => {
    pendingTexts.splice(0)
  }, 200)
  const messageId = activeInputMessageId.value
  const baseContent = inputMessageContent.value
  await db.messages.update(messageId, {
    // use shallow keyPath to avoid dexie's sync bug
    contents: [{
      ...baseContent,
      text
    }]
  })
  if (editingDraftState.value?.draftId === messageId) {
    const latestContent = messageMap.value[messageId]?.contents?.[0] as UserMessageContent | undefined
    if ((latestContent?.text ?? '') === text) {
      inputText.value = text
    }
  }
}
watch(() => inputMessageContent.value?.text, val => {
  const index = pendingTexts.indexOf(val)
  if (index !== -1) {
    pendingTexts.splice(0, index + 1)
    return
  }
  inputText.value = val ?? ''
})

watch(activeInputMessageId, id => {
  if (!id) {
    inputText.value = ''
    return
  }
  if (editingDraftState.value && id === chain.value.at(-1)) return
  inputText.value = inputMessageContent.value?.text ?? ''
}, { immediate: true })

watch(editingDraftState, state => {
  if (!state) {
    inputText.value = ''
    return
  }
  inputText.value = inputMessageContent.value?.text ?? ''
}, { immediate: true })

function onTextPaste(ev: ClipboardEvent) {
  if (!perfs.codePasteOptimize) return
  const { clipboardData } = ev
  const i = clipboardData.types.findIndex(t => t === 'vscode-editor-data')
  if (i !== -1) {
    const code = clipboardData.getData('text/plain')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
    if (!/\n/.test(code)) return
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

async function takePhoto() {
  if (Capacitor.isNativePlatform()) {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      })
      const res = await fetch(photo.dataUrl)
      const blob = await res.blob()
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
      parseFiles([file])
    } catch (e) {
      if (e.message !== 'User cancelled photos app') {
        $q.notify({ message: `Camera error: ${e.message}`, color: 'negative' })
      }
    }
  } else {
    // Web fallback: use file input with capture
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = () => {
      if (input.files.length) parseFiles(Array.from(input.files))
    }
    input.click()
  }
}

function onInputFiles({ target }) {
  const files = target.files
  parseFiles(Array.from(files))
  target.value = ''
}
function onPaste(ev: ClipboardEvent) {
  const { clipboardData } = ev
  if (clipboardData.types.includes('text/plain')) {
    if (
      !['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName) &&
      !['true', 'plaintext-only'].includes((document.activeElement as HTMLElement).contentEditable)
    ) {
      const text = clipboardData.getData('text/plain')
      addInputItems([{
        type: 'text',
        name: t('dialogView.pastedText', { text: textBeginning(text, 12) }),
        contentText: text
      }])
    }
    return
  }
  parseFiles(Array.from(clipboardData.files) as File[])
}
addEventListener('paste', onPaste)
onUnmounted(() => removeEventListener('paste', onPaste))
async function removeItem({ id, references }: StoredItem) {
  const items = [...inputMessageContent.value.items]
  items.splice(items.indexOf(id), 1)
  await db.transaction('rw', db.messages, db.items, () => {
    db.messages.update(activeInputMessageId.value, {
      contents: [{
        ...inputMessageContent.value,
        items
      }]
    })
    references--
    references === 0 ? db.items.delete(id) : db.items.update(id, { references })
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
      $q.notify({ message: t('dialogView.fileTooLarge', { maxSize: MaxMessageFileSizeMB }), color: 'negative' })
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
function quote(item: ApiResultItem) {
  if (displayLength(item.contentText) > 200) {
    addInputItems([item])
  } else {
    const { text } = inputMessageContent.value
    const content = wrapQuote(item.contentText) + '\n\n'
    updateInputText(text ? text + '\n' + content : content)
    focusInput()
  }
}
async function addInputItems(items: ApiResultItem[]) {
  const storedItems = items.map(i => ({ ...i, id: genId(), dialogId: props.id, references: 0 }))
  const ids = storedItems.map(i => i.id)
  await db.transaction('rw', db.messages, db.items, () => {
    db.messages.update(activeInputMessageId.value, {
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
  const val: ModelMessage[] = []
  collectConversationMessageContents(historyChain.value, chain.value, assistant.value.contextNum, messageMap.value)
    .forEach(content => {
      if (content.type === 'user-message') {
        val.push({
          role: 'user',
          content: [
            { type: 'text', text: content.text },
            ...content.items.map(id => itemMap.value[id]).map(i => {
              if (i.contentText != null) {
                if (i.type === 'file') {
                  return { type: 'text' as const, text: `<file_content filename="${i.name}">\n${i.contentText}\n</file_content>` }
                } else if (i.type === 'quote') {
                  return { type: 'text' as const, text: `<quote name="${i.name}">${i.contentText}</quote>` }
                } else {
                  return { type: 'text' as const, text: i.contentText }
                }
              } else if (i.contentBuffer) {
                if (!mimeTypeMatch(i.mimeType, model.value.inputTypes.user)) {
                  return null
                } else if (i.mimeType.startsWith('image/')) {
                  return { type: 'image' as const, image: i.contentBuffer, mediaType: i.mimeType }
                } else {
                  return { type: 'file' as const, mediaType: i.mimeType, data: i.contentBuffer }
                }
              } else {
                // contentBuffer missing (lightweight export), skip binary payload
                return null
              }
            }).filter(x => x)
          ]
        })
      } else if (content.type === 'assistant-message') {
        val.push({
          role: 'assistant',
          content: [
            { type: 'text', text: content.text },
            ...content.reasoning ? [{ type: 'reasoning' as const, text: content.reasoning }] : []
          ]
        })
      } else if (content.type === 'assistant-tool') {
        if (content.status !== 'completed') return
        const { name, args, result, pluginId } = content
        const id = genId()
        val.push({
          role: 'assistant',
          content: [{
            type: 'tool-call',
            toolName: `${pluginId}-${name}`,
            toolCallId: id,
            input: args
          }]
        })
        val.push({
          role: 'tool',
          content: [{
            type: 'tool-result',
            toolName: `${pluginId}-${name}`,
            toolCallId: id,
            output: toToolResultContent(result.map(id => itemMap.value[id]))
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
    $q.notify({ message: t('dialogView.promptParseFailed'), color: 'negative' })
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

const providerOptions = ref({})
const providerTools = ref({})
const { getModel, getSdkModel } = useGetModel()
const model = computed(() => getModel(dialog.value?.modelOverride || assistant.value?.model))
const sdkModel = computed(() => getSdkModel(assistant.value?.provider, model.value))
const providersStore = useProvidersStore()
const $q = useQuasar()
const { data } = useUserDataStore()

async function resolveCustomSdkModelFallback() {
  const provider = assistant.value?.provider
  const selectedModel = model.value
  if (!provider?.type?.startsWith('custom:') || !selectedModel?.name) return null
  const id = provider.type.slice('custom:'.length)
  const customProvider = await db.providers.get(id)
  if (!customProvider) return null

  for (const subprovider of customProvider.subproviders) {
    if (!subprovider.provider) continue
    const mappedModel = subprovider.modelMap[selectedModel.name]
    if (!mappedModel) continue
    const sdkProvider = providersStore.createProvider(subprovider.provider, { fetch }, [customProvider.id])
    if (!sdkProvider) continue
    const sdkModel = sdkProvider(mappedModel)
    if (sdkModel) return sdkModel
  }

  if (customProvider.fallbackProvider) {
    const fallbackProvider = providersStore.createProvider(customProvider.fallbackProvider, { fetch }, [customProvider.id])
    if (fallbackProvider) {
      const sdkModel = fallbackProvider(selectedModel.name)
      if (sdkModel) return sdkModel
    }
  }

  return null
}

async function resolveRuntimeSdkModel() {
  return sdkModel.value || await resolveCustomSdkModelFallback()
}

async function send() {
  if (inputEmpty.value) return
  if (!assistant.value) {
    $q.notify({ message: t('dialogView.errors.setAssistant'), color: 'negative' })
    return
  }
  const runtimeSdkModel = await resolveRuntimeSdkModel()
  if (!runtimeSdkModel) {
    $q.notify({ message: t('dialogView.errors.configModel'), color: 'negative' })
    return
  }
  if (!data.noobAlertDismissed && chain.value.length > 10 && dialogs.value.length < 3) {
    $q.dialog({
      title: t('dialogView.noobAlert.title'),
      message: t('dialogView.noobAlert.message'),
      persistent: true,
      ok: t('dialogView.noobAlert.okBtn'),
      cancel: t('dialogView.noobAlert.cancelBtn'),
      ...dialogOptions
    }).onCancel(() => {
      data.noobAlertDismissed = true
      send()
    })
    return
  }
  showVars.value = false

  if (editingDraftState.value) {
    const { parentId, draftId } = editingDraftState.value
    const draftIndex = dialog.value.msgTree[parentId]?.indexOf(draftId)
    if (draftIndex == null || draftIndex < 0) {
      editingDraftState.value = null
      return
    }
    switchChain(chain.value.findIndex(id => id === parentId), draftIndex)
    await until(chain).changed()
    editingDraftState.value = null
  }

  const target = chain.value.at(-1)
  await db.messages.update(target, { status: 'default' })
  until(chain).changed().then(() => {
    nextTick().then(() => {
      scroll('bottom')
    })
  })
  await stream(target, false)
  perfs.autoGenTitle && chain.value.length === 4 && genTitle()
}

const artifacts = inject<Ref<Artifact[]>>('artifacts')
const abortController = ref<AbortController>()
async function stream(target, insert = false, onPendingBranch?: (info: { assistantId: string, branchIndex: number, draftId?: string }) => void) {
  const settings: Partial<ModelSettings> = {}
  for (const key in assistant.value.modelSettings) {
    const val = assistant.value.modelSettings[key]
    if (!inputValueEmpty(val)) {
      settings[key] = val
    }
  }
  const currentProviderType = assistant.value.provider?.type || perfs.provider?.type
  if (currentProviderType === 'cerebras') {
    delete settings.frequencyPenalty
    delete settings.presencePenalty
  }
  if (currentProviderType === 'minimax') {
    delete settings.frequencyPenalty
    delete settings.presencePenalty
    if (typeof settings.temperature === 'number' && settings.temperature <= 0) {
      delete settings.temperature
    }
    if (typeof settings.topP === 'number' && settings.topP <= 0) {
      settings.topP = 0.01
    }
    // MiniMax often spends too many steps on tool-calls/reasoning and stops before final text.
    // Give it a higher floor when tools are enabled.
    settings.maxSteps = Math.max(Number(settings.maxSteps || 0), 8)
  }
  const messageContent: AssistantMessageContent = {
    type: 'assistant-message',
    text: ''
  }
  const contents: MessageContent[] = [messageContent]
  let id
  let branchIndex = -1
  let draftId: string | undefined
  await db.transaction('rw', db.dialogs, db.messages, async () => {
    const currentDialog = await db.dialogs.get(props.id)
    branchIndex = currentDialog.msgTree[target].length
    id = await appendMessage(target, {
      type: 'assistant',
      assistantId: assistant.value.id,
      contents,
      status: 'pending',
      generatingSession: sessions.id,
      modelName: model.value.name
    }, insert)
    if (!insert) {
      draftId = await appendMessage(id, {
        type: 'user',
        contents: [{
          type: 'user-message',
          text: '',
          items: []
        }],
        status: 'inputing'
      })
    }
  })
  onPendingBranch?.({ assistantId: id, branchIndex, draftId })

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
    const { result: apiResult, error } = await callApi(plugin, api, args)
    const result: StoredItem[] = apiResult.map(r => ({ ...r, id: genId(), dialogId: props.id, references: 0 }))
    saveItems(result)
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
        inputSchema: jsonSchema(a.parameters),
        async execute(args) {
          const { result, error } = await callTool(p, a, args)
          if (error) throw new ApiCallError(error)
          return result
        },
        toModelOutput: toToolResultContent
      })
    })
    const pluginInfos = {}
    await Promise.all(plugin.infos.map(async api => {
      if (!api.enabled) return
      const a = p.apis.find(a => a.name === api.name)
      if (a.infoType !== 'prompt-var') return
      try {
        pluginInfos[a.name] = await callApi(p, a, api.args)
      } catch (e) {
        $q.notify({ message: t('dialogView.callPluginInfoFailed', { message: e.message }), color: 'negative' })
      }
    }))

    try {
      enabledPlugins.push({
        id: p.id,
        prompt: p.prompt && engine.parseAndRenderSync(p.prompt, { ...pluginVars, infos: pluginInfos })
      })
    } catch (e) {
      $q.notify({ message: t('dialogView.pluginPromptParseFailed', { title: p.title }), color: 'negative' })
    }
  }))
  if (isPlatformEnabled(perfs.artifactsEnabled) && artifacts.value.some(a => a.open)) {
    const { plugin, getPrompt, api } = artifactsPlugin
    enabledPlugins.push({
      id: plugin.id,
      prompt: getPrompt(artifacts.value.filter(a => a.open)),
      actions: []
    })
    tools[`${plugin.id}-${api.name}`] = tool({
      description: api.prompt,
      inputSchema: jsonSchema(api.parameters),
      async execute(args) {
        const { result, error } = await callTool(plugin, api, args)
        if (error) throw new ApiCallError(error)
        return result
      },
      toModelOutput: toToolResultContent
    })
  }
  try {
    if (noRoundtrip) settings.maxSteps = 1
    abortController.value = new AbortController()
    const runtimeSdkModel = sdkModel.value || await resolveCustomSdkModelFallback()
    if (!runtimeSdkModel) {
      throw new Error(t('dialogView.errors.configModel'))
    }
    const messages = getChainMessages()
    const prompt = getSystemPrompt(enabledPlugins.filter(p => p.prompt))
    prompt && messages.unshift({ role: assistant.value.promptRole, content: prompt })
    const params = {
      model: runtimeSdkModel,
      messages,
      tools: {
        ...providerTools.value,
        ...tools
      },
      providerOptions: providerOptions.value,
      ...settings,
      stopWhen: stepCountIs(settings.maxSteps),
      abortSignal: abortController.value.signal
    }
    let result: StreamTextResult<any, any> | GenerateTextResult<any, any>
    if (assistant.value.stream) {
      result = streamText(params)
      await db.messages.update(id, { status: 'streaming' })
      lockingBottom.value = perfs.streamingLockBottom
      let minimaxStreamError: Error | null = null
      for await (const part of result.fullStream) {
        if (part.type === 'text-delta') {
          messageContent.text += part.text
          update()
        } else if (part.type === 'reasoning-delta') {
          messageContent.reasoning = (messageContent.reasoning ?? '') + part.text
          update()
        } else if (part.type === 'error') {
          const hasToolRoundtrip = contents.some(content => content.type === 'assistant-tool')
          if (currentProviderType === 'minimax' && !hasToolRoundtrip) {
            minimaxStreamError = part.error
            console.warn('MiniMax stream interrupted, falling back to generateText', part.error)
            break
          }
          throw part.error
        }
      }
      if (minimaxStreamError) {
        const fallbackResult = await generateText(params)
        result = fallbackResult
        const fallbackText = await fallbackResult.text
        const fallbackReasoning = await fallbackResult.reasoningText
        if (fallbackReasoning) {
          messageContent.reasoning = fallbackReasoning
        }
        if (fallbackText) {
          messageContent.text = fallbackText
        }
      }
    } else {
      result = await generateText(params)
      messageContent.text = await result.text
      messageContent.reasoning = await result.reasoningText
    }

    if (currentProviderType === 'minimax' && !messageContent.text.trim()) {
      const hasCompletedToolCalls = contents.some(content => content.type === 'assistant-tool' && content.status === 'completed')
      if (hasCompletedToolCalls) {
        const finalResult = await generateText({
          ...params,
          tools: {},
          maxSteps: 1,
          stopWhen: stepCountIs(1)
        })
        const finalText = await finalResult.text
        const finalReasoning = await finalResult.reasoningText
        if (finalReasoning) {
          messageContent.reasoning = finalReasoning
        }
        if (finalText) {
          messageContent.text = finalText
        }
        result = finalResult
      }
    }

    if (currentProviderType === 'minimax') {
      messageContent.text = messageContent.text
        .replace(/^\s+|\s+$/g, '')
        .replace(/^```(?:think)?\s*/i, '')
        .replace(/```$/i, '')

      const minimaxThinkMatches = [...messageContent.text.matchAll(/<think>([\s\S]*?)<\/think>/gi)]
      if (minimaxThinkMatches.length) {
        const extractedReasoning = minimaxThinkMatches
          .map(match => match[1]?.trim())
          .filter(Boolean)
          .join('\n\n')
        if (extractedReasoning) {
          messageContent.reasoning = [messageContent.reasoning, extractedReasoning].filter(Boolean).join('\n\n')
        }
        messageContent.text = messageContent.text.replace(/<think>[\s\S]*?<\/think>\s*/gi, '').trim()
      }

      if (!messageContent.text.trim()) {
        const hasCompletedToolCalls = contents.some(content => content.type === 'assistant-tool' && content.status === 'completed')
        if (hasCompletedToolCalls) {
          const finalResult = await generateText({
            ...params,
            tools: {},
            maxSteps: 1,
            stopWhen: stepCountIs(1)
          })
          const finalText = await finalResult.text
          const finalReasoning = await finalResult.reasoningText
          if (finalReasoning) {
            messageContent.reasoning = finalReasoning
          }
          if (finalText) {
            messageContent.text = finalText
          }
          result = finalResult
        }
      }
    }
    if (currentProviderType === 'cerebras') {
      messageContent.text = messageContent.text.replace(/^\s+|\s+$/g, '')
    }

    const usage = await result.usage
    const warnings = (await result.warnings).map(w => (w.type === 'unsupported-setting' || w.type === 'unsupported-tool') ? w.details : w.message)
    await db.messages.update(id, { contents, status: 'default', generatingSession: null, warnings, usage })
  } catch (e) {
    console.error(e)
    if (e.data?.error?.type === 'budget_exceeded') {
      $q.notify({
        message: t('dialogView.errors.insufficientQuota'),
        color: 'err-c',
        textColor: 'on-err-c',
        actions: [{ label: t('dialogView.recharge'), color: 'on-sur', handler() { router.push('/account') } }]
      })
    }
    await db.messages.update(id, { contents, error: e.message || e.toString(), status: 'failed', generatingSession: null })
  }
  perfs.artifactsAutoExtract && autoExtractArtifact()
  lockingBottom.value = false
}
function toToolResultContent(items: StoredItem[]) {
  const val = []
  for (const item of items) {
    if (item.type === 'text') {
      val.push({ type: 'text', text: item.contentText })
    } else if (item.contentBuffer && mimeTypeMatch(item.mimeType, model.value.inputTypes.tool)) {
      val.push({ type: item.mimeType.startsWith('image/') ? 'image' : 'file', mimeType: item.mimeType, data: item.contentBuffer })
    }
  }
  return {
    type: 'content' as const,
    value: val
  }
}
const lockingBottom = ref(false)
let lastScrollTop
function scrollListener() {
  const container = scrollContainer.value
  if (container.scrollTop < lastScrollTop) {
    lockingBottom.value = false
  }
  lastScrollTop = container.scrollTop
}
function lockBottom() {
  lockingBottom.value && scroll('bottom', 'auto')
}

let pendingLockBottomFrame = 0
function onMessageRendered(message: Message | undefined) {
  if (!message?.generatingSession || !lockingBottom.value || pendingLockBottomFrame) return
  pendingLockBottomFrame = window.requestAnimationFrame(() => {
    pendingLockBottomFrame = 0
    lockBottom()
  })
}

watch(lockingBottom, val => {
  if (!val && pendingLockBottomFrame) {
    window.cancelAnimationFrame(pendingLockBottomFrame)
    pendingLockBottomFrame = 0
  }
  if (val) {
    lastScrollTop = scrollContainer.value.scrollTop
    scrollContainer.value.addEventListener('scroll', scrollListener)
  } else {
    lastScrollTop = null
    scrollContainer.value.removeEventListener('scroll', scrollListener)
  }
})
const activePlugins = computed<Plugin[]>(() => pluginsStore.plugins.filter(p => p.available && assistant.value.plugins[p.id]?.enabled))
const usage = computed(() => messageMap.value[chain.value.at(-2)]?.usage)

const systemSdkModel = computed(() => getSdkModel(perfs.systemProvider, perfs.systemModel))
function getDialogContents() {
  return collectDialogContents(chain.value, messageMap.value)
}
async function genTitle() {
  try {
    const dialogId = props.id
    const { text } = await generateText({
      model: systemSdkModel.value,
      prompt: await engine.parseAndRender(GenDialogTitle, {
        contents: getDialogContents(),
        lang: locale.value
      })
    })
    await db.dialogs.update(dialogId, { name: text })
  } catch (e) {
    console.error(e)
    $q.notify({ message: t('dialogView.summarizeFailed'), color: 'negative' })
  }
}
async function copyContent() {
  await copyToClipboard(await engine.parseAndRender(DialogContent, {
    contents: getDialogContents(),
    title: dialog.value.name
  }))
}
const route = useRoute()
const router = useRouter()
watch(route, to => {
  db.workspaces.update(workspace.value.id, { lastDialogId: props.id } as Partial<Workspace>)

  until(dialog).toMatch(val => val?.id === props.id).then(async () => {
    focusInput()
    if (to.hash === '#genTitle') {
      genTitle()
      router.replace({ hash: '' })
    } else if (to.hash === '#copyContent') {
      copyContent()
      router.replace({ hash: '' })
    }
    if (to.query.goto) {
      const { route, highlight } = JSON.parse(to.query.goto as string)
      if (!JSONEqual(route, dialog.value.msgRoute.slice(0, route.length))) {
        updateChain(route)
        await until(chain).changed()
      }
      await nextTick()
      if (route.length) {
        const renderIndex = route.length - 1
        const item = getMountedItemByRenderIndex(renderIndex)
        if (item) {
          if (highlight) {
            const mark = new Mark(item)
            mark.unmark()
            mark.mark(highlight)
          }
          item.querySelector('mark[data-markjs]')?.scrollIntoView()
        }
      }
      router.replace({ query: {} })
    }
  })
}, { immediate: true })

function onEnter(ev) {
  if (perfs.sendKey === 'ctrl+enter') {
    ev.ctrlKey && send()
  } else if (perfs.sendKey === 'shift+enter') {
    ev.shiftKey && send()
  } else if (perfs.sendKey === 'meta+enter') {
    ev.metaKey && send()
  } else {
    if (ev.ctrlKey) {
      document.execCommand('insertText', false, '\n')
    } else if (!ev.shiftKey) {
      ev.preventDefault()
      send()
    }
  }
}

const showVars = ref(true)

const scrollContainer = ref<HTMLElement>()
const composerArea = ref<HTMLElement>()
const mdPreviewProps = useMdPreviewProps()
const activeCatalogMessageId = ref('')
const desktopCatalogMinWidth = 1180
const scrollNavScreenPadding = 8
const showDesktopCatalog = computed(() =>
  perfs.messageCatalog &&
  $q.screen.gt.sm &&
  !rightDrawerAbove?.value &&
  $q.screen.width >= desktopCatalogMinWidth &&
  !!activeCatalogMessageId.value
)
const scrollNavRightOffset = ref(`${scrollNavScreenPadding}px`)

function getScrollNavRightOffset() {
  const container = scrollContainer.value
  if (!container) return `${scrollNavScreenPadding}px`

  const contentRect = container.getBoundingClientRect()
  const right = Math.max(scrollNavScreenPadding, window.innerWidth - contentRect.right + scrollNavScreenPadding)
  return `${Math.round(right)}px`
}

function updateScrollNavRightOffset() {
  scrollNavRightOffset.value = getScrollNavRightOffset()
}

function getMessageBranchControl(index: number) {
  if (!dialog.value?.msgTree || !Array.isArray(chain.value) || index <= 0 || index >= chain.value.length) return null

  const parentId = chain.value[index - 1]
  const messageId = chain.value[index]
  const branches = dialog.value.msgTree[parentId]
  if (!Array.isArray(branches) || branches.length <= 1) return null

  const message = messageMap.value[messageId]
  const currentRoute = dialog.value.msgRoute?.[index - 1]
  if (typeof currentRoute !== 'number') return null

  return {
    current: currentRoute + 1,
    max: branches.length,
    deletable: !!message && !['pending', 'streaming'].includes(message.status)
  }
}

function updateActiveCatalogMessage() {
  const container = scrollContainer.value
  if (!container || !dialog.value) {
    activeCatalogMessageId.value = ''
    return
  }

  const assistantEntries = chain.value
    .slice(1)
    .map((messageId, index) => ({ messageId, renderIndex: index + 1 }))
    .filter(entry => messageMap.value[entry.messageId]?.type === 'assistant')

  if (!assistantEntries.length) {
    activeCatalogMessageId.value = ''
    return
  }

  const viewportTop = container.getBoundingClientRect().top + 24
  let nextActiveId = ''

  for (const entry of assistantEntries) {
    const shell = getMountedItemByMessageId(entry.messageId)
    if (!shell) continue
    const content = shell.querySelector<HTMLElement>(`.dialog-message-shell[data-md-id="md-${entry.messageId}"]`)
    if (!content) continue
    const rect = content.getBoundingClientRect()
    if (rect.bottom > viewportTop) {
      nextActiveId = `md-${entry.messageId}`
      break
    }
  }

  if (!nextActiveId) {
    const mountedAssistantItems = assistantEntries
      .map(entry => ({ entry, shell: getMountedItemByMessageId(entry.messageId) }))
      .filter((candidate): candidate is { entry: typeof assistantEntries[number], shell: HTMLElement } => !!candidate.shell)

    if (mountedAssistantItems.length) {
      const lastMounted = mountedAssistantItems[mountedAssistantItems.length - 1]
      const lastMountedRenderIndex = getItemRenderIndex(lastMounted.shell)
      const fallbackEntry = assistantEntries
        .filter(entry => entry.renderIndex <= lastMountedRenderIndex + 1)
        .at(-1)
      nextActiveId = fallbackEntry ? `md-${fallbackEntry.messageId}` : `md-${lastMounted.entry.messageId}`
    }
  }

  activeCatalogMessageId.value = nextActiveId
}
const composerAreaHeight = ref(164)
const composerSpacerOffset = 14
let composerResizeObserver: ResizeObserver | null = null
const scrollUpBtn = ref()
const scrollDownBtn = ref()
const scrollTopBtn = ref()
const scrollBottomBtn = ref()
type ScrollNavDirection = 'up' | 'down'
type ScrollNavAction = 'up' | 'down' | 'top' | 'bottom'
const scrollNavMode = ref<ScrollNavDirection | null>(null)
const scrollNavHoverAction = ref<ScrollNavAction | null>(null)
let scrollNavPointerId: number | null = null
let scrollNavPointerType = ''
let scrollNavCleanup: (() => void) | null = null
watch(scrollUpBtn, el => {
  el?.addEventListener('mousedown', ev => startScrollNavHold('up', ev))
  el?.addEventListener('touchstart', ev => startScrollNavHold('up', ev), { passive: false })
})
watch(scrollDownBtn, el => {
  el?.addEventListener('mousedown', ev => startScrollNavHold('down', ev))
  el?.addEventListener('touchstart', ev => startScrollNavHold('down', ev), { passive: false })
})

function getEls() {
  const container = scrollContainer.value
  const items: HTMLElement[] = Array.from(container?.querySelectorAll('.message-item') || [])
  return { container, items }
}
function getItemRenderIndex(item: HTMLElement) {
  const value = Number(item.dataset.renderIndex)
  return Number.isInteger(value) && value >= 0 ? value : -1
}
function getItemChainIndex(item: HTMLElement) {
  const renderIndex = getItemRenderIndex(item)
  return renderIndex >= 0 ? renderIndex + 1 : -1
}
function getItemMessageId(item: HTMLElement) {
  return item.dataset.messageId || ''
}
function getMountedItemByRenderIndex(renderIndex: number) {
  if (renderIndex < 0) return null
  const { items } = getEls()
  return items.find(item => getItemRenderIndex(item) === renderIndex) || null
}
function getMountedItemByMessageId(messageId: string) {
  if (!messageId) return null
  const { items } = getEls()
  return items.find(item => getItemMessageId(item) === messageId) || null
}
function getRenderEntryAtChainIndex(chainIndex: number) {
  if (chainIndex <= 0 || chainIndex >= chain.value.length) return null
  const messageId = chain.value[chainIndex]
  const message = messageMap.value[messageId]
  if (!message) return null
  return {
    chainIndex,
    renderIndex: chainIndex - 1,
    messageId,
    message
  }
}
function getRenderEntryFromItem(item: HTMLElement) {
  return getRenderEntryAtChainIndex(getItemChainIndex(item))
}
function getVisibleChainIndex(predicate: (entry: NonNullable<ReturnType<typeof getRenderEntryAtChainIndex>>, item: HTMLElement) => boolean) {
  const { container, items } = getEls()
  if (!container) return -1
  for (const item of items) {
    if (!itemInView(item, container)) continue
    const entry = getRenderEntryFromItem(item)
    if (!entry) continue
    if (predicate(entry, item)) return entry.chainIndex
  }
  return -1
}
function updateComposerAreaHeight() {
  const areaHeight = composerArea.value?.getBoundingClientRect().height ?? 0
  composerAreaHeight.value = Math.max(96, Math.ceil(areaHeight + composerSpacerOffset))
}
watch([composerArea, showVars, generating], () => {
  nextTick(() => updateComposerAreaHeight())
}, { immediate: true })
watch(() => inputText.value, () => {
  nextTick(() => updateComposerAreaHeight())
})
watch(() => inputMessageContent.value?.items?.length, () => {
  nextTick(() => updateComposerAreaHeight())
})
watch(() => assistant.value?.promptVars?.length, () => {
  nextTick(() => updateComposerAreaHeight())
})
watch(() => dialog.value?.id, () => {
  nextTick(() => updateComposerAreaHeight())
}, { immediate: true })
watch(composerArea, el => {
  composerResizeObserver?.disconnect()
  composerResizeObserver = null
  if (!el) return
  composerResizeObserver = new ResizeObserver(() => updateComposerAreaHeight())
  composerResizeObserver.observe(el)
  nextTick(() => updateComposerAreaHeight())
}, { immediate: true })
function itemInView(item: HTMLElement, container: HTMLElement) {
  return item.offsetTop <= container.scrollTop + container.clientHeight &&
  item.offsetTop + item.clientHeight > container.scrollTop
}
function switchTo(target: 'prev' | 'next' | 'first' | 'last') {
  const catalogId = activeCatalogMessageId.value.replace(/^md-/, '')
  let index = -1

  if (catalogId) {
    const chainIndex = chain.value.findIndex(id => id === catalogId)
    if (chainIndex > 0 && dialog.value.msgTree[chain.value[chainIndex - 1]]?.length > 1) {
      index = chainIndex - 1
    }
  }

  if (index === -1) {
    const chainIndex = getVisibleChainIndex(entry => {
      const parentId = chain.value[entry.chainIndex - 1]
      return !!dialog.value.msgTree[parentId] && dialog.value.msgTree[parentId].length > 1
    })
    if (chainIndex !== -1) {
      index = chainIndex - 1
    }
  }

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
function stopScrollNavHold() {
  scrollNavCleanup?.()
}
function getScrollNavAction(clientY: number): ScrollNavAction | null {
  const anchors: { action: ScrollNavAction, el: HTMLElement | null }[] = [
    { action: 'top', el: scrollTopBtn.value as HTMLElement | null },
    { action: 'up', el: scrollUpBtn.value as HTMLElement | null },
    { action: 'down', el: scrollDownBtn.value as HTMLElement | null },
    { action: 'bottom', el: scrollBottomBtn.value as HTMLElement | null }
  ]
  let nearest: { action: ScrollNavAction, distance: number } | null = null
  for (const { action, el } of anchors) {
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const centerY = rect.top + rect.height / 2
    const distance = Math.abs(clientY - centerY)
    if (!nearest || distance < nearest.distance) {
      nearest = { action, distance }
    }
  }
  return nearest?.action ?? null
}
function startScrollNavHold(direction: ScrollNavDirection, ev: MouseEvent | TouchEvent) {
  const target = ev.currentTarget as HTMLElement | null
  if (!target) return

  const isTouch = ev.type.startsWith('touch')
  const touch = isTouch ? (ev as TouchEvent).touches[0] || (ev as TouchEvent).changedTouches[0] : null
  const startClientY = touch ? touch.clientY : (ev as MouseEvent).clientY
  const startClientX = touch ? touch.clientX : (ev as MouseEvent).clientX
  const activationDistance = isTouch ? 18 : 6
  const activationDelay = isTouch ? 160 : 0
  let activated = false
  let activationTimer: ReturnType<typeof setTimeout> | null = null

  const updateHover = (nextClientY: number) => {
    scrollNavHoverAction.value = getScrollNavAction(nextClientY)
  }

  const clearState = () => {
    scrollNavMode.value = null
    scrollNavHoverAction.value = null
    scrollNavPointerId = null
    scrollNavPointerType = ''
    scrollNavCleanup = null
  }

  const clearActivationTimer = () => {
    if (activationTimer) {
      clearTimeout(activationTimer)
      activationTimer = null
    }
  }

  const cancelPending = () => {
    clearActivationTimer()
    window.removeEventListener('mousemove', onPendingMouseMove)
    window.removeEventListener('mouseup', onPendingMouseUp)
    window.removeEventListener('touchmove', onPendingTouchMove)
    window.removeEventListener('touchend', onPendingTouchEnd)
    window.removeEventListener('touchcancel', onPendingTouchCancel)
    window.removeEventListener('blur', onPendingWindowBlur)
    document.removeEventListener('visibilitychange', onPendingVisibilityChange)
  }

  const finish = (trigger: boolean) => {
    const action = scrollNavHoverAction.value
    cancelPending()
    scrollNavCleanup?.()
    if (trigger && action && activated) {
      scroll(action)
    }
  }

  const startHold = () => {
    if (activated) return
    activated = true
    stopScrollNavHold()
    scrollNavMode.value = direction
    scrollNavPointerId = isTouch ? 0 : 1
    scrollNavPointerType = isTouch ? 'touch' : 'mouse'
    updateHover(startClientY)
    bindActiveListeners()
  }

  const bindActiveListeners = () => {
    const onMouseMove = (moveEv: MouseEvent) => {
      updateHover(moveEv.clientY)
    }
    const onMouseUp = () => {
      finish(true)
    }
    const onTouchMove = (moveEv: TouchEvent) => {
      const nextTouch = moveEv.touches[0] || moveEv.changedTouches[0]
      if (!nextTouch) return
      updateHover(nextTouch.clientY)
      moveEv.preventDefault()
    }
    const onTouchEnd = () => {
      finish(true)
    }
    const onTouchCancel = () => {
      finish(false)
    }
    const onWindowBlur = () => finish(false)
    const onVisibilityChange = () => {
      if (document.hidden) finish(false)
    }

    if (scrollNavPointerType === 'touch') {
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('touchend', onTouchEnd)
      window.addEventListener('touchcancel', onTouchCancel)
      scrollNavCleanup = () => {
        window.removeEventListener('touchmove', onTouchMove)
        window.removeEventListener('touchend', onTouchEnd)
        window.removeEventListener('touchcancel', onTouchCancel)
        window.removeEventListener('blur', onWindowBlur)
        document.removeEventListener('visibilitychange', onVisibilityChange)
        clearState()
      }
    } else {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      scrollNavCleanup = () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
        window.removeEventListener('blur', onWindowBlur)
        document.removeEventListener('visibilitychange', onVisibilityChange)
        clearState()
      }
    }

    window.addEventListener('blur', onWindowBlur)
    document.addEventListener('visibilitychange', onVisibilityChange)
  }

  const activate = () => {
    cancelPending()
    startHold()
  }

  const exceedsThreshold = (clientX: number, clientY: number) => {
    return Math.hypot(clientX - startClientX, clientY - startClientY) > activationDistance
  }

  const onPendingMouseMove = (moveEv: MouseEvent) => {
    if (activated) return
    if (exceedsThreshold(moveEv.clientX, moveEv.clientY)) {
      cancelPending()
    }
  }
  const onPendingMouseUp = () => {
    finish(true)
  }
  const onPendingTouchMove = (moveEv: TouchEvent) => {
    if (activated) return
    const nextTouch = moveEv.touches[0] || moveEv.changedTouches[0]
    if (!nextTouch) return
    if (exceedsThreshold(nextTouch.clientX, nextTouch.clientY)) {
      cancelPending()
    }
  }
  const onPendingTouchEnd = () => {
    finish(true)
  }
  const onPendingTouchCancel = () => {
    finish(false)
  }
  const onPendingWindowBlur = () => {
    finish(false)
  }
  const onPendingVisibilityChange = () => {
    if (document.hidden) finish(false)
  }

  if (isTouch) {
    window.addEventListener('touchmove', onPendingTouchMove, { passive: false })
    window.addEventListener('touchend', onPendingTouchEnd)
    window.addEventListener('touchcancel', onPendingTouchCancel)
  } else {
    window.addEventListener('mousemove', onPendingMouseMove)
    window.addEventListener('mouseup', onPendingMouseUp)
  }
  window.addEventListener('blur', onPendingWindowBlur)
  document.addEventListener('visibilitychange', onPendingVisibilityChange)

  if (activationDelay > 0) {
    activationTimer = setTimeout(() => {
      activationTimer = null
      startHold()
    }, activationDelay)
  } else {
    startHold()
  }
}
function scroll(action: 'up' | 'down' | 'top' | 'bottom', behavior: 'smooth' | 'auto' = 'smooth') {
  const { container, items } = getEls()
  if (action === 'top') {
    container.scrollTo({ top: 0, behavior })
    return
  } else if (action === 'bottom') {
    container.scrollTo({ top: container.scrollHeight, behavior })
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
  const chainIndex = getVisibleChainIndex(entry => entry.message.type === 'assistant')
  if (chainIndex === -1) return
  regenerate(chainIndex)
}
function editCurr() {
  const chainIndex = getVisibleChainIndex(entry => entry.message.type === 'user')
  if (chainIndex === -1) return
  edit(chainIndex)
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
  useListenKey(toRef(perfs, 'focusDialogInputKey'), () => focusInput())
}

async function genArtifactName(content: string, lang?: string) {
  const { text } = await generateText({
    model: systemSdkModel.value,
    prompt: engine.parseAndRenderSync(NameArtifactPrompt, { content, lang })
  })
  return text
}
const { createArtifact } = useCreateArtifact(workspace)
async function extractArtifact(message: Message, text: string, pattern, options: ConvertArtifactOptions) {
  const name = options.name || await genArtifactName(text, options.lang)
  const id = await createArtifact({
    name,
    language: options.lang,
    versions: [{
      date: new Date(),
      text
    }],
    tmp: text
  })
  if (options.reserveOriginal) return
  const to = `> ${t('dialogView.convertedToArtifact')}: <router-link to="?openArtifact=${id}">${name}</router-link>\n`
  const index = message.contents.findIndex(c => ['assistant-message', 'user-message'].includes(c.type))
  const content = message.contents[index] as UserMessageContent | AssistantMessageContent
  await db.messages.update(message.id, {
    [`contents.${index}.text`]: content.text.replace(pattern, to) as any
  })
}
async function autoExtractArtifact() {
  const message = messageMap.value[chain.value.at(-2)]
  const { text } = await generateText({
    model: systemSdkModel.value,
    prompt: engine.parseAndRenderSync(ExtractArtifactPrompt, {
      contents: collectDialogContents(chain.value.slice(-3), messageMap.value)
    })
  })
  const object: ExtractArtifactResult = JSON.parse(text)
  if (!object.found) return
  const reg = new RegExp(`(\`{3,}.*\\n)?(${object.regex})(\\s*\`{3,})?`)
  const content = message.contents.find(c => c.type === 'assistant-message')
  const match = content.text.match(reg)
  if (!match) return
  await extractArtifact(message, match[2], reg, {
    name: object.name,
    lang: object.language,
    reserveOriginal: perfs.artifactsReserveOriginal
  })
}

const uiStateStore = useUiStateStore()
const scrollTops = uiStateStore.dialogScrollTops
function onScroll(ev) {
  scrollTops[props.id] = ev.target.scrollTop
  updateActiveCatalogMessage()
  updateScrollNavRightOffset()
}
watch(() => liveDialog.value?.id, id => {
  activeCatalogMessageId.value = ''
  if (!id) return
  nextTick(() => {
    scrollContainer.value?.scrollTo({ top: scrollTops[id] ?? 0 })
    updateActiveCatalogMessage()
    updateScrollNavRightOffset()
  })
})

watch(() => props.id, () => {
  activeCatalogMessageId.value = ''
  nextTick(() => {
    updateActiveCatalogMessage()
    updateScrollNavRightOffset()
  })
})

watch(chain, () => {
  nextTick(() => {
    updateActiveCatalogMessage()
    updateScrollNavRightOffset()
  })
}, { immediate: true })

watch(showDesktopCatalog, () => {
  nextTick(() => {
    updateActiveCatalogMessage()
    updateScrollNavRightOffset()
  })
})

onMounted(() => {
  window.addEventListener('resize', updateActiveCatalogMessage)
  window.addEventListener('resize', updateScrollNavRightOffset)
  nextTick(() => {
    updateActiveCatalogMessage()
    updateScrollNavRightOffset()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateActiveCatalogMessage)
  window.removeEventListener('resize', updateScrollNavRightOffset)
})

onUnmounted(() => {
  composerResizeObserver?.disconnect()
  stopScrollNavHold()
})

function setModel(name: string) {
  dialog.value.modelOverride = name
    ? models.find(model => model.name === name) || { name, inputTypes: InputTypes.default }
    : null
}

const { createDialog } = useCreateDialog(workspace)

defineEmits(['toggle-drawer'])

useSetTitle(computed(() => dialog.value?.name))
</script>
