<template>
  <view-common-header @toggle-drawer="$emit('toggle-drawer')">
    <q-toolbar-title>
      {{ $t('assistantsMarket.title') }}
    </q-toolbar-title>
    <q-space />
    <q-btn
      flat
      dense
      round
      icon="sym_o_add"
      :title="$t('assistantsMarket.import')"
    >
      <q-menu>
        <q-list>
          <q-item
            clickable
            v-close-popup
            @click="fileInput.click()"
          >
            <q-item-section>
              {{ $t('assistantsMarket.selectFile') }}
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-close-popup
            @click="clipboardImport"
          >
            <q-item-section>
              {{ $t('assistantsMarket.importFromClipboard') }}
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
          :label="$t('assistantsMarket.search')"
          outlined
          v-model="query"
        />
      </div>
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
              :label="$t('assistantsMarket.add')"
            >
              <q-menu>
                <q-list>
                  <q-item
                    clickable
                    v-close-popup
                    @click="addToGlobal(item)"
                  >
                    <q-item-section>
                      {{ $t('assistantsMarket.addToGlobal') }}
                    </q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="addToWorkspace(item)"
                  >
                    <q-item-section>
                      {{ $t('assistantsMarket.addToWorkspace') }}
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
import { useI18n } from 'vue-i18n'
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
import { clipboardReadText } from 'src/utils/platform-api'

const { t } = useI18n()
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
const { locale } = useI18n()
function load() {
  loading.value = true
  fetch(`/assistants/index.${locale.value}.json`)
    .then(res => res.json())
    .then(data => {
      list.push(...data)
    }).catch(err => {
      console.error(err)
      $q.notify({
        message: t('assistantsMarket.loadError'),
        color: 'err-c',
        textColor: 'on-err-c',
        actions: [{
          label: t('assistantsMarket.retry'),
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
      message: t('assistantsMarket.formatError'),
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
      message: t('assistantsMarket.added')
    })
  }).catch(err => {
    console.error(err)
    $q.notify({
      message: t('assistantsMarket.addError'),
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
    const text = await clipboardReadText()
    addToGlobal(JSON.parse(text))
  } catch (err) {
    $q.notify({
      message: t('assistantsMarket.importError'),
      color: 'negative'
    })
  }
}
</script>
