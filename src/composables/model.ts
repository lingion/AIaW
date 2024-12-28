import { Ref, ref, watchEffect } from 'vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { Model, Provider } from 'src/utils/types'
import { useObservable } from '@vueuse/rxjs'
import { db } from 'src/utils/db'
import { DexieDBURL, LitellmBaseURL } from 'src/utils/config'
import { ProviderTypes } from 'src/utils/values'

export function useModel(provider: Ref<Provider>, model: Ref<Model>) {
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
      _provider.value = { type: 'openai', settings: { apiKey: user.value.data.apiKey, baseURL: LitellmBaseURL, compatibility: 'strict' } }
    } else {
      sdkModel.value = null
      _model.value = null
      _provider.value = null
      return
    }
    sdkModel.value = ProviderTypes.find(p => p.name === _provider.value.type).constructor(_provider.value.settings)(_model.value.name)
  })
  return { sdkModel, model: _model, provider: _provider }
}
