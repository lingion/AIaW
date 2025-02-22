<template>
  <transition name="fade">
    <q-page-container
      v-if="show"
    >
      <q-page
        flex
        items-center
        pos-relative
      >
        <q-btn
          flat
          round
          dense
          icon="sym_o_menu"
          pos-absolute
          top-2
          left-3
          v-if="props.drawerToggle"
          @click="uiStateStore.mainDrawerOpen = !uiStateStore.mainDrawerOpen"
        />
        <hint-card
          img-url="/emotions/nachoneko/19.webp"
          message="$t('errorNotFound.message')"
        />
      </q-page>
    </q-page-container>
  </transition>
</template>

<script setup lang="ts">
import HintCard from 'src/components/HintCard.vue'
import { ref, onMounted } from 'vue'
import { useUiStateStore } from 'src/stores/ui-state'

const props = defineProps<{
  timeout?: number,
  drawerToggle?: boolean
}>()

const uiStateStore = useUiStateStore()

const show = ref(false)

onMounted(() => {
  setTimeout(() => {
    show.value = true
  }, props.timeout || 150)
})

</script>
