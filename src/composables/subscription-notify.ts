import { until } from '@vueuse/core'
import { useObservable } from '@vueuse/rxjs'
import { useQuasar } from 'quasar'
import { useUserDataStore } from 'src/stores/user-data'
import { DexieDBURL } from 'src/utils/config'
import { db } from 'src/utils/db'
import { useRouter } from 'vue-router'

export function useSubscriptionNotify() {
  if (!DexieDBURL) return
  const user = useObservable(db.cloud.currentUser)
  const router = useRouter()
  const $q = useQuasar()
  const store = useUserDataStore()
  const { data } = store
  function subscribe() {
    router.push('/account')
  }
  function notify() {
    if (!user.value.isLoggedIn) return
    if (user.value.license.type === 'eval') {
      if (user.value.license.evalDaysLeft <= 0) {
        if (data.evalExpiredNotified) return
        $q.notify({
          message: '云同步试用已过期，可选择订阅',
          color: 'negative',
          actions: [{
            label: '订阅',
            handler: subscribe,
            textColor: 'on-err'
          }]
        })
        data.evalExpiredNotified = true
      } else if (user.value.license.evalDaysLeft <= 1) {
        $q.notify({
          message: '云同步试用即将过期，可选择订阅',
          color: 'inv-sur',
          textColor: 'inv-on-sur',
          actions: [{
            label: '订阅',
            handler: subscribe,
            textColor: 'inv-pri'
          }]
        })
      }
    } else if (user.value.license.type === 'prod') {
      const { validUntil } = user.value.license
      if (validUntil < new Date()) {
        if (data.prodExpiredNotifiedTimestamp === validUntil.getTime()) return
        $q.notify({
          message: '您的云同步订阅已过期',
          color: 'negative',
          actions: [{
            label: '续订',
            handler: subscribe,
            textColor: 'on-err'
          }]
        })
        data.prodExpiredNotifiedTimestamp = validUntil.getTime()
      } else if (validUntil.getTime() - Date.now() <= 1000 * 60 * 60 * 24 * 2) {
        $q.notify({
          message: '您的云同步订阅即将过期',
          color: 'inv-sur',
          textColor: 'inv-on-sur',
          actions: [{
            label: '续订',
            handler: subscribe,
            textColor: 'inv-pri'
          }]
        })
      }
    }
  }
  until(() => store.ready).toBeTruthy().then(notify)
}
