import { useQuasar } from 'quasar'
import { BudgetBaseURL } from 'src/utils/config'
import { db } from 'src/utils/db'
import { OrderItem } from 'src/utils/types'
import { Ref } from 'vue'
import { useI18n } from 'vue-i18n'

export function useOrder(loading: Ref<boolean>, onDialogOK: (res) => void) {
  const $q = useQuasar()
  const { t } = useI18n()
  async function order(item: OrderItem) {
    try {
      loading.value = true
      const res = await fetch(`${BudgetBaseURL}/wxpay-order`, {
        method: 'POST',
        body: JSON.stringify({
          item
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${db.cloud.currentUser.value.accessToken}`
        }
      })
      if (!res.ok) throw new Error('Failed to order')
      const body = await res.json()
      onDialogOK({
        orderId: body.order_id,
        payUrl: body.pay_url
      })
    } catch (error) {
      console.error(error)
      $q.notify({
        message: t('order.failure'),
        color: 'negative'
      })
    } finally {
      loading.value = false
    }
  }
  return {
    order
  }
}
