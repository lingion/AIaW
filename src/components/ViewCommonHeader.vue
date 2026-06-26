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
/* Respect notch / dynamic island / status bar on fullscreen devices */
.safe-area-header {
  padding-top: constant(safe-area-inset-top); /* iOS < 11.2 */
  padding-top: env(safe-area-inset-top);
  /* Android fallback set by set-theme.ts via visualViewport.offsetTop */
  padding-top: var(--sat, env(safe-area-inset-top));
}
</style>
