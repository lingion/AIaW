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
        <div>{{ $t('payDialog.payWithAlipay', { price: props.price }) }}</div>
        <vue-qrcode
          :value="props.qrCode"
          :options="{
            width: 240,
            color: {
              light: lightColor,
              dark: darkColor
            }
          }"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          text-err
          :label="$t('payDialog.cancelOrder')"
          @click="cancelOrder"
          :loading="cancelLoading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent, useQuasar } from 'quasar'
import VueQrcode from '@chenfengyuan/vue-qrcode'
import { BudgetBaseURL } from 'src/utils/config'
import { db } from 'src/utils/db'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStateStore } from 'src/stores/ui-state'
import { hexFromArgb } from '@material/material-color-utilities'

const { t } = useI18n()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps<{
  orderId: string,
  qrCode: string,
  price: number
}>()

defineEmits([
  ...useDialogPluginComponent.emits
])

const cancelLoading = ref(false)

const $q = useQuasar()
async function cancelOrder() {
  cancelLoading.value = true
  try {
    const res = await fetch(`${BudgetBaseURL}/cancel-order`, {
      method: 'POST',
      body: JSON.stringify({ order_id: props.orderId }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${db.cloud.currentUser.value.accessToken}`
      }
    })
    if (!res.ok) throw new Error('Failed to cancel order')
    onDialogCancel()
    $q.notify({
      message: t('payDialog.orderCancelled')
    })
  } catch (err) {
    console.error(err)
    $q.notify({
      message: t('payDialog.cancelOrderFailed'),
      color: 'negative'
    })
  } finally {
    cancelLoading.value = false
  }
}

async function checkOrderStatus() {
  try {
    const res = await fetch(`${BudgetBaseURL}/order-status`, {
      method: 'POST',
      body: JSON.stringify({ order_id: props.orderId }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!res.ok) throw new Error('Failed to check order status')
    const body = await res.json()
    if (body.status === 'completed') {
      onDialogOK()
      $q.notify({
        message: t('payDialog.paymentSuccess'),
        color: 'positive'
      })
    } else if (body.status === 'cancelled') {
      onDialogCancel()
      $q.notify({
        message: t('payDialog.orderCancelled')
      })
    }
  } catch (err) {
    console.error(err)
    $q.notify({
      message: t('payDialog.checkOrderStatusFailed'),
      color: 'negative'
    })
  }
}
const interval = setInterval(checkOrderStatus, 3000)
onBeforeUnmount(() => clearInterval(interval))

const uiStateStore = useUiStateStore()
const lightColor = computed(() => hexFromArgb(uiStateStore.colors['sur-c']))
const darkColor = computed(() => hexFromArgb(uiStateStore.colors['on-sur']))
</script>
