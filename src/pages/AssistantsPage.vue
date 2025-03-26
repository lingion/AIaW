<template>
  <router-view @toggle-drawer="drawerOpen = !drawerOpen" />
  <q-drawer
    show-if-above
    bg-sur-c-low
    :width="275"
    :breakpoint="drawerBreakpoint"
    side="right"
    v-model="drawerOpen"
  >
    <assistants-expansion
      :label="$t('assistantsPage.globalAssistant')"
      header-class="text-lg"
      default-opened
      workspace-id="$root"
    />
  </q-drawer>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useQuasar } from 'quasar'
import AssistantsExpansion from 'src/components/AssistantsExpansion.vue'

const drawerOpen = ref(false)
const drawerBreakpoint = 960
const $q = useQuasar()
const rightDrawerAbove = computed(() => $q.screen.width > drawerBreakpoint)
provide('rightDrawerAbove', rightDrawerAbove)
</script>
