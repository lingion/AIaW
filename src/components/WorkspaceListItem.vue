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
    @click="onItemClick($event)"
    :class="{ 'route-active': item.id === selected }"
    item-rd
    py-1.5
    min-h-0
    @contextmenu.prevent="openMenu"
    @touchstart.passive="onTouchStart"
    @touchend="onTouchEnd"
    @touchmove="onTouchEnd"
    @touchcancel="onTouchEnd"
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
  </q-item>

  <!-- Manual overlay menu — NO q-dialog (Capacitor safe) -->
  <Teleport to="body">
    <div
      v-if="menuOpen"
      class="fixed inset-0"
      style="z-index: 6000; background: rgba(0,0,0,0.45)"
      @click.self="closeMenu"
      @touchstart.self="closeMenu"
    >
      <div
        class="fixed"
        style="top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 6001"
        @click.stop
      >
        <q-card
          style="min-width: 160px"
          class="q-pa-sm"
        >
          <q-list dense>
          <template v-if="item.type === 'folder'">
            <menu-item
              icon="sym_o_edit"
              :label="$t('workspaceListItem.rename')"
              @click="menuAction('rename')"
            />
            <menu-item
              icon="sym_o_interests"
              :label="$t('workspaceListItem.changeIcon')"
              @click="menuAction('changeIcon')"
            />
            <menu-item
              icon="sym_o_add"
              :label="$t('workspaceListItem.newWorkspace')"
              @click="menuAction('addWorkspace')"
            />
            <menu-item
              icon="sym_o_create_new_folder"
              :label="$t('workspaceListItem.newFolder')"
              @click="menuAction('addFolder')"
            />
            <menu-item
              icon="sym_o_move_item"
              :label="$t('workspaceListItem.moveTo')"
              @click="menuAction('move')"
            />
            <menu-item
              icon="sym_o_delete"
              :label="$t('workspaceListItem.delete')"
              @click="menuAction('delete')"
              hover:text-err
            />
          </template>
          <template v-else>
            <menu-item
              icon="sym_o_edit"
              :label="$t('workspaceListItem.rename')"
              @click="menuAction('rename')"
            />
            <menu-item
              icon="sym_o_interests"
              :label="$t('workspaceListItem.changeIcon')"
              @click="menuAction('changeIcon')"
            />
            <menu-item
              icon="sym_o_move_item"
              :label="$t('workspaceListItem.moveTo')"
              @click="menuAction('move')"
            />
            <menu-item
              icon="sym_o_delete"
              :label="$t('workspaceListItem.delete')"
              @click="menuAction('delete')"
              hover:text-err
            />
          </template>
        </q-list>
        </q-card>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useWorkspacesStore } from 'src/stores/workspaces'
import { Folder, Workspace } from 'src/utils/types'
import AAvatar from './AAvatar.vue'
import MenuItem from './MenuItem.vue'
import { useWorkspaceActions } from 'src/composables/workspace-actions'
import { idTimestamp } from 'src/utils/functions'

const props = defineProps<{
  item: Workspace | Folder
  accept: 'workspace' | 'folder'
}>()
const workspacesStore = useWorkspacesStore()

const { addWorkspace, addFolder, renameItem, moveItem, deleteItem, changeAvatar } = useWorkspaceActions()

function itemActivityTs(id: string): number {
  const item = workspacesStore.workspaces.find(w => w.id === id)
  if (!item) return 0
  const ownTs = item.type === 'workspace' && item.lastDialogId ? idTimestamp(item.lastDialogId) : idTimestamp(item.id)
  const childTs = workspacesStore.workspaces
    .filter(w => w.parentId === id)
    .reduce((max, child) => Math.max(max, itemActivityTs(child.id)), 0)
  return Math.max(ownTs, childTs)
}

const children = computed(() => {
  return workspacesStore.workspaces
    .filter(item => item.parentId === props.item.id)
    .sort((a, b) => itemActivityTs(b.id) - itemActivityTs(a.id))
})

const selected = defineModel<string>('selected')
const expanded = ref(false)
watch(selected, () => {
  if (children.value.some(c => c.id === selected.value)) {
    expanded.value = true
  }
}, { immediate: true })

// --- Long press context menu (manual overlay, no q-dialog) ---
const menuOpen = ref(false)
let longPressTimer: ReturnType<typeof setTimeout> | null = null
const longPressFired = ref(false)

function openMenu() {
  menuOpen.value = true
}
function closeMenu() {
  menuOpen.value = false
  longPressFired.value = false
}

function onTouchStart() {
  longPressFired.value = false
  onTouchEnd()
  longPressTimer = setTimeout(() => {
    longPressFired.value = true
    menuOpen.value = true
    longPressTimer = null
  }, 500)
}

function onTouchEnd() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
}

function onItemClick(event: MouseEvent) {
  if (longPressFired.value) {
    longPressFired.value = false
    return
  }
  selected.value = props.item.id
}

function menuAction(action: string) {
  menuOpen.value = false
  longPressFired.value = false
  setTimeout(() => {
    switch (action) {
      case 'rename': renameItem(props.item); break
      case 'changeIcon': changeAvatar(props.item); break
      case 'addWorkspace': addWorkspace(props.item.id); break
      case 'addFolder': addFolder(props.item.id); break
      case 'move': moveItem(props.item); break
      case 'delete': deleteItem(props.item); break
    }
  }, 50)
}
</script>
