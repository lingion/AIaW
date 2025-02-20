import { Ref, ref, watchEffect } from 'vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { Model, Provider } from 'src/utils/types'
import { useObservable } from '@vueuse/rxjs'
import { db } from 'src/utils/db'
import { DexieDBURL, LitellmBaseURL } from 'src/utils/config'
import { ProviderTypes } from 'src/utils/values'
import { wrapLanguageModel } from 'ai'
import { FormattingReenabled } from 'src/utils/middlewares'
import { fetch } from 'src/utils/platform-api'

const FormattingModels = ['o1', 'o3-mini', 'o3-mini-2025-01-31']

export function useModel(provider: Ref<Provider>, model: Ref<Model>, options?: Ref<Record<string, any>>) {
  const sdkModel = ref(null)
  const _model = ref<Model>(null)
  const _provider = ref<Provider>(null)
  const { perfs } = useUserPerfsStore()
  const user = DexieDBURL ? useObservable(db.cloud.currentUser) : null
  watchEffect(() => {
    _model.value = model.value || perfs.model
    if (!_model.value) {
      sdkModel.value = null
      _model.value = null
      _provider.value = null
      return
    }
    if (provider.value) _provider.value = provider.value
    else if (perfs.provider) _provider.value = perfs.provider
    else if (user?.value.isLoggedIn) {
      _provider.value = {
        type: 'openai',
        settings: { apiKey: user.value.data.apiKey, baseURL: LitellmBaseURL, compatibility: 'strict' }
      }
    } else {
      sdkModel.value = null
      _model.value = null
      _provider.value = null
      return
    }
    const sdkProvider = ProviderTypes.find(p => p.name === _provider.value.type).constructor({
      ..._provider.value.settings,
      fetch
    })
    sdkModel.value = sdkProvider(_model.value.name, options?.value)
    if (FormattingModels.includes(_model.value.name)) {
      sdkModel.value = wrapLanguageModel({
        model: sdkModel.value,
        middleware: FormattingReenabled
      })
    }
  })
  return { sdkModel, model: _model, provider: _provider }
}
