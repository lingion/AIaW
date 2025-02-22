import { useQuasar } from 'quasar'
import { DexieDBURL, LitellmBaseURL } from 'src/utils/config'
import { db } from 'src/utils/db'
import { localData } from 'src/utils/local-data'
import { dialogOptions } from 'src/utils/values'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

export function useFirstVisit() {
  const $q = useQuasar()
  const router = useRouter()
  const { t } = useI18n()

  onMounted(() => {
    if (location.pathname === '/set-provider') {
      localData.visited = true
      return
    }
    if (!localData.visited) {
      const serviceAvailable = DexieDBURL && LitellmBaseURL
      const message = serviceAvailable
        ? t('firstVisit.messageWithLogin')
        : t('firstVisit.messageWithoutLogin')
      $q.dialog({
        title: t('firstVisit.title'),
        message,
        html: true,
        cancel: t('firstVisit.cancel'),
        persistent: true,
        ok: serviceAvailable ? t('firstVisit.ok') : false,
        ...dialogOptions
      }).onCancel(() => {
        router.push('/settings')
        localData.visited = true
      }).onOk(() => {
        db.cloud.login()
        localData.visited = true
      })
    }
  })
}
