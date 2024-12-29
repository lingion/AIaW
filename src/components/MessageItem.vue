<template>
  <div
    flex
    :class="{ 'flex-row-reverse': message.type === 'user', 'flex-col px-2': colMode }"
  >
    <div
      flex
      :class="[
        colMode ? 'flex-row items-center' : 'flex-col',
        message.type === 'assistant' ? 'pl-2' : ''
      ]"
    >
      <a-avatar
        v-if="avatar"
        :avatar
        :size="colMode ? '36px' : '48px'"
        :class="colMode ? 'mx-2' : 'xs:mx-3 sm:mx-4'"
        @click="onAvatarClick"
        cursor-pointer
      />
      <div
        v-if="name"
        :class="colMode ? 'mx-2' : 'my-2 text-xs'"
        text="center on-sur-var"
      >
        {{ name }}
      </div>
    </div>
    <div
      min-w-0
    >
      <div
        position-relative
        :class="message.type === 'user' ? 'min-h-48px' : 'min-h-24px min-w-80px'"
      >
        <div
          v-for="(content, index) in contents"
          :key="index"
          :class="message.type === 'user' ? 'bg-sur-c-low' : 'bg-sur'"
          rd-lg
        >
          <div
            ref="textDiv"
            @mouseup="onMouseUp"
            pos-relative
            overflow-visible
            v-if="(content.type === 'assistant-message' || content.type === 'user-message') && content.text"
          >
            <md-preview
              :class="message.type === 'user' ? 'bg-sur-c-low' : 'bg-sur'"
              rd-lg
              :model-value="content.text"
              preview-theme="vuepress"
              :theme="$q.dark.isActive ? 'dark' : 'light'"
              :auto-fold-threshold="Infinity"
            />
            <q-btn
              v-if="showQuoteBtn"
              label="引用"
              pos-absolute
              z-3
              :style="quoteBtnStyle"
              bg-sec-c
              text-on-sec-c
              @click="quote"
            />
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
          />
          <action-content
            v-if="content.type === 'assistant-action'"
            :content
            @update="updateContent(index, $event)"
          />
        </div>
        <div
          text-err
          break-word
          m-2
          v-if="message.error"
        >
          {{ message.error }}
        </div>
        <div v-if="message.warnings?.length">
          <div
            text-warn
            break-word
            m-2
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
      </div>
      <q-linear-progress
        v-if="['pending', 'streaming'].includes(message.status)"
        indeterminate
      />
      <div
        v-if="['default', 'failed'].includes(message.status)"
        text-on-sur-var
        :class="message.type === 'assistant' ? 'ml-4' : 'm-1'"
      >
        <copy-btn
          round
          flat
          dense
          :value="text"
        />
        <q-btn
          v-if="message.type === 'assistant'"
          icon="sym_o_refresh"
          round
          flat
          dense
          ml-1
          title="重新生成"
          @click="$emit('regenerate')"
        />
        <q-btn
          v-if="message.type === 'user'"
          icon="sym_o_edit"
          round
          flat
          dense
          ml-1
          title="修改"
          @click="$emit('edit')"
        />
        <q-btn
          icon="sym_o_more_vert"
          round
          flat
          dense
          ml-1
          title="更多"
        >
          <q-menu>
            <q-list>
              <menu-item
                icon="sym_o_code"
                label="显示源代码"
                @click="sourceCodeMode = !sourceCodeMode"
                :class="{ 'route-active': sourceCodeMode }"
              />
              <menu-item
                icon="sym_o_edit"
                label="直接编辑"
                @click="edit"
              />
              <menu-item
                icon="sym_o_info"
                label="更多信息"
                @click="moreInfo"
              />
            </q-list>
          </q-menu>
        </q-btn>
      </div>
      <q-pagination
        v-if="childNum > 1"
        v-model="model"
        :max="childNum"
        input
        :boundary-links="false"
      />
    </div>
    <div
      v-if="!colMode"
      w="xs:16px sm:125px lg:20%"
      shrink-0
    />
  </div>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import { db } from 'src/utils/db'
import 'md-editor-v3/lib/preview.css'
import { computed, ComputedRef, inject, onUnmounted, reactive, ref, watchEffect } from 'vue'
import sessions from 'src/utils/sessions'
import { MessageContent, Message, ApiResultItem, UserMessageContent, AssistantMessageContent } from 'src/utils/types'
import CopyBtn from './CopyBtn.vue'
import AAvatar from './AAvatar.vue'
import { useAssistantsStore } from 'src/stores/assistants'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import MessageImage from './MessageImage.vue'
import ToolContent from './ToolContent.vue'
import ActionContent from './ActionContent.vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import PickAvatarDialog from './PickAvatarDialog.vue'
import MessageFile from './MessageFile.vue'
import { textBeginning, wrapCode } from 'src/utils/functions'
import MenuItem from './MenuItem.vue'
import MessageInfoDialog from './MessageInfoDialog.vue'
import TextareaDialog from './TextareaDialog.vue'

const props = defineProps<{
  message: Message,
  childNum: number
}>()

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
        } else if (content.type === 'assistant-action' && content.status === 'streaming') {
          return {
            ...content,
            status: 'failed',
            error: 'Action stream aborted'
          }
        } else if (content.type === 'assistant-action' && content.status === 'calling') {
          return {
            ...content,
            status: 'failed',
            error: 'Action call aborted'
          }
        }
        return content
      }) as MessageContent[]
    })
  }
})

const text = computed(() => props.message.contents
  .filter(content => 'text' in content && content.text)
  .map((content: MessageContent & { text: string }) => content.text)
  .join('\n'))

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

async function updateContent(index, value) {
  await db.messages.update(props.message.id, {
    [`contents.${index}`]: value
  })
}

const colMode = computed(() => $q.screen.lt.md && props.message.type === 'assistant')

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

const showQuoteBtn = ref(false)
const quoteBtnStyle = reactive({
  top: undefined,
  left: undefined
})
const textDiv = ref()
const selectedText = ref(null)
function onMouseUp() {
  if (!perfs.messageQuoteBtn) return
  const selection = document.getSelection()
  const text = selection.toString()
  if (!text) return
  const range = selection.getRangeAt(0)
  const targetRects = range.getBoundingClientRect()
  const baseRects = textDiv.value[0].getBoundingClientRect()
  quoteBtnStyle.top = targetRects.top - baseRects.top - 48 + 'px'
  quoteBtnStyle.left = targetRects.left - baseRects.left + 'px'
  showQuoteBtn.value = true
  selectedText.value = text
}
if (perfs.messageQuoteBtn) {
  const listener = () => {
    showQuoteBtn.value = false
    selectedText.value = null
  }
  document.addEventListener('selectionchange', listener)
  onUnmounted(() => document.removeEventListener('selectionchange', listener))
}
function quote() {
  const name = props.message.type === 'assistant' ? '助手消息引用' : '用户消息引用'
  emit('quote', {
    type: 'quote',
    name: `${name}：${textBeginning(selectedText.value, 10)}`,
    contentText: selectedText.value
  })
  showQuoteBtn.value = false
}
function edit() {
  const index = props.message.contents.findIndex(content => ['user-message', 'assistant-message'].includes(content.type))
  if (index === -1) return
  const content = props.message.contents[index] as UserMessageContent | AssistantMessageContent
  $q.dialog({
    component: TextareaDialog,
    componentProps: {
      title: '编辑消息',
      model: content.text
    }
  }).onOk(text => {
    db.messages.update(props.message.id, {
      [`contents.${index}.text`]: text
    })
  })
}

const itemMap = inject<ComputedRef>('itemMap')
</script>

<style lang="scss">
.md-editor-preview-wrapper {
  --at-apply: 'py-0';
}
</style>
