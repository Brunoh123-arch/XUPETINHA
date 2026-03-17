'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Settings2, MapPin, Plus, X, Save } from 'lucide-react'

interface Preferences {
  accepts_shared_rides: boolean
  accepts_long_trips: boolean
  accepts_intercity: boolean
  accepts_delivery: boolean
  max_detour_km: number
  preferred_vehicle_types: string[]
}

interface Zone {
  id: string
  city: string
  neighborhood: string
}

export default function DriverPreferencesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [prefs, setPrefs] = useState<Preferences>({
    accepts_shared_rides: false,
    accepts_long_trips: true,
    accepts_intercity: false,
    accepts_delivery: false,
    max_detour_km: 5,
    preferred_vehicle_types: [],
  })
  const [zones, setZones] = useState<Zone[]>([])
  const [newCity, setNewCity] = useState('')
  const [newNeighborhood, setNewNeighborhood] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [prefsRes, zonesRes] = await Promise.all([
        supabase.from('driver_ride_preferences').select('*').eq('driver_id', user.id).single(),
        supabase.from('driver_preferred_zones').select('*').eq('driver_id', user.id),
      ])
      if (prefsRes.data) setPrefs(prefsRes.data)
      if (zonesRes.data) setZones(zonesRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('driver_ride_preferences').upsert({ ...prefs, driver_id: user.id }, { onConflict: 'driver_id' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addZone = async () => {
    if (!newCity.trim() || !newNeighborhood.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('driver_preferred_zones').insert({ driver_id: user.id, city: newCity.trim(), neighborhood: newNeighborhood.trim() }).select().single()
    if (data) setZones(prev => [...prev, data])
    setNewCity('')
    setNewNeighborhood('')
  }

  const removeZone = async (id: string) => {
    await supabase.from('driver_preferred_zones').delete().eq('id', id)
    setZones(prev => prev.filter(z => z.id !== id))
  }

  const Toggle = ({ label, value, onChange }: { label: string, value: boolean, onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-foreground text-lg">Preferencias de Corrida</h1>
            <p className="text-xs text-muted-foreground">Configure o que voce aceita realizar</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="p-4 space-y-5">

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground">Tipos de corrida</h2>
            </div>
            <Toggle label="Corridas compartilhadas" value={prefs.accepts_shared_rides} onChange={v => setPrefs(p => ({ ...p, accepts_shared_rides: v }))} />
            <Toggle label="Viagens longas (+50km)" value={prefs.accepts_long_trips} onChange={v => setPrefs(p => ({ ...p, accepts_long_trips: v }))} />
            <Toggle label="Viagens intermunicipais" value={prefs.accepts_intercity} onChange={v => setPrefs(p => ({ ...p, accepts_intercity: v }))} />
            <Toggle label="Entregas e delivery" value={prefs.accepts_delivery} onChange={v => setPrefs(p => ({ ...p, accepts_delivery: v }))} />
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="font-semibold text-foreground mb-3">Desvio maximo de rota</h2>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1} max={20} step={1}
                value={prefs.max_detour_km}
                onChange={e => setPrefs(p => ({ ...p, max_detour_km: Number(e.target.value) }))}
                className="flex-1 accent-primary"
              />
              <span className="text-sm font-bold text-foreground w-12 text-right">{prefs.max_detour_km} km</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Distancia maxima que voce aceita se desviar da rota ideal</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground">Zonas preferidas</h2>
            </div>
            {zones.map(z => (
              <div key={z.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{z.neighborhood}</p>
                  <p className="text-xs text-muted-foreground">{z.city}</p>
                </div>
                <button onClick={() => removeZone(z.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                  <X size={16} />
                </button>
              </div>
            ))}
            <div className="mt-3 flex gap-2">
              <input
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
                placeholder="Cidade"
                className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <input
                value={newNeighborhood}
                onChange={e => setNewNeighborhood(e.target.value)}
                placeholder="Bairro"
                className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={addZone}
                className="p-2 bg-primary text-primary-foreground rounded-lg"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Save size={18} />
          {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar Preferencias'}
        </button>
      </div>
    </div>
  )
}
