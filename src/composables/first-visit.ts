import { useQuasar } from 'quasar'
import { DexieDBURL, LitellmBaseURL } from 'src/utils/config'
import { db } from 'src/utils/db'
import { localData } from 'src/utils/local-data'
import { dialogOptions } from 'src/utils/values'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

export function useFirstVisit() {
  const $q = useQuasar()
  const router = useRouter()
  onMounted(() => {
    if (location.pathname === '/set-provider') {
      localData.visited = true
      return
    }
    if (!localData.visited) {
      const serviceAvailable = DexieDBURL && LitellmBaseURL
      const message = serviceAvailable
        ? 'AIaW 是全功能、轻量级、可拓展的 AI 客户端。<br><br>为了使用 AI 模型，你需要<b>配置服务商（API）</b>或者<b>登录</b>。<br>登录之后，还可以使用跨设备实时云同步功能。'
        : 'AIaW 是全功能、轻量级、可拓展的 AI 客户端。<br><br>为了使用 AI 模型，你需要<b>配置服务商（API）</b>。'
      $q.dialog({
        title: '欢迎使用 AI as Workspace',
        message,
        html: true,
        cancel: '配置服务商',
        persistent: true,
        ok: serviceAvailable ? '登录' : false,
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
