<template>
  <q-expansion-item
    v-if="item.type === 'folder'"
    :label="item.name"
    :content-inset-level="0.5"
    item-rd
    :header-class="[{ 'route-active': item.id === selected }, 'py-1.5 min-h-0']"
    @update:model-value="accept === 'folder' && (selected = item.id)"
    v-model="expanded"
  >
    <template #header>
      <q-item-section
        avatar
        min-w-0
      >
        <a-avatar
          size="32px"
          :avatar="item.avatar"
        />
      </q-item-section>
      <q-item-section>
        {{ item.name }}
      </q-item-section>
      <q-menu context-menu>
        <q-list style="min-width: 100px">
          <menu-item
            icon="sym_o_edit"
            :label="$t('workspaceListItem.rename')"
            @click="renameItem(item)"
          />
          <menu-item
            icon="sym_o_interests"
            :label="$t('workspaceListItem.changeIcon')"
            @click="changeAvatar(item)"
          />
          <menu-item
            icon="sym_o_add"
            :label="$t('workspaceListItem.newWorkspace')"
            @click="addWorkspace(item.id)"
          />
          <menu-item
            icon="sym_o_create_new_folder"
            :label="$t('workspaceListItem.newFolder')"
            @click="addFolder(item.id)"
          />
          <menu-item
            icon="sym_o_move_item"
            :label="$t('workspaceListItem.moveTo')"
            @click="moveItem(item, [item.id])"
          />
          <menu-item
            icon="sym_o_delete"
            :label="$t('workspaceListItem.delete')"
            @click="deleteItem(item)"
            hover:text-err
          />
        </q-list>
      </q-menu>
    </template>
    <template #default>
      <workspace-list-item
        v-for="child in children"
        :key="child.id"
        :item="child"
        :accept
        v-model:selected="selected"
        mx-0
      />
    </template>
  </q-expansion-item>

  <q-item
    v-else-if="accept === 'workspace'"
    clickable
    @click="selected = item.id"
    :class="{ 'route-active': item.id === selected }"
    item-rd
    py-1.5
    min-h-0
  >
    <q-item-section
      avatar
      min-w-0
    >
      <a-avatar
        size="32px"
        :avatar="item.avatar"
      />
    </q-item-section>
    <q-item-section>{{ item.name }}</q-item-section>
    <q-menu context-menu>
      <q-list style="min-width: 100px">
        <menu-item
          icon="sym_o_edit"
          :label="$t('workspaceListItem.rename')"
          @click="renameItem(item)"
        />
        <menu-item
          icon="sym_o_interests"
          :label="$t('workspaceListItem.changeIcon')"
          @click="changeAvatar(item)"
        />
        <menu-item
          icon="sym_o_move_item"
          :label="$t('workspaceListItem.moveTo')"
          @click="moveItem(item)"
        />
        <menu-item
          icon="sym_o_delete"
          :label="$t('workspaceListItem.delete')"
          @click="deleteItem(item)"
          hover:text-err
        />
      </q-list>
    </q-menu>
  </q-item>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useWorkspacesStore } from 'src/stores/workspaces'
import { Folder, Workspace } from 'src/utils/types'
import AAvatar from './AAvatar.vue'
import { useWorkspaceActions } from 'src/composables/workspace-actions'
import MenuItem from './MenuItem.vue'

const props = defineProps<{
  item: Workspace | Folder
  accept: 'workspace' | 'folder'
}>()
const workspacesStore = useWorkspacesStore()

const { addWorkspace, addFolder, renameItem, moveItem, deleteItem, changeAvatar } = useWorkspaceActions()

const children = computed(() => {
  return workspacesStore.workspaces.filter(item => item.parentId === props.item.id)
})

const selected = defineModel<string>('selected')
const expanded = ref(false)
watch(selected, () => {
  if (children.value.some(c => c.id === selected.value)) {
    expanded.value = true
  }
}, { immediate: true })

</script>
