<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card class="select-workspace-dialog-card">
      <q-card-section>
        <div class="text-h6">
          {{ accept === 'workspace' ? $t('selectWorkspaceDialog.selectWorkspace') : $t('selectWorkspaceDialog.selectFolder') }}
        </div>
      </q-card-section>
      <q-card-section class="select-workspace-dialog-card__body" p-0>
        <workspace-list-select
          v-model="selected"
          :accept
        />
      </q-card-section>
      <q-card-actions class="select-workspace-dialog-card__actions" align="right">
        <q-btn
          flat
          color="primary"
          :label="$t('selectWorkspaceDialog.cancel')"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          color="primary"
          :label="$t('selectWorkspaceDialog.confirm')"
          :disable="!selected || exclude?.includes(selected)"
          @click="onDialogOK(selected)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'
import WorkspaceListSelect from './WorkspaceListSelect.vue'

defineProps<{
  accept: 'workspace' | 'folder',
  exclude?: string[]
}>()

defineEmits([
  ...useDialogPluginComponent.emits
])

const selected = ref<string>()

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
</script>

<style scoped>
.select-workspace-dialog-card {
  width: min(560px, 92vw);
  max-width: 92vw;
  max-height: min(80vh, 720px);
  display: flex;
  flex-direction: column;
}

.select-workspace-dialog-card__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.select-workspace-dialog-card__actions {
  flex: 0 0 auto;
  border-top: 1px solid color-mix(in srgb, var(--a-out-var) 35%, transparent);
  background-color: inherit;
}
</style>
