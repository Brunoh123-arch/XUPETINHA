'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Car, Plus, CheckCircle2, Clock, Edit2, Camera } from 'lucide-react'
import { iosToast } from '@/lib/utils/ios-toast'
import { DriverBottomNavigation } from '@/components/driver-bottom-navigation'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  color: string
  plate: string
  renavam: string | null
  is_active: boolean
  is_verified: boolean
  crlv_url: string | null
  type: string
}

interface VehicleCategory {
  id: string
  name: string
  display_name: string
  base_fare: number
  capacity: number
}

export default function DriverVehiclePage() {
  const router = useRouter()
  const supabase = createClient()

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [categories, setCategories] = useState<VehicleCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    brand: '', model: '', year: new Date().getFullYear(), color: '', plate: '', renavam: '', category_id: ''
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/onboarding/splash'); return }

    const [vehiclesRes, catsRes] = await Promise.all([
      supabase.from('vehicles').select('*').eq('driver_id', user.id).order('created_at', { ascending: false }),
      supabase.from('vehicle_categories').select('*').eq('is_active', true).order('base_fare'),
    ])

    if (vehiclesRes.data) setVehicles(vehiclesRes.data)
    if (catsRes.data) setCategories(catsRes.data)
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.brand || !form.model || !form.plate || !form.color) {
      iosToast.error('Preencha todos os campos obrigatórios')
      return
    }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('vehicles').insert({
        driver_id: user.id,
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: form.year,
        color: form.color.trim(),
        plate: form.plate.toUpperCase().trim(),
        renavam: form.renavam || null,
      })

      if (error) {
        if (error.code === '23505') iosToast.error('Esta placa já está cadastrada')
        else throw error
        return
      }

      iosToast.success('Veículo cadastrado! Aguarde a verificação.')
      setShowForm(false)
      setForm({ brand: '', model: '', year: new Date().getFullYear(), color: '', plate: '', renavam: '', category_id: '' })
      loadData()
    } catch {
      iosToast.error('Erro ao cadastrar veículo')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-dvh bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-[2.5px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-28 ios-scroll">
      <header className="bg-card/80 ios-blur border-b border-border/40 sticky top-0 z-30">
        <div className="px-5 pt-safe-offset-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary ios-press">
              <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={2.5} />
            </button>
            <h1 className="text-[20px] font-bold text-foreground tracking-tight">Meu Veículo</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-xl text-[13px] font-bold ios-press"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Adicionar
          </button>
        </div>
      </header>

      <main className="px-5 py-5 max-w-lg mx-auto space-y-4">
        {/* Categorias disponíveis */}
        {categories.length > 0 && (
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Categorias disponíveis</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <div key={cat.id} className="bg-card rounded-[16px] p-4 border border-border/40">
                  <p className="text-[14px] font-bold text-foreground">{cat.display_name || cat.name}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">Até {cat.capacity} passageiros</p>
                  <p className="text-[13px] font-bold text-blue-500 mt-1">R$ {Number(cat.base_fare).toFixed(2)} base</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de veículos */}
        <div>
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {vehicles.length > 0 ? `${vehicles.length} veículo(s) cadastrado(s)` : 'Nenhum veículo cadastrado'}
          </p>

          {vehicles.length === 0 && !showForm && (
            <div className="bg-card rounded-[20px] p-8 text-center border border-border/40">
              <Car className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-[16px] font-bold text-foreground mb-1">Cadastre seu veículo</p>
              <p className="text-[13px] text-muted-foreground mb-4">Adicione as informações do seu veículo para começar a receber corridas.</p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-2xl font-bold text-[14px] ios-press"
              >
                Adicionar veículo
              </button>
            </div>
          )}

          <div className="space-y-3">
            {vehicles.map(v => (
              <div key={v.id} className="bg-card rounded-[20px] p-5 border border-border/40 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-[14px] flex items-center justify-center">
                      <Car className="w-6 h-6 text-blue-500" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[16px] font-bold text-foreground">{v.brand} {v.model}</p>
                      <p className="text-[13px] text-muted-foreground">{v.year} · {v.color}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    v.is_verified ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}>
                    {v.is_verified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {v.is_verified ? 'Verificado' : 'Pendente'}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Placa</p>
                    <p className="text-[14px] font-black text-foreground font-mono">{v.plate}</p>
                  </div>
                  {v.renavam && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">RENAVAM</p>
                      <p className="text-[13px] font-semibold text-foreground font-mono">{v.renavam}</p>
                    </div>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <button type="button" className="w-8 h-8 bg-secondary rounded-xl flex items-center justify-center ios-press">
                      <Camera className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                    </button>
                    <button type="button" className="w-8 h-8 bg-secondary rounded-xl flex items-center justify-center ios-press">
                      <Edit2 className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {!v.is_verified && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-500/10 rounded-xl">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-[12px] text-amber-600 dark:text-amber-400">Em análise pela equipe Uppi. Em até 48h você será notificado.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formulário de cadastro */}
        {showForm && (
          <div className="bg-card rounded-[20px] p-5 border border-border/40 shadow-sm animate-ios-fade-up">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[16px] font-bold text-foreground">Novo Veículo</p>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground text-[13px] font-semibold ios-press">Cancelar</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Marca *</label>
                  <input
                    type="text"
                    placeholder="Ex: Toyota"
                    value={form.brand}
                    onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl bg-secondary/50 border border-border/40 text-foreground text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Modelo *</label>
                  <input
                    type="text"
                    placeholder="Ex: Corolla"
                    value={form.model}
                    onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl bg-secondary/50 border border-border/40 text-foreground text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Ano *</label>
                  <input
                    type="number"
                    min={2010}
                    max={new Date().getFullYear() + 1}
                    value={form.year}
                    onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}
                    className="w-full h-11 px-3.5 rounded-xl bg-secondary/50 border border-border/40 text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Cor *</label>
                  <input
                    type="text"
                    placeholder="Ex: Prata"
                    value={form.color}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl bg-secondary/50 border border-border/40 text-foreground text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Placa *</label>
                  <input
                    type="text"
                    placeholder="ABC1D23"
                    value={form.plate}
                    onChange={e => setForm(f => ({ ...f, plate: e.target.value.toUpperCase() }))}
                    maxLength={8}
                    className="w-full h-11 px-3.5 rounded-xl bg-secondary/50 border border-border/40 text-foreground text-[14px] font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">RENAVAM</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={form.renavam}
                    onChange={e => setForm(f => ({ ...f, renavam: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl bg-secondary/50 border border-border/40 text-foreground text-[14px] font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 bg-blue-500 text-white font-bold text-[15px] rounded-[16px] ios-press shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {saving ? 'Cadastrando...' : 'Cadastrar Veículo'}
              </button>
            </div>
          </div>
        )}
      </main>

      <DriverBottomNavigation />
    </div>
  )
}
