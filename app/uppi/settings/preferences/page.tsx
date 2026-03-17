'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Music, Wind, MessageCircle, Car, Save } from 'lucide-react'

interface Prefs {
  preferred_vehicle_type: string
  preferred_payment_method: string
  allow_shared_rides: boolean
  music_preference: string
  temperature_preference: string
  chat_preference: string
}

const VEHICLE_TYPES = ['economy', 'comfort', 'exec', 'moto', 'van']
const PAYMENT_METHODS = ['pix', 'credito', 'debito', 'carteira']
const MUSIC_OPTS = [{ v: 'no_preference', l: 'Sem preferencia' }, { v: 'low', l: 'Baixo volume' }, { v: 'no_music', l: 'Sem musica' }, { v: 'passenger_choice', l: 'Minha escolha' }]
const TEMP_OPTS = [{ v: 'cool', l: 'Gelado' }, { v: 'normal', l: 'Normal' }, { v: 'warm', l: 'Quente' }, { v: 'no_preference', l: 'Sem preferencia' }]
const CHAT_OPTS = [{ v: 'chatty', l: 'Gosto de conversar' }, { v: 'quiet', l: 'Prefiro silencio' }, { v: 'no_preference', l: 'Sem preferencia' }]

export default function PassengerPreferencesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [prefs, setPrefs] = useState<Prefs>({
    preferred_vehicle_type: 'economy',
    preferred_payment_method: 'pix',
    allow_shared_rides: false,
    music_preference: 'no_preference',
    temperature_preference: 'no_preference',
    chat_preference: 'no_preference',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('passenger_preferences').select('*').eq('user_id', user.id).single()
      if (data) setPrefs(data)
      setLoading(false)
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('passenger_preferences').upsert({ ...prefs, user_id: user.id }, { onConflict: 'user_id' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const ChipSelect = ({ options, value, onChange }: { options: {v:string,l:string}[], value: string, onChange:(v:string)=>void }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(o => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${value === o.v ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          {o.l}
        </button>
      ))}
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
            <h1 className="font-bold text-foreground text-lg">Minhas Preferencias</h1>
            <p className="text-xs text-muted-foreground">Personalize sua experiencia de viagem</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="p-4 space-y-4">

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Car size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground">Tipo de veiculo preferido</h2>
            </div>
            <ChipSelect
              options={VEHICLE_TYPES.map(v => ({ v, l: v.charAt(0).toUpperCase() + v.slice(1) }))}
              value={prefs.preferred_vehicle_type}
              onChange={v => setPrefs(p => ({ ...p, preferred_vehicle_type: v }))}
            />
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="font-semibold text-foreground mb-1">Forma de pagamento preferida</h2>
            <ChipSelect
              options={PAYMENT_METHODS.map(v => ({ v, l: v.charAt(0).toUpperCase() + v.slice(1) }))}
              value={prefs.preferred_payment_method}
              onChange={v => setPrefs(p => ({ ...p, preferred_payment_method: v }))}
            />
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Aceito corridas compartilhadas</span>
              </div>
              <button
                onClick={() => setPrefs(p => ({ ...p, allow_shared_rides: !p.allow_shared_rides }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${prefs.allow_shared_rides ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs.allow_shared_rides ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pague menos dividindo a corrida com outra pessoa</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Music size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground">Preferencia de musica</h2>
            </div>
            <ChipSelect options={MUSIC_OPTS} value={prefs.music_preference} onChange={v => setPrefs(p => ({ ...p, music_preference: v }))} />
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wind size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground">Temperatura no carro</h2>
            </div>
            <ChipSelect options={TEMP_OPTS} value={prefs.temperature_preference} onChange={v => setPrefs(p => ({ ...p, temperature_preference: v }))} />
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground">Preferencia de conversa</h2>
            </div>
            <ChipSelect options={CHAT_OPTS} value={prefs.chat_preference} onChange={v => setPrefs(p => ({ ...p, chat_preference: v }))} />
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
