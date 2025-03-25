<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    persistent
  >
    <q-card min-w="320px">
      <q-card-section>
        <div class="text-h6">
          {{ $t('payDialog.pay') }}
        </div>
      </q-card-section>
      <q-card-section
        p-0
        flex="~ col items-center"
      >
        <div>{{ $t('payDialog.refreshAfterPay') }}</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          color="primary"
          :label="$t('payDialog.cancel')"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          color="primary"
          :label="$t('payDialog.completePayment')"
          @click="onDialogOK"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

defineEmits([
  ...useDialogPluginComponent.emits
])
</script>
