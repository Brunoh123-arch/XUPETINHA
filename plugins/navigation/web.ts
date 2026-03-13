/**
 * Fallback Web — NavigationPluginWeb
 *
 * Usado quando o app roda no browser (preview v0, teste em desktop).
 * Simula a navegação abrindo o Google Maps web em nova aba.
 */

import { WebPlugin } from '@capacitor/core'
import type { NavigationDestination, NavigationPluginInterface, NavigationStatus } from './index'

export class NavigationPluginWeb extends WebPlugin implements NavigationPluginInterface {
  async isAvailable(): Promise<{ available: boolean }> {
    // No browser, consideramos sempre "disponível" via fallback web
    return { available: true }
  }

  async startNavigation(destination: NavigationDestination): Promise<NavigationStatus> {
    const { lat, lng, label } = destination
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    window.open(url, '_blank')
    console.warn('[NavigationPlugin] Web fallback: abrindo Google Maps no browser.', label)
    return { initialized: true }
  }

  async stopNavigation(): Promise<void> {
    // Não há nada a encerrar no fallback web
  }
}
