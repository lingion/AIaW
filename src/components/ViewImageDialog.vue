<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    maximized
  >
    <img
      :src="url"
      object-contain
      max-w-100vw
      max-h-100vh
    >
    <q-btn
      v-if="arrayBuffer"
      pointer-events-auto
      position-absolute
      bottom-2
      right-2
      flat
      dense
      round
      text-white
      icon="sym_o_download"
      @click="downloadImage"
    />
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { exportFile } from 'src/utils/platform-api'

const props = defineProps<{
  url: string,
  arrayBuffer?: ArrayBuffer,
  mimeType?: string
}>()

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide } = useDialogPluginComponent()

function downloadImage() {
  const ext = props.mimeType?.split('/')[1] || 'jpg'
  exportFile(`image.${ext}`, props.arrayBuffer)
}
</script>
