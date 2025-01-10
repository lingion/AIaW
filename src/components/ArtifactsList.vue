<template>
  <q-list>
    <div p="x-4 y-2">
      <q-input
        dense
        outlined
        v-model="filter"
        clearable
        placeholder="搜索 Artifacts..."
      />
    </div>
    <q-item
      v-for="artifact in filteredArtifacts"
      :key="artifact.id"
      clickable
      @click="openArtifact(artifact)"
      :class="{ 'route-active': artifact.open }"
      item-rd
      min-h="32px"
      py-1
    >
      <q-item-section
        avatar
        min-w-0
      >
        <q-icon
          size="16px"
          name="sym_o_code"
        />
      </q-item-section>
      <q-item-section>
        {{ artifact.name }}
      </q-item-section>
      <q-item-section side>
        <q-btn
          v-if="artifact.open"
          flat
          dense
          round
          icon="sym_o_close"
          title="关闭"
          size="sm"
          @click.prevent.stop="closeArtifact(artifact)"
        />
      </q-item-section>
      <q-menu
        context-menu
      >
        <q-list style="min-width: 100px">
          <menu-item
            icon="sym_o_edit"
            label="重命名"
            @click="renameItem(artifact)"
          />
          <menu-item
            icon="sym_o_move_item"
            label="移动至"
            @click="moveItem(artifact)"
          />
          <menu-item
            icon="sym_o_delete"
            label="删除"
            @click="deleteItem(artifact)"
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
import { Artifact } from 'src/utils/types'
import { dialogOptions } from 'src/utils/values'
import { computed, inject, ref, Ref } from 'vue'
import SelectWorkspaceDialog from './SelectWorkspaceDialog.vue'
import MenuItem from './MenuItem.vue'
import { useCloseArtifact } from 'src/composables/close-artifact'
import { useRouter } from 'vue-router'

const artifacts: Ref<Artifact[]> = inject('artifacts')
const filter = ref(null)
const filteredArtifacts = computed(() => {
  return artifacts.value.filter(d => !filter.value || caselessIncludes(d.name, filter.value)).reverse()
})

const $q = useQuasar()

function renameItem({ id, name }) {
  $q.dialog({
    title: '重命名',
    prompt: {
      model: name,
      type: 'text',
      label: '名称',
      isValid: v => v.trim() && v !== name
    },
    cancel: true,
    ...dialogOptions
  }).onOk(newName => {
    db.canvases.update(id, { name: newName.trim() })
  })
}
function moveItem({ id }) {
  $q.dialog({
    component: SelectWorkspaceDialog,
    componentProps: {
      accept: 'workspace'
    }
  }).onOk(workspaceId => {
    db.canvases.update(id, { workspaceId })
  })
}
function deleteItem({ id, name }) {
  $q.dialog({
    title: '删除 Artifact',
    message: `确定要删除 Artifact「${name}」吗？`,
    cancel: true,
    ok: {
      label: '删除',
      color: 'err',
      flat: true
    },
    ...dialogOptions
  }).onOk(() => {
    db.canvases.delete(id)
  })
}
const router = useRouter()
function openArtifact({ id, open }) {
  !open && db.canvases.update(id, { open: true })
  router.push({ query: { artifactId: id } })
}
const { closeArtifact } = useCloseArtifact()
</script>
