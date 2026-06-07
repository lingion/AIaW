import { computed, ref, watch, onUnmounted, type Ref } from 'vue'
import { db } from 'src/utils/db'
import { displayLength, genId, isPlatformEnabled, isTextFile, mimeTypeMatch, textBeginning, wrapCode, wrapQuote } from 'src/utils/functions'
import { collectExistingItems } from 'src/utils/dialog-message-map'
import { scaleBlob } from 'src/utils/image-process'
import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import ParseFilesDialog from 'src/components/ParseFilesDialog.vue'
import { MaxMessageFileSizeMB } from 'src/utils/config'
import { useToast } from 'src/composables/useToast'
import { useI18n } from 'vue-i18n'
import type { Dialog, Message, StoredItem, UserMessageContent, ApiResultItem } from 'src/utils/types'

export function useDialogInput(
  dialog: Ref<Dialog | null>,
  chain: Ref<string[]>,
  messageMap: Ref<Record<string, Message>>,
  itemMap: Ref<Record<string, StoredItem>>,
  perfs: any,
  $q: any,
  assistant: Ref<any>,
  model: Ref<any>,
) {
  const { t } = useI18n()
  const { toastError } = useToast()

  const editingDraftState = ref<{ parentId: string, draftId: string } | null>(null)
  const activeInputMessageId = computed(() => editingDraftState.value?.draftId || chain.value.at(-1))
  const inputText = ref('')
  const imageInput = ref()
  const fileInput = ref()

  async function discardEditingDraftIfEmpty(deleteMessageBranch: Function) {
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

  async function exitEditingMode(deleteMessageBranch: Function) {
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

  function focusInput(messageInput: any) {
    isPlatformEnabled(perfs.autoFocusDialogInput) && messageInput?.focus()
  }

  const inputMessageContent = computed(() => messageMap.value[activeInputMessageId.value]?.contents[0] as UserMessageContent)
  const inputContentItems = computed(() => collectExistingItems(inputMessageContent.value.items, itemMap.value))
  const inputEmpty = computed(() => !inputText.value && !inputMessageContent.value?.items?.length)
  const editingDraftEmpty = computed(() => !!editingDraftState.value && inputEmpty.value)
  const composerActionIcon = computed(() => editingDraftEmpty.value ? 'sym_o_close' : 'sym_o_send')
  const composerActionLabel = computed(() => editingDraftEmpty.value ? t('common.cancel') : t('dialogView.send'))
  const composerActionDisabled = computed(() => /* generating check done at call site */ inputEmpty.value)

  const pendingTexts: string[] = []
  let pendingTimeout: ReturnType<typeof setTimeout> | null = null

  async function updateInputText(text: string) {
    inputText.value = text
    pendingTexts.push(text)
    clearTimeout(pendingTimeout)
    pendingTimeout = window.setTimeout(() => { pendingTexts.splice(0) }, 200)
    const messageId = activeInputMessageId.value
    const baseContent = inputMessageContent.value
    await db.messages.update(messageId, {
      contents: [{ ...baseContent, text }]
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
    if (index !== -1) { pendingTexts.splice(0, index + 1); return }
    inputText.value = val ?? ''
  })

  watch(activeInputMessageId, id => {
    if (!id) { inputText.value = ''; return }
    if (editingDraftState.value && id === chain.value.at(-1)) return
    inputText.value = inputMessageContent.value?.text ?? ''
  }, { immediate: true })

  watch(editingDraftState, state => {
    if (!state) { inputText.value = ''; return }
    inputText.value = inputMessageContent.value?.text ?? ''
  }, { immediate: true })

  function onTextPaste(ev: ClipboardEvent) {
    if (!perfs.codePasteOptimize) return
    const { clipboardData } = ev
    const i = clipboardData.types.findIndex(t => t === 'vscode-editor-data')
    if (i !== -1) {
      const code = clipboardData.getData('text/plain').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      if (!/\n/.test(code)) return
      const data = clipboardData.getData('vscode-editor-data')
      const lang = JSON.parse(data).mode ?? ''
      if (lang === 'markdown') return
      document.execCommand('insertText', false, wrapCode(code, lang))
      ev.preventDefault()
    }
  }

  async function takePhoto() {
    if (Capacitor.isNativePlatform()) {
      try {
        const photo = await Camera.getPhoto({
          quality: 90, allowEditing: false,
          resultType: CameraResultType.DataUrl, source: CameraSource.Camera
        })
        if (!photo?.dataUrl) throw new Error('Camera returned empty photo data')
        const res = await fetch(photo.dataUrl)
        const blob = await res.blob()
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: photo.format ? `image/${photo.format}` : 'image/jpeg' })
        parseFiles([file])
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        if (message !== 'User cancelled photos app' && message !== 'User cancelled' && !message.toLowerCase().includes('cancel')) {
          toastError(`Camera error: ${message}`)
        }
      }
    } else {
      const input = document.createElement('input')
      input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment'
      input.onchange = () => { if (input.files.length) parseFiles(Array.from(input.files)) }
      input.click()
    }
  }

  function onInputFiles({ target }) {
    parseFiles(Array.from(target.files))
    target.value = ''
  }

  function onPaste(ev: ClipboardEvent) {
    const { clipboardData } = ev
    if (clipboardData.types.includes('text/plain')) {
      if (!['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName) &&
        !['true', 'plaintext-only'].includes((document.activeElement as HTMLElement).contentEditable)) {
        const text = clipboardData.getData('text/plain')
        addInputItems([{ type: 'text', name: t('dialogView.pastedText', { text: textBeginning(text, 12) }), contentText: text }])
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
        contents: [{ ...inputMessageContent.value, items }]
      })
      references--
      references === 0 ? db.items.delete(id) : db.items.update(id, { references })
    })
  }

  async function parseFiles(files: File[]) {
    if (!files.length) return
    const textFiles: File[] = [], supportedFiles: File[] = [], otherFiles: File[] = []
    for (const file of files) {
      if (await isTextFile(file)) textFiles.push(file)
      else if (mimeTypeMatch(file.type, model.value.inputTypes.user)) supportedFiles.push(file)
      else otherFiles.push(file)
    }
    const parsedFiles: ApiResultItem[] = []
    for (const file of textFiles) {
      parsedFiles.push({ type: 'text', name: file.name, contentText: await file.text() })
    }
    for (const file of supportedFiles) {
      if (file.size > MaxMessageFileSizeMB * 1024 * 1024) {
        toastError(t('dialogView.fileTooLarge', { maxSize: MaxMessageFileSizeMB }))
        continue
      }
      const f = file.type.startsWith('image/') && file.size > 512 * 1024 ? await scaleBlob(file, 2048 * 2048) : file
      parsedFiles.push({ type: 'file', name: file.name, mimeType: file.type, contentBuffer: await f.arrayBuffer() })
    }
    addInputItems(parsedFiles)
    otherFiles.length && $q.dialog({
      component: ParseFilesDialog,
      componentProps: { files: otherFiles, plugins: assistant.value.plugins }
    }).onOk((files: ApiResultItem[]) => { addInputItems(files) })
  }

  function quote(item: ApiResultItem) {
    if (displayLength(item.contentText) > 200) {
      addInputItems([item])
    } else {
      const { text } = inputMessageContent.value
      const content = wrapQuote(item.contentText) + '\n\n'
      updateInputText(text ? text + '\n' + content : content)
    }
  }

  async function addInputItems(items: ApiResultItem[]) {
    const storedItems = items.map(i => ({ ...i, id: genId(), dialogId: dialog.value.id, references: 0 }))
    const ids = storedItems.map(i => i.id)
    await db.transaction('rw', db.messages, db.items, () => {
      db.messages.update(activeInputMessageId.value, {
        contents: [{ ...inputMessageContent.value, items: [...inputMessageContent.value.items, ...ids] }]
      })
      saveItemsLocal(storedItems)
    })
  }

  async function saveItemsLocal(items: StoredItem[]) {
    items.forEach(i => { i.references++ })
    await db.items.bulkPut(items)
  }

  return {
    editingDraftState, activeInputMessageId, inputText,
    inputMessageContent, inputContentItems,
    inputEmpty, editingDraftEmpty, composerActionIcon, composerActionLabel, composerActionDisabled,
    imageInput, fileInput,
    discardEditingDraftIfEmpty, exitEditingMode, focusInput,
    updateInputText, onTextPaste, takePhoto, onInputFiles, onPaste, removeItem, parseFiles, quote, addInputItems,
    saveItems: saveItemsLocal,
  }
}
