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
      <div class="absolute-top-right q-pa-md" style="z-index: 99999;" @click.stop>
        <button
          class="row flex-center justify-center"
          style="background: rgba(0,0,0,0.6); border: none; width: 44px; height: 44px; border-radius: 50%; color: white;"
          @click.stop="onDialogCancel"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div
        class="col row flex-center overflow-hidden"
        style="width: 100vw; height: 100vh;"
        @touchstart="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
        @click.stop
      >
        <img
          :src="url"
          :style="imageStyle"
          style="max-width: 100%; max-height: 100%; object-fit: contain; transform-origin: 0 0; will-change: transform;"
        />
      </div>

      <div class="absolute-bottom row justify-center q-pb-xl" style="z-index: 99999;" @click.stop>
        <button
          class="row flex-center justify-center"
          style="background: var(--q-primary); border: none; width: 56px; height: 56px; border-radius: 50%; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.4);"
          :disabled="saving"
          @click.stop="downloadImage"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
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

// --- Pinch-zoom with pivot-point centering ---
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)

let startScale = 1
let startTX = 0
let startTY = 0
let startDist = 0
let pivotX = 0
let pivotY = 0
let singleStartX = 0
let singleStartY = 0
let singleStartTX = 0
let singleStartTY = 0
let wasMultiTouch = false

const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
}))

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    wasMultiTouch = true
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
    // Pivot = point under the fingers in image-local coords
    pivotX = (cx - translateX.value) / scale.value
    pivotY = (cy - translateY.value) / scale.value
    startDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    startScale = scale.value
    startTX = translateX.value
    startTY = translateY.value
  } else if (e.touches.length === 1 && !wasMultiTouch) {
    singleStartX = e.touches[0].clientX
    singleStartY = e.touches[0].clientY
    singleStartTX = translateX.value
    singleStartTY = translateY.value
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    const newScale = Math.max(0.5, Math.min(5, startScale * (dist / startDist)))
    // Keep pivot point under the finger center
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
    scale.value = newScale
    translateX.value = cx - pivotX * newScale
    translateY.value = cy - pivotY * newScale
  } else if (e.touches.length === 1 && !wasMultiTouch && scale.value > 1.05) {
    const dx = e.touches[0].clientX - singleStartX
    const dy = e.touches[0].clientY - singleStartY
    translateX.value = singleStartTX + dx
    translateY.value = singleStartTY + dy
  }
}

function onTouchEnd(e: TouchEvent) {
  if (e.touches.length === 0) {
    wasMultiTouch = false
    if (scale.value < 1.05) {
      scale.value = 1
      translateX.value = 0
      translateY.value = 0
    }
  }
}

// --- File save ---
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
