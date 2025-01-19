<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    no-route-dismiss
  >
    <q-card min-w="320px">
      <q-card-section>
        <div class="text-h6">
          保存修改
        </div>
      </q-card-section>
      <q-card-section pt-0>
        是否保存对「{{ name }}」的修改？
      </q-card-section>
      <q-card-actions>
        <q-btn
          flat
          color="primary"
          label="取消"
          @click="onDialogCancel"
        />
        <q-space />
        <q-btn
          flat
          label="不保存"
          text="pri hover:err"
          @click="onDialogOK(false)"
        />
        <q-btn
          flat
          color="primary"
          label="保存"
          @click="onDialogOK(true)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'

defineProps<{
  name: string
}>()

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
</script>
