<template>
  <q-expansion-item
    header-class="text-lg py-0"
    expand-icon-class="important:pl-2"
  >
    <template #header>
      <q-item-section>
        {{ label || $t('assistantsExpansion.assistants') }}
      </q-item-section>
      <q-item-section side>
        <q-btn
          flat
          dense
          round
          v-if="dense"
          icon="sym_o_add"
          :title="$t('assistantsExpansion.createAssistant')"
          @click.prevent.stop="addItem"
        />
      </q-item-section>
    </template>
    <template #default>
      <q-list mb-2>
        <q-item
          v-for="assistant in assistants"
          :key="assistant.id"
          clickable
          :to="longPressFired ? undefined : getLink(assistant.id)"
          active-class="route-active"
          item-rd
          py-1.5
          min-h-0
          @click="onItemClick($event, assistant)"
          @contextmenu.prevent="openMenu(assistant)"
          @touchstart.passive="onTouchStart($event, assistant)"
          @touchend="onTouchEnd"
          @touchmove="onTouchEnd"
          @touchcancel="onTouchEnd"
        >
          <q-item-section
            avatar
            min-w-0
          >
            <a-avatar
              size="30px"
              :avatar="assistant.avatar"
            />
          </q-item-section>
          <q-item-section>
            {{ assistant.name }}
          </q-item-section>
        </q-item>
        <q-item
          v-if="!dense"
          clickable
          @click="addItem"
          text-sec
          item-rd
          min-h="42px"
        >
          <q-item-section
            avatar
            min-w-0
          >
            <q-icon name="sym_o_add" />
          </q-item-section>
          <q-item-section>
            {{ $t('assistantsExpansion.createAssistant') }}
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Single q-dialog instead of per-item q-menu -->
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
            v-if="workspaceId !== '$root'"
            icon="sym_o_add_comment"
            :label="$t('assistantsExpansion.createDialog')"
            @click="menuAction('createDialog')"
          />
          <menu-item
            v-if="workspaceId !== '$root'"
            icon="sym_o_move_item"
            :label="$t('assistantsExpansion.moveToGlobal')"
            @click="menuAction('moveToGlobal')"
          />
          <menu-item
            icon="sym_o_move_item"
            :label="$t('assistantsExpansion.moveToWorkspace')"
            @click="menuAction('moveToWorkspace')"
          />
          <menu-item
            icon="sym_o_delete"
            :label="$t('assistantsExpansion.delete')"
            @click="menuAction('delete')"
            hover:text-err
          />
        </q-list>
      </q-dialog>
    </template>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { computed, inject, ref } from 'vue'
import { useAssistantsStore } from 'src/stores/assistants'
import { useRouter } from 'vue-router'
import AAvatar from './AAvatar.vue'
import SelectWorkspaceDialog from './SelectWorkspaceDialog.vue'
import { useCreateDialog } from 'src/composables/create-dialog'
import MenuItem from './MenuItem.vue'
import { dialogOptions } from 'src/utils/values'
import { idTimestamp } from 'src/utils/functions'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const menuOpen = ref(false)
const activeAssistant = ref<any>(null)
let longPressTimer: ReturnType<typeof setTimeout> | null = null
let longPressFired = false

function openMenu(assistant: any) {
  activeAssistant.value = assistant
  menuOpen.value = true
}
function onTouchStart(_event: TouchEvent, assistant: any) {
  longPressFired = false
  onTouchEnd()
  longPressTimer = setTimeout(() => {
    longPressFired = true
    activeAssistant.value = assistant
    menuOpen.value = true
    longPressTimer = null
  }, 500)
}
function onTouchEnd() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
}
function onItemClick(event: MouseEvent, assistant: any) {
  if (longPressFired) {
    event.preventDefault()
    event.stopPropagation()
    longPressFired = false
  }
}
function menuAction(action: string) {
  menuOpen.value = false
  const assistant = activeAssistant.value
  if (!assistant) return
  setTimeout(() => {
    switch (action) {
      case 'createDialog': createDialog({ assistantId: assistant.id }); break
      case 'moveToGlobal': move(assistant.id, '$root'); break
      case 'moveToWorkspace': moveToWorkspace(assistant.id); break
      case 'delete': deleteItem(assistant); break
    }
  }, 50)
}

const props = defineProps<{
  workspaceId: string,
  dense?: boolean,
  label?: string
}>()

const assistantsStore = useAssistantsStore()

const assistants = computed(() => assistantsStore.assistants
  .filter(a => a.workspaceId === props.workspaceId)
  .sort((a, b) => idTimestamp(b.id) - idTimestamp(a.id))
)

function getLink(id) {
  return props.workspaceId === '$root' ? `/assistants/${id}` : `/workspaces/${props.workspaceId}/assistants/${id}`
}
const router = useRouter()
async function addItem() {
  const id = await assistantsStore.add({ workspaceId: props.workspaceId })
  router.push(getLink(id))
}

function move(id, workspaceId) {
  assistantsStore.update(id, { workspaceId })
}
const $q = useQuasar()
function moveToWorkspace(id) {
  $q.dialog({
    component: SelectWorkspaceDialog,
    componentProps: {
      accept: 'workspace'
    }
  }).onOk(workspaceId => {
    move(id, workspaceId)
  })
}
function deleteItem({ id, name }) {
  $q.dialog({
    title: t('assistantsExpansion.deleteConfirmTitle'),
    message: t('assistantsExpansion.deleteConfirmMessage', { name }),
    cancel: true,
    ok: {
      label: t('assistantsExpansion.delete'),
      color: 'err',
      flat: true
    },
    ...dialogOptions
  }).onOk(() => {
    assistantsStore.delete(id)
  })
}

const { createDialog } = useCreateDialog(inject('workspace', ref()))
</script>
