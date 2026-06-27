<template>
  <router-view />
  <GlobalToast />
  <!-- Vue 渲染错误兜底: 如果顶层组件崩溃，显示错误信息而不是白屏 -->
  <div
    v-if="fatalError"
    class="fixed column items-center justify-center text-center"
    :style="{
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999999,
      background: 'rgb(20, 19, 22)',
      color: 'rgb(230, 225, 230)',
      padding: '24px',
    }"
  >
    <div style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">
      {{ $t('app.fatalError') }}
    </div>
    <div style="font-size: 13px; opacity: 0.8; max-width: 320px; word-break: break-all;">
      {{ fatalError }}
    </div>
    <button
      class="q-mt-md"
      style="padding: 8px 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: inherit; font-size: 13px;"
      @click="reload"
    >
      {{ $t('app.reload') }}
    </button>
  </div>
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
import { onMounted, ref } from 'vue'
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

// 真实 navigator.onLine 在 Android WebView 101 上永远返回 false，会误触发。
// 只在用户发起 fetch 失败 / API 显式报告网络错误时才显示 offline banner。
// 暂时禁用自动 navigator.onLine 检测，避免误报。
const online = ref<boolean | null>(true)

// 兜底: 捕获 Vue 渲染错误，显示错误 UI 而不是白屏
const fatalError = ref<string | null>(null)
function reload() { window.location.reload() }

const router = useRouter()
router.afterEach(to => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - AI as Workspace`
  }
})

// 捕获全局错误和未处理的 promise 拒绝
onMounted(() => {
  window.addEventListener('error', (e) => {
    if (e.error) {
      fatalError.value = String(e.error?.message || e.error)
    }
  })
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason
    fatalError.value = String(r?.message || r || 'Unhandled promise rejection')
  })
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
