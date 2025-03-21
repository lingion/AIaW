<template>
  <view-common-header
    @toggle-drawer="$emit('toggle-drawer')"
    back-to="."
  >
    <q-toolbar-title>
      {{ $t('shortcutKeysPage.keyboardShortcuts') }}
    </q-toolbar-title>
  </view-common-header>
  <q-page-container>
    <q-page :style-fn="pageFhStyle">
      <q-list
        py-2
        max-w="1000px"
        mx-a
      >
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.enableKeyboardShortcuts') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <platform-enabled-input
              v-model="perfs.enableShortcutKey"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item-label header>
          {{ $t('shortcutKeysPage.dialogPage') }}
        </q-item-label>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.scrollUp') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <shortcut-key-input
              v-model="perfs.scrollUpKeyV2"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.scrollDown') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <shortcut-key-input
              v-model="perfs.scrollDownKeyV2"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.scrollToTop') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <shortcut-key-input
              v-model="perfs.scrollTopKey"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.scrollToBottom') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <shortcut-key-input
              v-model="perfs.scrollBottomKey"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.switchToPreviousThread') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <shortcut-key-input
              v-model="perfs.switchPrevKeyV2"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.switchToNextThread') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <shortcut-key-input
              v-model="perfs.switchNextKeyV2"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.switchToFirstThread') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <shortcut-key-input
              v-model="perfs.switchFirstKey"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.switchToLastThread') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <shortcut-key-input
              v-model="perfs.switchLastKey"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.regenerateAssistantMessage') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <shortcut-key-input
              v-model="perfs.regenerateCurrKey"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.editUserMessage') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <shortcut-key-input
              v-model="perfs.editCurrKey"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.focusInputBox') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <shortcut-key-input
              v-model="perfs.focusDialogInputKey"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item-label header>
          {{ $t('shortcutKeysPage.dialogList') }}
        </q-item-label>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.newDialog') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <shortcut-key-input
              v-model="perfs.createDialogKey"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item-label header>
          {{ $t('shortcutKeysPage.editArtifacts') }}
        </q-item-label>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('shortcutKeysPage.saveArtifact') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <shortcut-key-input
              v-model="perfs.saveArtifactKey"
              v-bind="inputProps"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { pageFhStyle } from 'src/utils/functions'
import ShortcutKeyInput from 'src/components/ShortcutKeyInput.vue'
import PlatformEnabledInput from 'src/components/PlatformEnabledInput.vue'
import ViewCommonHeader from 'src/components/ViewCommonHeader.vue'

const { perfs } = useUserPerfsStore()

defineEmits(['toggle-drawer'])

const inputProps = {
  dense: true,
  filled: true,
  class: 'min-w-150px'
}
</script>
