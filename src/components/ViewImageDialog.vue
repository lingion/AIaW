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
      class="bg-black text-white full-width full-height column justify-between no-shadow"
      @click="onDialogCancel"
    >
      <div class="absolute-top-right q-pa-md" style="z-index: 99999;">
        <q-btn
          flat
          round
          dense
          icon="close"
          color="white"
          size="xl"
          class="bg-grey-9"
          style="opacity: 0.7;"
          @click.stop="onDialogCancel"
        />
      </div>

      <div class="col row flex-center sandbox-zoom-viewport" @click="onDialogCancel">
        <img
          :src="url"
          class="sandbox-zoomable-img"
          @click.stop
        />
      </div>

      <div class="row justify-center q-pb-xl" style="z-index: 99999;" @click.stop>
        <q-btn
          unelevated
          rounded
          color="primary"
          icon="download"
          :label="$t('components.saveImage')"
          size="lg"
          class="q-px-xl text-bold"
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

function timestampName(ext: string): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  return `AIaW_Img_${ts}.${ext}`
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

    await exportFile(timestampName(ext), buffer)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.sandbox-zoom-viewport {
  width: 100vw;
  height: 85vh;
  overflow: auto !important;
  -webkit-overflow-scrolling: touch;
}

.sandbox-zoomable-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  touch-action: pinch-zoom pan-x pan-y !important;
  will-change: transform;
}
</style>
