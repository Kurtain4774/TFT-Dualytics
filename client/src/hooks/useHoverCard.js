import { useState, useRef, useEffect, useCallback } from 'react'
import { useBoardStore } from '../store/boardStore.js'

const CARD_WIDTH = 280
const CARD_HEIGHT = 340

function computePosition(rect) {
  let left = rect.right + 12
  let top = rect.top + rect.height / 2 - CARD_HEIGHT / 2

  if (left + CARD_WIDTH > window.innerWidth - 8) {
    left = rect.left - CARD_WIDTH - 12
  }

  if (top < 8) top = 8
  if (top + CARD_HEIGHT > window.innerHeight - 8) {
    top = window.innerHeight - 8 - CARD_HEIGHT
  }

  return { top, left }
}

export function useHoverCard(data, { delay = 300 } = {}) {
  const isDragging = useBoardStore(s => s.isDragging)
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const timerRef = useRef(null)

  useEffect(() => {
    if (isDragging) {
      clearTimeout(timerRef.current)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(false)
    }
  }, [isDragging])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  // Capture the DOM element synchronously from the event before it's nulled.
  // React clears e.currentTarget after dispatch, but a local variable holds the node.
  const onMouseEnter = useCallback((e) => {
    if (isDragging) return
    const element = e.currentTarget
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const rect = element?.getBoundingClientRect()
      if (!rect) return
      setPosition(computePosition(rect))
      setIsOpen(true)
    }, delay)
  }, [isDragging, delay])

  const onMouseLeave = useCallback(() => {
    clearTimeout(timerRef.current)
    setIsOpen(false)
  }, [])

  return {
    onMouseEnter,
    onMouseLeave,
    cardProps: {
      isOpen,
      data,
      style: { position: 'fixed', zIndex: 9999, top: position.top, left: position.left },
    },
  }
}
