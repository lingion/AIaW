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
      :class="isActiveDialog(dialog) ? 'bg-sec-c text-on-sec-c' : ''"
      item-rd
      min-h="44px"
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
    <div
      v-if="!sortedDialogs.length"
      text-on-sur-var
      text="xs center"
      q-py-md
      px-3
    >
      {{ $t('dialogList.empty') }}
    </div>
  </q-list>

  <!-- Manual overlay menu — NO q-dialog/q-menu (Capacitor WebView backdrop bug).
       A plain fixed-position div with v-if; click/touch the backdrop to close.
       Position is anchored to the long-press touch point so the menu opens
       where the user's finger is instead of always in screen center. -->
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
        :style="menuPosStyle"
        @click.stop
      >
        <q-card
          style="min-width: 160px"
          class="q-pa-sm"
        >
          <q-list dense>
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
        </q-card>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { db } from 'src/utils/db'
import { idTimestamp, isPlatformEnabled } from 'src/utils/functions'
import { Dialog, Workspace } from 'src/utils/types'
import { dialogOptions } from 'src/utils/values'
import { computed, inject, ref, Ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import SelectWorkspaceDialog from './SelectWorkspaceDialog.vue'
import { useCreateDialog } from 'src/composables/create-dialog'
import MenuItem from './MenuItem.vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { useListenKey } from 'src/composables/listen-key'
import { useLiveQueryWithDeps } from 'src/composables/live-query'

const { t } = useI18n()
const $route = useRoute()
const $router = useRouter()
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

function isActiveDialog(dialog: Dialog) {
  return $route.path.includes(`/dialogs/${dialog.id}`)
}

const $q = useQuasar()
const { createDialog } = useCreateDialog(workspace)
async function addItem() {
  await createDialog()
}

// --- Context menu via manual overlay (no q-dialog — Capacitor safe) ---
const menuOpen = ref(false)
const activeDialog = ref<Dialog | null>(null)
// Anchor point of the long-press (or right-click) in viewport coordinates.
// Bug #9: previously the menu always appeared in screen center, which made
// the user feel they had to re-aim. Now it appears right under the finger.
const menuPos = ref<{ x: number, y: number }>({ x: -1, y: -1 })
let longPressTimer: ReturnType<typeof setTimeout> | null = null
const longPressFired = ref(false)

// Menu width is dynamic from min-width:160px; assume ~200px for anchor math.
const MENU_ESTIMATED_WIDTH = 200
const MENU_ESTIMATED_HEIGHT = 280
const MENU_VIEWPORT_GUTTER = 8
const menuPosStyle = computed(() => {
  const x = menuPos.value.x
  const y = menuPos.value.y
  // No anchor recorded (e.g. opened from keyboard shortcut) → fall back to
  // the old center-screen behavior so the menu is still reachable.
  if (x < 0 || y < 0) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 6001,
    }
  }
  const vw = window.innerWidth
  const vh = window.innerHeight
  // Prefer to open directly below the touch point; if there's no room, flip
  // above. Same logic horizontally.
  const left = Math.min(
    Math.max(MENU_VIEWPORT_GUTTER, x - MENU_ESTIMATED_WIDTH / 2),
    vw - MENU_ESTIMATED_WIDTH - MENU_VIEWPORT_GUTTER
  )
  const top = Math.min(
    Math.max(MENU_VIEWPORT_GUTTER, y + 12),
    vh - MENU_ESTIMATED_HEIGHT - MENU_VIEWPORT_GUTTER
  )
  return { top: `${top}px`, left: `${left}px`, zIndex: 6001 }
})

function openMenu(dialog: Dialog) {
  activeDialog.value = dialog
  menuPos.value = { x: -1, y: -1 } // center-screen fallback (e.g. context menu)
  menuOpen.value = true
}

function closeMenu() {
  menuOpen.value = false
  longPressFired.value = false
}

function onTouchStart(event: TouchEvent, dialog: Dialog) {
  longPressFired.value = false
  onTouchEnd()
  // Record the touch position so the menu opens under the user's finger
  // instead of in screen center (Bug #9).
  const t = event.touches?.[0]
  if (t) menuPos.value = { x: t.clientX, y: t.clientY }
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

// Manual navigation — no `:to` binding on q-item, so longPressFired
// never breaks the router-link reactivity cycle.
function onItemClick(_event: MouseEvent, dialog: Dialog) {
  if (longPressFired.value) {
    longPressFired.value = false
    return // Long press just fired — don't navigate
  }
  $router.push({
    path: `/workspaces/${workspace.value.id}/dialogs/${dialog.id}`,
    query: { ...$route.query }
  })
}

function menuAction(action: string) {
  menuOpen.value = false
  longPressFired.value = false
  const dialog = activeDialog.value
  if (!dialog) return
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

const { perfs } = useUserPerfsStore()

if (isPlatformEnabled(perfs.enableShortcutKey)) {
  useListenKey(toRef(perfs, 'createDialogKey'), addItem)
}
</script>
