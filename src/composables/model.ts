import { Ref, ref, watchEffect } from 'vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { Model, Provider } from 'src/utils/types'
import { useObservable } from '@vueuse/rxjs'
import { db } from 'src/utils/db'
import { DexieDBURL, LitellmBaseURL } from 'src/utils/config'
import { wrapLanguageModel } from 'ai'
import { AuthropicCors, FormattingReenabled } from 'src/utils/middlewares'
import { fetch } from 'src/utils/platform-api'
import { useProvidersStore } from 'src/stores/providers'

const FormattingModels = ['o1', 'o3-mini', 'o3-mini-2025-01-31']

export function useModel(provider: Ref<Provider>, model: Ref<Model>, options?: Ref<Record<string, any>>) {
  const sdkModel = ref(null)
  const _model = ref<Model>(null)
  const _provider = ref<Provider>(null)
  const { perfs } = useUserPerfsStore()
  const user = DexieDBURL ? useObservable(db.cloud.currentUser) : null
  const providersStore = useProvidersStore()
  function clear() {
    sdkModel.value = null
    _model.value = null
    _provider.value = null
  }
  function fallbackDefault() {
    if (!user?.value.isLoggedIn) {
      clear()
      return
    }
    _provider.value = {
      type: 'openai',
      settings: { apiKey: user.value.data.apiKey, baseURL: LitellmBaseURL, compatibility: 'strict' }
    }
    sdkModel.value = providersStore.providerTypes.find(p => p.name === 'openai')?.constructor({
      ..._provider.value.settings,
      fetch
    })(_model.value.name, options?.value)
    setMiddleware()
  }
  function setMiddleware() {
    const middleware = []
    FormattingModels.includes(_model.value.name) && middleware.push(FormattingReenabled)
    sdkModel.value.provider.startsWith('anthropic.') && middleware.push(AuthropicCors)
    if (middleware.length) {
      sdkModel.value = wrapLanguageModel({
        model: sdkModel.value,
        middleware
      })
    }
  }
  watchEffect(() => {
    _model.value = model.value || perfs.model
    if (!_model.value) {
      clear()
      return
    }
    if (provider.value) _provider.value = provider.value
    else if (perfs.provider) _provider.value = perfs.provider
    else {
      fallbackDefault()
      return
    }
    const sdkProvider = providersStore.providerTypes.find(p => p.name === _provider.value.type)?.constructor({
      ..._provider.value.settings,
      fetch
    })
    if (!sdkProvider) {
      clear()
      return
    }
    sdkModel.value = sdkProvider(_model.value.name, options?.value)
    if (!sdkModel.value) {
      fallbackDefault()
      return
    }
    setMiddleware()
  })
  return { sdkModel, model: _model, provider: _provider }
}
