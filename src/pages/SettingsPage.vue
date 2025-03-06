<template>
  <q-header
    bg-sur-c-low
    text-on-sur
  >
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="sym_o_menu"
        @click="uiStateStore.mainDrawerOpen = !uiStateStore.mainDrawerOpen"
      />
      <q-toolbar-title>
        {{ $t('settingsPage.title') }}
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page-container>
    <q-page :style-fn="pageFhStyle">
      <q-list
        pb-4
        max-w="1000px"
        mx-a
      >
        <a-tip
          tip-key="configure-multiple-providers"
          long
          m-2
        >
          {{ $t('settingsPage.multipleProvidersTip') }}
        </a-tip>
        <q-item-label
          header
          id="custom-provider"
        >
          {{ $t('settingsPage.customProviderHeader') }}
        </q-item-label>
        <provider-input-items v-model="perfs.provider" />
        <q-item v-if="perfs.provider">
          <q-item-section>
            <q-item-label>{{ $t('settingsPage.shareLinkLabel') }}</q-item-label>
            <q-item-label caption>
              {{ $t('settingsPage.shareLinkCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <copy-btn
              :label="$t('settingsPage.copyLinkLabel')"
              :value="providerLink"
              flat
              text-pri
            />
          </q-item-section>
        </q-item>
        <q-item-label
          caption
          p="x-4 y-2"
          text-on-sur-var
          v-if="!perfs.provider && user?.isLoggedIn && LitellmBaseURL"
        >
          {{ $t('settingsPage.noProviderConfigured') }}
          <router-link
            pri-link
            to="/account"
          >
            {{ $t('settingsPage.accountPage') }}
          </router-link>
          {{ $t('settingsPage.pageSuffix') }}
        </q-item-label>
        <q-separator spaced />
        <q-item-label
          header
          id="default-model"
        >
          {{ $t('settingsPage.defaultModelHeader') }}
        </q-item-label>
        <model-input-items v-model="perfs.model" />
        <q-separator spaced />
        <q-item-label
          header
          id="system-assistant"
        >
          {{ $t('settingsPage.systemAssistantHeader') }}
        </q-item-label>
        <provider-input-items v-model="perfs.systemProvider" />
        <model-input-items v-model="perfs.systemModel" />
        <q-item-label
          caption
          p="x-4 y-2"
          text-on-sur-var
        >
          {{ $t('settingsPage.systemAssistantCaption') }}
        </q-item-label>
        <q-separator spaced />
        <q-item-label
          header
          id="feature"
        >
          {{ $t('settingsPage.featureHeader') }}
        </q-item-label>
        <q-item>
          <q-item-section>
            <q-item-label>{{ $t('settingsPage.autoSummarizeTitle') }}</q-item-label>
            <q-item-label caption>
              {{ $t('settingsPage.autoSummarizeCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.autoGenTitle" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsPage.messageSelectionMenu') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('settingsPage.messageSelectionCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.messageSelectionBtn" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsPage.codePasteOptimize') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('settingsPage.codePasteCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.codePasteOptimize" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsPage.quickScrollButton') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('settingsPage.quickScrollCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <platform-enabled-input
              v-model="perfs.dialogScrollBtn"
              class="min-w-120px"
              dense
              filled
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsPage.autoFocusInput') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <platform-enabled-input
              v-model="perfs.autoFocusDialogInput"
              class="min-w-120px"
              dense
              filled
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsPage.autoLockBottom') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.streamingLockBottom" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsPage.messageContentCatalog') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('settingsPage.messageContentCatalogCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.messageCatalog" />
          </q-item-section>
        </q-item>
        <q-expansion-item :label="$t('settingsPage.artifactsSettings')">
          <q-item>
            <q-item-section>
              <q-item-label>
                {{ $t('settingsPage.enableArtifacts') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <platform-enabled-input
                v-model="perfs.artifactsEnabled"
                class="min-w-120px"
                dense
                filled
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>
                {{ $t('settingsPage.autoExtractArtifact') }}
              </q-item-label>
              <q-item-label caption>
                {{ $t('settingsPage.autoExtractArtifactCaption') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="perfs.artifactsAutoExtract" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              {{ $t('settingsPage.reserveOriginalArtifact') }}
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="perfs.artifactsReserveOriginal" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              {{ $t('settingsPage.autoNameArtifact') }}
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="perfs.artifactsAutoName" />
            </q-item-section>
          </q-item>
        </q-expansion-item>
        <q-separator spaced />
        <q-item-label
          header
          id="operation"
        >
          {{ $t('settingsPage.operationHeader') }}
        </q-item-label>
        <q-item>
          <q-item-section>{{ $t('settingsPage.sendKeyShortcut') }}</q-item-section>
          <q-item-section side>
            <q-select
              class="w-150px"
              v-model="perfs.sendKey"
              :options="[{ label: 'Ctrl + Enter', value: 'ctrl+enter' }, { label: 'Shift + Enter', value: 'shift+enter' }, { label: 'Enter', value: 'enter' }]"
              filled
              dense
              emit-value
              map-options
            />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          to="/shortcut-keys"
        >
          <q-item-section>{{ $t('settingsPage.keyboardShortcuts') }}</q-item-section>
          <q-item-section side>
            <q-icon name="sym_o_chevron_right" />
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item-label
          header
          id="ui"
        >
          {{ $t('settingsPage.uiHeader') }}
        </q-item-label>
        <q-item>
          <q-item-section avatar>
            <q-icon name="sym_o_dark_mode" />
          </q-item-section>
          <q-item-section>{{ $t('settingsPage.appearance') }}</q-item-section>
          <q-item-section side>
            <q-select
              class="min-w-120px"
              filled
              dense
              :options="darkModeOptions"
              v-model="perfs.darkMode"
              emit-value
              map-options
            />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="pickThemeHue"
        >
          <q-item-section avatar>
            <q-icon name="sym_o_palette" />
          </q-item-section>
          <q-item-section>{{ $t('settingsPage.themeColor') }}</q-item-section>
          <q-item-section side>
            <hct-preview-circle
              :hue="perfs.themeHue"
              :size="40"
            />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="pickUserAvatar"
        >
          <q-item-section avatar>
            <q-icon name="sym_o_account_circle" />
          </q-item-section>
          <q-item-section>{{ $t('settingsPage.userAvatar') }}</q-item-section>
          <q-item-section
            side
            text-on-sur
          >
            <a-avatar :avatar="perfs.userAvatar" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section
            avatar
            v-if="$q.screen.gt.xs"
          >
            <q-icon name="sym_o_neurology" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsPage.commonModels') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('settingsPage.commonModelsCaption') }}<a
                v-if="provider?.type === 'openai'"
                pri-link
                href="javascript:void(0)"
                @click="getModelList"
              >
                {{ $t('settingsPage.getModelList') }}
              </a>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              class="xs:w-250px md:w-350px"
              v-model="perfs.commonModelOptions"
              use-input
              use-chips
              multiple
              new-value-mode="add-unique"
              hide-dropdown-icon
              :input-debounce="0"
              filled
              dense
              :options="filteredOptions"
              @filter="filterFn"
            >
              <template #option="{ opt, selected, itemProps }">
                <model-item
                  :model="opt"
                  :selected
                  v-bind="itemProps"
                />
              </template>
            </q-select>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="sym_o_report" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsPage.showWarnings') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('settingsPage.showWarningsCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.showWarnings" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="sym_o_language" />
          </q-item-section>
          <q-item-section>{{ $t('settingsPage.language') }}</q-item-section>
          <q-item-section side>
            <q-select
              filled
              dense
              :options="langOptions"
              v-model="localData.language"
              emit-value
              map-options
              class="w-120px"
            />
          </q-item-section>
        </q-item>
        <q-expansion-item
          :label="$t('settingsPage.markdownRendering')"
          icon="sym_o_markdown"
          :content-inset-level="1"
        >
          <q-item>
            <q-item-section>
              <q-item-label>
                {{ $t('settingsPage.theme') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                :options="mdPreviewThemes"
                v-model="perfs.mdPreviewTheme"
                dense
                filled
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              {{ $t('settingsPage.codeTheme') }}
            </q-item-section>
            <q-item-section side>
              <q-select
                :options="mdCodeThemes"
                v-model="perfs.mdCodeTheme"
                dense
                filled
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              {{ $t('settingsPage.disableMermaid') }}
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="perfs.mdNoMermaid" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>
                {{ $t('settingsPage.codeAutoFoldThreshold') }}
              </q-item-label>
              <q-item-label caption>
                {{ $t('settingsPage.codeAutoFoldThresholdCaption') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-input
                type="number"
                v-model.number="perfs.mdAutoFoldThreshold"
                dense
                filled
                class="w-120px"
                clearable
              />
            </q-item-section>
          </q-item>
        </q-expansion-item>
        <q-separator spaced />
        <q-item-label
          header
          id="ui"
        >
          {{ $t('settingsPage.dataHeader') }}
        </q-item-label>
        <q-item>
          <q-item-section avatar>
            <q-icon name="sym_o_database" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('settingsPage.userData') }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div
              flex
              gap-2
            >
              <q-btn
                :label="$t('settingsPage.export')"
                @click="exportData"
                unelevated
                bg-sec-c
                text-on-sec-c
              />
              <q-btn
                :label="$t('settingsPage.import')"
                unelevated
                bg-sec-c
                text-on-sec-c
                @click="importData"
              />
            </div>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="restoreSettings"
        >
          <q-item-section avatar>
            <q-icon name="sym_o_restore" />
          </q-item-section>
          <q-item-section>{{ $t('settingsPage.restoreDefaultSettings') }}</q-item-section>
          <q-item-section side>
            <q-icon name="sym_o_chevron_right" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { exportFile, useQuasar } from 'quasar'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import HctPreviewCircle from 'src/components/HctPreviewCircle.vue'
import HueSliderDialog from 'src/components/HueSliderDialog.vue'
import { computed, ref } from 'vue'
import { useUiStateStore } from 'src/stores/ui-state'
import { dialogOptions, mdCodeThemes, mdPreviewThemes, modelOptions } from 'src/utils/values'
import CopyBtn from 'src/components/CopyBtn.vue'
import AAvatar from 'src/components/AAvatar.vue'
import PickAvatarDialog from 'src/components/PickAvatarDialog.vue'
import { useFilterOptions } from 'src/composables/filter-options'
import ModelItem from 'src/components/ModelItem.vue'
import ModelInputItems from 'src/components/ModelInputItems.vue'
import { useObservable } from '@vueuse/rxjs'
import { db } from 'src/utils/db'
import ProviderInputItems from 'src/components/ProviderInputItems.vue'
import { useLocateId } from 'src/composables/locate-id'
import { pageFhStyle } from 'src/utils/functions'
import { DexieDBURL, LitellmBaseURL } from 'src/utils/config'
import PlatformEnabledInput from 'src/components/PlatformEnabledInput.vue'
import { useModel } from 'src/composables/model'
import { exportDB } from 'dexie-export-import'
import ImportDataDialog from 'src/components/ImportDataDialog.vue'
import { useI18n } from 'vue-i18n'
import { localData } from 'src/utils/local-data'
import { fetch, PublicOrigin } from 'src/utils/platform-api'
import ATip from 'src/components/ATip.vue'

const { t } = useI18n()

const uiStateStore = useUiStateStore()
const { perfs, restore } = useUserPerfsStore()
const darkModeOptions = [
  { label: t('settingsPage.followSystem'), value: 'auto' },
  { label: t('settingsPage.light'), value: false },
  { label: t('settingsPage.dark'), value: true }
]

const $q = useQuasar()
function pickThemeHue() {
  $q.dialog({
    component: HueSliderDialog,
    componentProps: { value: perfs.themeHue }
  }).onOk(hue => { perfs.themeHue = hue })
}
function pickUserAvatar() {
  $q.dialog({
    component: PickAvatarDialog,
    componentProps: { model: perfs.userAvatar, defaultTab: 'text' }
  }).onOk(avatar => { perfs.userAvatar = avatar })
}
function restoreSettings() {
  $q.dialog({
    title: t('settingsPage.restoreDefaultSettings'),
    message: t('settingsPage.restoreSettingsConfirmation'),
    cancel: true,
    ...dialogOptions
  }).onOk(() => { restore() })
}
const providerLink = computed(() => {
  const provider = encodeURIComponent(JSON.stringify(perfs.provider))
  return `${PublicOrigin}/set-provider?provider=${provider}`
})
const user = DexieDBURL ? useObservable(db.cloud.currentUser) : null
const { filteredOptions, filterFn } = useFilterOptions(modelOptions)

const { provider } = useModel(ref(), ref())
function getModelList() {
  fetch(`${provider.value.settings.baseURL}/models`, {
    headers: {
      Authorization: `Bearer ${provider.value.settings.apiKey}`
    }
  }).then(res => res.json()).then(({ data }) => {
    const models = data.map(m => m.id).sort()
    $q.dialog({
      title: t('settingsPage.selectCommonModels'),
      options: {
        type: 'checkbox',
        model: models.filter(m => perfs.commonModelOptions.includes(m)),
        items: models.map(m => ({ label: m, value: m }))
      },
      cancel: true,
      ...dialogOptions
    }).onOk(val => {
      perfs.commonModelOptions = val
    })
  }).catch(err => {
    console.error(err)
    $q.notify({
      message: t('settingsPage.getModelListFailed'),
      color: 'negative'
    })
  })
}

function exportData() {
  exportDB(db).then(blob => {
    exportFile('aiaw_user_db.json', blob)
  }).catch(err => {
    console.error(err)
    $q.notify({
      message: t('settingsPage.exportFailed'),
      color: 'negative'
    })
  })
}
function importData() {
  $q.dialog({
    component: ImportDataDialog
  })
}
const langOptions = [
  { label: t('settingsPage.auto'), value: null },
  { label: 'English', value: 'en-US' },
  { label: '简体中文', value: 'zh-CN' },
  { label: '繁體中文', value: 'zh-TW' }
]

useLocateId(ref(true))
</script>
