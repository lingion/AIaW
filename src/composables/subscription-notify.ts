import { until } from '@vueuse/core'
import { useObservable } from '@vueuse/rxjs'
import { useUserDataStore } from 'src/stores/user-data'
import { DexieDBURL } from 'src/utils/config'
import { db } from 'src/utils/db'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'src/composables/useToast'

export function useSubscriptionNotify() {
  if (!DexieDBURL) return
  const user = useObservable(db.cloud.currentUser)
  const router = useRouter()
  const store = useUserDataStore()
  const { data } = store
  const { t } = useI18n()
  const { toastAction } = useToast()
  function subscribe() {
    router.push('/account')
  }
  function notify() {
    if (!user.value.isLoggedIn) return
    if (user.value.license.type === 'eval') {
      if (user.value.license.evalDaysLeft <= 0) {
        if (data.evalExpiredNotified) return
        toastAction('negative', t('subscriptionNotify.evalExpired'), [{
          label: t('subscriptionNotify.ok'),
          handler: subscribe,
        }])
        data.evalExpiredNotified = true
      } else if (user.value.license.evalDaysLeft <= 1) {
        toastAction('info', t('subscriptionNotify.evalExpiring'), [{
          label: t('subscriptionNotify.subscribe'),
          handler: subscribe,
        }])
      }
    } else if (user.value.license.type === 'prod') {
      const { validUntil } = user.value.license
      if (validUntil < new Date()) {
        if (data.prodExpiredNotifiedTimestamp === validUntil.getTime()) return
        toastAction('negative', t('subscriptionNotify.prodExpired'), [{
          label: t('subscriptionNotify.renewal'),
          handler: subscribe,
        }])
        data.prodExpiredNotifiedTimestamp = validUntil.getTime()
      } else if (validUntil.getTime() - Date.now() <= 1000 * 60 * 60 * 24 * 2) {
        toastAction('info', t('subscriptionNotify.prodExpiring'), [{
          label: t('subscriptionNotify.renewal'),
          handler: subscribe,
        }])
      }
    }
  }
  until(() => store.ready).toBeTruthy().then(notify)
}
