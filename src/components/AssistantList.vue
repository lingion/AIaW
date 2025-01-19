<template>
  <q-list>
    <q-item
      v-for="assistant in assistants"
      :key="assistant.id"
      clickable
      :to="getLink(assistant.id)"
      active-class="route-active"
      item-rd
    >
      <q-item-section avatar>
        <a-avatar
          size="md"
          :avatar="assistant.avatar"
        />
      </q-item-section>
      <q-item-section>
        {{ assistant.name }}
      </q-item-section>
      <q-menu
        context-menu
      >
        <q-list style="min-width: 100px">
          <menu-item
            v-if="workspaceId !== '$root'"
            icon="sym_o_add_comment"
            label="新建对话"
            @click="createDialog({ assistantId: assistant.id })"
          />
          <menu-item
            v-if="workspaceId !== '$root'"
            icon="sym_o_move_item"
            label="移至全局"
            @click="move(assistant.id, '$root')"
          />
          <menu-item
            icon="sym_o_move_item"
            label="移至工作区"
            @click="moveToWorkspace(assistant.id)"
          />
          <menu-item
            icon="sym_o_delete"
            label="删除"
            @click="deleteItem(assistant)"
            hover:text-err
          />
        </q-list>
      </q-menu>
    </q-item>
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
        <q-icon name="sym_o_add" />
      </q-item-section>
      <q-item-section>
        新建助手
      </q-item-section>
    </q-item>
  </q-list>
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

const props = defineProps<{
  workspaceId: string
}>()

const assistantsStore = useAssistantsStore()

const assistants = computed(() => assistantsStore.assistants.filter(a => a.workspaceId === props.workspaceId))

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
    title: '删除助手',
    message: `确定要删除助手「${name}」吗？`,
    cancel: true,
    ok: {
      label: '删除',
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
