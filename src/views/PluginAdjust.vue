<template>
  <view-common-header
    back-to=".."
  >
    <q-toolbar-title v-if="plugin">
      {{ plugin.title }}
    </q-toolbar-title>
    <q-space />
  </view-common-header>
  <q-page-container v-if="assistant && plugin">
    <q-page>
      <q-list
        px="xs:2 md:4"
        pt-2
      >
        <template v-if="assistantPlugin.infos.length">
          <q-item>
            <q-item-section
              avatar
              text-sec
              w=" xs:100px md:150px"
            >
              信息提供
            </q-item-section>
            <q-item-section>
              参数
            </q-item-section>
            <q-item-section side>
              <div>
                启用
              </div>
            </q-item-section>
          </q-item>
          <q-item
            v-for="info of assistantPlugin.infos"
            :key="info.name"
          >
            <q-item-section
              avatar
              w=" xs:100px md:150px"
            >
              <q-item-label>{{ info.name }}</q-item-label>
              <q-item-label caption>
                {{ apiMap[info.name]?.description ?? '' }}
              </q-item-label>
            </q-item-section>
            <q-item-section>
              <json-input
                :schema="apiMap[info.name].parameters"
                v-model="info.args"
                component="input"
              />
            </q-item-section>
            <q-item-section side>
              <div
                flex
                items-center
              >
                <q-checkbox v-model="info.enabled" />
                <q-btn
                  ml-2
                  flat
                  round
                  icon="sym_o_close"
                  @click="assistantPlugin.infos.splice(assistantPlugin.infos.indexOf(info), 1)"
                />
              </div>
            </q-item-section>
          </q-item>
          <q-separator spaced />
        </template>
        <template v-if="assistantPlugin.tools.length">
          <q-item>
            <q-item-section text-sec>
              工具调用
            </q-item-section>
            <q-item-section side>
              <div>
                启用
              </div>
            </q-item-section>
          </q-item>
          <q-item
            v-for="tool of assistantPlugin.tools"
            :key="tool.name"
          >
            <q-item-section>
              <q-item-label>{{ tool.name }}</q-item-label>
              <q-item-label caption>
                {{ apiMap[tool.name]?.description ?? '' }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div
                flex
                items-center
              >
                <q-checkbox v-model="tool.enabled" />
              </div>
            </q-item-section>
          </q-item>
          <q-separator spaced />
        </template>
        <template v-if="assistantPlugin.actions.length">
          <q-item>
            <q-item-section text-sec>
              操作执行
            </q-item-section>
            <q-item-section side>
              <div
                flex
                items-center
              >
                <span>自动执行</span>
                <span
                  ml-4
                >启用</span>
              </div>
            </q-item-section>
          </q-item>
          <q-item
            v-for="action of assistantPlugin.actions"
            :key="action.name"
          >
            <q-item-section>
              <q-item-label>{{ action.name }}</q-item-label>
              <q-item-label caption>
                {{ apiMap[action.name]?.description ?? '' }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div
                flex
                items-center
              >
                <q-checkbox v-model="action.autoExecute" />
                <q-checkbox
                  ml-4
                  v-model="action.enabled"
                />
              </div>
            </q-item-section>
          </q-item>
          <q-separator spaced />
        </template>
        <template v-if="plugin.promptVars?.length">
          <q-item>
            <q-item-section text-sec>
              变量
            </q-item-section>
          </q-item>
          <prompt-var-input
            v-for="promptVar of plugin.promptVars"
            :key="promptVar.id"
            :prompt-var="promptVar"
            v-model="assistantPlugin.vars[promptVar.name]"
            component="item"
          />
        </template>
        <q-item-label
          caption
          p="x-4 y-2"
          text-on-sur-var
        >
          提示：插件的全局设置在<router-link
            :to="`/plugins/${plugin.id}`"
            pri-link
          >
            插件设置
          </router-link>页面
        </q-item-label>
      </q-list>
      <hint-card
        mt="250px"
        v-if="!assistantPlugin.infos.length && !assistantPlugin.tools.length && !assistantPlugin.actions.length && !plugin.promptVars?.length"
        img-url="/emotions/nachoneko/7.webp"
        message="这个插件没有可配置的项目"
      />
    </q-page>
  </q-page-container>
  <error-not-found v-else />
</template>

<script setup lang="ts">
import { syncRef } from 'src/composables/sync-ref'
import { useAssistantsStore } from 'src/stores/assistants'
import { computed, toRaw } from 'vue'
import { usePluginsStore } from 'src/stores/plugins'
import { Assistant, PluginApi } from 'src/utils/types'
import JsonInput from 'src/components/JsonInput.vue'
import PromptVarInput from 'src/components/PromptVarInput.vue'
import HintCard from 'src/components/HintCard.vue'
import ErrorNotFound from 'src/pages/ErrorNotFound.vue'
import ViewCommonHeader from 'src/components/ViewCommonHeader.vue'
import { useSetTitle } from 'src/composables/set-title'

defineEmits(['toggle-drawer'])

const assistantsStore = useAssistantsStore()
const props = defineProps<{
  id: string,
  assistantId: string
}>()
const assistant = syncRef<Assistant>(
  () => assistantsStore.assistants.find(a => a.id === props.assistantId),
  val => { assistantsStore.put(toRaw(val)) },
  { valueDeep: true }
)

const pluginsStore = usePluginsStore()
const plugin = computed(() => pluginsStore.plugins.find(p => p.id === props.id))
const assistantPlugin = computed(() => assistant.value.plugins[props.id])
const apiMap = computed(() => {
  const val: Record<string, PluginApi> = {}
  plugin.value.apis.forEach(a => {
    val[a.name] = a
  })
  return val
})

useSetTitle(computed(() => plugin.value && `插件功能 - ${plugin.value.title}`))
</script>
