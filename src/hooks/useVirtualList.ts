import {
  ref,
  computed,
  type Ref,
  onMounted,
  onUnmounted,
  watch,
  type CSSProperties,
  nextTick,
} from 'vue'
import { throttle } from 'lodash-es'

interface VirtualListOptions {
  itemHeight: number
  overscan?: number
  itemGap?: number
}

interface Position {
  index: number
  height: number
  top: number
  bottom: number
}

export function useVirtualList<T>(rawData: Ref<T[]>, options: VirtualListOptions) {
  const containerRef: Ref<HTMLElement | null> = ref(null)
  const positions = ref<Position[]>([])
  const startIndex = ref(0)
  const endIndex = ref(0)
  const overscan = options.overscan || 5
  const itemGap = options.itemGap || 0
  const isAtBottom = ref(true)

  const totalHeight = computed(() => {
    if (positions.value.length === 0) return 0
    return positions.value[positions.value.length - 1].bottom
  })

  const visibleData = computed(() => {
    if (positions.value.length === 0) return []
    return rawData.value.slice(startIndex.value, endIndex.value + 1).map((item, index) => ({
      data: item,
      index: startIndex.value + index,
    }))
  })

  const wrapperStyle = computed(
    (): CSSProperties => ({
      height: `${totalHeight.value}px`,
    })
  )

  const getItemStyle = (index: number): CSSProperties => {
    const position = positions.value[index]
    if (position) {
      return {
        position: 'absolute',
        left: '0',
        right: '0',
        top: `${position.top}px`,
      }
    }
    return {}
  }

  const scrollToBottom = () => {
    if (containerRef.value) {
      nextTick(() => {
        containerRef.value!.scrollTop = containerRef.value!.scrollHeight
      })
    }
  }

  const initPositions = () => {
    const newPositions: Position[] = []
    for (let i = 0; i < rawData.value.length; i++) {
      const top = i === 0 ? 0 : newPositions[i - 1].bottom + itemGap
      const height = options.itemHeight
      newPositions.push({
        index: i,
        height,
        top,
        bottom: top + height,
      })
    }
    positions.value = newPositions
  }

  const binarySearch = (scrollTop: number) => {
    let left = 0,
      right = positions.value.length - 1,
      tempIndex = -1
    while (left <= right) {
      const midIdx = Math.floor((left + right) / 2)
      const midBottom = positions.value[midIdx].bottom
      if (midBottom === scrollTop) return midIdx + 1
      if (midBottom < scrollTop) {
        left = midIdx + 1
      } else {
        if (tempIndex === -1 || tempIndex > midIdx) tempIndex = midIdx
        right = midIdx - 1
      }
    }
    return tempIndex === -1 ? 0 : tempIndex
  }

  const calculateRange = () => {
    const container = containerRef.value
    if (!container || positions.value.length === 0) return

    const { scrollTop, clientHeight } = container
    const start = binarySearch(scrollTop)
    let end = start
    while (end < positions.value.length && positions.value[end].top < scrollTop + clientHeight) {
      end++
    }
    startIndex.value = Math.max(0, start - overscan)
    endIndex.value = Math.min(positions.value.length - 1, end + overscan)
  }

  const handleScroll = throttle(() => {
    if (!containerRef.value) return
    const { scrollTop, clientHeight, scrollHeight } = containerRef.value
    isAtBottom.value = scrollTop + clientHeight >= scrollHeight - 100
    console.log(isAtBottom.value)
    calculateRange()
  }, 16)

  const updatePosition = (index: number, height: number) => {
    const position = positions.value[index]
    if (!position || position.height === height) return

    position.height = height
    position.bottom = position.top + height

    for (let i = index + 1; i < positions.value.length; i++) {
      positions.value[i].top = positions.value[i - 1].bottom + itemGap
      positions.value[i].bottom = positions.value[i].top + positions.value[i].height
    }
    if (isAtBottom.value) {
      scrollToBottom()
    }
  }

  let observer: ResizeObserver | null = null
  onMounted(() => {
    if (!containerRef.value) return
    initPositions()
    calculateRange()
    containerRef.value.addEventListener('scroll', handleScroll)
    observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const index = Number((entry.target as HTMLElement).dataset.index)
        const newHeight = entry.contentRect.height
        updatePosition(index, newHeight)
      }
    })
  })

  onUnmounted(() => {
    if (containerRef.value) containerRef.value.removeEventListener('scroll', handleScroll)
    if (observer) observer.disconnect()
  })

  watch(
    () => rawData.value.length,
    (newVal, oldVal) => {
      initPositions()
      calculateRange()
      if (newVal > oldVal) {
        scrollToBottom()
      }
    }
  )

  const observeItem = (element: HTMLElement) => element && observer?.observe(element)
  const unObserveItem = (element: HTMLElement) => element && observer?.unobserve(element)

  return {
    containerRef,
    visibleData,
    wrapperStyle,
    getItemStyle,
    observeItem,
    unObserveItem,
    scrollToBottom,
  }
}
