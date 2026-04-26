import { useQuasar } from 'quasar'
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
      $q.dialog({
        title: t('firstVisit.title'),
        message: t('firstVisit.messageWithoutLogin'),
        html: true,
        cancel: {
          label: t('firstVisit.cancel'),
          noCaps: true,
          flat: true
        },
        persistent: true,
        ok: false,
        ...dialogOptions
      }).onCancel(() => {
        router.push('/settings')
        localData.visited = true
      })
    }
  })
}
