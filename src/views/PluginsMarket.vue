<template>
  <view-common-header @toggle-drawer="$emit('toggle-drawer')">
    <q-toolbar-title>
      插件市场
    </q-toolbar-title>
    <q-space />
    <q-btn
      flat
      dense
      round
      icon="sym_o_add"
      title="手动安装"
    >
      <q-menu>
        <q-list>
          <q-item
            clickable
            v-close-popup
            @click="fileInput.click()"
          >
            <q-item-section>
              选择配置文件
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-close-popup
            @click="clipboardImport"
          >
            <q-item-section>
              从剪贴板导入
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-close-popup
            @click="addMcpPlugin"
          >
            <q-item-section>
              添加 MCP 插件
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        un-hidden
        @change="onFileInput"
      >
    </q-btn>
  </view-common-header>
  <q-page-container>
    <q-page
      p-2
      :style-fn="pageFhStyle"
    >
      <a-tip
        v-if="$q.screen.xs"
        tip-key="plugins-market-right-drawer"
        mb-2
      >
        已安装的插件在右侧边栏
      </a-tip>
      <div>
        <q-input
          label="搜索"
          outlined
          v-model="query"
        />
      </div>
      <q-list mt-2>
        <q-item
          v-for="item in filterList"
          :key="item.id"
        >
          <q-item-section avatar>
            <a-avatar :avatar="item.avatar" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ item.title }}<plugin-type-badge
                :type="item.type"
                ml-2
                lh="1.1em"
              />
            </q-item-label>
            <q-item-label caption>
              {{ item.description }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <install-plugin-btn
              :id="item.id"
              :manifest="item.manifest"
              unelevated
              bg-pri-c
              text-on-pri-c
            />
          </q-item-section>
        </q-item>
      </q-list>
      <q-inner-loading :showing="loading" />
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import ViewCommonHeader from 'src/components/ViewCommonHeader.vue'
import { useQuasar } from 'quasar'
import { caselessIncludes, pageFhStyle } from 'src/utils/functions'
import AAvatar from 'src/components/AAvatar.vue'
import ATip from 'src/components/ATip.vue'
import PluginTypeBadge from 'src/components/PluginTypeBadge.vue'
import AddMcpPluginDialog from 'src/components/AddMcpPluginDialog.vue'
import { useInstallPlugin } from 'src/composables/install-plugin'
import InstallPluginBtn from 'src/components/InstallPluginBtn.vue'

defineEmits(['toggle-drawer'])

const query = ref('')
const list = reactive([])

const filterList = computed(() =>
  query.value
    ? list.filter(item => caselessIncludes(item.title, query.value) || caselessIncludes(item.description, query.value))
    : list
)

const $q = useQuasar()
const loading = ref(false)
function load() {
  loading.value = true
  fetch('/plugins.json')
    .then(res => res.json())
    .then(data => {
      list.push(...data)
    }).catch(err => {
      console.error(err)
      $q.notify({
        message: '加载插件列表失败',
        color: 'err-c',
        textColor: 'on-err-c',
        actions: [{
          label: '重试',
          color: 'on-sur',
          handler: load
        }]
      })
    }).finally(() => {
      loading.value = false
    })
}
load()

const { install } = useInstallPlugin()

const fileInput = ref<HTMLInputElement>()
async function onFileInput() {
  const file = fileInput.value.files[0]
  await install(await file.text())
}
async function clipboardImport() {
  await install(await navigator.clipboard.readText())
}

function addMcpPlugin() {
  $q.dialog({
    component: AddMcpPluginDialog
  })
}
</script>
