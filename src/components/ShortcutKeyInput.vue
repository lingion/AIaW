<template>
  <q-field
    @focus="onFocus"
    @blur="onBlur"
  >
    <template #control>
      <div v-if="text">
        {{ text }}
      </div>
    </template>
  </q-field>
</template>

<script setup lang="ts">
import { ShortcutKey } from 'src/utils/types'
import { computed } from 'vue'

const model = defineModel<ShortcutKey>()
const listener = (ev: KeyboardEvent) => {
  if (['ControlLeft', 'ShiftLeft', 'AltLeft', 'ControlRight', 'ShiftRight', 'AltRight'].includes(ev.code)) return
  model.value = {
    key: ev.code,
    withCtrl: ev.ctrlKey,
    withShift: ev.shiftKey,
    withAlt: ev.altKey,
    withMeta: ev.metaKey
  }
  ev.preventDefault()
}
function onFocus() {
  model.value = null
  document.addEventListener('keydown', listener)
}
function onBlur() {
  document.removeEventListener('keydown', listener)
}

const text = computed(() => {
  if (!model.value) return
  let val = ''
  if (model.value.withCtrl) val += 'Ctrl + '
  if (model.value.withMeta) val += 'Meta + '
  if (model.value.withShift) val += 'Shift + '
  if (model.value.withAlt) val += 'Alt + '
  val += model.value.key
  return val
})
</script>
