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
      class="bg-black text-white full-width full-height column justify-between no-shadow overflow-hidden"
      @click="onDialogCancel"
    >
      <div class="absolute-top-right q-pa-md" style="z-index: 99999;">
        <q-btn
          flat
          round
          icon="close"
          color="white"
          size="lg"
          style="background: rgba(0,0,0,0.5);"
          @click.stop="onDialogCancel"
        />
      </div>

      <div
        class="col row flex-center overflow-hidden"
        style="width: 100vw; height: 80vh;"
        @touchstart="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
        @click.stop
      >
        <img
          ref="imgRef"
          :src="url"
          :style="imageStyle"
          style="max-width: 100%; max-height: 100%; object-fit: contain;"
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
import { ref, computed } from 'vue'

const props = defineProps<{
  url: string,
  arrayBuffer?: ArrayBuffer,
  mimeType?: string
}>()

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const saving = ref(false)
const imgRef = ref<HTMLImageElement>()

// --- JS pinch-zoom state machine ---
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)

let startDist = 0
let startScale = 1
let startTX = 0
let startTY = 0
let lastX = 0
let lastY = 0

const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
}))

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    startDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    startScale = scale.value
  } else if (e.touches.length === 1) {
    lastX = e.touches[0].clientX
    lastY = e.touches[0].clientY
    startTX = translateX.value
    startTY = translateY.value
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    scale.value = Math.max(0.5, Math.min(5, startScale * (dist / startDist)))
  } else if (e.touches.length === 1 && scale.value > 1.05) {
    const dx = e.touches[0].clientX - lastX
    const dy = e.touches[0].clientY - lastY
    translateX.value = startTX + dx
    translateY.value = startTY + dy
  }
}

function onTouchEnd() {
  // Reset pan if zoomed back to ~1
  if (scale.value < 1.05) {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  }
}

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
