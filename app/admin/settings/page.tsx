'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { Input } from '@/components/ui/input'
import { Settings, Save, RefreshCw, AlertCircle, Check, DollarSign, Zap, Clock, MessageSquare, Tag, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppConfig {
  id: string
  key: string
  value: { value: unknown }
  description: string | null
  category: string
  updated_at: string
}

const CONFIG_META: Record<string, {
  label: string
  desc: string
  type: 'number' | 'text' | 'boolean'
  unit?: string
  min?: number
  max?: number
}> = {
  platform_fee_percent:    { label: 'Taxa da Plataforma',           desc: 'Percentual cobrado pela plataforma em cada corrida', type: 'number', unit: '%', min: 0, max: 50 },
  driver_earnings_percent: { label: 'Repasse ao Motorista',         desc: 'Percentual de cada corrida repassado ao motorista', type: 'number', unit: '%', min: 50, max: 100 },
  min_withdrawal_amount:   { label: 'Valor Mínimo de Saque',        desc: 'Menor valor permitido em uma solicitação de saque', type: 'number', unit: 'R$', min: 1 },
  max_withdrawal_per_day:  { label: 'Limite de Saque Diário',       desc: 'Valor máximo que um motorista pode sacar por dia', type: 'number', unit: 'R$', min: 50 },
  price_per_km:            { label: 'Preço por KM',                 desc: 'Tarifa base calculada por quilômetro rodado', type: 'number', unit: 'R$/km', min: 0.5 },
  price_base:              { label: 'Tarifa de Embarque',           desc: 'Valor fixo cobrado no início de cada corrida', type: 'number', unit: 'R$', min: 1 },
  price_per_minute:        { label: 'Preço por Minuto',             desc: 'Tarifa cobrada por tempo de deslocamento', type: 'number', unit: 'R$/min', min: 0.1 },
  surge_enabled:           { label: 'Tarifa Dinâmica (Surge)',      desc: 'Habilitar multiplicadores de preço por demanda', type: 'boolean' },
  surge_max_multiplier:    { label: 'Multiplicador Máx. de Surge', desc: 'Teto máximo para multiplicação da tarifa dinâmica', type: 'number', unit: 'x', min: 1, max: 5 },
  search_radius_km:        { label: 'Raio de Busca de Motoristas', desc: 'Distância máxima para localizar motoristas disponíveis', type: 'number', unit: 'km', min: 1, max: 30 },
  max_offer_counter:       { label: 'Máx. Contra-ofertas',         desc: 'Número máximo de contra-ofertas por corrida', type: 'number', unit: '', min: 0, max: 10 },
  offer_timeout_seconds:   { label: 'Tempo Limite de Oferta',      desc: 'Segundos que o motorista tem para aceitar/rejeitar uma oferta', type: 'number', unit: 's', min: 10, max: 120 },
  ride_search_timeout_min: { label: 'Tempo Limite de Busca',       desc: 'Minutos antes de cancelar a busca por motoristas', type: 'number', unit: 'min', min: 1, max: 30 },
  maintenance_mode:        { label: 'Modo Manutenção',             desc: 'Quando ativo, novos pedidos são bloqueados no app', type: 'boolean' },
  referral_bonus_amount:   { label: 'Bônus por Indicação',         desc: 'Créditos concedidos ao indicador após corrida qualificada', type: 'number', unit: 'R$', min: 0 },
  welcome_bonus:           { label: 'Bônus de Boas-Vindas',        desc: 'Créditos para novo usuário na primeira corrida', type: 'number', unit: 'R$', min: 0 },
}

const CATEGORY_ICONS: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  financial:  { icon: DollarSign,   label: 'Financeiro',   color: 'text-emerald-400' },
  pricing:    { icon: Percent,       label: 'Precificação', color: 'text-blue-400' },
  operations: { icon: Clock,         label: 'Operações',    color: 'text-amber-400' },
  system:     { icon: Settings,      label: 'Sistema',      color: 'text-red-400' },
  referral:   { icon: Tag,           label: 'Indicações',   color: 'text-violet-400' },
}

export default function SettingsPage() {
  const [configs, setConfigs]   = useState<AppConfig[]>([])
  const [edited, setEdited]     = useState<Record<string, string>>({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')

  const fetchConfigs = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('app_config')
      .select('*')
      .order('category')
      .order('key')
    setConfigs(data || [])
    setEdited({})
    setLoading(false)
  }, [])

  useEffect(() => { fetchConfigs() }, [fetchConfigs])

  const handleChange = (key: string, val: string) => {
    setEdited(prev => ({ ...prev, [key]: val }))
    setSaved(false)
    setError('')
  }

  const handleSave = async () => {
    if (!Object.keys(edited).length) return
    setSaving(true)
    setError('')
    const supabase = createClient()

    for (const [key, rawVal] of Object.entries(edited)) {
      const meta = CONFIG_META[key]
      let parsedValue: unknown = rawVal
      if (meta?.type === 'number') parsedValue = parseFloat(rawVal)
      if (meta?.type === 'boolean') parsedValue = rawVal === 'true'

      const { error: err } = await supabase
        .from('app_config')
        .update({ value: { value: parsedValue }, updated_at: new Date().toISOString() })
        .eq('key', key)

      if (err) {
        setError(`Erro ao salvar "${CONFIG_META[key]?.label || key}": ${err.message}`)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setSaved(true)
    fetchConfigs()
    setTimeout(() => setSaved(false), 3000)
  }

  const hasChanges = Object.keys(edited).length > 0

  // Agrupar por categoria
  const grouped = configs.reduce<Record<string, AppConfig[]>>((acc, cfg) => {
    const cat = cfg.category || 'general'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(cfg)
    return acc
  }, {})

  const getRawVal = (cfg: AppConfig): string => {
    if (edited[cfg.key] !== undefined) return edited[cfg.key]
    const v = cfg.value?.value
    return v === null || v === undefined ? '' : String(v)
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={fetchConfigs}
        className="w-8 h-8 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={handleSave}
        disabled={!hasChanges || saving}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all',
          hasChanges && !saving
            ? 'bg-[hsl(var(--admin-green))]/15 text-[hsl(var(--admin-green))] border border-[hsl(var(--admin-green))]/30 hover:bg-[hsl(var(--admin-green))]/25'
            : 'bg-[hsl(var(--admin-surface))] text-slate-600 border border-[hsl(var(--admin-border))] cursor-not-allowed'
        )}
      >
        {saving ? (
          <div className="w-3.5 h-3.5 border-2 border-[hsl(var(--admin-green))] border-t-transparent rounded-full animate-spin" />
        ) : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
        {saved ? 'Salvo!' : `Salvar${Object.keys(edited).length > 0 ? ` (${Object.keys(edited).length})` : ''}`}
      </button>
    </div>
  )

  return (
    <>
      <AdminHeader
        title="Configurações do Sistema"
        subtitle="Parâmetros globais da plataforma — salvo imediatamente em produção"
        actions={headerActions}
      />
      <div className="flex-1 overflow-y-auto bg-[hsl(var(--admin-bg))] p-5">
        <div className="max-w-3xl mx-auto space-y-6">

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-[hsl(var(--admin-green))] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {saved && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px]">
                  <Check className="w-4 h-4 shrink-0" />
                  Configurações salvas com sucesso.
                </div>
              )}

              {Object.entries(grouped).map(([category, items]) => {
                const cat = CATEGORY_ICONS[category]
                const Icon = cat?.icon || Settings
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={cn('w-4 h-4', cat?.color || 'text-slate-400')} />
                      <h2 className="text-[12px] font-bold uppercase tracking-widest text-slate-500">
                        {cat?.label || category}
                      </h2>
                    </div>
                    <div className="space-y-2">
                      {items.map(cfg => {
                        const meta = CONFIG_META[cfg.key]
                        const rawVal = getRawVal(cfg)
                        const isChanged = edited[cfg.key] !== undefined

                        return (
                          <div
                            key={cfg.key}
                            className={cn(
                              'bg-[hsl(var(--admin-surface))] rounded-xl border p-4 transition-colors',
                              isChanged ? 'border-[hsl(var(--admin-green))]/40' : 'border-[hsl(var(--admin-border))]'
                            )}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <h3 className="text-[13px] font-bold text-slate-200">
                                    {meta?.label || cfg.key}
                                  </h3>
                                  {meta?.unit && (
                                    <span className="text-[10px] bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-slate-500 px-1.5 py-0.5 rounded font-mono">
                                      {meta.unit}
                                    </span>
                                  )}
                                  {isChanged && (
                                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-medium">
                                      modificado
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500">{meta?.desc || cfg.description || cfg.key}</p>
                              </div>
                              <div className="w-36 shrink-0">
                                {meta?.type === 'boolean' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleChange(cfg.key, rawVal === 'true' ? 'false' : 'true')}
                                    className={cn(
                                      'w-full h-9 rounded-lg text-[12px] font-bold transition-colors flex items-center justify-center gap-2',
                                      rawVal === 'true'
                                        ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                    )}
                                  >
                                    {rawVal === 'true' ? 'ATIVO' : 'INATIVO'}
                                  </button>
                                ) : (
                                  <Input
                                    type={meta?.type === 'number' ? 'number' : 'text'}
                                    value={rawVal}
                                    min={meta?.min}
                                    max={meta?.max}
                                    step={meta?.type === 'number' ? 0.1 : undefined}
                                    onChange={e => handleChange(cfg.key, e.target.value)}
                                    className={cn(
                                      'h-9 bg-[hsl(var(--admin-bg))] text-slate-100 rounded-lg text-[13px] text-right tabular-nums',
                                      isChanged
                                        ? 'border-[hsl(var(--admin-green))]/50 focus-visible:ring-[hsl(var(--admin-green))]/30'
                                        : 'border-[hsl(var(--admin-border))]'
                                    )}
                                  />
                                )}
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-600 mt-2 font-mono">
                              Atualizado em: {new Date(cfg.updated_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {configs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                  <Settings className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-[14px]">Nenhuma configuração encontrada</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
