<template>
  <q-list>
    <q-item
      v-if="accept === 'folder'"
      :class="{ 'route-active': selected === '$root'}"
      clickable
      item-rd
      dense
      @click="selected = '$root'"
    >
      <q-item-section>[{{ $t('workspaceListSelect.root') }}]</q-item-section>
    </q-item>
    <workspace-list-item
      v-for="item in rootItems"
      :key="item.id"
      :item="item"
      :accept
      v-model:selected="selected"
    />
  </q-list>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspacesStore } from 'src/stores/workspaces'
import WorkspaceListItem from './WorkspaceListItem.vue'
import { idTimestamp } from 'src/utils/functions'

defineProps<{
  accept: 'workspace' | 'folder'
}>()

const workspacesStore = useWorkspacesStore()

function itemActivityTs(id: string): number {
  const item = workspacesStore.workspaces.find(w => w.id === id)
  if (!item) return 0
  const ownTs = item.type === 'workspace' && item.lastDialogId ? idTimestamp(item.lastDialogId) : idTimestamp(item.id)
  const childTs = workspacesStore.workspaces
    .filter(w => w.parentId === id)
    .reduce((max, child) => Math.max(max, itemActivityTs(child.id)), 0)
  return Math.max(ownTs, childTs)
}

const rootItems = computed(() => workspacesStore.workspaces
  .filter(item => item.parentId === '$root')
  .sort((a, b) => itemActivityTs(b.id) - itemActivityTs(a.id))
)

const selected = defineModel<string>()
</script>
