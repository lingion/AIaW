<template>
  <view-common-header @toggle-drawer="$emit('toggle-drawer')">
    <q-toolbar-title>
      助手市场
    </q-toolbar-title>
    <q-space />
    <q-btn
      flat
      dense
      round
      icon="sym_o_add"
      title="导入"
    >
      <q-menu>
        <q-list>
          <q-item
            clickable
            v-close-popup
            @click="fileInput.click()"
          >
            <q-item-section>
              选择文件
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
      <div>
        <q-input
          label="搜索"
          outlined
          v-model="query"
        />
      </div>
      <!-- No height limit. Use `q-virtual-scroll` to just make it load asynchronously. -->
      <q-virtual-scroll
        mt-2
        v-slot="{ item, index }"
        :items="filterList"
      >
        <q-item
          :key="index"
        >
          <q-item-section avatar>
            <a-avatar :avatar="item.avatar" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ item.name }}
            </q-item-label>
            <q-item-label caption>
              {{ item.description }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              unelevated
              bg-pri-c
              text-on-pri-c
              label="添加"
            >
              <q-menu>
                <q-list>
                  <q-item
                    clickable
                    v-close-popup
                    @click="addToGlobal(item)"
                  >
                    <q-item-section>
                      添加至全局
                    </q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="addToWorkspace(item)"
                  >
                    <q-item-section>
                      添加至工作区
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-virtual-scroll>
      <q-inner-loading :showing="loading" />
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toRaw } from 'vue'
import ViewCommonHeader from 'src/components/ViewCommonHeader.vue'
import { useQuasar } from 'quasar'
import { MarketAssistantSchema } from 'src/utils/types'
import { Validator } from '@cfworker/json-schema'
import { caselessIncludes, pageFhStyle } from 'src/utils/functions'
import AAvatar from 'src/components/AAvatar.vue'
import { useAssistantsStore } from 'src/stores/assistants'
import { AssistantDefaultPrompt } from 'src/utils/templates'
import { defaultModelSettings } from 'src/utils/db'
import SelectWorkspaceDialog from 'src/components/SelectWorkspaceDialog.vue'

defineEmits(['toggle-drawer'])

const query = ref('')
const list = reactive([])

const filterList = computed(() =>
  query.value
    ? list.filter(item => caselessIncludes(item.name, query.value) || caselessIncludes(item.description, query.value))
    : list
)

const $q = useQuasar()
const loading = ref(false)
function load() {
  loading.value = true
  fetch('/assistants.json')
    .then(res => res.json())
    .then(data => {
      list.push(...data)
    }).catch(err => {
      console.error(err)
      $q.notify({
        message: '加载助手列表失败',
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

const store = useAssistantsStore()

function addToGlobal(item) {
  add(item, '$root')
}
function addToWorkspace(item) {
  $q.dialog({
    component: SelectWorkspaceDialog,
    componentProps: {
      accept: 'workspace'
    }
  }).onOk(selected => {
    add(item, selected)
  })
}
function add(item, workspaceId) {
  if (!new Validator(MarketAssistantSchema).validate(item).valid) {
    $q.notify({
      message: '助手数据格式错误',
      color: 'negative'
    })
    return
  }
  const { name, avatar, prompt, promptVars, promptTemplate, model, modelSettings, author, homepage, description } = toRaw(item)
  store.add({
    name,
    avatar,
    prompt,
    promptVars: promptVars ?? [],
    promptTemplate: promptTemplate ?? AssistantDefaultPrompt,
    workspaceId,
    model,
    modelSettings: modelSettings ?? { ...defaultModelSettings },
    author,
    homepage,
    description
  }).then(() => {
    $q.notify({
      message: '已添加'
    })
  }).catch(err => {
    console.error(err)
    $q.notify({
      message: '添加失败',
      color: 'negative'
    })
  })
}

const fileInput = ref<HTMLInputElement>()
async function onFileInput() {
  const file = fileInput.value.files[0]
  addToGlobal(JSON.parse(await file.text()))
}

async function clipboardImport() {
  try {
    const text = await navigator.clipboard.readText()
    addToGlobal(JSON.parse(text))
  } catch (err) {
    $q.notify({
      message: '导入失败',
      color: 'negative'
    })
  }
}
</script>
