<template>
  <div
    @click="imageInput.click()"
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
      {{ $t('imageInputArea.clickToSelect') }}<br>
      {{ $t('imageInputArea.dragHere') }}<br>
      {{ $t('imageInputArea.paste') }}
    </div>
    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      @change="onInput"
      un-hidden
    >
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

const emit = defineEmits<{
  input: [File]
}>()
const imageInput = ref<HTMLInputElement>()

function onInput() {
  emit('input', imageInput.value.files[0])
}
function onDrop({ dataTransfer }) {
  for (const file of dataTransfer.files) {
    if (file.type.startsWith('image/')) {
      emit('input', file)
      break
    }
  }
}
function onPaste({ clipboardData }) {
  for (const file of clipboardData.files) {
    if (file.type.startsWith('image/')) {
      emit('input', file)
      break
    }
  }
}
addEventListener('paste', onPaste)
onUnmounted(() => removeEventListener('paste', onPaste))
</script>

<style scoped>

</style>
