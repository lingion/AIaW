<template>
  <div
    flex
    :class="{ 'flex-row-reverse': message.type === 'user', 'flex-col': colMode }"
    :data-md-id="!colMode && message.type === 'assistant' && textContent.text ? mdId : null"
    relative
    class="dialog-message-shell px-3 sm:px-4"
  >
    <div>
      <div
        flex
        :class="[
          colMode ? 'flex-row items-center' : 'flex-col pos-sticky top-0',
          message.type === 'assistant' ? 'pl-0' : ''
        ]"
      >
        <a-avatar
          v-if="avatar"
          :avatar
          :size="colMode ? '36px' : denseMode ? '40px' : '48px'"
          :class="colMode ? 'mx-3' : 'ml-1 mr-2'"
          @click="onAvatarClick"
          cursor-pointer
        />
        <div
          v-if="name"
          :class="colMode ? '' : 'my-2 text-xs ml-1'"
          text="center on-sur-var"
        >
          {{ name }}
        </div>
      </div>
    </div>
    <div
      :class="message.type === 'user' ? 'min-w-0 flex flex-1 flex-col items-end' : 'min-w-0 flex-1'"
    >
      <div
        position-relative
        :class="message.type === 'user' ? 'message-user-group min-h-48px' : 'min-h-24px min-w-100px'"
        class="group"
      >
        <div
          v-for="(content, index) in contents"
          :key="index"
          :class="message.type === 'user' ? 'bg-sur-c-low message-user-bubble' : 'bg-sur'"
          rd-lg
        >
          <q-expansion-item
            v-if="content.type === 'assistant-message' && content.reasoning"
            icon="sym_o_auto_awesome"
            :label="$t('messageItem.reasoningContent')"
            :default-opened="message.generatingSession && perfs.expandReasoningContent"
            bg-sur-c-low
            of-hidden
            rd-md
            my-2
            mx-4
            header-class="min-h-40px reasoning-content-header"
          >
            <q-card important:bg-sur-c-low>
              <q-card-section
                text="on-sur-var"
                font-code
                whitespace-pre-wrap
                pt-2
                @vue:updated="onHtmlChanged()"
              >
                {{ content.reasoning.trim() }}
              </q-card-section>
            </q-card>
          </q-expansion-item>
          <div
            ref="textDiv"
            @mouseup="onSelect('mouse')"
            @touchend="onSelect('touch')"
            pos-relative
            overflow-visible
            class="message-markdown-wrap"
            v-if="(content.type === 'assistant-message' || content.type === 'user-message') && content.text"
          >
            <div
              v-if="getStreamingRenderState(content).mode === 'plain-text'"
              :class="message.type === 'user'
                ? 'bg-sur-c-low user-message-preview message-markdown-preview message-streaming-plain-text'
                : 'bg-sur assistant-message-preview message-markdown-preview message-streaming-plain-text'"
              rd-lg
              @vue:updated="emit('rendered')"
            >
              {{ getStreamingRenderState(content).text }}
            </div>
            <md-preview
              v-else-if="getStreamingRenderState(content).mode === 'markdown'"
              :class="message.type === 'user'
                ? 'bg-sur-c-low user-message-preview message-markdown-preview'
                : 'bg-sur assistant-message-preview message-markdown-preview'"
              :id="mdId"
              rd-lg
              :model-value="getStreamingRenderState(content).text"
              v-bind="mdPreviewProps"
              @on-html-changed="onHtmlChanged(true)"
            />
            <md-preview
              v-else
              :class="message.type === 'user'
                ? 'bg-sur-c-low user-message-preview message-markdown-preview'
                : 'bg-sur assistant-message-preview message-markdown-preview'"
              :id="mdId"
              rd-lg
              :model-value="content.text"
              v-bind="mdPreviewProps"
              @on-html-changed="onHtmlChanged(true)"
            />
            <transition name="fade">
              <q-btn-group
                v-if="showFloatBtns"
                :style="floatBtnStyle"
                pos-absolute
                z-3
                bg-sec-c
                text-on-sec-c
                @click="showFloatBtns = false"
              >
                <q-btn
                  icon="sym_o_format_quote"
                  :label="$t('messageItem.quote')"
                  @click="quote(selected.text)"
                  no-caps
                  sm-icon
                />
                <template v-if="selected.original">
                  <q-separator vertical />
                  <q-btn
                    icon="sym_o_content_copy"
                    :label="$t('messageItem.markdown')"
                    @click="copyToClipboard(selected.text)"
                    :title="$t('messageItem.copyMarkdown')"
                    no-caps
                    sm-icon
                  />
                  <template v-if="isPlatformEnabled(perfs.artifactsEnabled)">
                    <q-separator vertical />
                    <q-btn
                      icon="sym_o_convert_to_text"
                      :label="$t('messageItem.convertToArtifact')"
                      :title="$t('messageItem.convertToArtifactTitle')"
                      @click="selectedConvertArtifact"
                      no-caps
                      sm-icon
                    />
                  </template>
                </template>
              </q-btn-group>
            </transition>
          </div>
          <div
            v-if="content.type === 'user-message' && content.items.length"
            flex
            flex-wrap
            px-4
            py-3
            gap-2
          >
            <message-image
              v-for="image in content.items.map(id => itemMap[id]).filter(i => i.mimeType?.startsWith('image/'))"
              :key="image.id"
              :image
              h="100px"
            />
            <message-file
              v-for="file in content.items.map(id => itemMap[id]).filter(i => !i.mimeType?.startsWith('image/'))"
              :key="file.id"
              :file
            />
          </div>
          <tool-content
            v-if="content.type === 'assistant-tool'"
            :content
            my-2
            :class="colMode ? 'mx-4' : 'mx-2'"
          />
        </div>
        <div
          text-err
          break-word
          px-5
          mt-2
          pb-2
          v-if="message.error"
        >
          {{ message.error }}
        </div>
        <div v-if="perfs.showWarnings && message.warnings?.length">
          <div
            text-warn
            break-word
            px-5
            my-2
            v-for="(warning, index) in message.warnings"
            :key="index"
          >
            {{ warning }}
          </div>
        </div>
        <q-icon
          v-if="message.status === 'inputing'"
          name="sym_o_edit"
          pos-absolute
          left--1
          bottom-0
          translate-x="-100%"
          text-on-sur-var
        />
        <div
          v-if="message.status !== 'streaming'"
          text="out xs"
          pos-absolute
          right-1
          bottom--1
          translate-y="100%"
          opacity-0
          group-hover:opacity-100
          transition="opacity 250"
          whitespace-nowrap
        >
          <span>{{ message.modelName }}</span>
          <span ml-3>{{ idDateString(message.id) }}</span>
        </div>
      </div>
      <div
        :class="colMode ? 'mx-4' : 'mx-2'"
        v-if="['pending', 'streaming'].includes(message.status)"
      >
        <q-linear-progress
          indeterminate
        />
      </div>
      <div
        text-on-sur-var
        :class="message.type === 'assistant' ? (colMode ? 'mx-4' : 'mx-2') : 'mt-1'"
        flex
        items-center
      >
        <div
          v-if="branchControl"
          class="dialog-catalog-branch-controls mr-2"
        >
          <q-pagination
            :model-value="branchControl.current"
            :max="branchControl.max"
            input
            :boundary-links="false"
            @update:model-value="model = $event"
          />
          <q-btn
            v-if="branchControl.deletable"
            icon="sym_o_delete"
            flat
            dense
            round
            text="sec xs hover:err"
            un-size="32px"
            :title="$t('messageItem.deleteBranch')"
            @click="deleteBranch"
          />
        </div>
        <template
          v-if="['default', 'failed'].includes(message.status)"
        >
          <copy-btn
            round
            flat
            dense
            text="sec xs"
            un-size="32px"
            :value="textContent.text"
          />
          <q-btn
            v-if="message.type === 'assistant'"
            icon="sym_o_refresh"
            round
            flat
            dense
            text="sec xs"
            un-size="32px"
            :title="$t('messageItem.regenerate')"
            @click="$emit('regenerate')"
          />
          <q-btn
            v-if="message.type === 'user'"
            icon="sym_o_edit"
            round
            flat
            dense
            text="sec xs"
            un-size="32px"
            :title="$t('messageItem.edit')"
            @click="$emit('edit')"
          />
          <q-btn
            icon="sym_o_more_vert"
            round
            flat
            dense
            text="sec xs"
            un-size="32px"
            :title="$t('messageItem.more')"
          >
            <q-menu>
              <q-list>
                <menu-item
                  icon="sym_o_code"
                  :label="$t('messageItem.showSourceCode')"
                  @click="sourceCodeMode = !sourceCodeMode"
                  :class="{ 'route-active': sourceCodeMode }"
                />
                <menu-item
                  icon="sym_o_edit"
                  :label="$t('messageItem.directEdit')"
                  @click="edit"
                />
                <menu-item
                  icon="sym_o_format_quote"
                  :label="$t('messageItem.quote')"
                  @click="quote(textContent.text)"
                />
                <menu-item
                  icon="sym_o_info"
                  :label="$t('messageItem.moreInfo')"
                  @click="moreInfo"
                />
              </q-list>
            </q-menu>
          </q-btn>
        </template>
      </div>
    </div>
    <div
      v-if="false"
      class="message-catalog-rail"
      shrink-0
    >
      <md-catalog
        pos-sticky
        top-0
        px-2
        pb-4
        :editor-id="mdId"
        :scroll-element="scrollContainer"
        :md-heading-id="mdPreviewProps.mdHeadingId"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MdPreview, MdCatalog } from 'md-editor-v3'
import { db } from 'src/utils/db'
import { computed, ComputedRef, inject, nextTick, onUnmounted, reactive, ref, watchEffect } from 'vue'
import sessions from 'src/utils/sessions'
import { MessageContent, Message, ApiResultItem, UserMessageContent, AssistantMessageContent, ConvertArtifactOptions } from 'src/utils/types'
import CopyBtn from './CopyBtn.vue'
import AAvatar from './AAvatar.vue'
import { useAssistantsStore } from 'src/stores/assistants'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import MessageImage from './MessageImage.vue'
import ToolContent from './ToolContent.vue'
import { copyToClipboard, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import PickAvatarDialog from './PickAvatarDialog.vue'
import MessageFile from './MessageFile.vue'
import { escapeRegex, idDateString, isPlatformEnabled, textBeginning, wrapCode } from 'src/utils/functions'
import MenuItem from './MenuItem.vue'
import MessageInfoDialog from './MessageInfoDialog.vue'
import TextareaDialog from './TextareaDialog.vue'
import { useMdPreviewProps } from 'src/composables/md-preview-props'
import ConvertArtifactDialog from './ConvertArtifactDialog.vue'
import { useI18n } from 'vue-i18n'
import { dialogOptions } from 'src/utils/values'

const props = defineProps<{
  message: Message,
  childNum: number,
  scrollContainer: HTMLElement,
  branchControl?: {
    current: number,
    max: number,
    deletable: boolean
  } | null
}>()

const mdId = `md-${props.message.id}`

const $q = useQuasar()
function moreInfo() {
  $q.dialog({
    component: MessageInfoDialog,
    componentProps: { message: props.message }
  })
}
const sourceCodeMode = ref(false)

const contents = computed(() => props.message.contents.map(x => {
  if (x.type === 'assistant-message' || x.type === 'user-message') {
    return {
      ...x,
      text: sourceCodeMode.value ? wrapCode(x.text, 'markdown', 5) : x.text
    }
  }
  // Vue 3.4 computed is lazy. Force it to trigger.
  return { ...x }
}))

const model = defineModel<number>()

const emit = defineEmits<{
  regenerate: []
  edit: []
  quote: [ApiResultItem]
  'extract-artifact': [[string, RegExp | string, ConvertArtifactOptions]],
  rendered: []
  delete: []
}>()

watchEffect(async () => {
  const sessionId = props.message.generatingSession
  if (sessionId) {
    !await sessions.ping(sessionId) && db.messages.update(props.message.id, {
      generatingSession: null,
      status: 'failed',
      error: 'aborted',
      contents: props.message.contents.map(content => {
        if (content.type === 'assistant-tool' && content.status === 'calling') {
          return {
            ...content,
            status: 'failed',
            error: 'Tool call aborted'
          }
        }
        return content
      }) as MessageContent[]
    })
  }
})

const textIndex = computed(() => props.message.contents.findIndex(c => ['user-message', 'assistant-message'].includes(c.type)))
const textContent = computed(() => (props.message.contents[textIndex.value] as UserMessageContent | AssistantMessageContent))

const { perfs } = useUserPerfsStore()
const assistantsStore = useAssistantsStore()
const avatar = computed(() =>
  props.message.type === 'user'
    ? perfs.userAvatar
    : assistantsStore.assistants.find(a => a.id === props.message.assistantId)?.avatar
)

const name = computed(() =>
  props.message.type === 'user'
    ? null
    : assistantsStore.assistants.find(a => a.id === props.message.assistantId)?.name
)

const showArtifacts = inject<ComputedRef>('showArtifacts')
const denseMode = computed(() => showArtifacts.value || $q.screen.lt.md)
const colMode = computed(() => denseMode.value && props.message.type === 'assistant')

const router = useRouter()
function onAvatarClick() {
  if (props.message.type === 'assistant') {
    router.push(`../assistants/${props.message.assistantId}`)
  } else if (props.message.type === 'user') {
    $q.dialog({
      component: PickAvatarDialog,
      componentProps: { model: perfs.userAvatar, defaultTab: 'text' }
    }).onOk(avatar => { perfs.userAvatar = avatar })
  }
}

const showFloatBtns = ref(false)
const floatBtnStyle = reactive({
  top: undefined,
  left: undefined
})
const textDiv = ref()
const selected = reactive({
  text: null,
  original: false
})

const streamingRenderState = computed(() => {
  const content = textContent.value
  if (content?.type !== 'assistant-message' || props.message.status !== 'streaming') {
    return { mode: 'final' as const, text: '' }
  }
  return buildStreamingRenderState(content.text, perfs.streamRenderLevel)
})

function isStreamingAssistantText(content: MessageContent) {
  return content.type === 'assistant-message' && props.message.status === 'streaming'
}

function getStreamingRenderState(content: MessageContent) {
  if (isStreamingAssistantText(content)) return streamingRenderState.value
  if (content.type === 'assistant-message' || content.type === 'user-message') {
    return { mode: 'final' as const, text: content.text }
  }
  return { mode: 'final' as const, text: '' }
}

function buildStreamingRenderState(text: string, level: 0 | 25 | 50 | 75 | 100) {
  if (level === 0) return { mode: 'plain-text' as const, text }
  if (level === 100) return { mode: 'markdown' as const, text }

  let nextText = degradeBlockFormulas(text)
  if (level < 75) nextText = degradeInlineFormulas(nextText)
  if (level < 50) nextText = degradeImages(nextText)
  if (level < 50) nextText = degradeTables(nextText)
  if (level < 25) nextText = degradeBasicMarkdown(nextText)

  return { mode: 'markdown' as const, text: nextText }
}

function degradeBasicMarkdown(text: string) {
  return text
    .replace(/^(#{1,6})\s+/gm, (_, hashes: string) => `${'\\'.repeat(hashes.length)}${hashes} `)
    .replace(/\*\*(.+?)\*\*/g, (_, inner: string) => `\\*\\*${inner}\\*\\*`)
    .replace(/__(.+?)__/g, (_, inner: string) => `\\_\\_${inner}\\_\\_`)
}

function degradeTables(text: string) {
  const lines = text.split('\n')
  const keep = new Set<number>()

  const isRow = (line: string) => /^\s*\|.*\|\s*$/.test(line)
  const isSeparator = (line: string) => /^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/.test(line)

  for (let i = 0; i < lines.length - 1; i++) {
    if (!isRow(lines[i]) || !isSeparator(lines[i + 1])) continue
    keep.add(i)
    keep.add(i + 1)
    let j = i + 2
    while (j < lines.length && isRow(lines[j])) {
      keep.add(j)
      j++
    }
    i = j - 1
  }

  return lines.map((line, index) => {
    if (!isRow(line) || !keep.has(index)) return line
    return line.replace(/\|/g, '&#124;')
  }).join('\n')
}

function degradeImages(text: string) {
  return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match: string, alt: string, src: string) => `\\![${alt}](${src})`)
}

function degradeBlockFormulas(text: string) {
  return text.replace(/\$\$[\s\S]*?\$\$/g, (match: string) => match.replace(/\$/g, '\\$'))
}

function degradeInlineFormulas(text: string) {
  return text.replace(/\$(?!\$)([^\n$]{1,80})\$/g, (_match: string, body: string) => `\\${body.replace(/\\/g, '\\\\').replace(/([*_`#[\]{}()+\-.!|])/g, '\\$1')}`)
}

function getDataLine(node: Node, ttl = 3) {
  if (ttl === 0) return -1
  if (node.nodeType !== Node.ELEMENT_NODE) return getDataLine(node.parentElement, ttl - 1)
  const val = (node as Element).getAttribute('data-line')
  return val ? parseInt(val) : getDataLine(node.parentElement, ttl - 1)
}
function onSelect(mode: 'mouse' | 'touch') {
  if (!perfs.messageSelectionBtn) return
  const selection = document.getSelection()
  const text = selection.toString()
  if (!text) return
  const start = getDataLine(selection.anchorNode)
  const end = getDataLine(selection.focusNode)
  if (start === -1 || end === -1 || start === end) {
    selected.text = text
    selected.original = false
  } else {
    selected.text = textContent.value.text.split('\n').slice(start, end + 1).join('\n')
    selected.original = true
  }
  const range = selection.getRangeAt(0)
  const targetRects = range.getBoundingClientRect()
  const baseRects = textDiv.value[0].getBoundingClientRect()
  floatBtnStyle.top = targetRects.top < 48 || mode === 'touch'
    ? targetRects.bottom - baseRects.top + 12 + 'px'
    : targetRects.top - baseRects.top - 48 + 'px'
  floatBtnStyle.left = targetRects.left - baseRects.left + 'px'
  showFloatBtns.value = true
}
if (perfs.messageSelectionBtn) {
  const listener = () => {
    showFloatBtns.value = false
    selected.text = null
  }
  document.addEventListener('selectionchange', listener)
  onUnmounted(() => document.removeEventListener('selectionchange', listener))
}
function quote(text: string) {
  const name = props.message.type === 'assistant' ? t('messageItem.assistantMessageQuote') : t('messageItem.userMessageQuote')
  emit('quote', {
    type: 'quote',
    name: `${name}：${textBeginning(text, 10)}`,
    contentText: text
  })
}
function edit() {
  $q.dialog({
    component: TextareaDialog,
    componentProps: {
      title: t('messageItem.editMessage'),
      model: textContent.value.text
    }
  }).onOk(text => {
    db.messages.update(props.message.id, {
      [`contents.${textIndex.value}.text`]: text
    })
  })
}
function deleteBranch() {
  if (['inputing', 'failed'].includes(props.message.status)) {
    emit('delete')
    return
  }
  $q.dialog({
    title: t('messageItem.deleteBranch'),
    message: t('messageItem.deleteBranchMessage'),
    cancel: true,
    ok: {
      label: t('messageItem.delete'),
      color: 'err',
      flat: true
    },
    ...dialogOptions
  }).onOk(() => {
    emit('delete')
  })
}

const itemMap = inject<ComputedRef>('itemMap')

function convertArtifact(text: string, pattern, lang: string) {
  if (perfs.artifactsAutoName) {
    emit('extract-artifact', [text, pattern, {
      lang,
      reserveOriginal: perfs.artifactsReserveOriginal
    }])
  } else {
    $q.dialog({
      component: ConvertArtifactDialog,
      componentProps: {
        lang
      }
    }).onOk(async (options: ConvertArtifactOptions) => {
      emit('extract-artifact', [text, pattern, options])
    })
  }
}

function selectedConvertArtifact() {
  const text = selected.text
  convertArtifact(text, text, 'markdown')
}

function onHtmlChanged(inject = false) {
  nextTick(() => {
    inject && injectConvertArtifact()
    injectDisplayMathScroll()
    emit('rendered')
  })
}

function clearDisplayMathScroll(root: HTMLElement) {
  root.querySelectorAll('.message-display-math-content').forEach(node => {
    node.classList.remove('message-display-math-content')
  })
  root.querySelectorAll('.message-display-math-inner').forEach(node => {
    node.classList.remove('message-display-math-inner')
  })
  root.querySelectorAll('.message-display-math-scroll').forEach(wrapper => {
    const parent = wrapper.parentElement
    while (wrapper.firstChild) {
      parent.insertBefore(wrapper.firstChild, wrapper)
    }
    wrapper.remove()
  })
}

function clearTableScroll(root: HTMLElement) {
  root.querySelectorAll('.message-table-scroll').forEach(wrapper => {
    const parent = wrapper.parentElement
    while (wrapper.firstChild) {
      parent.insertBefore(wrapper.firstChild, wrapper)
    }
    wrapper.remove()
  })
}

function wrapTable(table: HTMLTableElement) {
  const parent = table.parentElement
  if (!parent || parent.classList.contains('message-table-scroll')) return

  const wrapper = document.createElement('div')
  wrapper.classList.add('message-table-scroll')
  table.replaceWith(wrapper)
  wrapper.appendChild(table)
}

function wrapDisplayMathBlock(displayMath: HTMLElement) {
  const block = displayMath.closest<HTMLElement>('.md-editor-katex-block, .katex-display')
  const target = block?.classList.contains('katex-display') ? block.parentElement as HTMLElement : block
  const parent = target?.parentElement
  if (!target || !parent || parent.classList.contains('message-display-math-scroll')) return

  const wrapper = document.createElement('div')
  wrapper.classList.add('message-display-math-scroll')
  target.replaceWith(wrapper)
  wrapper.appendChild(target)
  target.classList.add('message-display-math-content')
  target.querySelectorAll<HTMLElement>('.katex-display, .katex').forEach(node => {
    node.classList.add('message-display-math-inner')
  })
}

function wrapInlineMath(displayMath: HTMLElement, asBlock = false) {
  const parent = displayMath.parentElement
  if (!parent || parent.classList.contains('message-display-math-scroll')) return

  const wrapper = document.createElement(asBlock ? 'div' : 'span')
  wrapper.classList.add('message-display-math-scroll', 'message-inline-math-scroll')
  if (asBlock) wrapper.classList.add('message-inline-math-block-scroll')
  displayMath.replaceWith(wrapper)
  wrapper.appendChild(displayMath)
  displayMath.classList.add('message-display-math-content')
  displayMath.querySelectorAll<HTMLElement>('.katex, .katex-html').forEach(node => {
    node.classList.add('message-display-math-inner')
  })
}

function shouldPromoteInlineMath(inlineMath: HTMLElement) {
  const annotation = inlineMath.querySelector('annotation')?.textContent || ''
  if (/\\boxed\s*\{/.test(annotation)) return true

  const parentWidth = Math.floor(inlineMath.parentElement?.getBoundingClientRect().width || 0)
  const contentWidth = Math.ceil(
    inlineMath.querySelector<HTMLElement>('.katex-html')?.getBoundingClientRect().width ||
    inlineMath.querySelector<HTMLElement>('.katex')?.getBoundingClientRect().width ||
    inlineMath.getBoundingClientRect().width
  )
  return contentWidth > parentWidth && parentWidth > 0
}

function injectDisplayMathScroll() {
  const el: HTMLElement = textDiv.value[0]
  if (!el) return

  clearDisplayMathScroll(el)
  clearTableScroll(el)

  el.querySelectorAll<HTMLTableElement>('table').forEach(table => {
    if (!table.closest('pre')) wrapTable(table)
  })

  el.querySelectorAll<HTMLElement>('.katex-display').forEach(displayMath => {
    if (!displayMath.offsetParent) return
    wrapDisplayMathBlock(displayMath)
  })

  el.querySelectorAll<HTMLElement>('.md-editor-katex-inline').forEach(inlineMath => {
    if (!inlineMath.offsetParent) return
    const annotation = inlineMath.querySelector('annotation')?.textContent || ''
    wrapInlineMath(inlineMath, shouldPromoteInlineMath(inlineMath))
    if (/\\boxed\s*\{/.test(annotation)) {
      inlineMath.classList.add('message-boxed-inline-math')
    }
  })
}
function injectConvertArtifact() {
  if (!isPlatformEnabled(perfs.artifactsEnabled)) return
  const el: HTMLElement = textDiv.value[0]
  el.querySelectorAll('.md-editor-code').forEach(code => {
    if (code.querySelector('.md-editor-convert-artifact')) return
    const anchor = code.querySelector('.md-editor-collapse-tips')
    const btn = document.createElement('span')
    btn.innerHTML = 'convert_to_text'
    btn.classList.add('md-editor-convert-artifact')
    btn.addEventListener('click', (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      const text = code.querySelector('pre code').textContent
      const lang = code.querySelector('pre code').getAttribute('language')
      const pattern = new RegExp(`\`{3,}.*\\n${escapeRegex(text)}\\s*\`{3,}`, 'g')
      convertArtifact(text, pattern, lang)
    })
    btn.title = t('messageItem.convertToArtifactBtn')
    code.querySelector('.md-editor-code-action').insertBefore(btn, anchor)
    code.querySelector<HTMLElement>('.md-editor-copy-button').title = t('messageItem.copyCode')
    code.querySelector<HTMLElement>('.md-editor-collapse-tips').title = t('messageItem.fold')
  })
}
const mdPreviewProps = useMdPreviewProps()
const { t } = useI18n()
</script>

<style lang="scss">
.md-editor-preview-wrapper {
  --at-apply: 'py-0';
}

.user-message-preview {
  display: inline-block;
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 8px 12px !important;

  .md-editor-preview-wrapper,
  .md-editor-preview {
    width: auto;
    max-width: 100%;
    min-width: 0;
  }

  .md-editor-preview {
    padding: 0 !important;
  }

  > :first-child {
    margin-top: 0 !important;
  }

  > :last-child {
    margin-bottom: 0 !important;
  }

  p {
    margin: 0.35em 0 !important;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  :not(pre) > code,
  a,
  span,
  li,
  blockquote {
    overflow-wrap: anywhere;
    word-break: break-word;
  }
}

.assistant-message-preview {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow: visible;

  .md-editor-preview-wrapper,
  .md-editor-preview {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: visible;
  }

  .md-editor-preview {
    padding: 10px 20px !important;

    > :first-child {
      margin-top: 0 !important;
    }

    > :last-child {
      margin-bottom: 0 !important;
    }

    > * {
      max-width: 100%;
      min-width: 0;
    }
  }

  .message-table-scroll,
  pre,
  blockquote {
    display: block;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y;
  }

  .message-table-scroll > table,
  pre > code {
    display: inline-block;
    min-width: max-content;
  }
}

.reasoning-content-header {
  .q-item__section--avatar {
    min-width: 0;
  }
}
</style>
