<template>
  <div
    bg-sur-c-low
    of-hidden
    rd-md
  >
    <q-expansion-item>
      <template #header>
        <q-item-section avatar>
          <a-avatar :avatar="pluginData.avatar" />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ plugin.title }}<code bg-sur-c-high>{{ content.name }}</code>
          </q-item-label>
          <q-item-label caption>
            操作执行
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div
            flex
            items-center
          >
            <span v-if="content.status === 'streaming'">
              生成中
            </span>
            <span
              v-else-if="content.status === 'aborted'"
              text-err
            >
              生成中断
            </span>
            <span v-else-if="content.status === 'ready'">
              就绪
            </span>
            <span v-else-if="content.status === 'calling'">
              执行中
            </span>
            <span
              v-else-if="content.status === 'failed'"
              text-err
            >
              执行失败
            </span>
            <span
              v-else-if="content.status === 'completed'"
              text-suc
            >
              执行成功
            </span>

            <q-btn
              :disable="['streaming', 'aborted'].includes(content.status)"
              :loading="content.status === 'calling'"
              icon="sym_o_play_circle"
              label="执行"
              @click.prevent.stop="execute"
              flat
              ml-4
              bg-pri
              text-on-pri
            />
          </div>
        </q-item-section>
      </template>
      <template #default>
        <md-preview
          :model-value="contentMd"
          preview-theme="vuepress"
          :theme="$q.dark.isActive ? 'dark' : 'light'"
          bg-sur-c-low
        />
      </template>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { usePluginsStore } from 'src/stores/plugins'
import { AssistantActionContent, Dialog, StoredItem } from 'src/utils/types'
import { computed, inject, Ref, ref, watch } from 'vue'
import AAvatar from './AAvatar.vue'
import { engine } from 'src/utils/template-engine'
import { MdPreview } from 'md-editor-v3'
import { useCallApi } from 'src/composables/call-api'
import { genId } from 'src/utils/functions'
import { db } from 'src/utils/db'

const props = defineProps<{
  content: AssistantActionContent
}>()

const pluginsStore = usePluginsStore()
const plugin = computed(() => pluginsStore.plugins.find(p => p.id === props.content.pluginId))
const pluginData = computed(() => pluginsStore.data[props.content.pluginId])

const contentTemplate =
`### 操作参数

\`\`\`json
{{ content.args | json }}
\`\`\`

### 内容

\`\`\`
{{ content.text }}
\`\`\`

{%- if content.result %}
### 执行结果

\`\`\`json
{{ content.result | json }}
\`\`\`
{%- endif %}
{%- if content.error %}
### 错误信息

{{ content.error }}
{%- endif %}
`
const contentMd = ref('')
watch(() => props.content, () => {
  contentMd.value = engine.parseAndRenderSync(contentTemplate, { content: props.content })
}, { deep: true, immediate: true })

const dialog = inject<Ref<Dialog>>('dialog')
const { callApi } = useCallApi({ workspace: inject('workspace'), dialog })
const emit = defineEmits(['update'])
async function execute() {
  const { name, args } = props.content
  emit('update', {
    ...props.content,
    status: 'calling'
  })
  const { result: apiResult, error } = await callApi(plugin.value, plugin.value.apis.find(a => a.name === name), args)
  const result: StoredItem[] = apiResult.map(r => ({ ...r, id: genId(), dialogId: dialog.value.id, references: 1 }))
  await db.items.bulkAdd(result)
  emit('update', {
    ...props.content,
    result: result.map(item => item.id),
    error,
    status: error ? 'failed' : 'completed'
  })
}
</script>
