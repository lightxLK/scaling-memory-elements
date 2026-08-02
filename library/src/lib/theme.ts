import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

export function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('light') ? 'light' : 'dark'
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('light', theme === 'light')
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // localStorage unavailable (privacy mode, etc.) — theme still applies via DOM class
  }
}

// Tracks the live site theme by observing the `class` attribute on <html>,
// so components can resolve dark/light colors in JS instead of depending on
// Tailwind's `dark:` variant (which doesn't reliably combine with per-token
// CSS-variable overrides for things like syntax-highlighted code).
export function useIsDarkTheme(): boolean {
  const [isDark, setIsDark] = useState(() => getInitialTheme() === 'dark')

  useEffect(() => {
    const root = document.documentElement
    const sync = () => setIsDark(root.classList.contains('dark'))
    sync()

    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark
}
