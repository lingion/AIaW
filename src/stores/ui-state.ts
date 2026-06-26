import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStateStore = defineStore('ui-state', () => {
  const mainDrawerOpen = ref(false)
  // Bug #10: the right-hand workspace drawer (artifacts / dialog list) used
  // to be a local `ref(false)` in WorkspacePage, so it silently closed every
  // time the workspace component remounted. Persist it here so dialog
  // navigation keeps the drawer where the user left it.
  const workspaceDrawerOpen = ref(false)
  function toggleMainDrawer() {
    mainDrawerOpen.value = !mainDrawerOpen.value
  }
  function toggleWorkspaceDrawer() {
    workspaceDrawerOpen.value = !workspaceDrawerOpen.value
  }
  const colors = ref({})
  const dialogScrollTops = ref<Record<string, number>>({})
  return { mainDrawerOpen, workspaceDrawerOpen, toggleMainDrawer, toggleWorkspaceDrawer, colors, dialogScrollTops }
})
