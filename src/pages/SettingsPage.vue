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
        设置
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page-container>
    <q-page :style-fn="pageFhStyle">
      <q-list
        pb-2
        max-w="1000px"
        mx-a
      >
        <q-item-label
          header
          id="custom-provider"
        >
          自定义服务商
        </q-item-label>
        <provider-input-items v-model="perfs.provider" />
        <q-item>
          <q-item-section>
            <q-item-label>分享链接</q-item-label>
            <q-item-label caption>
              用于分享你的服务商设置。其他人打开链接后，会自动应用此设置
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <copy-btn
              label="复制链接"
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
          当前未配置自定义服务商，将默认使用我们提供的模型服务。详见<router-link
            pri-link
            to="/account"
          >
            账号
          </router-link>页面
        </q-item-label>
        <q-separator spaced />
        <q-item-label
          header
          id="default-model"
        >
          默认模型
        </q-item-label>
        <model-input-items v-model="perfs.model" />
        <q-separator spaced />
        <q-item-label
          header
          id="system-assistant"
        >
          系统助手
        </q-item-label>
        <provider-input-items v-model="perfs.systemProvider" />
        <model-input-items v-model="perfs.systemModel" />
        <q-item>
          <q-item-section>
            <q-item-label>自动总结对话标题</q-item-label>
            <q-item-label caption>
              在第一轮对话结束时，自动总结标题
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.autoGenTitle" />
          </q-item-section>
        </q-item>
        <q-item-label
          caption
          p="x-4 y-2"
          text-on-sur-var
        >
          用于总结对话标题。如果留空，则使用默认服务商设置
        </q-item-label>
        <q-separator spaced />
        <q-item-label
          header
          id="operation"
        >
          操作
        </q-item-label>
        <q-item>
          <q-item-section>发送消息快捷键</q-item-section>
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
        <q-item>
          <q-item-section>
            <q-item-label>
              消息引用按钮
            </q-item-label>
            <q-item-label caption>
              用鼠标选中消息文本时，显示引用按钮
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.messageQuoteBtn" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              代码粘贴优化
            </q-item-label>
            <q-item-label caption>
              粘贴从 VSCode 复制的代码时，自动用 markdown 代码块包裹
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.codePasteOptimize" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              快速滚动按钮
            </q-item-label>
            <q-item-label caption>
              在对话右下角显示快速滚动按钮。关闭后，你仍然可以使用键盘快捷键滚动
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
        <q-item
          clickable
          v-ripple
          to="/shortcut-keys"
        >
          <q-item-section>键盘快捷键</q-item-section>
          <q-item-section side>
            <q-icon name="sym_o_chevron_right" />
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item-label
          header
          id="ui"
        >
          界面
        </q-item-label>
        <q-item>
          <q-item-section avatar>
            <q-icon name="sym_o_dark_mode" />
          </q-item-section>
          <q-item-section>外观</q-item-section>
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
          <q-item-section>主题色</q-item-section>
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
          <q-item-section>用户头像</q-item-section>
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
              常用模型
            </q-item-label>
            <q-item-label caption>
              用于在对话中快速切换模型
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
        <q-separator spaced />
        <q-item
          clickable
          v-ripple
          @click="restoreSettings"
        >
          <q-item-section avatar>
            <q-icon name="sym_o_restore" />
          </q-item-section>
          <q-item-section>恢复默认设置</q-item-section>
          <q-item-section side>
            <q-icon name="sym_o_chevron_right" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import HctPreviewCircle from 'src/components/HctPreviewCircle.vue'
import HueSliderDialog from 'src/components/HueSliderDialog.vue'
import { computed, ref } from 'vue'
import { useUiStateStore } from 'src/stores/ui-state'
import { modelOptions } from 'src/utils/values'
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

const uiStateStore = useUiStateStore()
const { perfs, restore } = useUserPerfsStore()
const darkModeOptions = computed(() => [
  { label: '跟随系统', value: 'auto' },
  { label: '浅色', value: false },
  { label: '深色', value: true }
])

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
    title: '恢复默认设置',
    message: '确定将所有本地设置恢复默认？',
    cancel: true
  }).onOk(() => { restore() })
}
const providerLink = computed(() => {
  const provider = encodeURIComponent(JSON.stringify(perfs.provider))
  return `${location.origin}/set-provider?provider=${provider}`
})
const user = DexieDBURL ? useObservable(db.cloud.currentUser) : null
const { filteredOptions, filterFn } = useFilterOptions(modelOptions)

useLocateId(ref(true))
</script>
