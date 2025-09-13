<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card style="width: min(90vw, 500px)">
      <a-tip
        tip-key="mcp-stdio-platform"
        v-if="!IsTauri"
      >
        {{ $t('addMcpPluginDialog.stdioPlatformTip') }}
      </a-tip>
      <q-card-section p-0>
        <q-tabs
          v-model="type"
          dense
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab
            v-if="IsTauri"
            name="stdio"
            label="STDIO"
          />
          <q-tab
            name="http"
            label="HTTP"
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
                    {{ $t('addMcpPluginDialog.pluginName') }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ $t('addMcpPluginDialog.pluginNameCaption') }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <a-input
                    v-model="title"
                    dense
                    class="w-150px"
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>
                    {{ $t('addMcpPluginDialog.command') }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ $t('addMcpPluginDialog.commandCaption') }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <a-input
                    v-model="options.stdio.command"
                    dense
                    class="w-200px"
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>
                    {{ $t('addMcpPluginDialog.workDir') }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ $t('addMcpPluginDialog.workDirCaption') }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <a-input
                    v-model="options.stdio.cwd"
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
                {{ $t('addMcpPluginDialog.envVars') }}
              </q-item-label>
              <vars-input
                v-model="options.stdio.env"
                :input-props="{
                  dense: true,
                  placeholder: $t('addMcpPluginDialog.inputVarsPlaceholder')
                }"
              />
            </q-list>
          </q-tab-panel>
          <q-tab-panel
            name="http"
            p-0
          >
            <q-list mt-2>
              <q-item>
                <q-item-section>
                  <q-item-label>
                    {{ $t('addMcpPluginDialog.pluginName') }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ $t('addMcpPluginDialog.pluginNameCaption') }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <a-input
                    v-model="title"
                    dense
                    class="w-150px"
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  {{ $t('addMcpPluginDialog.url') }}
                </q-item-section>
                <q-item-section side>
                  <a-input
                    v-model="options.http.url"
                    dense
                  />
                </q-item-section>
              </q-item>
              <q-separator spaced />
              <q-item-label
                header
                py-2
              >
                Headers
              </q-item-label>
              <vars-input
                v-model="options.http.headers"
                :input-props="{
                  dense: true
                }"
                :labels="{
                  addVariable: $t('addMcpPluginDialog.addHeader'),
                  variableName: $t('addMcpPluginDialog.headerName')
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
                    {{ $t('addMcpPluginDialog.pluginName') }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ $t('addMcpPluginDialog.pluginNameCaption') }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <a-input
                    v-model="title"
                    dense
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  {{ $t('addMcpPluginDialog.url') }}
                </q-item-section>
                <q-item-section side>
                  <a-input
                    v-model="options.sse.url"
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
          :label="$t('addMcpPluginDialog.cancel')"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          color="primary"
          :label="$t('addMcpPluginDialog.install')"
          :disable="!keyValue"
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
import { hash53 } from 'src/utils/functions'
import { useI18n } from 'vue-i18n'
import { IsTauri } from 'src/utils/platform-api'
import ATip from './ATip.vue'

const { t } = useI18n()

const type = ref(IsTauri ? 'stdio' : 'http')
const title = ref('')
const options = reactive({
  stdio: {
    command: '',
    cwd: undefined,
    env: {} as Record<string, string>
  },
  sse: {
    url: ''
  },
  http: {
    url: '',
    headers: {} as Record<string, string>
  }
})

const keyValue = computed(() =>
  type.value === 'stdio' ? options.stdio.command
    : type.value === 'sse' ? options.sse.url
      : options.http.url
)

defineEmits([
  ...useDialogPluginComponent.emits
])

const loading = ref(false)
const { install } = useInstallPlugin()
const $q = useQuasar()
function add() {
  loading.value = true
  if (!options.stdio.cwd) delete options.stdio.cwd
  const manifest: McpPluginManifest = {
    id: hash53(keyValue.value),
    title: title.value,
    transport: {
      type: type.value,
      ...toRaw(options[type.value])
    }
  }
  install(manifest).then(() => {
    onDialogOK()
  }).catch(err => {
    console.error(err)
    $q.notify({
      message: `${t('addMcpPluginDialog.installFailed')}: ${err.message}`,
      color: 'negative'
    })
  }).finally(() => {
    loading.value = false
  })
}

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
</script>
