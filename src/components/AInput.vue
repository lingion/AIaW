<template>
  <q-input
    :model-value="tempVal"
    @update:model-value="onUpdate"
    ref="compRef"
  />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { ref, watch } from 'vue'

const $q = useQuasar()
const compose = !$q.platform.is.android

const compRef = ref(null)
const model = defineModel<string|number>()
const tempVal = ref(model.value)

let composing = false
function onUpdate(val: string) {
  tempVal.value = val
  if (!composing) {
    model.value = val
  }
}

watch(model, val => {
  if (val !== tempVal.value) {
    tempVal.value = val
  }
})

watch(() => compRef.value?.nativeEl, el => {
  if (!el) return
  if (!compose) return
  el.addEventListener('compositionstart', () => {
    composing = true
  })
  el.addEventListener('compositionend', () => {
    composing = false
  })
})

defineExpose({
  focus: () => compRef.value?.focus()
})

</script>
