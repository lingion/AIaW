<template>
  <view-common-header @toggle-drawer="$emit('toggle-drawer')">
    <q-toolbar-title>
      工作区主页
    </q-toolbar-title>
    <q-space />
  </view-common-header>
  <q-page-container bg-sur-c-low>
    <q-page
      bg-sur
    >
      <md-preview
        bg-sur
        rd-lg
        :model-value="contentMd"
        preview-theme="vuepress"
        :theme="$q.dark.isActive ? 'dark' : 'light'"
        max-w="1000px"
        m-a
      />
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { computed, Ref, inject, toRaw } from 'vue'
import { Workspace } from 'src/utils/types'
import { syncRef } from 'src/composables/sync-ref'
import { useWorkspacesStore } from 'src/stores/workspaces'
import ViewCommonHeader from 'src/components/ViewCommonHeader.vue'
import { MdPreview } from 'md-editor-v3'
import { engine } from 'src/utils/template-engine'
import { useSetTitle } from 'src/composables/set-title'

defineEmits(['toggle-drawer'])

const store = useWorkspacesStore()
const workspace = syncRef(
  inject('workspace') as Ref<Workspace>,
  val => { store.putItem(toRaw(val)) },
  { valueDeep: true }
)

const contentMd = computed(() => engine.parseAndRenderSync(workspace.value.indexContent, { workspace: workspace.value }))

useSetTitle(computed(() => workspace.value?.name))
</script>
