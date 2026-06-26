<template>
  <q-header
    bg-sur-c-low
    text-on-sur
    class="safe-area-header"
  >
    <q-toolbar>
      <q-btn
        v-if="backTo"
        flat
        dense
        round
        icon="sym_o_arrow_back"
        @click="back"
      />
      <q-btn
        v-else
        flat
        dense
        round
        icon="sym_o_menu"
        @click="uiStore.toggleMainDrawer"
      />
      <slot />
      <q-btn
        flat
        dense
        round
        icon="sym_o_segment"
        @click="$emit('toggle-drawer')"
        @contextmenu.prevent="$emit('contextmenu')"
      />
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { useBack } from 'src/composables/back'
import { useUiStateStore } from 'src/stores/ui-state'

const uiStore = useUiStateStore()

defineEmits(['toggle-drawer', 'contextmenu'])

const props = defineProps<{
  backTo?: string
}>()
const back = useBack(props.backTo)
</script>
<style scoped>
/* Respect notch / dynamic island / status bar on fullscreen devices.
 * --sat is set by set-theme.ts at boot from StatusBar.getInfo().height, and
 * env(safe-area-inset-top) is the iOS path. On older Android WebViews where
 * neither is supported we still get the bar height from StatusBar, so the
 * buttons are never under the status bar / dynamic island. */
.safe-area-header {
  padding-top: var(--sat, 24px);
  padding-top: max(var(--sat, 24px), env(safe-area-inset-top, 0px), constant(safe-area-inset-top, 0px));
}
</style>
