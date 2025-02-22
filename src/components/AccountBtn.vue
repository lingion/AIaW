<template>
  <q-btn
    icon="sym_o_account_circle"
    @click="onClick"
    :class="{ 'route-active': $route.path === '/account' }"
    :label="user.isLoggedIn ? $t('accountBtn.account') : $t('accountBtn.login')"
  />
</template>

<script setup lang="ts">
import { useObservable } from '@vueuse/rxjs'
import { db } from 'src/utils/db'
import { useRouter } from 'vue-router'

const user = useObservable(db.cloud.currentUser)

const router = useRouter()
function onClick() {
  if (user.value.isLoggedIn) {
    router.push('/account')
  } else {
    db.cloud.login()
  }
}
</script>

<style scoped>

</style>
