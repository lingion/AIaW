import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'

/**
 * Renders only a sliding window of the message chain to prevent
 * DOM bloat in long conversations. Older messages are loaded on
 * scroll-up via IntersectionObserver sentinel placed at the top.
 *
 * Architecture:
 *   - Initial render: last INITIAL_LIMIT messages
 *   - Scroll to top → sentinel enters viewport → loadMore (LOAD_MORE_SIZE)
 *   - Scroll position is preserved by compensating scrollHeight delta
 *   - Observer is gated with cooldown to prevent rapid-fire loads
 */
export function useMessageWindow(
  chain: Ref<string[]>,
  scrollContainer: Ref<HTMLElement | undefined>,
) {
  const INITIAL_LIMIT = 100
  const LOAD_MORE_SIZE = 50
  const MAX_RENDER_CAP = 200  // hard limit: never render more than this
  const SETTLE_DELAY_MS = 500
  const OBSERVER_COOLDOWN_MS = 600

  const renderStart = ref(Math.max(0, chain.value.length - INITIAL_LIMIT))
  const renderEnd = ref(chain.value.length)
  const isLoadingMore = ref(false)

  const reset = () => {
    renderEnd.value = chain.value.length
    renderStart.value = Math.max(0, renderEnd.value - INITIAL_LIMIT)
    isLoadingMore.value = false
  }

  // Stable-keyed visible slice — keys are message IDs so Vue won't remount
  const visibleItems = computed(() =>
    chain.value
      .slice(renderStart.value, renderEnd.value)
      .map((id, i) => ({
        id,
        originalIndex: renderStart.value + i,
      })),
  )

  const hasMore = computed(() => renderStart.value > 0)

  function loadMore() {
    if (isLoadingMore.value || !hasMore.value) return
    isLoadingMore.value = true

    const container = scrollContainer.value
    const prevScrollHeight = container?.scrollHeight ?? 0
    const prevScrollTop = container?.scrollTop ?? 0

    renderStart.value = Math.max(0, renderStart.value - LOAD_MORE_SIZE)
    // Enforce max cap: if window exceeds limit, drop oldest messages
    if (renderEnd.value - renderStart.value > MAX_RENDER_CAP) {
      renderEnd.value = renderStart.value + MAX_RENDER_CAP
    }

    // Restore scroll position after Vue re-renders expanded content
    nextTick(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight
        container.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight)
      }
      // Cooldown: don't let the observer fire again immediately
      setTimeout(() => {
        isLoadingMore.value = false
      }, OBSERVER_COOLDOWN_MS)
    })
  }

  // ── IntersectionObserver sentinel ──
  const sentinelRef = ref<HTMLElement>()
  let sentinelObserver: IntersectionObserver | null = null
  let settleTimer: ReturnType<typeof setTimeout> | null = null

  function setupSentinel(el: HTMLElement) {
    sentinelObserver?.disconnect()
    sentinelObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore()
        }
      },
      { root: scrollContainer.value ?? null, threshold: 0 },
    )
    sentinelObserver.observe(el)
  }

  function teardownSentinel() {
    sentinelObserver?.disconnect()
    sentinelObserver = null
    if (settleTimer) {
      clearTimeout(settleTimer)
      settleTimer = null
    }
  }

  // Watch the sentinel DOM element: set up observer with delay so
  // initial scroll restoration has time to settle before detection.
  watch(sentinelRef, (el) => {
    teardownSentinel()
    if (!el) return
    settleTimer = setTimeout(() => {
      setupSentinel(el)
      settleTimer = null
    }, SETTLE_DELAY_MS)
  })

  onBeforeUnmount(() => {
    teardownSentinel()
  })

  return {
    visibleItems,
    renderStart,
    renderEnd,
    hasMore,
    isLoadingMore,
    loadMore,
    reset,
    sentinelRef,
  }
}
