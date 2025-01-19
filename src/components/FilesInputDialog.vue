<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <div
      @click="fileInput.click()"
      @dragenter.prevent
      @dragover.prevent
      @drop.stop.prevent="onDrop"
      border="dashed 2px out"
      h="200px"
      flex
      items-center
      justify-center
      cursor-pointer
    >
      <div text="xl center out">
        点击选择图片<br>
        拖拽到此处<br>
        或者 Ctrl+V 粘贴
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="*"
        @change="onInput"
        un-hidden
      >
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { onUnmounted, ref } from 'vue'

defineProps<{
  url: string
}>()

const emit = defineEmits([
  ...useDialogPluginComponent.emits,
  'input'
])

const fileInput = ref<HTMLInputElement>()

function onInput() {
  if (fileInput.value.files.length) {
    emit('input', Array.from(fileInput.value.files))
    onDialogOK()
  }
}
function onDrop({ dataTransfer }) {
  if (dataTransfer.files.length) {
    emit('input', Array.from(dataTransfer.files))
    onDialogOK()
  }
}
function onPaste(ev: ClipboardEvent) {
  ev.stopPropagation()
  if (ev.clipboardData.files.length) {
    emit('input', Array.from(ev.clipboardData.files))
    onDialogOK()
  }
}
addEventListener('paste', onPaste, true)
onUnmounted(() => removeEventListener('paste', onPaste, true))

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()
</script>
