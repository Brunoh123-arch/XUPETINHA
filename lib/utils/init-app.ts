/**
 * Initialize app on mount
 * Call this in layout.tsx or root component
 */

export function initApp() {
  if (typeof window === 'undefined') return

  // Service Worker registration (if exists)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW not available or registration failed — silently ignore
    })
  }

  // Handle app visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Could trigger data refresh here
    }
  })
}
