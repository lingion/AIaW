<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card min-w="320px">
      <q-card-section>
        <div class="text-h6">
          {{ $t('subscribeDialog.title') }}
        </div>
      </q-card-section>
      <q-card-section p-0>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>
                {{ $t('subscribeDialog.duration') }}
              </q-item-label>
              <q-item-label
                caption
                v-if="payMethod === 'wxpay'"
              >
                {{ $t('subscribeDialog.priceCNY', { price: SyncServicePrice }) }}
              </q-item-label>
              <q-item-label
                caption
                v-else
              >
                {{ $t('subscribeDialog.priceUSD', { price: SyncServicePriceUSD }) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-input
                class="w-50px"
                v-model.number="amount"
                type="number"
              />
            </q-item-section>
          </q-item>
          <q-item v-if="payMethod === 'stripe'">
            <q-item-section>
              {{ $t('topupDialog.transactionFee') }}
            </q-item-section>
            <q-item-section side>
              {{ `$ ${StripeFee}` }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              {{ $t('subscribeDialog.amountDue') }}
            </q-item-section>
            <q-item-section side>
              {{ payAmount }}
            </q-item-section>
          </q-item>
          <pay-method-item v-model="payMethod" />
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          color="primary"
          :label="$t('subscribeDialog.cancel')"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          color="primary"
          :label="$t('subscribeDialog.order')"
          :loading
          :disable="!valid"
          @click="order({ type: 'sync-service', amount }, payMethod)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { useOrder } from 'src/composables/order'
import { StripeFee, SyncServicePrice, SyncServicePriceUSD } from 'src/utils/config'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PayMethodItem from './PayMethodItem.vue'

defineEmits([
  ...useDialogPluginComponent.emits
])

const { locale } = useI18n()
const payMethod = ref<'wxpay' | 'stripe'>(locale.value === 'zh-CN' ? 'wxpay' : 'stripe')

const amount = ref<number>(locale.value === 'zh-CN' ? 1 : 3)
const payAmount = computed(() => {
  if (!valid.value) return '-'
  if (payMethod.value === 'wxpay') {
    return '￥' + (amount.value * SyncServicePrice).toFixed(2)
  } else {
    return '$ ' + (amount.value * SyncServicePriceUSD + StripeFee).toFixed(2)
  }
})

const valid = computed(() => amount.value > 0 && amount.value < 100 && amount.value % 1 === 0)
const loading = ref(false)

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const { order } = useOrder(loading, onDialogOK)
</script>
