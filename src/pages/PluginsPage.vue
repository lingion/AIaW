<template>
  <router-view @toggle-drawer="drawerOpen = !drawerOpen" />
  <q-drawer
    show-if-above
    bg-sur-c-low
    :width="320"
    :breakpoint="drawerBreakpoint"
    side="right"
    v-model="drawerOpen"
  >
    <q-expansion-item
      :label="$t('pluginsPage.installedPlugins')"
      header-class="text-lg"
      default-opened
    >
      <installed-plugins />
    </q-expansion-item>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import InstalledPlugins from 'src/components/InstalledPlugins.vue'
import { useQuasar } from 'quasar'

const drawerOpen = ref(false)
const drawerBreakpoint = 960
const $q = useQuasar()
const rightDrawerAbove = computed(() => $q.screen.width > drawerBreakpoint)
provide('rightDrawerAbove', rightDrawerAbove)
</script>
