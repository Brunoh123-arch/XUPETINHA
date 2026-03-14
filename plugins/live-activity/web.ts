import { WebPlugin } from '@capacitor/core'
import type { LiveActivityPluginDef } from './index'

/**
 * Fallback web/Android — todos os métodos retornam available: false silenciosamente.
 * Nenhuma chamada gera erro no console.
 */
export class LiveActivityPluginWeb extends WebPlugin implements LiveActivityPluginDef {
  async isAvailable() {
    return { available: false }
  }

  async startActivity() {
    return { available: false }
  }

  async updateActivity() {
    return { available: false }
  }

  async endActivity() {
    return { success: false }
  }
}
