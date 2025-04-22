<template>
  <template v-if="workspace">
    <router-view @toggle-drawer="drawerOpen = !drawerOpen" />
    <q-drawer
      show-if-above
      bg-sur-c-low
      :width="drawerWidth"
      :breakpoint="drawerBreakpoint"
      side="right"
      v-model="drawerOpen"
      flex
    >
      <dragable-separator
        v-if="showArtifacts"
        v-model="widthWithArtifacts"
        reverse
        :min="600"
        h-full
        w-2
      />
      <div
        v-if="showArtifacts"
        h-full
        min-w-0
        flex="~ col 1"
      >
        <div
          flex
          items-center
          h="50px"
        >
          <q-tabs
            inline-label
            dense
            mt="14px"
            rd-t
          >
            <q-route-tab
              no-caps
              v-for="artifact in openedArtifacts"
              :key="artifact.id"
              :to="{ query: { artifactId: artifact.id } }"
              :class="{'text-pri icon-fill': focusedArtifact?.id === artifact.id}"
              pl-3
              pr-2
            >
              <artifact-item-icon :artifact="artifact" />
              <div ml-2>
                {{ artifact.name }}
              </div>
              <div v-if="artifactUnsaved(artifact)">
                *
              </div>
              <q-btn
                ml-1
                flat
                dense
                round
                icon="sym_o_close"
                :title="$t('workspacePage.closeArtifact')"
                size="sm"
                text-out
                @click.prevent.stop="closeArtifact(artifact)"
              />
              <artifact-item-menu :artifact />
            </q-route-tab>
          </q-tabs>
          <q-space />
          <q-btn
            flat
            dense
            round
            icon="sym_o_close"
            :title="$t('workspacePage.closeAllArtifacts')"
            text-on-sur-var
            @click="closeAllArtifacts"
          />
        </div>
        <edit-artifact
          :artifact="focusedArtifact"
          v-if="focusedArtifact"
        />
      </div>
      <div
        w="250px"
        h-full
        flex="~ col"
      >
        <div
          h="48px"
          p-2
          flex
          items-center
        >
          <q-space />
          <q-btn
            flat
            dense
            round
            icon="sym_o_home"
            :to="`/workspaces/${id}`"
            :class="{'route-active': $route.path === `/workspaces/${id}`}"
            :title="$t('workspacePage.workspaceHome')"
          />
          <q-btn
            flat
            dense
            round
            icon="sym_o_settings"
            :to="`/workspaces/${id}/settings`"
            :class="{'route-active': $route.path === `/workspaces/${id}/settings`}"
            :title="$t('workspacePage.workspaceSettings')"
          />
        </div>
        <assistants-expansion
          :model-value="workspace.listOpen.assistants"
          @update:model-value="setListOpen('assistants', $event)"
          :workspace-id="workspace.id"
          dense
        />
        <template v-if="isPlatformEnabled(perfs.artifactsEnabled)">
          <q-separator />
          <artifacts-expansion
            :model-value="workspace.listOpen.artifacts"
            @update:model-value="setListOpen('artifacts', $event)"
            max-h="40vh"
            of-y-auto
          />
        </template>
        <q-separator />
        <dialogs-expansion
          :workspace-id="workspace.id"
          :model-value="workspace.listOpen.dialogs"
          @update:model-value="setListOpen('dialogs', $event)"
          flex-1
          of-y-auto
        />
      </div>
    </q-drawer>
  </template>
  <error-not-found
    v-else
    drawer-toggle
  />
</template>

<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import AssistantsExpansion from 'src/components/AssistantsExpansion.vue'
import ArtifactsExpansion from 'src/components/ArtifactsExpansion.vue'
import { useWorkspacesStore } from 'src/stores/workspaces'
import { useLiveQueryWithDeps } from 'src/composables/live-query'
import { db } from 'src/utils/db'
import { Workspace, Dialog, Artifact } from 'src/utils/types'
import { useUserDataStore } from 'src/stores/user-data'
import { useQuasar } from 'quasar'
import ErrorNotFound from 'src/pages/ErrorNotFound.vue'
import { artifactUnsaved, isPlatformEnabled } from 'src/utils/functions'
import { useRoute, useRouter } from 'vue-router'
import EditArtifact from 'src/views/EditArtifact.vue'
import { useCloseArtifact } from 'src/composables/close-artifact'
import ArtifactItemMenu from 'src/components/ArtifactItemMenu.vue'
import DragableSeparator from 'src/components/DragableSeparator.vue'
import ArtifactItemIcon from 'src/components/ArtifactItemIcon.vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import DialogsExpansion from 'src/components/DialogsExpansion.vue'

const props = defineProps<{
  id: string
}>()

const workspacesStore = useWorkspacesStore()

const workspace = computed(() => workspacesStore.workspaces.find(item => item.id === props.id) as Workspace)
const dialogs = useLiveQueryWithDeps(() => props.id, () => db.dialogs.where('workspaceId').equals(props.id).toArray(), { initialValue: [] as Dialog[] })
const artifacts = useLiveQueryWithDeps(() => props.id, () => db.artifacts.where('workspaceId').equals(props.id).toArray(), { initialValue: [] as Artifact[] })

provide('workspace', workspace)
provide('dialogs', dialogs)
provide('artifacts', artifacts)

const $q = useQuasar()

const drawerBreakpoint = 960
const openedArtifacts = computed(() => artifacts.value.filter(a => a.open))
const showArtifacts = computed(() => $q.screen.width > drawerBreakpoint && openedArtifacts.value.length)
provide('showArtifacts', showArtifacts)
const route = useRoute()
const focusedArtifact = computed(() =>
  openedArtifacts.value.find(a => a.id === route.query.artifactId) || openedArtifacts.value.at(-1)
)
const router = useRouter()
watch(focusedArtifact, val => {
  if (val) {
    val.id !== route.query.artifactId && router.replace({ query: { artifactId: val.id } })
  } else {
    router.replace({ query: { artifactId: undefined } })
  }
}, { immediate: true })
watch(() => route.query.openArtifact, val => {
  if (!val) return
  const artifact = artifacts.value.find(a => a.id === val)
  if (artifact) {
    !artifact.open && db.artifacts.update(artifact.id, { open: true })
    router.replace({ query: { artifactId: artifact.id } })
  } else {
    router.replace({ query: { artifactId: focusedArtifact.value?.id } })
  }
})
const { closeArtifact } = useCloseArtifact()
function closeAllArtifacts() {
  for (const artifact of openedArtifacts.value) {
    closeArtifact(artifact)
  }
}
const widthWithArtifacts = ref(Math.max(innerWidth / 2, 600))
const drawerWidth = computed(() => showArtifacts.value ? widthWithArtifacts.value : 250)

const { data } = useUserDataStore()
watch(workspace, val => {
  if (val) {
    data.lastWorkspaceId = val.id
  }
}, { immediate: true })

const drawerOpen = ref(false)

const rightDrawerAbove = computed(() => $q.screen.width > drawerBreakpoint)
provide('rightDrawerAbove', rightDrawerAbove)
provide('workspace', workspace)

const { perfs } = useUserPerfsStore()

function setListOpen(key: keyof Workspace['listOpen'], value: boolean) {
  db.workspaces.update(workspace.value.id, {
    listOpen: { ...workspace.value.listOpen, [key]: value }
  } as Partial<Workspace>)
}
</script>
