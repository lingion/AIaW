<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card min-w="320px">
      <q-card-section>
        <div class="text-h6">
          排序
        </div>
      </q-card-section>
      <q-card-section>
        <q-list
          bordered
          separator
        >
          <q-item
            v-for="(item, index) in model"
            :key="index"
            v-touch-pan.prevent.mouse="(evt) => onDrag(evt, index)"
            clickable
            class="drag-item q-py-sm"
            :class="{ 'item-dragging': draggingIndex === index }"
          >
            <q-item-section avatar>
              <q-icon
                name="drag_indicator"
                color="grey"
              />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions>
        <q-btn
          flat
          icon="sym_o_sort_by_alpha"
          color="primary"
          label="按名称排序"
          @click="sortByLabel"
        />
        <q-space />
        <q-btn
          flat
          color="primary"
          label="取消"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          color="primary"
          label="确定"
          @click="onDialogOK(model)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'

const props = defineProps<{
  items: {
    label: string
    [x: string]: any
  }[]
}>()

const model = ref(props.items)
const draggingIndex = ref<number | null>(null)
let targetIndex: number | null = null

defineEmits([
  ...useDialogPluginComponent.emits
])

function sortByLabel() {
  model.value.sort((a, b) => a.label.localeCompare(b.label))
}

function onDrag(evt: any, index: number) {
  // Start dragging
  if (evt.isFirst) {
    draggingIndex.value = index
    targetIndex = index
    return
  }

  // Calculate new position while dragging
  const items = document.querySelectorAll('.drag-item')
  const draggedRect = items[index].getBoundingClientRect()
  const draggedHeight = draggedRect.height

  // Move the item visually
  const el = items[index] as HTMLElement
  el.style.transform = `translateY(${evt.delta.y}px)`

  // Determine potential new index
  const newIndex = Math.floor((evt.position.y - items[0].getBoundingClientRect().top) / draggedHeight)
  targetIndex = Math.max(0, Math.min(newIndex, items.length - 1))

  // End dragging and finalize position
  if (evt.isFinal) {
    el.style.transform = ''
    if (draggingIndex.value !== null && targetIndex !== null && draggingIndex.value !== targetIndex) {
      const item = model.value.splice(draggingIndex.value, 1)[0]
      model.value.splice(targetIndex, 0, item)
    }
    draggingIndex.value = null
  }
}

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
</script>

<style scoped>
.drag-item {
  transition: transform 0.2s, background-color 0.2s;
  position: relative;
  cursor: move;
}

.item-dragging {
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
