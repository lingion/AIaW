<template>
  <router-view />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFirstVisit } from './composables/first-visit'
import { useLoginDialogs } from './composables/login-dialogs'
import { useSetTheme } from './composables/set-theme'
import { useSubscriptionNotify } from './composables/subscription-notify'
import { onMounted } from 'vue'
import { useMigrationAlert } from './composables/migration-alert'
import { db } from './utils/db'
import { reconcileAssistantBuiltinPlugins } from './utils/builtin-plugin-seed'

defineOptions({
  name: 'App'
})

useSetTheme()
useLoginDialogs()
useFirstVisit()
useSubscriptionNotify()
useMigrationAlert()

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
  // TEMP: disable live update startup path during UI debugging.
  // Do not call ready() / checkUpdate() here, otherwise remote bundle may override local frontend.
  migrateBuiltinPluginsAtStartup()
})

</script>
