'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Users, Plus, Check, Copy, Share2, Minus } from 'lucide-react'
import { iosToast } from '@/lib/utils/ios-toast'

interface Ride {
  id: string
  final_price: number
  pickup_address: string
  dropoff_address: string
}

export default function RideSplitPage() {
  const { id: rideId } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [ride, setRide] = useState<Ride | null>(null)
  const [splitCount, setSplitCount] = useState(2)
  const [created, setCreated] = useState(false)
  const [splitId, setSplitId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('rides').select('id, final_price, pickup_address, dropoff_address').eq('id', rideId).single()
      if (data) setRide(data)
      setLoading(false)
    }
    load()
  }, [rideId])

  const amountPerPerson = ride ? Number(ride.final_price) / splitCount : 0

  const handleCreate = async () => {
    if (!ride) return
    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from('payment_splits').insert({
        ride_id: rideId,
        initiator_id: user.id,
        total_amount: ride.final_price,
        split_count: splitCount,
        status: 'pending',
      }).select().single()

      if (error) throw error

      setSplitId(data.id)
      setCreated(true)
      iosToast.success('Split criado! Compartilhe o link com seus amigos.')
    } catch {
      iosToast.error('Erro ao criar split')
    } finally {
      setCreating(false)
    }
  }

  const handleShare = async () => {
    const link = `${window.location.origin}/split/${splitId}`
    try {
      await navigator.share({ title: 'Dividir corrida Uppi', text: `Você foi convidado a dividir a corrida. Sua parte: R$ ${amountPerPerson.toFixed(2)}`, url: link })
    } catch {
      await navigator.clipboard.writeText(link)
      iosToast.success('Link copiado!')
    }
  }

  if (loading) {
    return <div className="h-dvh bg-background flex items-center justify-center"><div className="w-8 h-8 border-[2.5px] border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="h-dvh overflow-y-auto bg-[#F2F2F7] dark:bg-black pb-10 ios-scroll">
      <header className="bg-white/80 dark:bg-black/80 ios-blur-heavy border-b border-black/[0.08] dark:border-white/[0.08] sticky top-0 z-20">
        <div className="px-5 pt-safe-offset-4 pb-4 flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/60 ios-press">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">Dividir Corrida</h1>
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto space-y-5">
        {/* Valor total */}
        <div className="bg-blue-500 rounded-[24px] p-6 text-center shadow-lg shadow-blue-500/20">
          <p className="text-[13px] font-semibold text-white/70 uppercase tracking-wider">Valor total da corrida</p>
          <p className="text-[42px] font-black text-white tracking-tight leading-none mt-1">R$ {Number(ride?.final_price || 0).toFixed(2)}</p>
          <p className="text-[13px] text-white/70 mt-2 truncate px-4">{ride?.pickup_address} → {ride?.dropoff_address}</p>
        </div>

        {!created ? (
          <>
            {/* Seletor de pessoas */}
            <div className="bg-white/90 dark:bg-[#1C1C1E]/90 rounded-[24px] p-6 border border-black/[0.04] dark:border-white/[0.08] shadow-sm">
              <p className="text-[15px] font-bold text-foreground mb-4 text-center">Quantas pessoas vão dividir?</p>

              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                  className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center ios-press"
                >
                  <Minus className="w-5 h-5 text-foreground" strokeWidth={2.5} />
                </button>

                <div className="text-center">
                  <p className="text-[48px] font-black text-blue-500 leading-none">{splitCount}</p>
                  <p className="text-[12px] text-muted-foreground">pessoas</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSplitCount(Math.min(10, splitCount + 1))}
                  className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center ios-press"
                >
                  <Plus className="w-5 h-5 text-foreground" strokeWidth={2.5} />
                </button>
              </div>

              {/* Valor por pessoa */}
              <div className="mt-5 pt-5 border-t border-border/40">
                <p className="text-[13px] text-muted-foreground text-center mb-2">Cada pessoa paga</p>
                <p className="text-[32px] font-black text-foreground text-center">R$ {amountPerPerson.toFixed(2)}</p>
              </div>

              {/* Grid de pessoas */}
              <div className="mt-4 grid grid-cols-5 gap-2">
                {Array.from({ length: splitCount }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" strokeWidth={2} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{i === 0 ? 'Você' : `P${i + 1}`}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="w-full h-[54px] bg-blue-500 text-white font-bold text-[17px] rounded-[18px] ios-press shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {creating ? 'Criando...' : 'Criar Split'}
            </button>
          </>
        ) : (
          <div className="space-y-4 animate-ios-fade-up">
            {/* Sucesso */}
            <div className="bg-white/90 dark:bg-[#1C1C1E]/90 rounded-[24px] p-8 text-center border border-black/[0.04] dark:border-white/[0.08] shadow-sm">
              <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-500" strokeWidth={2.5} />
              </div>
              <p className="text-[20px] font-bold text-foreground mb-1">Split criado!</p>
              <p className="text-[14px] text-muted-foreground mb-4">
                Compartilhe o link com {splitCount - 1} pessoa(s). Cada uma paga R$ {amountPerPerson.toFixed(2)}.
              </p>

              <div className="bg-secondary/50 rounded-[14px] px-4 py-3 font-mono text-[12px] text-muted-foreground break-all">
                {window.location.origin}/split/{splitId}
              </div>
            </div>

            <button type="button" onClick={handleShare} className="w-full h-[54px] bg-blue-500 text-white font-bold text-[17px] rounded-[18px] ios-press shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              Compartilhar link
            </button>

            <button type="button" onClick={() => router.back()} className="w-full h-12 bg-secondary text-muted-foreground font-semibold text-[15px] rounded-[18px] ios-press">
              Voltar
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
