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
                @update:model-value="setModelFromDisplay"
                :options="modelDisplayOptions"
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
            v-for="m of commonProviderModelOptions"
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
              :disable="composerActionDisabledFinal"
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
import { computed, inject, onUnmounted, provide, ref, Ref, shallowRef, toRaw, toRef, watch, nextTick } from 'vue'
import { db } from 'src/utils/db'
import { useLiveQueryWithDeps } from 'src/composables/live-query'
import { displayLength, genId, inputValueEmpty, isPlatformEnabled, isTextFile, JSONEqual, mimeTypeMatch, pageFhStyle, textBeginning, wrapCode, wrapQuote } from 'src/utils/functions'
import { useAssistantsStore } from 'src/stores/assistants'
import { streamText, generateText, tool, jsonSchema, StreamTextResult, GenerateTextResult, ModelMessage, stepCountIs } from 'ai'
import { copyToClipboard, throttle, useQuasar } from 'quasar'
import { useToast } from 'src/composables/useToast'
import AssistantItem from 'src/components/AssistantItem.vue'
import { DialogContent, GenDialogTitle, PluginsPrompt } from 'src/utils/templates'
import sessions from 'src/utils/sessions'
import PromptVarInput from 'src/components/PromptVarInput.vue'
import { MessageContent, PluginApi, ApiCallError, Plugin, Dialog, Message, Workspace, UserMessageContent, StoredItem, ModelSettings, ApiResultItem, AssistantMessageContent, Artifact } from 'src/utils/types'
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
import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { dialogOptions, InputTypes } from 'src/utils/values'
import { useUserDataStore } from 'src/stores/user-data'
import ErrorNotFound from 'src/pages/ErrorNotFound.vue'
import { useRoute, useRouter } from 'vue-router'
import AbortableBtn from 'src/components/AbortableBtn.vue'
import { MaxMessageFileSizeMB } from 'src/utils/config'
import ATip from 'src/components/ATip.vue'
import { useListenKey } from 'src/composables/listen-key'
import { useSetTitle } from 'src/composables/set-title'
import Mark from 'mark.js'
import { useCreateDialog } from 'src/composables/create-dialog'
import artifactsPlugin from 'src/utils/artifacts-plugin'
import providerOptionsBtn from 'src/components/ProviderOptionsBtn.vue'
import AddInfoBtn from 'src/components/AddInfoBtn.vue'
import { useI18n } from 'vue-i18n'
import EnablePluginsMenu from 'src/components/EnablePluginsMenu.vue'
import { useGetModel } from 'src/composables/get-model'
import AutocompleteInput from 'src/components/AutocompleteInput.vue'
import { useProvidersStore } from 'src/stores/providers'
import { useDialogArtifact } from 'src/composables/use-dialog-artifact'
import { useDialogBranch } from 'src/composables/use-dialog-branch'
import { useDialogChain } from 'src/composables/use-dialog-chain'
import { useDialogScroll } from 'src/composables/use-dialog-scroll'
import { useDialogInput } from 'src/composables/use-dialog-input'
import { collectChainMessageContents, collectConversationMessageContents, collectDialogContents, collectExistingItems, collectReferencedItemIds, getMessageRecord } from 'src/utils/dialog-message-map'

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

const messageMap = shallowRef<Record<string, Message>>({})
const itemMap = shallowRef<Record<string, StoredItem>>({})

watch(liveMessages, messages => {
  const prev = messageMap.value
  const next: Record<string, Message> = {}
  messages.forEach(message => {
    next[message.id] = prev[message.id] === message ? prev[message.id] : message
  })
  messageMap.value = next
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


const { perfs } = useUserPerfsStore()
const $q = useQuasar()
const { toastError, toastAction } = useToast()
const { data } = useUserDataStore()
const pluginsStore = usePluginsStore()
const { callApi } = useCallApi({ workspace, dialog })
const providerOptions = ref({})
const providerTools = ref({})
const { getModel, getSdkModel } = useGetModel()
const model = computed(() => getModel(dialog.value?.modelOverride || assistant.value?.model))
const sdkModel = computed(() => getSdkModel(assistant.value?.provider, model.value))
const providersStore = useProvidersStore()
const modelDisplayOptions = computed(() => providersStore.modelOptions.map(m => m.displayName))
const displayNameToName = computed(() => {
  const map: Record<string, string> = {}
  for (const m of providersStore.modelOptions) map[m.displayName] = m.name
  return map
})
const commonProviderModelOptions = computed(() => {
  const available = new Set(providersStore.modelOptions.map(m => m.name))
  return perfs.commonModelOptions.filter(m => available.has(m))
})
const {
  chain, normalizedRoute, historyChain, editingDraftState,
  getChain, switchChain, setRoute, updateChain,
  expandMessageTree, deleteMessageBranch, deleteBranch, appendMessage,
} = useDialogChain(
  toRef(props, 'id'), liveDialog, liveMessages, messageMap, itemMap,
)
const generating = computed(() => !!messageMap.value[chain.value.at(-2)]?.generatingSession)
const showVars = ref(true)
const activePlugins = computed<Plugin[]>(() => pluginsStore.plugins.filter(p => p.available && assistant.value?.plugins?.[p.id]?.enabled))
const usage = computed(() => messageMap.value[chain.value.at(-2)]?.usage)
const systemSdkModel = computed(() => getSdkModel(perfs.systemProvider, perfs.systemModel))
const route = useRoute()
const router = useRouter()
const { getMessageBranchControl } = useDialogBranch(dialog, chain, messageMap)
const { extractArtifact, autoExtractArtifact } = useDialogArtifact(
  dialog, chain, messageMap, workspace, systemSdkModel
)

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
    toastError(t('dialogView.summarizeFailed'))
  }
}

async function copyContent() {
  await copyToClipboard(await engine.parseAndRender(DialogContent, {
    contents: getDialogContents(),
    title: dialog.value.name
  }))
}

const {
  activeInputMessageId, inputText,
  inputMessageContent, inputContentItems,
  inputEmpty, editingDraftEmpty, composerActionIcon, composerActionLabel, composerActionDisabled,
  imageInput, fileInput,
  discardEditingDraftIfEmpty, exitEditingMode, focusInput,
  updateInputText, onTextPaste, takePhoto, onInputFiles, onPaste, removeItem, parseFiles, quote, addInputItems,
  saveItems,
} = useDialogInput(
  dialog, chain, messageMap, itemMap, perfs, $q, assistant, model, editingDraftState,
)

const messageInput = ref()

async function edit(index) {
  const target = chain.value[index - 1]
  const currentId = chain.value[index]
  const currentMessage = messageMap.value[currentId]
  if (currentMessage?.type !== 'user') return
  const existingDraftId = dialog.value.msgTree[target].find(id => messageMap.value[id]?.status === 'inputing')
  if (existingDraftId) {
    editingDraftState.value = { parentId: target, draftId: existingDraftId }
    await nextTick()
    focusInput(messageInput)
    return
  }
  const content = currentMessage?.contents?.[0] as UserMessageContent | undefined
  if (!content) return
  const draftId = await appendMessage(target, {
    type: 'user',
    contents: [{ ...content, items: [...(content.items || [])] }],
    status: 'inputing'
  })
  await db.transaction('rw', db.items, () => {
    saveItems((content.items || []).map(id => itemMap.value[id]).filter(Boolean))
  })
  editingDraftState.value = { parentId: target, draftId }
  await nextTick()
  focusInput(messageInput)
}

async function regenerate(index) {
  if (!assistant.value) {
    toastError(t('dialogView.errors.setAssistant'))
    return
  }
  const runtimeSdkModel = await resolveRuntimeSdkModel()
  if (!runtimeSdkModel) {
    toastError(t('dialogView.errors.configModel'))
    return
  }
  const target = chain.value[index - 1]
  const pendingBranchIndex = dialog.value?.msgTree?.[target]?.length ?? 0
  switchChain(index - 1, pendingBranchIndex)
  await stream(target, false, async ({ branchIndex }) => {
    const nextRoute = [...(dialog.value?.msgRoute || []).slice(0, index - 1), branchIndex, 0]
    await setRoute(nextRoute)
    await nextTick()
    switchChain(index - 1, branchIndex)
  })
}

async function onComposerAction() {
  if (editingDraftEmpty.value) {
    await exitEditingMode(deleteMessageBranch)
    return
  }
  await send()
}

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

const composerActionDisabledFinal = computed(() => !generating.value && !editingDraftState.value && inputEmpty.value)


function getChainMessages() {
  const val: ModelMessage[] = []
  collectConversationMessageContents(historyChain.value, chain.value, assistant.value.contextNum, messageMap.value)
    .forEach(content => {
      if (content.type === 'user-message') {
        val.push({
          role: 'user',
          content: [
            { type: 'text', text: content.text },
            ...collectExistingItems(content.items, itemMap.value).map(i => {
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
            output: toToolResultContent(collectExistingItems(result, itemMap.value))
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
    toastError(t('dialogView.promptParseFailed'))
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
  const selectedModel = model.value
  if (!selectedModel?.name) return null
  const modelName = selectedModel.name

  if (sdkModel.value) return sdkModel.value
  const customFallback = await resolveCustomSdkModelFallback()
  if (customFallback) return customFallback

  for (const cp of providersStore.providers) {
    for (const sp of cp.subproviders) {
      if (!sp.provider) continue
      const mapped = sp.modelMap[modelName]
      if (!mapped) continue
      const sdkProv = providersStore.createProvider(sp.provider, { fetch }, [cp.id])
      if (!sdkProv) continue
      const m = sdkProv(mapped)
      if (m) return m
    }
    if (cp.fallbackProvider) {
      const sdkProv = providersStore.createProvider(cp.fallbackProvider, { fetch }, [cp.id])
      if (!sdkProv) continue
      const m = sdkProv(modelName)
      if (m) return m
    }
  }

  return null
}

async function send() {
  console.log('[BUGHUNT] send() called', { inputEmpty: inputEmpty.value, hasAssistant: !!assistant.value, hasModel: !!model.value, activeInputId: activeInputMessageId.value, msgMapSize: Object.keys(messageMap.value).length, chainLen: chain.value.length })
  if (inputEmpty.value) return
  if (!assistant.value) {
    console.error('[BUGHUNT] send() aborted: no assistant')
    toastError(t('dialogView.errors.setAssistant'))
    return
  }
  const runtimeSdkModel = await resolveRuntimeSdkModel()
  if (!runtimeSdkModel) {
    console.error('[BUGHUNT] send() aborted: no model')
    toastError(t('dialogView.errors.configModel'))
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
  console.log('[BUGHUNT] send() → stream()', { target, hasMap: !!messageMap.value[target], contents: messageMap.value[target]?.contents?.length, status: messageMap.value[target]?.status })
  await db.messages.update(target, { status: 'default' })
  until(chain).changed().then(() => {
    nextTick().then(() => {
      scroll('bottom')
    })
  })
  try {
    console.log('[BUGHUNT] calling stream()')
    await stream(target, false)
    console.log('[BUGHUNT] stream() returned normally')
  } catch (e) {
    console.error('[BUGHUNT] stream() threw', e)
    throw e
  }
  perfs.autoGenTitle && chain.value.length === 4 && genTitle()
}

const artifacts = inject<Ref<Artifact[]>>('artifacts')
const abortController = ref<AbortController>()
// Bug #2: when the user leaves a generating dialog, the stream kept running,
// burning tokens and holding the connection. Abort on unmount.
onUnmounted(() => {
  if (abortController.value && !abortController.value.signal.aborted) {
    abortController.value.abort()
  }
})

// Bug #13: when the user navigates away from a brand-new dialog without ever
// typing, don't leave an empty "New dialog" record in the sidebar. A new
// dialog is created with exactly one root user message in 'inputing' state
// with empty text/items — if we still see that shape, delete it.
async function cleanupEmptyDialog(dialogId: string) {
  if (!dialogId) return
  try {
    const dlg = await db.dialogs.get(dialogId)
    if (!dlg) return
    const msgs = await db.messages.where('dialogId').equals(dialogId).toArray()
    if (msgs.length !== 1) return
    const only = msgs[0]
    if (only.status !== 'inputing') return
    if (only.contents?.length !== 1) return
    const c = only.contents[0]
    if (c.type !== 'user-message') return
    if ((c.text ?? '').trim() !== '') return
    if ((c.items ?? []).length !== 0) return
    await db.transaction('rw', db.dialogs, db.messages, db.items, async () => {
      await db.dialogs.delete(dialogId)
      await db.messages.delete(only.id)
    })
  } catch (e) { /* best-effort cleanup — never block navigation */ }
}
// Router often reuses the same component when dialog id changes, so onUnmounted
// won't fire. Watch props.id and clean the previous dialog before switching.
watch(() => props.id, (newId, oldId) => {
  if (oldId && newId !== oldId) cleanupEmptyDialog(oldId)
})
onUnmounted(() => {
  cleanupEmptyDialog(props.id)
})
async function stream(target, insert = false, onPendingBranch?: (info: { assistantId: string, branchIndex: number, draftId?: string }) => void | Promise<void>) {
  console.log('[BUGHUNT] stream() start', { target, insert, hasAssistant: !!assistant.value, modelName: assistant.value?.model?.name, modelId: assistant.value?.modelId, modelSettings: Object.keys(assistant.value?.modelSettings || {}), providerType: assistant.value?.provider?.type || perfs.provider?.type })
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
  console.log('[BUGHUNT] stream() about to call appendMessage')
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
    console.log('[BUGHUNT] appendMessage returned', { id, branchIndex, target })
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
  console.log('[BUGHUNT] stream() after transaction', { id, draftId })
  await onPendingBranch?.({ assistantId: id, branchIndex, draftId })

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
    await saveItems(result)
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
        toastError(t('dialogView.callPluginInfoFailed', { message: e.message }))
      }
    }))

    try {
      enabledPlugins.push({
        id: p.id,
        prompt: p.prompt && engine.parseAndRenderSync(p.prompt, { ...pluginVars, infos: pluginInfos })
      })
    } catch (e) {
      toastError(t('dialogView.pluginPromptParseFailed', { title: p.title }))
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
    const runtimeSdkModel = await resolveRuntimeSdkModel()
    if (!runtimeSdkModel) {
      throw new Error(t('dialogView.errors.configModel'))
    }
    const messages = getChainMessages()
    const prompt = getSystemPrompt(enabledPlugins.filter(p => p.prompt))
    console.log('[BUGHUNT] getChainMessages returned', messages.length, 'messages; hasSystemPrompt:', !!prompt)
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
      console.log('[BUGHUNT] calling streamText', { model: runtimeSdkModel.modelId, maxSteps: settings.maxSteps, msgCount: messages.length })
      result = streamText(params)
      await db.messages.update(id, { status: 'streaming' })
      lockingBottom.value = perfs.streamingLockBottom
      let minimaxStreamError: Error | null = null
      for await (const part of result.fullStream) {
        console.log('[BUGHUNT] stream part', part.type)
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
    // Bug #6: surface every stream failure to the user — previously only
    // budget_exceeded was toasted and every other failure (network, auth,
    // rate-limit, provider 5xx) silently wrote `error` to the message and
    // gave the user no idea what happened.
    if (e?.data?.error?.type === 'budget_exceeded') {
      toastAction('negative', t('dialogView.errors.insufficientQuota'), [{
        label: t('dialogView.recharge'),
        handler() { router.push('/account') },
      }])
    } else {
      toastError(t('dialogView.errors.streamFailed', { message: e?.message || e?.toString() || t('dialogView.errors.unknown') }))
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
const {
  scrollContainer, composerArea, lockingBottom, composerAreaHeight,
  activeCatalogMessageId, showDesktopCatalog, scrollNavRightOffset,
  scrollNavMode, scrollNavHoverAction,
  scrollUpBtn, scrollDownBtn, scrollTopBtn, scrollBottomBtn,
  mdPreviewProps,
  scroll, onScroll, onMessageRendered,
  switchTo, stopScrollNavHold, startScrollNavHold,
  regenerateCurr, editCurr,
  getMountedItemByRenderIndex,
  getVisibleChainIndex,
} = useDialogScroll(
  dialog, chain, messageMap, toRef(props, 'id'), liveDialog,
  inputText, showVars, generating, editingDraftState,
  rightDrawerAbove, assistant, activePlugins, perfs, $q,
)


function setModel(name: string) {
  dialog.value.modelOverride = name
    ? { name, inputTypes: InputTypes.default }
    : null
}

function setModelFromDisplay(displayName: string) {
  const name = displayNameToName.value[displayName] || displayName
  setModel(name)
}

const { createDialog } = useCreateDialog(workspace)

defineEmits(['toggle-drawer'])

// Route watcher: genTitle / copyContent / goto deep links
watch(route, to => {
  db.workspaces.update(workspace.value.id, { lastDialogId: props.id } as Partial<Workspace>)

  until(dialog).toMatch(val => val?.id === props.id).then(async () => {
    focusInput(messageInput)
    try {
      if (to.hash === '#genTitle') {
        await genTitle()
        await router.replace({ hash: '' })
      } else if (to.hash === '#copyContent') {
        await copyContent()
        await router.replace({ hash: '' })
      }
      if (to.query.goto) {
        const { route: gotoRoute, highlight } = JSON.parse(to.query.goto as string)
        if (!JSONEqual(gotoRoute, dialog.value.msgRoute.slice(0, gotoRoute.length))) {
          updateChain(gotoRoute)
          await until(chain).changed()
        }
        await nextTick()
        if (gotoRoute.length) {
          const renderIndex = gotoRoute.length - 1
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
        await router.replace({ query: {} })
      }
    } catch (e) {
      console.error(e)
      if (to.hash === '#genTitle' || to.hash === '#copyContent') {
        await router.replace({ hash: '' })
      } else if (to.query.goto) {
        await router.replace({ query: {} })
      }
    }
  })
}, { immediate: true })

// Keyboard shortcuts
if (isPlatformEnabled(perfs.enableShortcutKey)) {
  useListenKey(toRef(perfs, 'scrollUpKeyV2'), () => scroll('up'))
  useListenKey(toRef(perfs, 'scrollDownKeyV2'), () => scroll('down'))
  useListenKey(toRef(perfs, 'scrollTopKey'), () => scroll('top'))
  useListenKey(toRef(perfs, 'scrollBottomKey'), () => scroll('bottom'))
  useListenKey(toRef(perfs, 'switchPrevKeyV2'), () => switchTo('prev', switchChain))
  useListenKey(toRef(perfs, 'switchNextKeyV2'), () => switchTo('next', switchChain))
  useListenKey(toRef(perfs, 'switchFirstKey'), () => switchTo('first', switchChain))
  useListenKey(toRef(perfs, 'switchLastKey'), () => switchTo('last', switchChain))
  useListenKey(toRef(perfs, 'regenerateCurrKey'), () => regenerateCurr(regenerate))
  useListenKey(toRef(perfs, 'editCurrKey'), () => editCurr(edit))
  useListenKey(toRef(perfs, 'focusDialogInputKey'), () => focusInput(messageInput))
}

useSetTitle(computed(() => dialog.value?.name))
</script>
