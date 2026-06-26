<template>
  <router-view />
  <GlobalToast />
  <!-- Bug #15: surface a small banner when the device goes offline so the user
       doesn't wonder why streaming errors appear; auto-hides on reconnect. -->
  <transition name="offline-fade">
    <div
      v-if="online === false"
      class="fixed-top row items-center justify-center q-py-xs"
      :style="{
        zIndex: 9000000,
        background: 'rgba(198, 40, 40, 0.92)',
        color: 'white',
        top: 'max(0px, var(--sat, 24px))',
        left: 0,
        right: 0,
        fontSize: '12px',
        fontWeight: 600,
        pointerEvents: 'none',
      }"
    >
      {{ $t('app.offline') }}
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFirstVisit } from './composables/first-visit'
import { useLoginDialogs } from './composables/login-dialogs'
import { useSetTheme } from './composables/set-theme'
import { useSubscriptionNotify } from './composables/subscription-notify'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useMigrationAlert } from './composables/migration-alert'
import { db } from './utils/db'
import { reconcileAssistantBuiltinPlugins } from './utils/builtin-plugin-seed'
import GlobalToast from 'src/components/GlobalToast.vue'

defineOptions({
  name: 'App'
})

useSetTheme()
useLoginDialogs()
useFirstVisit()
useSubscriptionNotify()
useMigrationAlert()

// Bug #15: track online status. `null` = unknown, `true` = online, `false` = offline.
const online = ref<boolean | null>(navigator.onLine)
function setOnline() { online.value = true }
function setOffline() { online.value = false }
window.addEventListener('online', setOnline)
window.addEventListener('offline', setOffline)
onBeforeUnmount(() => {
  window.removeEventListener('online', setOnline)
  window.removeEventListener('offline', setOffline)
})

const router = useRouter()
router.afterEach(to => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - AI as Workspace`
  }
})

async function migrateBuiltinPluginsAtStartup() {
  try {
    const assistants = await db.assistants.toArray()
    for (const assistant of assistants) {
      const beforeKeys = Object.keys(assistant.plugins || {})
      const migrated = reconcileAssistantBuiltinPlugins(assistant)
      const afterKeys = Object.keys(migrated.plugins || {})
      if (afterKeys.length !== beforeKeys.length || afterKeys.some(k => !beforeKeys.includes(k))) {
        await db.assistants.put(migrated)
      }
    }
  } catch (e) {
    console.error('builtin plugin migration failed', e)
  }
}

onMounted(() => {
  migrateBuiltinPluginsAtStartup()
})

</script>

<style scoped>
.offline-fade-enter-active,
.offline-fade-leave-active {
  transition: opacity 0.25s ease;
}
.offline-fade-enter-from,
.offline-fade-leave-to {
  opacity: 0;
}
</style>
