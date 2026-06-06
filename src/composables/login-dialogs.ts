import { useQuasar } from 'quasar'
import { useObservable } from '@vueuse/rxjs'
import { db } from 'src/utils/db'
import { watch } from 'vue'
import { dialogOptions } from 'src/utils/values'
import { DexieDBURL } from 'src/utils/config'
import { useI18n } from 'vue-i18n'
import { useToast } from 'src/composables/useToast'

export function useLoginDialogs() {
  if (!DexieDBURL) return
  const userInteraction = useObservable(db.cloud.userInteraction)
  const user = useObservable(db.cloud.currentUser)
  const $q = useQuasar()
  const { t } = useI18n()
  const { toastError, toastInfo, toastSuccess } = useToast()
  let loginNotify = false

  watch(userInteraction, interaction => {
    if (!interaction) return
    if (interaction.type === 'email') {
      $q.dialog({
        title: t('login.register'),
        message: t('login.privacyPolicy'),
        html: true,
        prompt: {
          model: '',
          type: 'email',
          label: 'Email'
        },
        cancel: true,
        ok: t('login.next'),
        noRouteDismiss: true,
        ...dialogOptions
      }).onOk(email => {
        interaction.onSubmit({ email })
      })
    } else if (interaction.type === 'otp') {
      $q.dialog({
        title: t('login.otp'),
        message: t('login.enterOtp'),
        prompt: {
          model: '',
          type: 'text',
          label: t('login.otp')
        },
        cancel: true,
        persistent: true,
        noRouteDismiss: true,
        ...dialogOptions
      }).onOk(otp => {
        interaction.onSubmit({ otp })
        loginNotify = true
      }).onCancel(() => {
        interaction.onCancel()
      })
    } else if (interaction.type === 'logout-confirmation') {
      $q.dialog({
        title: t('login.logout'),
        message: t('login.confirmLogout'),
        cancel: true,
        ok: t('login.logout'),
        persistent: true,
        ...dialogOptions
      }).onOk(() => {
        interaction.onSubmit({})
      }).onCancel(() => {
        interaction.onCancel()
      })
    } else if (interaction.type === 'message-alert') {
      for (const alert of interaction.alerts) {
        if (alert.type === 'info') {
          toastInfo(alert.message)
        } else {
          toastError(alert.message)
        }
      }
    }
  })
  watch(() => user.value.isLoggedIn, isLoggedIn => {
    isLoggedIn && loginNotify && toastSuccess(t('login.loggedIn', { email: user.value.email }))
    loginNotify = false
  })
}
