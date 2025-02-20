<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card style="width: min(90vw, 500px)">
      <q-card-section p-0>
        <q-tabs
          v-model="type"
          dense
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab
            name="stdio"
            label="STDIO"
          />
          <q-tab
            name="sse"
            label="SSE"
          />
        </q-tabs>

        <q-separator />

        <q-tab-panels
          v-model="type"
          animated
        >
          <q-tab-panel
            name="stdio"
            p-0
          >
            <q-list mt-2>
              <q-item>
                <q-item-section>
                  <q-item-label>
                    插件名称
                  </q-item-label>
                  <q-item-label caption>
                    任意名称即可
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-input
                    v-model="title"
                    dense
                    class="w-150px"
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>
                    运行命令
                  </q-item-label>
                  <q-item-label caption>
                    MCP服务端的运行命令
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-input
                    v-model="stdioOptions.command"
                    dense
                    class="w-200px"
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>
                    工作目录
                  </q-item-label>
                  <q-item-label caption>
                    可选
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-input
                    v-model="stdioOptions.cwd"
                    dense
                    class="w-200px"
                  />
                </q-item-section>
              </q-item>
              <q-separator spaced />
              <q-item-label
                header
                py-2
              >
                环境变量
              </q-item-label>
              <vars-input
                v-model="stdioOptions.env"
                :input-props="{
                  dense: true,
                  clearale: true,
                  placeholder:'输入变量值...'
                }"
              />
            </q-list>
          </q-tab-panel>

          <q-tab-panel
            name="sse"
            p-0
          >
            <q-list mt-2>
              <q-item>
                <q-item-section>
                  <q-item-label>
                    插件名称
                  </q-item-label>
                  <q-item-label caption>
                    任意名称即可
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-input
                    v-model="title"
                    dense
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  URL
                </q-item-section>
                <q-item-section side>
                  <q-input
                    v-model="sseOptions.url"
                    dense
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          color="primary"
          label="取消"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          color="primary"
          label="安装"
          :disable="!valid"
          :loading
          @click="add"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { computed, reactive, ref, toRaw } from 'vue'
import VarsInput from 'src/components/VarsInput.vue'
import { useInstallPlugin } from 'src/composables/install-plugin'
import { McpPluginManifest } from 'src/utils/types'
import { genId } from 'src/utils/functions'

const type = ref<'stdio' | 'sse'>('stdio')
const title = ref('')
const stdioOptions = reactive({
  command: '',
  cwd: undefined,
  env: {}
})
const sseOptions = reactive({
  url: ''
})

const valid = computed(() => type.value === 'stdio' ? stdioOptions.command : sseOptions.url)

defineEmits([
  ...useDialogPluginComponent.emits
])

const loading = ref(false)
const { install } = useInstallPlugin()
const $q = useQuasar()
function add() {
  loading.value = true
  if (!stdioOptions.cwd) delete stdioOptions.cwd
  const manifest: McpPluginManifest = {
    id: genId(),
    title: title.value,
    transport: type.value === 'stdio'
      ? { type: 'stdio', ...toRaw(stdioOptions) }
      : { type: 'sse', ...toRaw(sseOptions) }
  }
  install(manifest).then(() => {
    onDialogOK()
  }).catch(err => {
    console.error(err)
    $q.notify({
      message: `安装失败: ${err.message}`,
      color: 'negative'
    })
  }).finally(() => {
    loading.value = false
  })
}

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
</script>
