<template>
  <q-list>
    <q-item
      clickable
      @click="addItem"
      text-sec
      item-rd
    >
      <q-item-section
        avatar
        min-w-0
      >
        <q-icon name="sym_o_add_comment" />
      </q-item-section>
      <q-item-section>
        {{ $t('dialogList.createDialog') }}
      </q-item-section>
    </q-item>
    <q-item
      v-for="dialog in sortedDialogs"
      :key="dialog.id"
      clickable
      :to="longPressFired ? undefined : { path: `/workspaces/${workspace.id}/dialogs/${dialog.id}`, query: $route.query }"
      active-class="bg-sec-c text-on-sec-c"
      item-rd
      min-h="40px"
      @click="onItemClick($event, dialog)"
      @contextmenu.prevent="openMenu(dialog)"
      @touchstart.passive="onTouchStart($event, dialog)"
      @touchend="onTouchEnd"
      @touchmove="onTouchEnd"
      @touchcancel="onTouchEnd"
    >
      <q-item-section>
        {{ dialog.name }}
      </q-item-section>
    </q-item>

    <!-- Single dialog-based menu, completely outside the v-for -->
    <q-dialog
      v-model="menuOpen"
      transition-show="none"
      transition-hide="none"
    >
      <q-list
        style="min-width: 160px"
        class="q-pa-sm rounded-borders shadow-2 bg-sur"
      >
        <menu-item
          icon="sym_o_edit"
          :label="$t('dialogList.renameTitle')"
          @click="menuAction('rename')"
        />
        <menu-item
          icon="sym_o_auto_fix"
          :label="$t('dialogList.summarizeDialog')"
          @click="menuAction('summarize')"
        />
        <menu-item
          icon="sym_o_content_copy"
          :label="$t('dialogList.copyContent')"
          @click="menuAction('copyContent')"
        />
        <menu-item
          icon="sym_o_move_item"
          :label="$t('dialogList.moveTo')"
          @click="menuAction('move')"
        />
        <menu-item
          icon="sym_o_delete"
          :label="$t('dialogList.delete')"
          @click="menuAction('delete')"
          hover:text-err
        />
      </q-list>
    </q-dialog>
  </q-list>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { db } from 'src/utils/db'
import { idTimestamp, isPlatformEnabled } from 'src/utils/functions'
import { Dialog, Workspace } from 'src/utils/types'
import { dialogOptions } from 'src/utils/values'
import { computed, inject, ref, Ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SelectWorkspaceDialog from './SelectWorkspaceDialog.vue'
import { useCreateDialog } from 'src/composables/create-dialog'
import MenuItem from './MenuItem.vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { useListenKey } from 'src/composables/listen-key'
import { useLiveQueryWithDeps } from 'src/composables/live-query'

const { t } = useI18n()
const workspace: Ref<Workspace> = inject('workspace')
const dialogs: Ref<Dialog[]> = inject('dialogs')
const dialogMessages = useLiveQueryWithDeps(
  () => dialogs.value.map(d => d.id).join(','),
  async () => {
    const ids = dialogs.value.map(d => d.id)
    return ids.length ? await db.messages.where('dialogId').anyOf(ids).toArray() : []
  },
  { initialValue: [] }
)
const sortedDialogs = computed(() => {
  const latestByDialog: Record<string, number> = {}
  for (const message of dialogMessages.value) {
    latestByDialog[message.dialogId] = Math.max(latestByDialog[message.dialogId] || 0, idTimestamp(message.id))
  }
  return [...dialogs.value].sort((a, b) => {
    const at = Math.max(idTimestamp(a.id), latestByDialog[a.id] || 0)
    const bt = Math.max(idTimestamp(b.id), latestByDialog[b.id] || 0)
    return bt - at
  })
})

const $q = useQuasar()
const { createDialog } = useCreateDialog(workspace)
async function addItem() {
  await createDialog()
}

// --- Context menu via q-dialog (no q-menu, avoids Capacitor backdrop bug) ---
const menuOpen = ref(false)
const activeDialog = ref<Dialog | null>(null)
let longPressTimer: ReturnType<typeof setTimeout> | null = null
const longPressFired = ref(false)

function openMenu(dialog: Dialog) {
  activeDialog.value = dialog
  menuOpen.value = true
}

function onTouchStart(_event: TouchEvent, dialog: Dialog) {
  longPressFired.value = false
  onTouchEnd()
  longPressTimer = setTimeout(() => {
    longPressFired.value = true
    activeDialog.value = dialog
    menuOpen.value = true
    longPressTimer = null
  }, 500)
}

function onTouchEnd() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

// Prevent router navigation when long press just fired
function onItemClick(event: MouseEvent, dialog: Dialog) {
  if (longPressFired.value) {
    event.preventDefault()
    event.stopPropagation()
    longPressFired.value = false
  }
}

// Reset longPressFired when the menu closes so subsequent clicks work correctly.
// Without this, the next item click is silently swallowed (`:to=undefined` on
// the previous patch leaves every q-item rendered as a plain <div> with no
// router-link, so clicks fire emit('click') with no `go` and never navigate).
watch(menuOpen, (open) => {
  if (!open) {
    longPressFired.value = false
  }
})

function menuAction(action: string) {
  menuOpen.value = false
  const dialog = activeDialog.value
  if (!dialog) return
  // Use setTimeout to let dialog close first
  setTimeout(() => {
    switch (action) {
      case 'rename': renameItem(dialog); break
      case 'summarize': summarizeDialog(dialog); break
      case 'copyContent': copyContent(dialog); break
      case 'move': moveItem(dialog); break
      case 'delete': deleteItem(dialog); break
    }
  }, 50)
}

function summarizeDialog(dialog: Dialog) {
  $router.push(`/workspaces/${workspace.value.id}/dialogs/${dialog.id}#genTitle`)
}
function copyContent(dialog: Dialog) {
  $router.push(`/workspaces/${workspace.value.id}/dialogs/${dialog.id}#copyContent`)
}

function renameItem({ id, name }: Dialog) {
  $q.dialog({
    title: t('dialogList.renameTitle'),
    prompt: {
      model: name,
      type: 'text',
      label: t('dialogList.title'),
      isValid: v => v.trim() && v !== name
    },
    cancel: true,
    ...dialogOptions
  }).onOk(newName => {
    db.dialogs.update(id, { name: newName.trim() })
  })
}
function moveItem({ id }: Dialog) {
  $q.dialog({
    component: SelectWorkspaceDialog,
    componentProps: {
      accept: 'workspace'
    }
  }).onOk(workspaceId => {
    db.dialogs.update(id, { workspaceId })
  })
}
function deleteItem({ id, name }: Dialog) {
  $q.dialog({
    title: t('dialogList.deleteConfirmTitle'),
    message: t('dialogList.deleteConfirmMessage', { name }),
    cancel: true,
    ok: {
      label: t('dialogList.deleteConfirmOk'),
      color: 'err',
      flat: true
    },
    ...dialogOptions
  }).onOk(() => {
    db.transaction('rw', db.dialogs, db.messages, db.items, async () => {
      await db.dialogs.delete(id)
      await db.messages.where('dialogId').equals(id).delete()
      await db.items.where('dialogId').equals(id).delete()
    })
  })
}

import { useRouter } from 'vue-router'
const $router = useRouter()

const { perfs } = useUserPerfsStore()

if (isPlatformEnabled(perfs.enableShortcutKey)) {
  useListenKey(toRef(perfs, 'createDialogKey'), addItem)
}
</script>
