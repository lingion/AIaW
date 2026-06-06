import { reactive, ref } from 'vue'

/**
 * Global swipe-to-dismiss Toast.
 * Replaces all Quasar Notify.create calls with a unified custom component.
 * Supports: positive (green check) / negative (red X) / info (blue i)
 * Features: swipe-up dismiss, auto-dismiss, real-time drag animation.
 */

const toast = reactive({
  show: false,
  type: 'positive' as 'positive' | 'negative' | 'info',
  title: '',
  message: '',
  actions: [] as { label: string; handler: () => void }[],
  timer: null as ReturnType<typeof setTimeout> | null,
})

let toastStartY = 0
let toastCurrentY = 0

export function useToast() {
  function showToast(
    type: 'positive' | 'negative' | 'info' = 'positive',
    title: string,
    message: string = '',
    duration?: number,
    actions: { label: string; handler: () => void }[] = [],
  ) {
    if (toast.timer) clearTimeout(toast.timer)
    toast.type = type
    toast.title = title
    toast.message = message
    toast.actions = actions
    toast.show = true

    const ms = duration ?? (type === 'positive' ? 1200 : type === 'negative' ? 2500 : 1500)
    if (ms > 0) {
      toast.timer = setTimeout(() => { toast.show = false }, ms)
    }
  }

  function dismissToast() {
    if (toast.timer) clearTimeout(toast.timer)
    toast.actions = []
    toast.show = false
  }

  function onToastTouchStart(e: TouchEvent) {
    toastStartY = e.touches[0].clientY
    toastCurrentY = toastStartY
  }

  function onToastTouchMove(e: TouchEvent) {
    toastCurrentY = e.touches[0].clientY
    const moveY = toastCurrentY - toastStartY
    if (moveY < 0) {
      ;(e.currentTarget as HTMLElement).style.transform = `translateY(${moveY}px)`
    }
  }

  function onToastTouchEnd(e: TouchEvent) {
    const moveY = toastCurrentY - toastStartY
    if (toastCurrentY !== 0 && moveY < -15) {
      dismissToast()
    } else {
      ;(e.currentTarget as HTMLElement).style.transform = ''
    }
    toastStartY = 0
    toastCurrentY = 0
  }

  // Convenience shortcuts
  const toastSuccess = (title: string, message?: string) => showToast('positive', title, message)
  const toastError = (title: string, message?: string) => showToast('negative', title, message)
  const toastInfo = (title: string, message?: string) => showToast('info', title, message)
  const toastAction = (
    type: 'positive' | 'negative' | 'info',
    title: string,
    actions: { label: string; handler: () => void }[],
    message = '',
  ) => showToast(type, title, message, 0, actions)

  return {
    toast,
    showToast,
    dismissToast,
    toastSuccess,
    toastError,
    toastInfo,
    toastAction,
    onToastTouchStart,
    onToastTouchMove,
    onToastTouchEnd,
  }
}
