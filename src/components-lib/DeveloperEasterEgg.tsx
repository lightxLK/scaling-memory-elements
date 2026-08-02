import { useEffect } from 'react'

const AUTHOR_URL = 'https://lightxlk.github.io/'

/**
 * Hidden shortcut: Alt+Shift+L+K (⌥⇧LK on macOS) opens the author's site.
 * Uses event.code (not event.key) for consistent behavior across
 * Chromium/WebKit/Gecko, and skips while focus is inside an editable
 * control so it never hijacks normal typing.
 */
export function DeveloperEasterEgg() {
  useEffect(() => {
    const pressed = new Set<string>()

    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false
      return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return

      pressed.add(e.code)
      if (e.altKey && e.shiftKey && pressed.has('KeyL') && pressed.has('KeyK')) {
        window.open(AUTHOR_URL, '_blank', 'noopener,noreferrer')
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => pressed.delete(e.code)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return null
}
