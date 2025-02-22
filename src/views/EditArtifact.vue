<template>
  <div
    v-if="mode === 'edit'"
    flex-1
    of-y-auto
  >
    <code-jar
      :language="props.artifact.language"
      :model-value="props.artifact.tmp"
      @update:model-value="update({ tmp: $event })"
    />
  </div>
  <div
    v-else
    flex-1
    of-y-auto
    bg-sur
  >
    <md-preview
      :model-value="props.artifact.tmp"
      v-bind="mdPreviewProps"
      bg-sur
    />
  </div>
  <div
    flex
    items-center
    p-2
  >
    <div>
      <div
        text-out
      >
        {{ artifact.versions[artifact.currIndex].date.toLocaleString() }}
      </div>
      <q-pagination
        :model-value="artifact.currIndex + 1"
        @update:model-value="setIndex($event - 1)"
        :max="artifact.versions.length"
        input
        :boundary-links="false"
      />
    </div>
    <q-space />
    <div mr-2>
      <q-input
        :model-value="artifact.language"
        @update:model-value="update({ language: $event as string })"
        :label="$t('editArtifact.language')"
        outlined
        dense
        class="w-120px"
      />
    </div>
    <q-btn
      v-if="mode === 'view'"
      icon="sym_o_edit"
      :title="$t('editArtifact.edit')"
      @click="mode = 'edit'"
      flat
      dense
      round
    />
    <q-btn
      v-if="viewable && mode === 'edit'"
      icon="sym_o_preview"
      :title="$t('editArtifact.preview')"
      @click="mode = 'view'"
      flat
      dense
      round
    />
    <div>
      <q-checkbox
        ml-2
        :label="$t('editArtifact.readable')"
        :model-value="artifact.readable"
        @update:model-value="update({ readable: $event })"
        dense
        text-on-sur-var
      /><br>
      <q-checkbox
        mt-2
        ml-2
        :label="$t('editArtifact.writable')"
        :model-value="artifact.writable"
        @update:model-value="update({ writable: $event })"
        dense
        text-on-sur-var
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import CodeJar from 'src/components/CodeJar.vue'
import { useListenKey } from 'src/composables/listen-key'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { db } from 'src/utils/db'
import { artifactUnsaved, saveArtifactChanges } from 'src/utils/functions'
import { Artifact } from 'src/utils/types'
import { computed, ref, toRef, watchEffect } from 'vue'
import { useMdPreviewProps } from 'src/composables/md-preview-props'
import { MdPreview } from 'md-editor-v3'

const props = defineProps<{
  artifact: Artifact
}>()

function update(changes: Partial<Artifact>) {
  db.artifacts.update(props.artifact.id, changes)
}
function setIndex(index: number) {
  update({
    currIndex: index,
    tmp: props.artifact.versions[index].text
  })
}
function save() {
  const { artifact } = props
  if (!artifactUnsaved(artifact)) return
  db.artifacts.update(artifact.id, saveArtifactChanges(artifact))
}
const { perfs } = useUserPerfsStore()
useListenKey(toRef(perfs, 'saveArtifactKey'), save)

const mode = ref<'edit' | 'view'>('edit')
const viewable = computed(() => ['markdown', 'md', 'svg', 'txt'].includes(props.artifact.language))
watchEffect(() => {
  mode.value = viewable.value ? 'view' : 'edit'
})

const mdPreviewProps = useMdPreviewProps()
</script>
