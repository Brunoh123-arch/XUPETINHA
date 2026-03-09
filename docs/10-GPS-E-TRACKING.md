# GPS e Tracking em Tempo Real — Uppi

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

## Otimizacoes de Bateria

- GPS desativado automaticamente ao pausar o app
- Interval aumenta para 15s quando app em background
- Tracking para completamente ao finalizar corrida
- `stopTracking()` chamado no `onDestroy` do React
