'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search, Car, UserCheck, UserX, Star, ChevronRight, Eye,
  CheckCircle, XCircle, Clock, Phone, FileText, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Driver {
  id: string
  full_name: string
  phone: string
  avatar_url: string | null
  rating: number
  total_rides: number
  created_at: string
  driver_profiles: {
    vehicle_brand: string
    vehicle_model: string
    vehicle_plate: string
    vehicle_color: string
    vehicle_year: number | null
    vehicle_type: string
    is_verified: boolean
    is_available: boolean
    total_earnings: number
    cnh_number: string | null
    cnh_expiry: string | null
    document_url: string | null
    created_at: string
  } | null
}

type Filter = 'all' | 'pending' | 'verified' | 'online'

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<Driver | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchDrivers = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*, driver_profiles(*)')
      .eq('user_type', 'driver')
      .order('created_at', { ascending: false })
    setDrivers((data as any) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchDrivers() }, [fetchDrivers])

  const filtered = drivers.filter(d => {
    if (filter === 'pending' && d.driver_profiles?.is_verified !== false) return false
    if (filter === 'verified' && !d.driver_profiles?.is_verified) return false
    if (filter === 'online' && !d.driver_profiles?.is_available) return false
    if (search && !d.full_name?.toLowerCase().includes(search.toLowerCase()) && !d.phone?.includes(search)) return false
    return true
  })

  const pendingCount = drivers.filter(d => d.driver_profiles && !d.driver_profiles.is_verified).length
  const verifiedCount = drivers.filter(d => d.driver_profiles?.is_verified).length
  const onlineCount = drivers.filter(d => d.driver_profiles?.is_available).length

  const handleVerify = async (driver: Driver, verify: boolean) => {
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('driver_profiles').update({ is_verified: verify }).eq('id', driver.id)
    fetchDrivers()
    if (selected?.id === driver.id) {
      setSelected({ ...driver, driver_profiles: driver.driver_profiles ? { ...driver.driver_profiles, is_verified: verify } : null })
    }
    setActionLoading(false)
  }

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: drivers.length },
    { key: 'pending', label: 'Pendentes', count: pendingCount },
    { key: 'verified', label: 'Verificados', count: verifiedCount },
    { key: 'online', label: 'Online', count: onlineCount },
  ]

  return (
    <>
      <AdminHeader title="Motoristas" subtitle={`${drivers.length} motoristas cadastrados`} />
      <div className="flex-1 overflow-hidden flex bg-[hsl(var(--admin-bg))]">
        {/* List */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-[hsl(var(--admin-border))]">
          <div className="p-4 pb-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] text-slate-200 placeholder:text-slate-600 text-[13px]"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {filters.map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors',
                    filter === f.key
                      ? 'bg-[hsl(var(--admin-green))]/15 text-[hsl(var(--admin-green))] border border-[hsl(var(--admin-green))]/30'
                      : 'bg-[hsl(var(--admin-surface))] text-slate-400 hover:text-slate-200 border border-[hsl(var(--admin-border))]'
                  )}
                >
                  {f.label}
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-md font-bold',
                    filter === f.key ? 'bg-[hsl(var(--admin-green))]/20' : 'bg-[hsl(var(--admin-border))]'
                  )}>{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-[hsl(var(--admin-green))] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.map(driver => {
              const dp = driver.driver_profiles
              return (
                <button
                  key={driver.id}
                  type="button"
                  onClick={() => setSelected(driver)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                    selected?.id === driver.id ? 'bg-[hsl(var(--admin-green))]/10 ring-1 ring-[hsl(var(--admin-green))]/30' : 'hover:bg-[hsl(var(--admin-surface))]'
                  )}
                >
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarImage src={driver.avatar_url || undefined} />
                    <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                      {driver.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-slate-200 truncate">{driver.full_name || 'Sem nome'}</span>
                      {dp?.is_available && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {dp ? (
                        <>
                          <Badge className={cn('text-[9px] font-bold border-0 px-1.5 py-0',
                            dp.is_verified ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                          )}>
                            {dp.is_verified ? 'Verificado' : 'Pendente'}
                          </Badge>
                          <span className="text-[11px] text-slate-500 truncate">{dp.vehicle_brand} {dp.vehicle_model}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{dp.vehicle_plate}</span>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-600">Sem perfil de motorista</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[11px] text-slate-400">{(driver.rating || 5).toFixed(1)}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                </button>
              )
            })}
            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <Car className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-[13px] font-medium">Nenhum motorista encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="hidden lg:flex w-[380px] flex-col overflow-y-auto bg-[hsl(var(--admin-bg))]">
          {selected ? (
            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="text-center pt-2">
                <Avatar className="w-18 h-18 mx-auto mb-3 ring-2 ring-[hsl(var(--admin-border))]" style={{ width: 72, height: 72 }}>
                  <AvatarImage src={selected.avatar_url || undefined} />
                  <AvatarFallback className="bg-emerald-500/15 text-emerald-400 text-2xl font-bold">
                    {selected.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-[18px] font-bold text-slate-100">{selected.full_name}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  {selected.driver_profiles?.is_available && (
                    <Badge className="bg-emerald-500/15 text-emerald-400 text-[10px] border-0">Online</Badge>
                  )}
                  <Badge className={cn('text-[10px] border-0',
                    selected.driver_profiles?.is_verified
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-amber-500/15 text-amber-400'
                  )}>
                    {selected.driver_profiles?.is_verified ? 'Verificado' : 'Pendente de verificacao'}
                  </Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Corridas', value: selected.total_rides || 0 },
                  { label: 'Rating', value: (selected.rating || 5).toFixed(1) },
                  { label: 'Ganhos', value: `R$ ${(selected.driver_profiles?.total_earnings || 0).toFixed(0)}` },
                ].map(s => (
                  <div key={s.label} className="bg-[hsl(var(--admin-surface))] rounded-xl p-3 text-center border border-[hsl(var(--admin-border))]">
                    <p className="text-[17px] font-bold text-slate-100">{s.value}</p>
                    <p className="text-[10px] text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] divide-y divide-[hsl(var(--admin-border))]">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[13px] text-slate-300">{selected.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-[11px] text-slate-600 font-mono truncate">{selected.id}</span>
                </div>
              </div>

              {/* Vehicle */}
              {selected.driver_profiles && (
                <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-4 space-y-3">
                  <h3 className="text-[12px] font-bold text-slate-300 uppercase tracking-wide">Veiculo</h3>
                  <div className="grid grid-cols-2 gap-3 text-[12px]">
                    {[
                      { label: 'Marca/Modelo', value: `${selected.driver_profiles.vehicle_brand || ''} ${selected.driver_profiles.vehicle_model || ''}`.trim() || 'N/A' },
                      { label: 'Placa', value: selected.driver_profiles.vehicle_plate || 'N/A', mono: true },
                      { label: 'Cor', value: selected.driver_profiles.vehicle_color || 'N/A' },
                      { label: 'Ano', value: selected.driver_profiles.vehicle_year?.toString() || 'N/A' },
                    ].map(f => (
                      <div key={f.label}>
                        <p className="text-slate-600 text-[10px] mb-0.5">{f.label}</p>
                        <p className={cn('text-slate-200 font-semibold', f.mono && 'font-mono uppercase')}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                  {selected.driver_profiles.cnh_number && (
                    <div className="flex items-center gap-2 text-[12px] pt-1 border-t border-[hsl(var(--admin-border))]">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400">CNH: <span className="font-mono text-slate-300">{selected.driver_profiles.cnh_number}</span></span>
                      {selected.driver_profiles.cnh_expiry && (
                        <span className="text-slate-500">· vence {new Date(selected.driver_profiles.cnh_expiry).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {selected.driver_profiles && (
                <div className="space-y-2">
                  {!selected.driver_profiles.is_verified ? (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleVerify(selected, true)}
                      className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[13px] font-bold hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprovar Motorista
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleVerify(selected, false)}
                      className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[13px] font-bold hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Revogar Verificacao
                    </button>
                  )}
                </div>
              )}

              <p className="text-[10px] text-slate-600 text-center">
                Cadastrado em {new Date(selected.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
              <Eye className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-[13px] font-medium text-slate-500">Selecione um motorista</p>
              <p className="text-[11px] text-slate-600">para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
