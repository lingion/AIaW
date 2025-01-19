<template>
  <q-menu
    context-menu
  >
    <q-list style="min-width: 100px">
      <menu-item
        v-if="artifact.open"
        icon="sym_o_save"
        label="保存"
        :disable="!artifactUnsaved(artifact)"
        @click="saveItem(artifact)"
      />
      <menu-item
        icon="sym_o_edit"
        label="重命名"
        @click="renameItem(artifact)"
      />
      <menu-item
        icon="sym_o_move_item"
        label="移动至"
        @click="moveItem(artifact)"
      />
      <menu-item
        icon="sym_o_download"
        label="下载"
        @click="downloadItem(artifact)"
      />
      <menu-item
        icon="sym_o_delete"
        label="删除"
        @click="deleteItem(artifact)"
        hover:text-err
      />
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import { exportFile, useQuasar } from 'quasar'
import { dialogOptions } from 'src/utils/values'
import MenuItem from './MenuItem.vue'
import SelectWorkspaceDialog from './SelectWorkspaceDialog.vue'
import { Artifact } from 'src/utils/types'
import { db } from 'src/utils/db'
import { artifactUnsaved, saveArtifactChanges } from 'src/utils/functions'

const $q = useQuasar()

defineProps<{
  artifact: Artifact
}>()

function renameItem({ id, name }) {
  $q.dialog({
    title: '重命名',
    prompt: {
      model: name,
      type: 'text',
      label: '名称',
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
    title: '删除 Artifact',
    message: `确定要删除 Artifact「${name}」吗？`,
    cancel: true,
    ok: {
      label: '删除',
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
