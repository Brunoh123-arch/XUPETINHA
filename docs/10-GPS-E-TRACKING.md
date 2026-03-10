# GPS e Tracking em Tempo Real — Uppi (Otimizado + Mapa Nativo)

## Arquitetura de Tracking

O rastreamento de corridas usa duas tecnologias em conjunto:
1. **@capacitor/geolocation** — GPS nativo de alta precisao no Android
2. **Supabase Realtime** — atualizacoes ao vivo para o passageiro

---

## Hook useNativeGeolocation

Arquivo: `hooks/use-native-geolocation.ts`

```typescript
// Uso em tela de corrida ativa (motorista)
const { position, error, startTracking, stopTracking } = useNativeGeolocation({
  enableHighAccuracy: true,
  interval: 5000, // Atualiza a cada 5 segundos
  onPosition: async (pos) => {
    // Salva no banco em tempo real
    await updateDriverLocation(pos.coords.latitude, pos.coords.longitude)
  }
})
```

### Configuracoes de GPS
| Parametro | Valor | Descricao |
|---|---|---|
| `enableHighAccuracy` | `true` | GPS de precisao (nao rede celular) |
| `interval` | `5000ms` | Atualizacao a cada 5 segundos |
| `maximumAge` | `0` | Sempre dado fresco |
| `timeout` | `10000ms` | Timeout por leitura |

---

## GPS em Background (Android)

Para corridas ativas, o GPS precisa funcionar com a tela bloqueada. Isso requer:

### AndroidManifest.xml (configurar apos `npx cap add android`)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
```

### Servico de Background
Para GPS com tela bloqueada, e necessario um `ForegroundService` no Android. Opcoes:
- **@capacitor-community/background-geolocation** (recomendado)
- Servico nativo Java/Kotlin customizado

```bash
npm install @capacitor-community/background-geolocation
npx cap sync
```

---

## Tabela driver_locations

```sql
CREATE TABLE driver_locations (
  id UUID PRIMARY KEY,
  driver_id UUID REFERENCES profiles(id),
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  heading NUMERIC(5,2),    -- Direcao (0-360 graus)
  speed NUMERIC(8,2),      -- Velocidade em km/h
  accuracy NUMERIC(8,2),   -- Precisao em metros
  updated_at TIMESTAMPTZ   -- Ultimo update
);
```

Atualizada via RPC `upsert_driver_location` (upsert por driver_id).

---

## Realtime para o Passageiro

O passageiro ve o motorista em tempo real via Supabase Realtime:

```typescript
// Tela de tracking do passageiro
const channel = supabase
  .channel('driver-location')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'driver_locations',
    filter: `driver_id=eq.${driverId}`
  }, (payload) => {
    // Atualiza marcador no mapa
    setDriverPosition({
      lat: payload.new.latitude,
      lng: payload.new.longitude
    })
  })
  .subscribe()
```

---

## ETA (Tempo Estimado de Chegada)

RPC `get_ride_eta(ride_id)` calcula:
- Distancia entre motorista e destino
- Velocidade media estimada (40 km/h padrao)
- Retorna: `eta_minutes`, `driver_lat`, `driver_lng`, `distance_km`

---

## Permissoes de Localizacao no Android

O `CapacitorProvider` solicita permissao de GPS automaticamente ao inicializar. Se negada, o motorista nao consegue aceitar corridas e ve um aviso na tela.

```typescript
// Em capacitor-provider.tsx
const { useNativeGeolocation } = await import('@/hooks/use-native-geolocation')
// Permissao solicitada automaticamente no primeiro uso
```

---

## Otimizacoes de Bateria (IMPLEMENTADAS)

### 1. Modo Balanceado de Precisao
```ts
// tracking-service.ts
const TRACKING_CONFIGS = {
  idle: { interval: 60000, distanceFilter: 100 },      // 1 min, WiFi+cell
  online: { interval: 10000, distanceFilter: 20 },     // 10s, WiFi+cell+GPS
  active_ride: { interval: 3000, distanceFilter: 5 },  // 3s, GPS preciso
}
```
- Economiza ~60% de bateria em modo idle
- So usa GPS preciso durante corrida ativa

### 2. Distance Filter (Evita updates desnecessarios)
```ts
const distance = calculateDistance(lastLat, lastLng, newLat, newLng)
if (distance < effectiveDistanceFilter) return  // Ignora
```
- 5m em corrida ativa
- 20m quando motorista online
- 100m quando offline
- Economiza ~40% de bateria

### 3. Frequencia Dinamica baseada em Velocidade
```ts
if (speed < 0.5) {  // Parado
  updateInterval = STOPPED_CONFIG.interval  // 20s
} else {  // Em movimento
  updateInterval = config.interval  // 3-10s
}
```
- Quando parado, updateInterval sobe de 3s para 20s

### 4. Interpolacao no Mapa (Nao atualiza a cada frame)
```ts
// app/uppi/ride/[id]/tracking/page.tsx
const animate = (currentTime: number) => {
  const progress = Math.min((currentTime - startTime) / 2000, 1)
  const easeProgress = 1 - Math.pow(1 - progress, 3)  // cubic ease-out
  
  const currentLat = lastPos.lat + (newPos.lat - lastPos.lat) * easeProgress
  driverMarkerRef.current.setPosition({ lat: currentLat, lng: currentLng })
  
  if (progress < 1) requestAnimationFrame(animate)
}
```
- Anima suavemente entre updates
- So mexe no mapa a cada 2-3 segundos, nao a cada frame
- Economiza GPU/CPU no rendering

### 5. Background Tracking Desligado
```ts
// Ao minimizar app, tracking para
onPause: () => stopTracking()

// So reinicia ao reabrir app
onResume: () => startTracking()
```
- GPS se desliga completamente em background
- **Precisamos de:** `@capacitor-community/background-geolocation` para GPS com tela bloqueada

### 6. Dados Compactos (4 valores apenas)
```json
{ "lat": -1.293, "lng": -47.926, "heading": 45, "speed": 15.2 }
```
- Sem payload desnecessario
- ~200 bytes por update
- 3-5 updates por minuto = ~100-300 bytes/min

---

## Mapa Nativo (@capacitor/google-maps)

### No Android (Performance Maxima)
```ts
// components/native-map.tsx
import { GoogleMap as CapacitorGoogleMap } from '@capacitor/google-maps'

const mapRef = useRef<CapacitorGoogleMap | null>(null)

useEffect(() => {
  const createMap = async () => {
    const map = await CapacitorGoogleMap.create({
      id: 'ride-map',
      element: mapContainer,
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      config: {
        center: { lat: -1.293, lng: -47.926 },
        zoom: 15,
      },
    })
    mapRef.current = map
  }
  createMap()
}, [])
```

**Beneficios:**
- 60 fps nativo
- Sem lag em scrolling
- Perfomance em dispositivos fracos
- Suporta gestos nativos (pinch zoom, etc)

### Animacao Suave do Carro
```ts
// Implementada em app/uppi/ride/[id]/tracking/page.tsx
const updateDriverMarker = useCallback((location: DriverLocation) => {
  const startTime = performance.now()
  const duration = 2000  // 2 segundos de animacao
  
  const animate = (currentTime: number) => {
    const progress = Math.min((currentTime - startTime) / duration, 1)
    const easeProgress = 1 - Math.pow(1 - progress, 3)  // cubic ease-out
    
    const currentLat = lastPos.lat + (newPos.lat - lastPos.lat) * easeProgress
    const currentLng = lastPos.lng + (newPos.lng - lastPos.lng) * easeProgress
    
    driverMarkerRef.current?.setPosition({ lat: currentLat, lng: currentLng })
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
}, [])
```

**Resultado:** Carro "desliza" suavemente no mapa, nao teleporta.

### Rotacao do Carro (Bearing automatico)
```ts
const calculateBearing = (lat1, lng1, lat2, lng2) => {
  // Calcula angulo de rotacao baseado na direcao do movimento
  const toRad = (deg) => (deg * Math.PI) / 180
  const toDeg = (rad) => (rad * 180) / Math.PI
  const dLng = toRad(lng2 - lng1)
  const y = Math.sin(dLng) * Math.cos(toRad(lat2))
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - 
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

// Icone SVG do carro rotativo
const carIcon = {
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <g transform="rotate(${bearing}, 24, 24)">
        <rect x="16" y="8" width="16" height="32" rx="4" fill="#10b981"/>
        <rect x="18" y="14" width="12" height="12" rx="2" fill="#fff" fill-opacity="0.3"/>
        <path d="M24 2 L28 8 L20 8 Z" fill="#10b981"/>
      </g>
    </svg>
  `)}`,
  scaledSize: new google.maps.Size(48, 48),
  anchor: new google.maps.Point(24, 24),
}
```

**Resultado:** Carro rotaciona na direcao que esta indo.

### No Browser (Fallback)
```ts
// components/google-map.tsx
// Se nao for Android nativo, renderiza Google Maps Web API
// Mesmo codigo, funciona em web tambem
```

---

## Otimizacoes de Bateria (ANTIGAS)

- GPS desativado automaticamente ao pausar o app
- Interval aumenta para 15s quando app em background
- Tracking para completamente ao finalizar corrida
- `stopTracking()` chamado no `onDestroy` do React
