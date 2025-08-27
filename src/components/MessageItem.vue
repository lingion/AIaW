<template>
  <div
    flex
    :class="{ 'flex-row-reverse': message.type === 'user', 'flex-col': colMode }"
    relative
  >
    <div>
      <div
        flex
        :class="[
          colMode ? 'flex-row items-center' : 'flex-col pos-sticky top-0',
          message.type === 'assistant' ? 'pl-2' : ''
        ]"
      >
        <a-avatar
          v-if="avatar"
          :avatar
          :size="colMode ? '36px' : denseMode ? '40px' : '48px'"
          :class="colMode ? 'mx-3' : 'xs:mx-3 sm:mx-4'"
          @click="onAvatarClick"
          cursor-pointer
        />
        <div
          v-if="name"
          :class="colMode ? '' : 'my-2 text-xs'"
          text="center on-sur-var"
        >
          {{ name }}
        </div>
      </div>
    </div>
    <div
      min-w-0
    >
      <div
        position-relative
        :class="message.type === 'user' ? 'min-h-48px' : 'min-h-24px min-w-100px'"
        class="group"
      >
        <div
          v-for="(content, index) in contents"
          :key="index"
          :class="message.type === 'user' ? 'bg-sur-c-low' : 'bg-sur'"
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
            v-if="(content.type === 'assistant-message' || content.type === 'user-message') && content.text"
          >
            <md-preview
              :class="message.type === 'user' ? 'bg-sur-c-low' : 'bg-sur'"
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
                    :label="$t('messageItem.copyMarkdown')"
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
        <template v-if="childNum > 1">
          <q-pagination
            v-model="model"
            :max="childNum"
            input
            :boundary-links="false"
          />
          <q-btn
            icon="sym_o_delete"
            v-if="!['pending', 'streaming'].includes(message.status)"
            flat
            dense
            round
            text="sec xs hover:err"
            un-size="32px"
            :title="$t('messageItem.deleteBranch')"
            @click="deleteBranch"
          />
        </template>
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
      v-if="!colMode"
      w="xs:20px sm:22.5%"
      shrink-0
    >
      <md-catalog
        pos-sticky
        top-0
        px-2
        pb-4
        v-if="perfs.messageCatalog && scrollContainer && $q.screen.gt.xs && textContent.text"
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
import { escapeRegex, genId, idDateString, isPlatformEnabled, textBeginning, wrapCode } from 'src/utils/functions'
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
  scrollContainer: HTMLElement
}>()

const mdId = `md-${genId()}`

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
    emit('rendered')
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

.reasoning-content-header {
  .q-item__section--avatar {
    min-width: 0;
  }
}
</style>
