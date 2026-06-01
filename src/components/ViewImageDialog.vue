<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    maximized
    :persistent="false"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card
      class="bg-black text-white full-width full-height column justify-between"
      @click="onDialogCancel"
    >
      <div class="row justify-end q-pa-md absolute-top" style="z-index: 9999;">
        <q-btn flat round icon="close" color="white" size="lg" @click.stop="onDialogCancel" />
      </div>

      <div class="col row flex-center" @click.stop>
        <img
          :src="url"
          style="max-width: 100%; max-height: 80vh; object-fit: contain;"
        />
      </div>

      <div class="row justify-center q-pb-xl" @click.stop>
        <q-btn
          round
          color="primary"
          icon="sym_o_download"
          size="lg"
          :loading="saving"
          @click.stop="downloadImage"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { exportFile, fetch as platformFetch } from 'src/utils/platform-api'
import { ref } from 'vue'

const props = defineProps<{
  url: string,
  arrayBuffer?: ArrayBuffer,
  mimeType?: string
}>()

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const saving = ref(false)

function extForBlob(blob: Blob, fallback?: string): string {
  const mime = blob.type?.toLowerCase() || ''
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('gif')) return 'gif'
  if (mime.includes('png')) return 'png'
  if (mime.includes('svg')) return 'svg'
  if (mime.includes('bmp')) return 'bmp'
  return fallback || 'jpg'
}

async function downloadImage() {
  saving.value = true
  try {
    let buffer: ArrayBuffer
    let ext: string

    if (props.arrayBuffer) {
      buffer = props.arrayBuffer
      ext = props.mimeType?.split('/')[1] || 'jpg'
    } else {
      const response = await platformFetch(props.url)
      const blob = await response.blob()
      ext = extForBlob(blob, props.mimeType?.split('/')[1])
      buffer = await blob.arrayBuffer()
    }

    await exportFile(`image.${ext}`, buffer)
  } finally {
    saving.value = false
  }
}
</script>
