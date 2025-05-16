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
      <q-card-section>
        <div>{{ $t('payDialog.refreshAfterPay') }}</div>
      </q-card-section>
      <q-card-actions align="right">
        <copy-btn
          flat
          color="primary"
          no-caps
          :value="link"
          :label="$t('payDialog.paymentLink')"
        />
        <q-space />
        <q-btn
          flat
          color="primary"
          no-caps
          :label="$t('payDialog.cancel')"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          color="primary"
          no-caps
          :label="$t('payDialog.completePayment')"
          @click="onDialogOK"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import CopyBtn from './CopyBtn.vue'

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

defineProps<{
  link: string
}>()

defineEmits([
  ...useDialogPluginComponent.emits
])
</script>
