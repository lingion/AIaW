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
        新建对话
      </q-item-section>
    </q-item>
    <div p="x-4 y-2">
      <q-input
        dense
        outlined
        v-model="filter"
        clearable
        placeholder="搜索对话..."
      />
    </div>
    <q-item
      v-for="dialog in filteredDialogs"
      :key="dialog.id"
      clickable
      :to="`/workspaces/${workspace.id}/dialogs/${dialog.id}`"
      active-class="bg-sec-c text-on-sec-c"
      item-rd
      min-h="40px"
    >
      <q-item-section>
        {{ dialog.name }}
      </q-item-section>
      <q-menu
        context-menu
      >
        <q-list style="min-width: 100px">
          <menu-item
            icon="sym_o_edit"
            label="修改标题"
            @click="renameItem(dialog.id, dialog.name)"
          />
          <menu-item
            icon="sym_o_auto_fix"
            label="总结标题"
            @click="$router.push(`/workspaces/${workspace.id}/dialogs/${dialog.id}#genTitle`)"
          />
          <menu-item
            icon="sym_o_move_item"
            label="移动至"
            @click="moveItem(dialog.id)"
          />
          <menu-item
            icon="sym_o_delete"
            label="删除"
            @click="deleteItem(dialog.id)"
            hover:text-err
          />
        </q-list>
      </q-menu>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { db } from 'src/utils/db'
import { caselessIncludes } from 'src/utils/functions'
import { Dialog, Workspace } from 'src/utils/types'
import { dialogOptions } from 'src/utils/values'
import { computed, inject, ref, Ref, toRef } from 'vue'
import SelectWorkspaceDialog from './SelectWorkspaceDialog.vue'
import { useCreateDialog } from 'src/composables/create-dialog'
import MenuItem from './MenuItem.vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { useListenKey } from 'src/composables/listen-key'

const workspace: Ref<Workspace> = inject('workspace')
const dialogs: Ref<Dialog[]> = inject('dialogs')
const filter = ref(null)
const filteredDialogs = computed(() => {
  return dialogs.value.filter(d => !filter.value || caselessIncludes(d.name, filter.value)).reverse()
})

const $q = useQuasar()

const { createDialog } = useCreateDialog(workspace)
async function addItem() {
  await createDialog()
}

function renameItem(id, oldName) {
  $q.dialog({
    title: '重命名',
    message: '请输入新名称：',
    prompt: {
      model: oldName,
      type: 'text',
      isValid: v => v.trim() && v !== oldName
    },
    cancel: true,
    ...dialogOptions
  }).onOk(newName => {
    db.dialogs.update(id, { name: newName.trim() })
  })
}
function moveItem(id) {
  $q.dialog({
    component: SelectWorkspaceDialog,
    componentProps: {
      accept: 'workspace'
    }
  }).onOk(workspaceId => {
    db.dialogs.update(id, { workspaceId })
  })
}
function deleteItem(id) {
  $q.dialog({
    title: '删除对话',
    message: '确定要删除对话吗？',
    cancel: true,
    ok: {
      label: '删除',
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
useListenKey(toRef(perfs, 'createDialogKey'), addItem)
</script>
