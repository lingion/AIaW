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
        <div
          ref="toolMarkdownRoots"
          class="tool-markdown-wrap"
        >
          <md-preview
            class="tool-markdown-preview"
            :model-value="contentMd"
            v-bind="mdPreviewProps"
            bg-sur-c-low
            @on-html-changed="onToolHtmlChanged"
          />
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
import { engine } from 'src/utils/template-engine'
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

const contentTemplate =
`### ${t('toolContent.callParams')}

\`\`\`json
{{ content.args | json: 2 }}
\`\`\`

{%- if result %}
### ${t('toolContent.callResult')}

\`\`\`json
{{ result | json: 2 }}
\`\`\`
{%- endif %}

{%- if content.error %}
### ${t('toolContent.errorMessage')}

{{ content.error }}
{%- endif %}
`
const contentMd = computed(() => {
  const { content } = props
  return engine.parseAndRenderSync(contentTemplate, {
    content,
    result: content.result?.map(id => {
      const { name, type, mimeType, contentText } = itemMap.value[id]
      return { name, type, mimeType, contentText }
    })
  })
})

const itemMap = inject<ComputedRef>('itemMap')

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
</style>

