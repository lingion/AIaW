import { ShortcutKey } from 'src/utils/types'
import { onActivated, onDeactivated, onMounted, onUnmounted, Ref, unref } from 'vue'

export function useListenKey(shortcutKey: Ref<ShortcutKey>, callback, prevent = true) {
  const listener = event => {
    const { key, withCtrl = false, withShift = false, withAlt = false } = unref(shortcutKey)
    if (event.code === key && event.ctrlKey === withCtrl && event.shiftKey === withShift && event.altKey === withAlt) {
      callback()
      prevent && event.preventDefault()
    }
  }
  const addListener = () => { document.addEventListener('keydown', listener) }
  const rmListener = () => { document.removeEventListener('keydown', listener) }
  onMounted(addListener)
  onUnmounted(rmListener)
  onActivated(addListener)
  onDeactivated(rmListener)
}
