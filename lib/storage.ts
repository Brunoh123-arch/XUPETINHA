/**
 * storage.ts — wrapper sobre @capacitor/preferences com fallback localStorage.
 *
 * No build nativo (Capacitor), usa o Preferences plugin real.
 * No web (browser / Vercel), usa localStorage como fallback.
 */

let _Preferences: typeof import('@capacitor/preferences').Preferences | null = null

async function getPreferences() {
  if (_Preferences) return _Preferences
  try {
    const mod = await import('@capacitor/preferences')
    _Preferences = mod.Preferences
    return _Preferences
  } catch {
    return null
  }
}

export const Storage = {
  async get(key: string): Promise<string | null> {
    const Preferences = await getPreferences()
    if (Preferences) {
      const { value } = await Preferences.get({ key })
      return value
    }
    if (typeof window !== 'undefined') return window.localStorage.getItem(key)
    return null
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await Storage.get(key)
    if (!value) return null
    try { return JSON.parse(value) as T } catch { return null }
  },

  async set(key: string, value: string): Promise<void> {
    const Preferences = await getPreferences()
    if (Preferences) {
      await Preferences.set({ key, value })
      return
    }
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value)
  },

  async setJSON(key: string, value: unknown): Promise<void> {
    await Storage.set(key, JSON.stringify(value))
  },

  async remove(key: string): Promise<void> {
    const Preferences = await getPreferences()
    if (Preferences) {
      await Preferences.remove({ key })
      return
    }
    if (typeof window !== 'undefined') window.localStorage.removeItem(key)
  },

  async clear(): Promise<void> {
    const Preferences = await getPreferences()
    if (Preferences) {
      await Preferences.clear()
      return
    }
    if (typeof window !== 'undefined') window.localStorage.clear()
  },
}
