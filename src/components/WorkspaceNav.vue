<template>
  <div>
    <workspace-list-select
      :model-value="$route.params.workspaceId as string"
      @update:model-value="goTo($event)"
      accept="workspace"
    />
    <div>
      <q-btn
        ml-2
        mt-1
        color="secondary"
        :label="$t('workspaceNav.workspace')"
        icon="sym_o_add"
        flat
        no-caps
        @click="addWorkspace()"
      />
      <q-btn
        ml-2
        mt-1
        color="secondary"
        :label="$t('workspaceNav.folder')"
        icon="sym_o_create_new_folder"
        flat
        no-caps
        @click="addFolder()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspacesStore } from 'src/stores/workspaces'
import WorkspaceListSelect from './WorkspaceListSelect.vue'
import { useWorkspaceActions } from 'src/composables/workspace-actions'
import { useRouter } from 'vue-router'
import { Workspace } from 'src/utils/types'

const { addWorkspace, addFolder } = useWorkspaceActions()

const workspaceStore = useWorkspacesStore()
const router = useRouter()
function goTo(id: string) {
  const workspace = workspaceStore.workspaces.find(w => w.id === id) as Workspace
  let path = `/workspaces/${workspace.id}`
  if (workspace.lastDialogId) path += `/dialogs/${workspace.lastDialogId}`
  router.push(path)
}
</script>
