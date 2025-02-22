<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    no-route-dismiss
  >
    <q-card min-w="320px">
      <q-card-section>
        <div class="text-h6">
          {{ $t('saveDialog.title') }}
        </div>
      </q-card-section>
      <q-card-section pt-0>
        {{ $t('saveDialog.message', { name }) }}
      </q-card-section>
      <q-card-actions>
        <q-btn
          flat
          color="primary"
          :label="$t('saveDialog.cancel')"
          @click="onDialogCancel"
        />
        <q-space />
        <q-btn
          flat
          :label="$t('saveDialog.dontSave')"
          text="pri hover:err"
          @click="onDialogOK(false)"
        />
        <q-btn
          flat
          color="primary"
          :label="$t('saveDialog.save')"
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
