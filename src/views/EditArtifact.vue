<template>
  <div
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
    <div>
      <q-input
        :model-value="artifact.language"
        @update:model-value="update({ language: $event as string })"
        label="语言"
        outlined
        dense
        class="w-120px"
      />
    </div>
    <div ml-2>
      <q-checkbox
        ml-2
        label="可读"
        :model-value="artifact.readable"
        @update:model-value="update({ readable: $event })"
        dense
        text-on-sur-var
      /><br>
      <q-checkbox
        mt-2
        ml-2
        label="可写"
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
import { saveArtifactChanges } from 'src/utils/functions'
import { Artifact } from 'src/utils/types'
import { toRef } from 'vue'

const props = defineProps<{
  artifact: Artifact
}>()

function update(changes: Partial<Artifact>) {
  db.canvases.update(props.artifact.id, changes)
}
function setIndex(index: number) {
  update({
    currIndex: index,
    tmp: props.artifact.versions[index].text
  })
}
function save() {
  const { artifact } = props
  if (artifact.tmp === artifact.versions[artifact.currIndex].text) return
  db.canvases.update(artifact.id, saveArtifactChanges(artifact))
}
const { perfs } = useUserPerfsStore()
useListenKey(toRef(perfs, 'saveArtifactKey'), save)
</script>
