<template>
  <view-common-header @toggle-drawer="$emit('toggle-drawer')">
    <q-toolbar-title>
      助手设置
    </q-toolbar-title>
    <q-space />
  </view-common-header>
  <q-page-container
    v-if="assistant"
    bg-sur-c-low
  >
    <q-page
      pb-2
      bg-sur
      :class="{ 'rd-rt-lg': rightDrawerAbove }"
      :style-fn="pageFhStyle"
    >
      <q-list>
        <q-item-label
          header
          id="assistant"
        >
          助手
        </q-item-label>
        <q-item>
          <q-item-section>名称</q-item-section>
          <q-item-section side>
            <q-input
              class="w-150px"
              filled
              dense
              v-model="assistant.name"
            />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          @click="pickAvatar"
        >
          <q-item-section>头像</q-item-section>
          <q-item-section side>
            <a-avatar :avatar="assistant.avatar" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            角色设定
          </q-item-section>
          <q-item-section>
            <q-input
              filled
              v-model="assistant.prompt"
              autogrow
              clearable
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            提示词模板
          </q-item-section>
          <q-item-section>
            <q-input
              filled
              v-model="assistant.promptTemplate"
              autogrow
              clearable
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            提示词变量
          </q-item-section>
          <q-item-section>
            <prompt-var-editor
              ml-2
              v-model="assistant.promptVars"
            />
          </q-item-section>
        </q-item>
        <q-item-label
          caption
          p="x-4 y-2"
          text-on-sur-var
        >
          可参考提示词变量/模板的<a
            href="https://docs.aiaw.app/usage/prompt-vars.html"
            target="_blank"
            pri-link
          >使用指南</a>
        </q-item-label>
        <q-separator spaced />
        <q-item-label
          header
          id="model"
        >
          模型
        </q-item-label>
        <model-input-items v-model="assistant.model" />
        <q-item-label
          caption
          p="x-4 y-2"
          text-on-sur-var
        >
          留空则使用全局模型设置；此设置也会被对话中切换的模型覆盖
        </q-item-label>
        <q-separator spaced />
        <q-item-label
          header
          id="provider"
        >
          服务商
        </q-item-label>
        <provider-input-items v-model="assistant.provider" />
        <q-item-label
          caption
          p="x-4 y-2"
          text-on-sur-var
        >
          留空则使用全局服务商设置
        </q-item-label>
        <q-separator spaced />
        <q-item id="plugins">
          <q-item-section text-sec>
            插件
          </q-item-section>
          <q-item-section side>
            启用
          </q-item-section>
        </q-item>
        <q-item
          v-for="plugin in pluginsStore.plugins.filter(p => p.available && (p.apis.length || p.prompt))"
          :key="plugin.id"
        >
          <q-item-section
            avatar
            v-if="pluginsStore.data[plugin.id]"
          >
            <a-avatar :avatar="pluginsStore.data[plugin.id].avatar" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ plugin.title }}<plugin-type-badge
                :type="plugin.type"
                ml-2
                lh="1.1em"
              />
            </q-item-label>
            <q-item-label caption>
              {{ plugin.description }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div
              flex
              items-center
            >
              <q-btn
                flat
                dense
                round
                icon="sym_o_tune"
                :to="`${assistant.id}/plugins/${plugin.id}`"
                v-if="assistant.plugins[plugin.id]?.enabled"
                title="插件功能"
                mr-2
              />
              <q-checkbox
                :model-value="!!assistant.plugins[plugin.id]?.enabled"
                @update:model-value="setPlugin(plugin, $event)"
              />
            </div>
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item-label
          header
          id="generate-settings"
        >
          生成设置
        </q-item-label>
        <q-item>
          <q-item-section>
            <q-item-label>流式传输</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="assistant.stream" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>重试次数</q-item-label>
            <q-item-label caption>
              生成失败时的最大重试次数
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input
              class="w-100px"
              filled
              dense
              v-model.number="assistant.modelSettings.maxRetries"
              type="number"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>最大调用次数</q-item-label>
            <q-item-label caption>
              启用工具调用时，单次回复调用模型的最大次数
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input
              class="w-100px"
              filled
              dense
              v-model.number="assistant.modelSettings.maxSteps"
              type="number"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>上下文携带条数</q-item-label>
            <q-item-label caption>
              包括当前用户消息的最大上下文数量。留空则不限制
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input
              class="w-100px"
              filled
              dense
              v-model.number="assistant.contextNum"
              type="number"
              clearable
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>提示词角色</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              class="w-100px"
              filled
              dense
              v-model="assistant.promptRole"
              :options="['system', 'user', 'assistant']"
            />
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item-label
          header
          id="model-params"
        >
          模型参数
        </q-item-label>
        <q-item>
          <q-item-section>
            <q-item-label>随机性<code>temperature</code></q-item-label>
            <q-item-label caption>
              值越大，回复越随机
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input
              class="w-100px"
              filled
              dense
              v-model.number="assistant.modelSettings.temperature"
              type="number"
              step="0.1"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>核采样<code>topP</code></q-item-label>
            <q-item-label caption>
              与随机性类似，但不要和随机性一起更改
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input
              class="w-100px"
              filled
              dense
              v-model.number="assistant.modelSettings.topP"
              type="number"
              step="0.1"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>存在惩罚<code>presencePenalty</code></q-item-label>
            <q-item-label caption>
              值越大，越有可能扩展到新话题
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input
              class="w-100px"
              filled
              dense
              v-model.number="assistant.modelSettings.presencePenalty"
              type="number"
              step="0.1"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>频率惩罚<code>frequencyPenalty</code></q-item-label>
            <q-item-label caption>
              值越大，越有可能降低重复字词
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input
              class="w-100px"
              filled
              dense
              v-model.number="assistant.modelSettings.frequencyPenalty"
              type="number"
              step="0.1"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>停止词<code>stopSequences</code></q-item-label>
            <q-item-label caption>
              当模型生成停止词时，就会停止生成。按回车添加值。
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              class="w-150px"
              filled
              dense
              v-model="assistant.modelSettings.stopSequences"
              use-input
              use-chips
              multiple
              hide-dropdown-icon
              input-debounce="0"
              new-value-mode="add-unique"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>单次回复限制<code>maxTokens</code></q-item-label>
            <q-item-label caption>
              单次生成的最大token数
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input
              class="w-150px"
              filled
              dense
              v-model.number="assistant.modelSettings.maxTokens"
              type="number"
              clearable
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>种子<code>seed</code></q-item-label>
            <q-item-label caption>
              用于随机采样的种子（整数）。用于生成确定性的结果。
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input
              class="w-100px"
              filled
              dense
              v-model.number="assistant.modelSettings.seed"
              type="number"
              clearable
            />
          </q-item-section>
        </q-item>
        <q-item-label
          caption
          p="x-4 y-2"
          text-on-sur-var
        >
          提示：不是所有服务商都支持全部参数
        </q-item-label>
        <q-separator spaced />
        <q-item-label
          header
          id="model-params"
        >
          元数据
        </q-item-label>
        <q-item>
          <q-item-section>
            <q-item-label>作者</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input
              class="w-150px"
              filled
              dense
              v-model="assistant.author"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>描述</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input
              class="xs:w-250px sm:w-400px"
              filled
              dense
              autogrow
              v-model="assistant.description"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>主页</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input
              class="xs:w-250px sm:w-400px"
              filled
              dense
              v-model="assistant.homepage"
            />
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item>
          <q-item-section>
            <q-item-label>导出</q-item-label>
            <q-item-label caption>
              导出助手为 JSON，用于<a
                href="https://docs.aiaw.app/usage/assistants.html#分享助手"
                target="_blank"
                pri-link
              >分享或发布助手</a>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              label="导出"
              bg-pri-c
              text-on-pri-c
            >
              <q-menu>
                <q-item
                  clickable
                  v-close-popup
                  @click="exportFile(`${assistant.name}.json`, assistantJson)"
                >
                  <q-item-section>
                    导出为文件
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="copyToClipboard(assistantJson)"
                >
                  <q-item-section>
                    导出到剪贴板
                  </q-item-section>
                </q-item>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-page>
  </q-page-container>
  <error-not-found v-else />
</template>

<script setup lang="ts">
import { syncRef } from 'src/composables/sync-ref'
import { useAssistantsStore } from 'src/stores/assistants'
import { computed, inject, toRaw } from 'vue'
import ProviderInputItems from 'src/components/ProviderInputItems.vue'
import PromptVarEditor from 'src/components/PromptVarEditor.vue'
import { usePluginsStore } from 'src/stores/plugins'
import { AssistantPlugin, Plugin, Assistant } from 'src/utils/types'
import ViewCommonHeader from 'src/components/ViewCommonHeader.vue'
import AAvatar from 'src/components/AAvatar.vue'
import { copyToClipboard, exportFile, useQuasar } from 'quasar'
import PickAvatarDialog from 'src/components/PickAvatarDialog.vue'
import ModelInputItems from 'src/components/ModelInputItems.vue'
import ErrorNotFound from 'src/pages/ErrorNotFound.vue'
import PluginTypeBadge from 'src/components/PluginTypeBadge.vue'
import { useLocateId } from 'src/composables/locate-id'
import { pageFhStyle } from 'src/utils/functions'
import { useSetTitle } from 'src/composables/set-title'

const props = defineProps<{
  id: string
}>()

defineEmits(['toggle-drawer'])

const store = useAssistantsStore()
const assistant = syncRef<Assistant>(
  () => store.assistants.find(a => a.id === props.id),
  val => { store.put(toRaw(val)) },
  { valueDeep: true }
)

function setPlugin(plugin: Plugin, enabled: boolean) {
  if (enabled && !assistant.value.plugins[plugin.id]) {
    const assistantPlugin: AssistantPlugin = { enabled: true, infos: [], tools: [], actions: [], vars: {} }
    plugin.apis.forEach(api => {
      if (api.type === 'action') {
        assistantPlugin.actions.push({
          name: api.name,
          enabled: true,
          autoExecute: false
        })
      } else if (api.type === 'tool') {
        assistantPlugin.tools.push({
          name: api.name,
          enabled: true
        })
      } else if (api.type === 'info') {
        assistantPlugin.infos.push({
          name: api.name,
          enabled: true,
          args: {}
        })
      }
    })
    assistant.value.plugins[plugin.id] = assistantPlugin
  } else {
    assistant.value.plugins[plugin.id].enabled = enabled
  }
}

const pluginsStore = usePluginsStore()

const $q = useQuasar()
function pickAvatar() {
  $q.dialog({
    component: PickAvatarDialog,
    componentProps: {
      model: assistant.value.avatar,
      defaultTab: 'ai'
    }
  }).onOk(avatar => {
    assistant.value.avatar = avatar
  })
}

const rightDrawerAbove = inject('rightDrawerAbove')
useLocateId(assistant)

useSetTitle(computed(() => assistant.value?.name))

const assistantJson = computed(() => {
  const { name, avatar, prompt, promptVars, promptTemplate, model, modelSettings, author, homepage, description } = assistant.value
  return JSON.stringify({ name, avatar, prompt, promptVars, promptTemplate, model, modelSettings, author, homepage, description })
})
</script>
