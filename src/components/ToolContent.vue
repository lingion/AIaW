<template>
  <div>
    <q-expansion-item
      bg-sur-c-low
      rd-md
      v-if="pluginsStore.ready"
    >
      <template #header>
        <q-item-section avatar>
          <a-avatar :avatar="pluginData.avatar" />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ plugin.title }}<code bg-sur-c-high>{{ content.name }}</code>
          </q-item-label>
          <q-item-label caption>
            {{ $t('toolContent.toolCall') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-spinner
            v-if="content.status === 'calling'"
            size="sm"
          />
          <q-icon
            v-else-if="content.status === 'completed'"
            name="sym_o_check_circle"
            text-suc
          />
          <q-icon
            v-else-if="content.status === 'failed'"
            name="sym_o_error"
            text-err
          />
        </q-item-section>
      </template>
      <template #default>
        <div class="tool-plain-wrap">
          <div class="tool-section-title">{{ t('toolContent.callParams') }}</div>
          <pre
            class="tool-json-box"
            @touchstart.passive="onToolBoxTouchStart"
            @touchmove="onToolBoxTouchMove"
            @touchend="onToolBoxTouchEnd"
            @touchcancel="onToolBoxTouchEnd"
          ><code>{{ argsJson }}</code></pre>

          <template v-if="toolResultData">
            <div class="tool-section-title">{{ t('toolContent.callResult') }}</div>
            <pre
              class="tool-json-box"
              @touchstart.passive="onToolBoxTouchStart"
              @touchmove="onToolBoxTouchMove"
              @touchend="onToolBoxTouchEnd"
              @touchcancel="onToolBoxTouchEnd"
            ><code>{{ resultJson }}</code></pre>
          </template>

          <template v-if="content.error">
            <div class="tool-section-title">{{ t('toolContent.errorMessage') }}</div>
            <pre
              class="tool-json-box tool-error-box"
              @touchstart.passive="onToolBoxTouchStart"
              @touchmove="onToolBoxTouchMove"
              @touchend="onToolBoxTouchEnd"
              @touchcancel="onToolBoxTouchEnd"
            ><code>{{ content.error }}</code></pre>
          </template>
        </div>
      </template>
    </q-expansion-item>
    <div
      v-if="content.result && api?.showComponents"
      mt-1
    >
      <template
        v-for="(component, index) in api.showComponents"
        :key="index"
      >
        <div
          v-if="['markdown', 'textbox'].includes(component)"
          ref="toolMarkdownRoots"
          class="tool-markdown-wrap"
        >
          <md-preview
            class="tool-markdown-preview"
            :model-value="itemMap[content.result[index]].contentText"
            v-bind="mdPreviewProps"
            bg-sur-c-low
            rd-md
            @on-html-changed="onToolHtmlChanged"
          />
        </div>
        <div
          v-else-if="['json', 'code'].includes(component)"
          ref="toolMarkdownRoots"
          class="tool-markdown-wrap"
        >
          <md-preview
            class="tool-markdown-preview"
            :model-value="wrapCode(itemMap[content.result[index]].contentText, component === 'json' ? 'json' : '')"
            v-bind="mdPreviewProps"
            bg-sur-c-low
            rd-md
            @on-html-changed="onToolHtmlChanged"
          />
        </div>
        <div v-else-if="component === 'image'">
          <message-image :image="itemMap[content.result[index]]" />
        </div>
        <div v-else-if="component === 'audio'">
          <message-audio :audio="itemMap[content.result[index]]" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePluginsStore } from 'src/stores/plugins'
import { AssistantToolContent } from 'src/utils/types'
import { computed, ComputedRef, inject, nextTick, ref } from 'vue'
import AAvatar from './AAvatar.vue'
import { MdPreview } from 'md-editor-v3'
import { wrapCode } from 'src/utils/functions'
import MessageImage from './MessageImage.vue'
import MessageAudio from './MessageAudio.vue'
import { useMdPreviewProps } from 'src/composables/md-preview-props'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  content: AssistantToolContent
}>()

const pluginsStore = usePluginsStore()
const plugin = computed(() => pluginsStore.plugins.find(p => p.id === props.content.pluginId))
const api = computed(() => plugin.value?.apis.find(a => a.name === props.content.name))
const pluginData = computed(() => pluginsStore.data[props.content.pluginId])
const toolMarkdownRoots = ref<HTMLElement[]>([])

const itemMap = inject<ComputedRef>('itemMap')

const toolResultData = computed(() => props.content.result?.map(id => {
  const { name, type, mimeType, contentText } = itemMap.value[id]
  return { name, type, mimeType, contentText }
}))

const argsJson = computed(() => JSON.stringify(props.content.args ?? {}, null, 2))
const resultJson = computed(() => JSON.stringify(toolResultData.value ?? [], null, 2))

function findScrollParent(el: HTMLElement | null) {
  let node = el?.parentElement || null
  while (node) {
    const style = window.getComputedStyle(node)
    const overflowY = style.overflowY
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node
    }
    node = node.parentElement
  }
  return document.scrollingElement as HTMLElement | null
}

function onToolBoxTouchStart(event: TouchEvent) {
  const target = event.currentTarget as HTMLElement | null
  if (!target) return
  target.dataset.lastTouchY = String(event.touches[0]?.clientY ?? 0)
}

function onToolBoxTouchEnd(event: TouchEvent) {
  const target = event.currentTarget as HTMLElement | null
  if (!target) return
  delete target.dataset.lastTouchY
}

function onToolBoxTouchMove(event: TouchEvent) {
  const target = event.currentTarget as HTMLElement | null
  const touch = event.touches[0]
  if (!target || !touch) return

  const currentY = touch.clientY
  const lastY = Number(target.dataset.lastTouchY ?? currentY)
  const deltaY = currentY - lastY
  target.dataset.lastTouchY = String(currentY)

  const maxScrollTop = Math.max(0, target.scrollHeight - target.clientHeight)
  const atTop = target.scrollTop <= 2
  const atBottom = target.scrollTop >= maxScrollTop - 2
  const pullingDownAtTop = atTop && deltaY > 0
  const pushingUpAtBottom = atBottom && deltaY < 0

  if (pullingDownAtTop || pushingUpAtBottom) {
    const parent = findScrollParent(target)
    if (parent) {
      parent.scrollBy({ top: -deltaY, behavior: 'auto' })
      event.preventDefault()
      event.stopPropagation()
    }
  }
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
  const contentWidth = Math.ceil(inlineMath.querySelector<HTMLElement>('.katex-html')?.getBoundingClientRect().width
    || inlineMath.querySelector<HTMLElement>('.katex')?.getBoundingClientRect().width
    || inlineMath.getBoundingClientRect().width)
  return contentWidth > parentWidth && parentWidth > 0
}

function injectDisplayMathScroll(root: HTMLElement) {
  clearDisplayMathScroll(root)
  clearTableScroll(root)

  root.querySelectorAll<HTMLTableElement>('table').forEach(table => {
    if (!table.closest('pre')) wrapTable(table)
  })

  root.querySelectorAll<HTMLElement>('.katex-display').forEach(displayMath => {
    if (!displayMath.offsetParent) return
    wrapDisplayMathBlock(displayMath)
  })

  root.querySelectorAll<HTMLElement>('.md-editor-katex-inline').forEach(inlineMath => {
    if (!inlineMath.offsetParent) return
    const annotation = inlineMath.querySelector('annotation')?.textContent || ''
    wrapInlineMath(inlineMath, shouldPromoteInlineMath(inlineMath))
    if (/\\boxed\s*\{/.test(annotation)) {
      inlineMath.classList.add('message-boxed-inline-math')
    }
  })
}

function onToolHtmlChanged() {
  nextTick(() => {
    const roots = Array.isArray(toolMarkdownRoots.value)
      ? toolMarkdownRoots.value
      : [toolMarkdownRoots.value].filter(Boolean)
    roots.forEach(root => injectDisplayMathScroll(root))
  })
}

const mdPreviewProps = useMdPreviewProps()
</script>

<style lang="scss">
.tool-plain-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 10px 12px 12px;
  box-sizing: border-box;
}

.tool-section-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-word;
}

.tool-json-box {
  margin: 0;
  padding: 12px;
  border-radius: 10px;
  background: rgba(127, 127, 127, 0.12);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.45;
  height: 180px;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: auto;
  touch-action: pan-y;
}

.tool-json-box > code {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.tool-error-box {
  height: 120px;
}

.tool-markdown-wrap {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: visible;
}

.tool-markdown-preview {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: visible;

  .md-editor-preview-wrapper,
  .md-editor-preview {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: visible;
  }

  .md-editor-preview > * {
    max-width: 100%;
    min-width: 0;
  }

  .md-editor-preview h1,
  .md-editor-preview h2,
  .md-editor-preview h3,
  .md-editor-preview h4,
  .md-editor-preview h5,
  .md-editor-preview h6,
  .md-editor-preview p,
  .md-editor-preview li,
  .md-editor-preview blockquote {
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .message-table-scroll,
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

  .tool-markdown-preview .md-editor-preview pre,
  .tool-markdown-preview .md-editor-preview-wrapper pre {
    display: block !important;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    height: 220px;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    white-space: pre-wrap !important;
    overflow-wrap: anywhere;
    word-break: break-word;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y !important;
  }

  .tool-markdown-preview .md-editor-preview pre > code,
  .tool-markdown-preview .md-editor-preview-wrapper pre > code {
    display: block !important;
    min-width: 0;
    white-space: pre-wrap !important;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .message-table-scroll > table {
    display: inline-block;
    min-width: max-content;
  }
}
</style>

