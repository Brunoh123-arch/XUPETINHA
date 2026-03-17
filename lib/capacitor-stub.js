// Stub para ambientes web onde o Capacitor nao esta disponivel
export const Capacitor = {
  isNativePlatform: () => false,
  getPlatform: () => 'web',
  isPluginAvailable: () => false,
}

export const Plugins = {}

// Stubs dos plugins mais usados
export const App = {
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => {},
  exitApp: () => {},
  getInfo: async () => ({ version: '1.0.0', build: '1', id: 'web', name: 'Web' }),
  getLaunchUrl: async () => null,
  getState: async () => ({ isActive: true }),
}

export const SplashScreen = {
  hide: async () => {},
  show: async () => {},
}

export const StatusBar = {
  setStyle: async () => {},
  setBackgroundColor: async () => {},
  setOverlaysWebView: async () => {},
  show: async () => {},
  hide: async () => {},
}

export const Geolocation = {
  getCurrentPosition: async () => ({ coords: { latitude: 0, longitude: 0, accuracy: 0 }, timestamp: Date.now() }),
  watchPosition: () => {},
  clearWatch: async () => {},
  checkPermissions: async () => ({ location: 'denied' }),
  requestPermissions: async () => ({ location: 'denied' }),
}

export const Camera = {
  getPhoto: async () => ({ dataUrl: null, base64String: null, path: null, format: 'jpeg', saved: false }),
  checkPermissions: async () => ({ camera: 'denied', photos: 'denied' }),
  requestPermissions: async () => ({ camera: 'denied', photos: 'denied' }),
}

export const Haptics = {
  impact: async () => {},
  notification: async () => {},
  vibrate: async () => {},
  selectionStart: async () => {},
  selectionChanged: async () => {},
  selectionEnd: async () => {},
}

export const Network = {
  getStatus: async () => ({ connected: true, connectionType: 'wifi' }),
  addListener: () => ({ remove: () => {} }),
}

export const Preferences = {
  get: async () => ({ value: null }),
  set: async () => {},
  remove: async () => {},
  clear: async () => {},
  keys: async () => ({ keys: [] }),
}

export const PushNotifications = {
  register: async () => {},
  addListener: () => ({ remove: () => {} }),
  checkPermissions: async () => ({ receive: 'denied' }),
  requestPermissions: async () => ({ receive: 'denied' }),
  getDeliveredNotifications: async () => ({ notifications: [] }),
}

export const LocalNotifications = {
  schedule: async () => {},
  cancel: async () => {},
  checkPermissions: async () => ({ display: 'denied' }),
  requestPermissions: async () => ({ display: 'denied' }),
  addListener: () => ({ remove: () => {} }),
}

export const Share = {
  share: async () => {},
  canShare: async () => ({ value: false }),
}

export const Clipboard = {
  read: async () => ({ type: 'text/plain', value: '' }),
  write: async () => {},
}

export const Device = {
  getId: async () => ({ identifier: 'web-device' }),
  getInfo: async () => ({ model: 'web', platform: 'web', operatingSystem: 'unknown', osVersion: 'unknown', manufacturer: 'unknown', isVirtual: false, webViewVersion: 'unknown' }),
  getBatteryInfo: async () => ({ batteryLevel: 1, isCharging: false }),
  getLanguageCode: async () => ({ value: 'pt-BR' }),
}

export const Browser = {
  open: async ({ url }: { url: string }) => { if (typeof window !== 'undefined') window.open(url, '_blank') },
  close: async () => {},
  addListener: () => ({ remove: () => {} }),
}

export const AppLauncher = {
  openUrl: async ({ url }: { url: string }) => { if (typeof window !== 'undefined') window.open(url) },
  canOpenUrl: async () => ({ value: false }),
}

export const KeepAwake = {
  keepAwake: async () => {},
  allowSleep: async () => {},
  isSupported: async () => ({ isSupported: false }),
  isKeptAwake: async () => ({ isKeptAwake: false }),
}

export const TextToSpeech = {
  speak: async () => {},
  stop: async () => {},
  getSupportedLanguages: async () => ({ languages: [] }),
  getSupportedVoices: async () => ({ voices: [] }),
  isLanguageSupported: async () => ({ supported: false }),
  openInstall: async () => {},
}

export default {
  Capacitor, Plugins, App, SplashScreen, StatusBar, Geolocation,
  Camera, Haptics, Network, Preferences, PushNotifications,
  LocalNotifications, Share, Clipboard, Device, Browser,
  AppLauncher, KeepAwake, TextToSpeech,
}
