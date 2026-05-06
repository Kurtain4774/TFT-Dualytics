import { useEffect } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',')

function isVisible(element) {
  return element.getClientRects().length > 0
}

function getFocusableElements(root) {
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isVisible)
}

export function useFocusTrap({
  active,
  rootRef,
  initialFocusRef,
  returnFocusRef,
  onEscape,
}) {
  useEffect(() => {
    if (!active || !rootRef.current) return undefined

    const root = rootRef.current
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const requestedReturnFocus = returnFocusRef?.current || null

    const focusInitial = () => {
      const target = initialFocusRef?.current || getFocusableElements(root)[0] || root
      target.focus({ preventScroll: true })
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscape?.()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements(root)
      if (!focusableElements.length) {
        event.preventDefault()
        root.focus({ preventScroll: true })
        return
      }

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
      const current = document.activeElement

      if (event.shiftKey && current === first) {
        event.preventDefault()
        last.focus({ preventScroll: true })
        return
      }

      if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus({ preventScroll: true })
        return
      }

      if (!root.contains(current)) {
        event.preventDefault()
        first.focus({ preventScroll: true })
      }
    }

    const frame = window.requestAnimationFrame(focusInitial)
    root.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(frame)
      root.removeEventListener('keydown', handleKeyDown)
      const returnTarget = requestedReturnFocus || previousFocus
      if (returnTarget?.isConnected) {
        returnTarget.focus({ preventScroll: true })
      }
    }
  }, [active, initialFocusRef, onEscape, returnFocusRef, rootRef])
}
