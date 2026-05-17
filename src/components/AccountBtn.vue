<template>
  <q-btn
    icon="sym_o_account_circle"
    @click="onClick"
    :class="{ 'route-active': $route.path === '/account' }"
    :label="isLoggedIn ? $t('accountBtn.account') : $t('accountBtn.login')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useObservable } from '@vueuse/rxjs'
import { db } from 'src/utils/db'
import { useRouter } from 'vue-router'

const user = useObservable(db.cloud.currentUser)
const isLoggedIn = computed(() => !!user.value?.isLoggedIn)

const router = useRouter()
function onClick() {
  if (isLoggedIn.value) {
    router.push('/account')
  } else {
    db.cloud.login()
  }
}
</script>

<style scoped>

</style>
