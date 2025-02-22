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
    <q-expansion-item
      :label="$t('assistantsPage.globalAssistant')"
      header-class="text-lg"
      default-opened
    >
      <assistant-list workspace-id="$root" />
    </q-expansion-item>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useQuasar } from 'quasar'
import AssistantList from 'src/components/AssistantList.vue'

const drawerOpen = ref(false)
const drawerBreakpoint = 960
const $q = useQuasar()
const rightDrawerAbove = computed(() => $q.screen.width > drawerBreakpoint)
provide('rightDrawerAbove', rightDrawerAbove)
</script>
