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
      <q-item-section>[$t('workspaceListSelect.root')]</q-item-section>
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

defineProps<{
  accept: 'workspace' | 'folder'
}>()

const workspacesStore = useWorkspacesStore()

const rootItems = computed(() => workspacesStore.workspaces.filter(item => item.parentId === '$root'))

const selected = defineModel<string>()
</script>
