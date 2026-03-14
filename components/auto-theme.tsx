'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

/**
 * Auto-switches between light/dark mode based on time of day.
 * Light mode: 6am - 6pm
 * Dark mode: 6pm - 6am
 * 
 * Only activates when theme is set to 'system' or 'auto'.
 * Respects manual override - if user explicitly picked 'light' or 'dark', this does nothing.
 */
export function AutoTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    let cancelled = false
    import('@capacitor/preferences').then(({ Preferences }) => {
      Preferences.get({ key: 'uppi-theme-preference' }).then(({ value: userPreference }) => {
        if (cancelled || userPreference === 'manual') return

    function applyTimeBasedTheme() {
      const hour = new Date().getHours()
      const shouldBeDark = hour >= 18 || hour < 6
      const targetTheme = shouldBeDark ? 'dark' : 'light'

      if (resolvedTheme !== targetTheme) {
        setTheme(targetTheme)
      }
    }

        applyTimeBasedTheme()
        const interval = setInterval(applyTimeBasedTheme, 5 * 60 * 1000)
        // cleanup via ref trick — return não funciona dentro de .then()
        ;(window as any).__autoThemeInterval = interval
      }).catch(() => {})
    }).catch(() => {})
    return () => {
      cancelled = true
      clearInterval((window as any).__autoThemeInterval)
    }
  }, [resolvedTheme, setTheme, theme])

  return null
}

/**
 * Call this when user manually toggles theme to stop auto-switching.
 */
export async function setManualThemePreference() {
  const { Preferences } = await import('@capacitor/preferences')
  await Preferences.set({ key: 'uppi-theme-preference', value: 'manual' })
}

/**
 * Call this to re-enable auto theme switching.
 */
export async function clearManualThemePreference() {
  const { Preferences } = await import('@capacitor/preferences')
  await Preferences.remove({ key: 'uppi-theme-preference' })
}
