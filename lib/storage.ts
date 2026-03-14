/**
 * storage.ts — wrapper sobre @capacitor/preferences.
 *
 * Substitui todos os sessionStorage / localStorage do projeto.
 * API async simples, sem fallback web.
 */

import { Preferences } from '@capacitor/preferences'

export const Storage = {
  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key })
    return value
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key })
    if (!value) return null
    try { return JSON.parse(value) as T } catch { return null }
  },

  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value })
  },

  async setJSON(key: string, value: unknown): Promise<void> {
    await Preferences.set({ key, value: JSON.stringify(value) })
  },

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key })
  },

  async clear(): Promise<void> {
    await Preferences.clear()
  },
}
