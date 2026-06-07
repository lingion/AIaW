import { computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { almostEqual, isPlatformEnabled } from 'src/utils/functions'
import { useUiStateStore } from 'src/stores/ui-state'
import { useMdPreviewProps } from 'src/composables/md-preview-props'
import type { Dialog, Message } from 'src/utils/types'

type ScrollNavDirection = 'up' | 'down'
type ScrollNavAction = 'up' | 'down' | 'top' | 'bottom'

export function useDialogScroll(
  dialog: Ref<Dialog | null>,
  chain: Ref<string[]>,
  messageMap: Ref<Record<string, Message>>,
  propsId: Ref<string>,
  liveDialog: Ref<Dialog | null>,
  inputText: Ref<string>,
  showVars: Ref<boolean>,
  generating: Ref<boolean>,
  editingDraftState: Ref<any>,
  rightDrawerAbove: any,
  assistant: Ref<any>,
  activePlugins: Ref<any[]>,
  perfs: any,
  $q: any,
) {
  const scrollContainer = ref<HTMLElement>()
  const composerArea = ref<HTMLElement>()
  const mdPreviewProps = useMdPreviewProps()
  const activeCatalogMessageId = ref('')
  const desktopCatalogMinWidth = 1180
  const scrollNavScreenPadding = 8
  const showDesktopCatalog = computed(() =>
    perfs.messageCatalog &&
    $q.screen.gt.sm &&
    !rightDrawerAbove?.value &&
    $q.screen.width >= desktopCatalogMinWidth &&
    !!activeCatalogMessageId.value
  )
  const scrollNavRightOffset = ref(`${scrollNavScreenPadding}px`)
  const lockingBottom = ref(false)
  const composerAreaHeight = ref(164)
  const composerSpacerOffset = 14
  let composerResizeObserver: ResizeObserver | null = null

  const scrollUpBtn = ref()
  const scrollDownBtn = ref()
  const scrollTopBtn = ref()
  const scrollBottomBtn = ref()
  const scrollNavMode = ref<ScrollNavDirection | null>(null)
  const scrollNavHoverAction = ref<ScrollNavAction | null>(null)
  let scrollNavPointerId: number | null = null
  let scrollNavPointerType = ''
  let scrollNavCleanup: (() => void) | null = null

  function getScrollNavRightOffset() {
    const container = scrollContainer.value
    if (!container) return `${scrollNavScreenPadding}px`
    const contentRect = container.getBoundingClientRect()
    const right = Math.max(scrollNavScreenPadding, window.innerWidth - contentRect.right + scrollNavScreenPadding)
    return `${Math.round(right)}px`
  }

  function updateScrollNavRightOffset() {
    scrollNavRightOffset.value = getScrollNavRightOffset()
  }

  function updateActiveCatalogMessage() {
    const container = scrollContainer.value
    if (!container || !dialog.value) {
      activeCatalogMessageId.value = ''
      return
    }
    const assistantEntries = chain.value
      .slice(1)
      .map((messageId, index) => ({ messageId, renderIndex: index + 1 }))
      .filter(entry => messageMap.value[entry.messageId]?.type === 'assistant')
    if (!assistantEntries.length) {
      activeCatalogMessageId.value = ''
      return
    }
    const viewportTop = container.getBoundingClientRect().top + 24
    let nextActiveId = ''
    for (const entry of assistantEntries) {
      const shell = getMountedItemByMessageId(entry.messageId)
      if (!shell) continue
      const content = shell.querySelector<HTMLElement>(`.dialog-message-shell[data-md-id="md-${entry.messageId}"]`)
      if (!content) continue
      const rect = content.getBoundingClientRect()
      if (rect.bottom > viewportTop) {
        nextActiveId = `md-${entry.messageId}`
        break
      }
    }
    if (!nextActiveId) {
      const mountedAssistantItems = assistantEntries
        .map(entry => ({ entry, shell: getMountedItemByMessageId(entry.messageId) }))
        .filter((candidate): candidate is { entry: typeof assistantEntries[number], shell: HTMLElement } => !!candidate.shell)
      if (mountedAssistantItems.length) {
        const lastMounted = mountedAssistantItems[mountedAssistantItems.length - 1]
        const lastMountedRenderIndex = getItemRenderIndex(lastMounted.shell)
        const fallbackEntry = assistantEntries
          .filter(entry => entry.renderIndex <= lastMountedRenderIndex + 1)
          .at(-1)
        nextActiveId = fallbackEntry ? `md-${fallbackEntry.messageId}` : `md-${lastMounted.entry.messageId}`
      }
    }
    activeCatalogMessageId.value = nextActiveId
  }

  let lastScrollTop
  function scrollListener() {
    const container = scrollContainer.value
    if (container.scrollTop < lastScrollTop) {
      lockingBottom.value = false
    }
    lastScrollTop = container.scrollTop
  }
  function lockBottom() {
    lockingBottom.value && scroll('bottom', 'auto')
  }

  let pendingLockBottomFrame = 0
  function onMessageRendered(message: Message | undefined) {
    if (!message?.generatingSession || !lockingBottom.value || pendingLockBottomFrame) return
    pendingLockBottomFrame = window.requestAnimationFrame(() => {
      pendingLockBottomFrame = 0
      lockBottom()
    })
  }

  watch(lockingBottom, val => {
    if (!val && pendingLockBottomFrame) {
      window.cancelAnimationFrame(pendingLockBottomFrame)
      pendingLockBottomFrame = 0
    }
    if (val) {
      lastScrollTop = scrollContainer.value.scrollTop
      scrollContainer.value.addEventListener('scroll', scrollListener)
    } else {
      lastScrollTop = null
      scrollContainer.value.removeEventListener('scroll', scrollListener)
    }
  })

  function updateComposerAreaHeight() {
    const areaHeight = composerArea.value?.getBoundingClientRect().height ?? 0
    composerAreaHeight.value = Math.max(96, Math.ceil(areaHeight + composerSpacerOffset))
  }

  watch([composerArea, showVars, generating], () => {
    nextTick(() => updateComposerAreaHeight())
  }, { immediate: true })
  watch(() => inputText.value, () => {
    nextTick(() => updateComposerAreaHeight())
  })
  watch(() => messageMap.value[chain.value.at(-1)]?.contents?.[0]?.items?.length, () => {
    nextTick(() => updateComposerAreaHeight())
  })
  watch(() => assistant.value?.promptVars?.length, () => {
    nextTick(() => updateComposerAreaHeight())
  })
  watch(() => dialog.value?.id, () => {
    nextTick(() => updateComposerAreaHeight())
  }, { immediate: true })
  watch(composerArea, el => {
    composerResizeObserver?.disconnect()
    composerResizeObserver = null
    if (!el) return
    composerResizeObserver = new ResizeObserver(() => updateComposerAreaHeight())
    composerResizeObserver.observe(el)
    nextTick(() => updateComposerAreaHeight())
  }, { immediate: true })

  watch(scrollUpBtn, el => {
    el?.addEventListener('mousedown', ev => startScrollNavHold('up', ev))
    el?.addEventListener('touchstart', ev => startScrollNavHold('up', ev), { passive: false })
  })
  watch(scrollDownBtn, el => {
    el?.addEventListener('mousedown', ev => startScrollNavHold('down', ev))
    el?.addEventListener('touchstart', ev => startScrollNavHold('down', ev), { passive: false })
  })

  function getEls() {
    const container = scrollContainer.value
    const items: HTMLElement[] = Array.from(container?.querySelectorAll('.message-item') || [])
    return { container, items }
  }
  function getItemRenderIndex(item: HTMLElement) {
    const value = Number(item.dataset.renderIndex)
    return Number.isInteger(value) && value >= 0 ? value : -1
  }
  function getItemChainIndex(item: HTMLElement) {
    const renderIndex = getItemRenderIndex(item)
    return renderIndex >= 0 ? renderIndex + 1 : -1
  }
  function getItemMessageId(item: HTMLElement) {
    return item.dataset.messageId || ''
  }
  function getMountedItemByRenderIndex(renderIndex: number) {
    if (renderIndex < 0) return null
    const { items } = getEls()
    return items.find(item => getItemRenderIndex(item) === renderIndex) || null
  }
  function getMountedItemByMessageId(messageId: string) {
    if (!messageId) return null
    const { items } = getEls()
    return items.find(item => getItemMessageId(item) === messageId) || null
  }
  function getRenderEntryAtChainIndex(chainIndex: number) {
    if (chainIndex <= 0 || chainIndex >= chain.value.length) return null
    const messageId = chain.value[chainIndex]
    const message = messageMap.value[messageId]
    if (!message) return null
    return { chainIndex, renderIndex: chainIndex - 1, messageId, message }
  }
  function getRenderEntryFromItem(item: HTMLElement) {
    return getRenderEntryAtChainIndex(getItemChainIndex(item))
  }
  function getVisibleChainIndex(predicate: (entry: NonNullable<ReturnType<typeof getRenderEntryAtChainIndex>>, item: HTMLElement) => boolean) {
    const { container, items } = getEls()
    if (!container) return -1
    for (const item of items) {
      if (!itemInView(item, container)) continue
      const entry = getRenderEntryFromItem(item)
      if (!entry) continue
      if (predicate(entry, item)) return entry.chainIndex
    }
    return -1
  }
  function itemInView(item: HTMLElement, container: HTMLElement) {
    return item.offsetTop <= container.scrollTop + container.clientHeight &&
    item.offsetTop + item.clientHeight > container.scrollTop
  }

  function switchTo(target: 'prev' | 'next' | 'first' | 'last', switchChain: Function) {
    const catalogId = activeCatalogMessageId.value.replace(/^md-/, '')
    let index = -1
    if (catalogId) {
      const chainIndex = chain.value.findIndex(id => id === catalogId)
      if (chainIndex > 0 && dialog.value.msgTree[chain.value[chainIndex - 1]]?.length > 1) {
        index = chainIndex - 1
      }
    }
    if (index === -1) {
      const chainIndex = getVisibleChainIndex(entry => {
        const parentId = chain.value[entry.chainIndex - 1]
        return !!dialog.value.msgTree[parentId] && dialog.value.msgTree[parentId].length > 1
      })
      if (chainIndex !== -1) {
        index = chainIndex - 1
      }
    }
    if (index === -1) return
    const id = chain.value[index]
    let to
    const curr = dialog.value.msgRoute[index]
    const num = dialog.value.msgTree[id].length
    if (target === 'first') to = 0
    else if (target === 'last') to = num - 1
    else if (target === 'prev') to = curr - 1
    else if (target === 'next') to = curr + 1
    if (to < 0 || to >= num || to === curr) return
    switchChain(index, to)
  }

  function stopScrollNavHold() {
    scrollNavCleanup?.()
  }

  function getScrollNavAction(clientY: number): ScrollNavAction | null {
    const anchors: { action: ScrollNavAction, el: HTMLElement | null }[] = [
      { action: 'top', el: scrollTopBtn.value as HTMLElement | null },
      { action: 'up', el: scrollUpBtn.value as HTMLElement | null },
      { action: 'down', el: scrollDownBtn.value as HTMLElement | null },
      { action: 'bottom', el: scrollBottomBtn.value as HTMLElement | null }
    ]
    let nearest: { action: ScrollNavAction, distance: number } | null = null
    for (const { action, el } of anchors) {
      if (!el) continue
      const rect = el.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2
      const distance = Math.abs(clientY - centerY)
      if (!nearest || distance < nearest.distance) {
        nearest = { action, distance }
      }
    }
    return nearest?.action ?? null
  }

  function startScrollNavHold(direction: ScrollNavDirection, ev: MouseEvent | TouchEvent) {
    const target = ev.currentTarget as HTMLElement | null
    if (!target) return
    const isTouch = ev.type.startsWith('touch')
    const touch = isTouch ? (ev as TouchEvent).touches[0] || (ev as TouchEvent).changedTouches[0] : null
    const startClientY = touch ? touch.clientY : (ev as MouseEvent).clientY
    const startClientX = touch ? touch.clientX : (ev as MouseEvent).clientX
    const activationDistance = isTouch ? 18 : 6
    const activationDelay = isTouch ? 160 : 0
    let activated = false
    let activationTimer: ReturnType<typeof setTimeout> | null = null

    const updateHover = (nextClientY: number) => {
      scrollNavHoverAction.value = getScrollNavAction(nextClientY)
    }
    const clearState = () => {
      scrollNavMode.value = null
      scrollNavHoverAction.value = null
      scrollNavPointerId = null
      scrollNavPointerType = ''
      scrollNavCleanup = null
    }
    const clearActivationTimer = () => {
      if (activationTimer) { clearTimeout(activationTimer); activationTimer = null }
    }
    const cancelPending = () => {
      clearActivationTimer()
      window.removeEventListener('mousemove', onPendingMouseMove)
      window.removeEventListener('mouseup', onPendingMouseUp)
      window.removeEventListener('touchmove', onPendingTouchMove)
      window.removeEventListener('touchend', onPendingTouchEnd)
      window.removeEventListener('touchcancel', onPendingTouchCancel)
      window.removeEventListener('blur', onPendingWindowBlur)
      document.removeEventListener('visibilitychange', onPendingVisibilityChange)
    }
    const finish = (trigger: boolean) => {
      const action = scrollNavHoverAction.value
      cancelPending()
      scrollNavCleanup?.()
      if (trigger && action && activated) { scroll(action) }
    }
    const startHold = () => {
      if (activated) return
      activated = true
      stopScrollNavHold()
      scrollNavMode.value = direction
      scrollNavPointerId = isTouch ? 0 : 1
      scrollNavPointerType = isTouch ? 'touch' : 'mouse'
      updateHover(startClientY)
      bindActiveListeners()
    }
    const bindActiveListeners = () => {
      const onMouseMove = (moveEv: MouseEvent) => { updateHover(moveEv.clientY) }
      const onMouseUp = () => { finish(true) }
      const onTouchMove = (moveEv: TouchEvent) => {
        const nextTouch = moveEv.touches[0] || moveEv.changedTouches[0]
        if (!nextTouch) return
        updateHover(nextTouch.clientY)
        moveEv.preventDefault()
      }
      const onTouchEnd = () => { finish(true) }
      const onTouchCancel = () => { finish(false) }
      const onWindowBlur = () => finish(false)
      const onVisibilityChange = () => { if (document.hidden) finish(false) }
      if (scrollNavPointerType === 'touch') {
        window.addEventListener('touchmove', onTouchMove, { passive: false })
        window.addEventListener('touchend', onTouchEnd)
        window.addEventListener('touchcancel', onTouchCancel)
        scrollNavCleanup = () => {
          window.removeEventListener('touchmove', onTouchMove)
          window.removeEventListener('touchend', onTouchEnd)
          window.removeEventListener('touchcancel', onTouchCancel)
          window.removeEventListener('blur', onWindowBlur)
          document.removeEventListener('visibilitychange', onVisibilityChange)
          clearState()
        }
      } else {
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        scrollNavCleanup = () => {
          window.removeEventListener('mousemove', onMouseMove)
          window.removeEventListener('mouseup', onMouseUp)
          window.removeEventListener('blur', onWindowBlur)
          document.removeEventListener('visibilitychange', onVisibilityChange)
          clearState()
        }
      }
      window.addEventListener('blur', onWindowBlur)
      document.addEventListener('visibilitychange', onVisibilityChange)
    }
    const activate = () => { cancelPending(); startHold() }
    const exceedsThreshold = (clientX: number, clientY: number) => Math.hypot(clientX - startClientX, clientY - startClientY) > activationDistance
    const onPendingMouseMove = (moveEv: MouseEvent) => { if (!activated && exceedsThreshold(moveEv.clientX, moveEv.clientY)) cancelPending() }
    const onPendingMouseUp = () => { finish(true) }
    const onPendingTouchMove = (moveEv: TouchEvent) => {
      if (activated) return
      const nextTouch = moveEv.touches[0] || moveEv.changedTouches[0]
      if (nextTouch && exceedsThreshold(nextTouch.clientX, nextTouch.clientY)) cancelPending()
    }
    const onPendingTouchEnd = () => { finish(true) }
    const onPendingTouchCancel = () => { finish(false) }
    const onPendingWindowBlur = () => { finish(false) }
    const onPendingVisibilityChange = () => { if (document.hidden) finish(false) }
    if (isTouch) {
      window.addEventListener('touchmove', onPendingTouchMove, { passive: false })
      window.addEventListener('touchend', onPendingTouchEnd)
      window.addEventListener('touchcancel', onPendingTouchCancel)
    } else {
      window.addEventListener('mousemove', onPendingMouseMove)
      window.addEventListener('mouseup', onPendingMouseUp)
    }
    window.addEventListener('blur', onPendingWindowBlur)
    document.addEventListener('visibilitychange', onPendingVisibilityChange)
    if (activationDelay > 0) {
      activationTimer = setTimeout(() => { activationTimer = null; startHold() }, activationDelay)
    } else {
      startHold()
    }
  }

  function scroll(action: 'up' | 'down' | 'top' | 'bottom', behavior: 'smooth' | 'auto' = 'smooth') {
    const { container, items } = getEls()
    if (action === 'top') { container.scrollTo({ top: 0, behavior }); return }
    if (action === 'bottom') { container.scrollTo({ top: container.scrollHeight, behavior }); return }
    const index = items.findIndex(item => itemInView(item, container))
    const itemTypes = items.map(i => i.clientHeight > container.clientHeight ? 'partial' : 'entire')
    let position: 'start' | 'inner' | 'end' | 'out'
    const item = items[index]
    const type = itemTypes[index]
    if (type === 'partial') {
      if (almostEqual(container.scrollTop, item.offsetTop, 5)) position = 'start'
      else if (almostEqual(container.scrollTop + container.clientHeight, item.offsetTop + item.clientHeight, 5)) position = 'end'
      else if (container.scrollTop + container.clientHeight < item.offsetTop + item.clientHeight) position = 'inner'
      else position = 'out'
    } else {
      position = almostEqual(container.scrollTop, item.offsetTop, 5) ? 'start' : 'out'
    }
    let top
    if (type === 'entire') {
      if (action === 'up') {
        if (position === 'start') {
          if (index === 0) return
          top = itemTypes[index - 1] === 'entire' ? items[index - 1].offsetTop : items[index - 1].offsetTop + items[index - 1].clientHeight - container.clientHeight
        } else top = item.offsetTop
      } else {
        if (index === items.length - 1) return
        top = items[index + 1].offsetTop
      }
    } else {
      if (action === 'up') {
        if (position === 'start') {
          if (index === 0) return
          top = itemTypes[index - 1] === 'entire' ? items[index - 1].offsetTop : items[index - 1].offsetTop + items[index - 1].clientHeight - container.clientHeight
        } else if (position === 'out') top = item.offsetTop + item.clientHeight - container.clientHeight
        else top = item.offsetTop
      } else {
        if (position === 'end' || position === 'out') {
          if (index === items.length - 1) return
          top = items[index + 1].offsetTop
        } else top = item.offsetTop + item.clientHeight - container.clientHeight
      }
    }
    container.scrollTo({ top: top + 2, behavior: 'smooth' })
  }

  function regenerateCurr(regenerate: Function) {
    const chainIndex = getVisibleChainIndex(entry => entry.message.type === 'assistant')
    if (chainIndex === -1) return
    regenerate(chainIndex)
  }
  function editCurr(edit: Function) {
    const chainIndex = getVisibleChainIndex(entry => entry.message.type === 'user')
    if (chainIndex === -1) return
    edit(chainIndex)
  }

  // Scroll position persistence
  const uiStateStore = useUiStateStore()
  const scrollTops = uiStateStore.dialogScrollTops
  function onScroll(ev) {
    scrollTops[propsId.value] = ev.target.scrollTop
    updateActiveCatalogMessage()
    updateScrollNavRightOffset()
  }
  watch(() => liveDialog.value?.id, id => {
    activeCatalogMessageId.value = ''
    if (!id) return
    nextTick(() => {
      scrollContainer.value?.scrollTo({ top: scrollTops[id] ?? 0 })
      updateActiveCatalogMessage()
      updateScrollNavRightOffset()
    })
  })
  watch(() => propsId.value, () => {
    activeCatalogMessageId.value = ''
    nextTick(() => { updateActiveCatalogMessage(); updateScrollNavRightOffset() })
  })
  watch(chain, () => {
    nextTick(() => { updateActiveCatalogMessage(); updateScrollNavRightOffset() })
  }, { immediate: true })
  watch(showDesktopCatalog, () => {
    nextTick(() => { updateActiveCatalogMessage(); updateScrollNavRightOffset() })
  })

  onMounted(() => {
    window.addEventListener('resize', updateActiveCatalogMessage)
    window.addEventListener('resize', updateScrollNavRightOffset)
    nextTick(() => { updateActiveCatalogMessage(); updateScrollNavRightOffset() })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateActiveCatalogMessage)
    window.removeEventListener('resize', updateScrollNavRightOffset)
  })
  onUnmounted(() => {
    composerResizeObserver?.disconnect()
    stopScrollNavHold()
  })

  return {
    scrollContainer, composerArea, lockingBottom, composerAreaHeight,
    activeCatalogMessageId, showDesktopCatalog, scrollNavRightOffset,
    scrollNavMode, scrollNavHoverAction,
    scrollUpBtn, scrollDownBtn, scrollTopBtn, scrollBottomBtn,
    mdPreviewProps,
    scroll, onScroll, onMessageRendered,
    switchTo, stopScrollNavHold, startScrollNavHold,
    regenerateCurr, editCurr,
    getVisibleChainIndex,
  }
}
