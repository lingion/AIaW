<template>
  <q-expansion-item
    class="dialogs-expansion"
    :class="{ 'dialogs-expansion--expanded': modelValue }"
    header-class="text-lg py-0"
    expand-icon-class="important:pl-2"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <q-item-section>
        {{ $t('dialogsExpansion.dialogs') }}
      </q-item-section>
      <q-item-section side>
        <q-btn
          flat
          dense
          round
          icon="sym_o_search"
          :title="$t('dialogsExpansion.search')"
          @click.prevent.stop="showSearchDialog = true"
        />
      </q-item-section>
    </template>
    <template #default>
      <div class="dialogs-expansion-content">
        <q-scroll-area class="dialogs-expansion-scroll">
          <dialog-list />
        </q-scroll-area>
      </div>
      <search-dialog
        v-model="showSearchDialog"
        :workspace-id
      />
    </template>
  </q-expansion-item>
</template>

<script setup lang="ts">
import DialogList from './DialogList.vue'
import SearchDialog from './SearchDialog.vue'
import { ref, toRef } from 'vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { useListenKey } from 'src/composables/listen-key'
import { isPlatformEnabled } from 'src/utils/functions'

const props = defineProps<{
  workspaceId: string
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const showSearchDialog = ref(false)

const { perfs } = useUserPerfsStore()
if (isPlatformEnabled(perfs.enableShortcutKey)) {
  useListenKey(toRef(perfs, 'searchDialogKey'), () => {
    showSearchDialog.value = true
  })
}
</script>

<style scoped>
.dialogs-expansion {
  flex: 0 0 auto;
  min-height: auto;
}

.dialogs-expansion--expanded {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
}

.dialogs-expansion--expanded :deep(.q-expansion-item__container) {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.dialogs-expansion--expanded :deep(.q-expansion-item__content) {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.dialogs-expansion-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.dialogs-expansion-scroll {
  height: 100%;
}
</style>
