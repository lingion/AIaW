<template>
  <q-menu
    context-menu
  >
    <q-list style="min-width: 100px">
      <menu-item
        v-if="artifact.open"
        icon="sym_o_save"
        :label="$t('artifactItemMenu.save')"
        :disable="!artifactUnsaved(artifact)"
        @click="saveItem(artifact)"
      />
      <menu-item
        icon="sym_o_edit"
        :label="$t('artifactItemMenu.rename')"
        @click="renameItem(artifact)"
      />
      <menu-item
        icon="sym_o_move_item"
        :label="$t('artifactItemMenu.moveTo')"
        @click="moveItem(artifact)"
      />
      <menu-item
        icon="sym_o_download"
        :label="$t('artifactItemMenu.download')"
        @click="downloadItem(artifact)"
      />
      <menu-item
        icon="sym_o_delete"
        :label="$t('artifactItemMenu.delete')"
        @click="deleteItem(artifact)"
        hover:text-err
      />
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { dialogOptions } from 'src/utils/values'
import MenuItem from './MenuItem.vue'
import SelectWorkspaceDialog from './SelectWorkspaceDialog.vue'
import { Artifact } from 'src/utils/types'
import { db } from 'src/utils/db'
import { artifactUnsaved, saveArtifactChanges } from 'src/utils/functions'
import { useI18n } from 'vue-i18n'
import { exportFile } from 'src/utils/platform-api'

const $q = useQuasar()
const { t } = useI18n()

defineProps<{
  artifact: Artifact
}>()

function renameItem({ id, name }) {
  $q.dialog({
    title: t('artifactItemMenu.rename'),
    prompt: {
      model: name,
      type: 'text',
      label: t('artifactItemMenu.rename'),
      isValid: v => v.trim() && v !== name
    },
    cancel: true,
    ...dialogOptions
  }).onOk(newName => {
    db.artifacts.update(id, { name: newName.trim() })
  })
}
function moveItem({ id }) {
  $q.dialog({
    component: SelectWorkspaceDialog,
    componentProps: {
      accept: 'workspace'
    }
  }).onOk(workspaceId => {
    db.artifacts.update(id, { workspaceId })
  })
}
function downloadItem({ name, versions, currIndex }) {
  exportFile(name, versions[currIndex].text)
}
function deleteItem({ id, name }) {
  $q.dialog({
    title: t('artifactItemMenu.deleteConfirmTitle'),
    message: t('artifactItemMenu.deleteConfirmMessage', { name }),
    cancel: true,
    ok: {
      label: t('artifactItemMenu.deleteConfirmOk'),
      color: 'err',
      flat: true
    },
    ...dialogOptions
  }).onOk(() => {
    db.artifacts.delete(id)
  })
}
function saveItem(artifact: Artifact) {
  db.artifacts.update(artifact.id, saveArtifactChanges(artifact))
}
</script>

<style scoped>

</style>
