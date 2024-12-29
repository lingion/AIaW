<template><div /></template>

<script setup lang="ts">
import { Validator } from '@cfworker/json-schema'
import { until } from '@vueuse/core'
import { useQuasar } from 'quasar'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { ProviderSchema } from 'src/utils/types'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userPerfsStore = useUserPerfsStore()
const $q = useQuasar()

until(() => userPerfsStore.ready).toBeTruthy().then(() => {
  try {
    const provider = JSON.parse(route.query.provider as string)
    if (!new Validator(ProviderSchema).validate(provider)) {
      throw new Error('Invalid provider schema')
    }
    const bak = userPerfsStore.perfs.provider
    userPerfsStore.perfs.provider = provider
    $q.notify({
      message: `已设置服务商为：${provider.settings.baseURL}`,
      color: 'positive',
      actions: [{
        label: '还原',
        handler: () => {
          userPerfsStore.perfs.provider = bak
        },
        color: 'white'
      }],
      timeout: 6000
    })
  } catch (e) {
    console.error(e)
    $q.notify({
      message: '设置服务商失败：格式错误',
      color: 'negative'
    })
  } finally {
    router.replace('/settings')
  }
})
</script>
