/**
 * capacitor-mock.js
 *
 * Shim para todos os pacotes @capacitor/* e @capacitor-community/*
 * usado no build web (Next.js / Vercel).
 *
 * No build Android (Capacitor), os pacotes reais substituem este mock via
 * resolucao nativa — este arquivo nunca chega ao APK.
 *
 * Cada export imita a API publica do plugin real mas retorna
 * valores neutros / no-op, sem lancar erros.
 */

// ─── @capacitor/core ────────────────────────────────────────────────────────
export const Capacitor = {
  isNativePlatform: () => false,
  getPlatform: () => 'web',
  isPluginAvailable: () => false,
  convertFileSrc: (src) => src,
}

// ─── @capacitor/geolocation ──────────────────────────────────────────────────
export const Geolocation = {
  getCurrentPosition: async () => ({
    coords: { latitude: 0, longitude: 0, accuracy: 0, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
    timestamp: Date.now(),
  }),
  watchPosition: async (_opts, _cb) => 'mock-watch-id',
  clearWatch: async () => {},
  checkPermissions: async () => ({ location: 'granted', coarseLocation: 'granted' }),
  requestPermissions: async () => ({ location: 'granted', coarseLocation: 'granted' }),
}

// ─── @capacitor/preferences ──────────────────────────────────────────────────
const _prefStore = {}
export const Preferences = {
  get: async ({ key }) => ({ value: _prefStore[key] ?? null }),
  set: async ({ key, value }) => { _prefStore[key] = value },
  remove: async ({ key }) => { delete _prefStore[key] },
  clear: async () => { Object.keys(_prefStore).forEach(k => delete _prefStore[k]) },
  keys: async () => ({ keys: Object.keys(_prefStore) }),
}

// ─── @capacitor/push-notifications ───────────────────────────────────────────
export const PushNotifications = {
  requestPermissions: async () => ({ receive: 'denied' }),
  register: async () => {},
  addListener: async () => ({ remove: () => {} }),
  removeAllListeners: async () => {},
}

// ─── @capacitor/local-notifications ──────────────────────────────────────────
export const LocalNotifications = {
  requestPermissions: async () => ({ display: 'denied' }),
  schedule: async () => ({ notifications: [] }),
  cancel: async () => {},
  addListener: async () => ({ remove: () => {} }),
  removeAllListeners: async () => {},
}

// ─── @capacitor/haptics ───────────────────────────────────────────────────────
export const Haptics = {
  impact: async () => {},
  notification: async () => {},
  vibrate: async () => {},
  selectionStart: async () => {},
  selectionChanged: async () => {},
  selectionEnd: async () => {},
}

// ─── @capacitor/network ───────────────────────────────────────────────────────
export const Network = {
  getStatus: async () => ({ connected: true, connectionType: 'wifi' }),
  addListener: async () => ({ remove: () => {} }),
  removeAllListeners: async () => {},
}

// ─── @capacitor/device ────────────────────────────────────────────────────────
export const Device = {
  getId: async () => ({ identifier: 'web' }),
  getInfo: async () => ({
    model: 'web', platform: 'web', operatingSystem: 'web',
    osVersion: '0', manufacturer: 'web', isVirtual: false, webViewVersion: '0',
  }),
  getBatteryInfo: async () => ({ batteryLevel: 1, isCharging: false }),
  getLanguageCode: async () => ({ value: 'pt' }),
  getLanguageTag: async () => ({ value: 'pt-BR' }),
}

// ─── @capacitor/camera ────────────────────────────────────────────────────────
export const Camera = {
  getPhoto: async () => ({ base64String: '', dataUrl: '', path: '', webPath: '', exif: {}, format: 'jpeg', saved: false }),
  pickImages: async () => ({ photos: [] }),
  requestPermissions: async () => ({ camera: 'denied', photos: 'denied' }),
}

// ─── @capacitor/share ─────────────────────────────────────────────────────────
export const Share = {
  share: async () => ({ activityType: undefined }),
  canShare: async () => ({ value: false }),
}

// ─── @capacitor/clipboard ────────────────────────────────────────────────────
export const Clipboard = {
  write: async () => {},
  read: async () => ({ type: 'text/plain', value: '' }),
}

// ─── @capacitor/browser ──────────────────────────────────────────────────────
export const Browser = {
  open: async ({ url }) => { if (typeof window !== 'undefined') window.open(url, '_blank') },
  close: async () => {},
  addListener: async () => ({ remove: () => {} }),
  removeAllListeners: async () => {},
}

// ─── @capacitor/app ──────────────────────────────────────────────────────────
export const App = {
  getInfo: async () => ({ id: 'web', name: 'Uppi', build: '0', version: '0.0.0' }),
  getState: async () => ({ isActive: true }),
  getLaunchUrl: async () => ({ url: undefined }),
  openUrl: async ({ url }) => { if (typeof window !== 'undefined') window.open(url, '_blank') },
  canOpenUrl: async () => ({ value: false }),
  exitApp: () => {},
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: async () => {},
}

// ─── @capacitor/app-launcher ─────────────────────────────────────────────────
export const AppLauncher = {
  canOpenUrl: async () => ({ value: false }),
  openUrl: async () => ({ completed: false }),
}

// ─── @capacitor/status-bar ───────────────────────────────────────────────────
export const StatusBar = {
  setStyle: async () => {},
  setBackgroundColor: async () => {},
  show: async () => {},
  hide: async () => {},
  getInfo: async () => ({ visible: true, style: 'DEFAULT', color: '#000000', overlays: false }),
  setOverlaysWebView: async () => {},
}
export const Style = { Dark: 'DARK', Light: 'LIGHT', Default: 'DEFAULT' }

// ─── @capacitor/splash-screen ────────────────────────────────────────────────
export const SplashScreen = {
  show: async () => {},
  hide: async () => {},
}

// ─── @capacitor/keyboard ─────────────────────────────────────────────────────
export const Keyboard = {
  show: async () => {},
  hide: async () => {},
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: async () => {},
}

// ─── @capacitor/google-maps ──────────────────────────────────────────────────
export const GoogleMap = {
  create: async () => ({
    setCamera: async () => {},
    addMarker: async () => 'mock-marker',
    removeMarker: async () => {},
    destroy: async () => {},
    addListener: async () => ({ remove: () => {} }),
  }),
}

// ─── @capacitor-community/keep-awake ─────────────────────────────────────────
export const KeepAwake = {
  keepAwake: async () => {},
  allowSleep: async () => {},
  isSupported: async () => ({ isSupported: false }),
  isKeptAwake: async () => ({ isKeptAwake: false }),
}

// ─── @capacitor-community/background-geolocation ────────────────────────────
export const BackgroundGeolocation = {
  addWatcher: async () => 'mock-watcher-id',
  removeWatcher: async () => {},
  openSettings: async () => {},
}

// ─── @capacitor-community/text-to-speech ─────────────────────────────────────
export const TextToSpeech = {
  speak: async () => {},
  stop: async () => {},
  getSupportedLanguages: async () => ({ languages: [] }),
  getSupportedVoices: async () => ({ voices: [] }),
  isLanguageSupported: async () => ({ supported: false }),
  openInstall: async () => {},
  setPitchRate: async () => {},
  setRate: async () => {},
}

// ─── @vis.gl/react-google-maps ───────────────────────────────────────────────
// React components and hooks — return null/noop on web when package not installed
const _noop = () => null
export const Map = _noop
export const AdvancedMarker = _noop
export const Pin = _noop
export const Marker = _noop
export const InfoWindow = _noop
export const useMap = () => null
export const useMapsLibrary = () => null
export const APIProvider = ({ children }) => children

// ─── google-maps (type-only package, mock the namespace) ─────────────────────
export const google = {
  maps: {
    places: {
      AutocompleteService: class { getPlacePredictions() { return Promise.resolve({ predictions: [] }) } },
      PlacesService: class { getDetails() {} },
      PlacesServiceStatus: { OK: 'OK' },
    },
    LatLng: class { constructor(lat, lng) { this.lat = () => lat; this.lng = () => lng } },
  },
}

// ─── Default export (compatibilidade com CommonJS `require`) ─────────────────
export default {
  Capacitor, Geolocation, Preferences, PushNotifications, LocalNotifications,
  Haptics, Network, Device, Camera, Share, Clipboard, Browser, App, AppLauncher,
  StatusBar, Style, SplashScreen, Keyboard, GoogleMap, KeepAwake,
  BackgroundGeolocation, TextToSpeech,
  // vis.gl / google-maps
  Map, AdvancedMarker, Pin, Marker, InfoWindow, useMap, useMapsLibrary, APIProvider,
  google,
}
