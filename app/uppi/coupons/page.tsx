'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { iosToast } from '@/lib/utils/ios-toast'
import { haptics } from '@/lib/utils/ios-haptics'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNavigation } from '@/components/bottom-navigation'
import { IOSBottomSheet } from '@/components/ui/ios-bottom-sheet'
import { Tag, Percent, DollarSign, CheckCircle2, Clock, Gift } from 'lucide-react'

interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_discount?: number
  description?: string
  expires_at?: string
  min_ride_value?: number
  is_reusable?: boolean
}

export default function CouponsPage() {
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [manualCode, setManualCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [preview, setPreview] = useState<{
    success: boolean; discount: number; final_amount: number
  } | null>(null)

  useEffect(() => { loadCoupons() }, [])

  const loadCoupons = async () => {
    try {
      const res = await fetch('/api/v1/coupons')
      if (res.ok) {
        const data = await res.json()
        setCoupons(data.coupons || [])
      }
    } catch (err) {
      console.error('[coupons]', err)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    if (!manualCode.trim()) {
      iosToast.error('Digite um código')
      return
    }
    setValidating(true)
    setPreview(null)
    try {
      const res = await fetch(`/api/v1/coupons?validate=${manualCode.trim()}&amount=50`)
      const data = await res.json()
      if (data.success) {
        setPreview(data)
        haptics.notification('success')
        iosToast.success(`Cupom válido! Desconto de R$ ${data.discount.toFixed(2)}`)
      } else {
        haptics.notification('error')
        iosToast.error(data.error || 'Cupom inválido')
      }
    } catch {
      iosToast.error('Erro ao validar cupom')
    } finally {
      setValidating(false)
    }
  }

  const copyCouponCode = async (code: string) => {
    const { nativeCopy } = await import('@/lib/native')
    await nativeCopy(code)
    haptics.notification('success')
    iosToast.success('Código copiado!')
  }

  const formatExpiry = (date?: string) => {
    if (!date) return null
    const d = new Date(date)
    const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 'Expirado'
    if (diff === 0) return 'Expira hoje'
    if (diff <= 7) return `Expira em ${diff} dia${diff > 1 ? 's' : ''}`
    return `Até ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
  }

  const getDiscountLabel = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`
    }
    return `R$ ${coupon.discount_value.toFixed(2)} OFF`
  }

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-28 ios-scroll">
      <header className="sticky top-0 z-10 bg-background/80 ios-blur border-b border-border/50">
        <div className="flex items-center gap-4 px-5 pt-safe-offset-4 pb-4">
          <button type="button" onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/60 ios-press">
            <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-[22px] font-bold text-foreground">Cupons</h1>
            <p className="text-sm text-muted-foreground">Seus descontos disponíveis</p>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto space-y-5">
        {/* Add coupon manually */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[24px] p-5 border border-border/50"
        >
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Inserir código de cupom
          </p>
          <div className="flex gap-2">
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Ex: UPPI10"
              maxLength={20}
              className="flex-1 bg-secondary/60 rounded-[14px] px-4 py-3 text-[15px] font-mono font-bold tracking-widest text-foreground placeholder:text-muted-foreground/50 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary/30 border border-border/40"
            />
            <button
              type="button"
              onClick={handleValidate}
              disabled={validating || !manualCode.trim()}
              className="px-5 py-3 bg-primary text-primary-foreground rounded-[14px] font-semibold text-[14px] ios-press disabled:opacity-50"
            >
              {validating ? '...' : 'Aplicar'}
            </button>
          </div>

          <AnimatePresence>
            {preview?.success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex items-center gap-3 bg-green-50 dark:bg-green-900/20 rounded-[14px] p-3"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-green-700 dark:text-green-400">Cupom válido</p>
                  <p className="text-[12px] text-green-600 dark:text-green-500">
                    Desconto de R$ {preview.discount.toFixed(2)} em corridas acima de R$ 50
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Available coupons */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[20px] font-bold text-foreground">Disponíveis</h2>
            {coupons.length > 0 && (
              <span className="text-[13px] font-semibold text-primary">{coupons.length} cupom{coupons.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : coupons.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-[24px] p-10 border border-border/50 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-secondary/60 mx-auto mb-4 flex items-center justify-center">
                <Gift className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <p className="text-[18px] font-bold text-foreground mb-2">Nenhum cupom disponível</p>
              <p className="text-muted-foreground text-[14px]">Fique de olho em nossas promoções</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon, i) => {
                const expiry = formatExpiry(coupon.expires_at)
                const isUrgent = coupon.expires_at && Math.ceil((new Date(coupon.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 3

                return (
                  <motion.div
                    key={coupon.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card rounded-[24px] border border-border/50 overflow-hidden"
                  >
                    {/* Top section */}
                    <div className="p-5 flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0 ${
                        coupon.discount_type === 'percentage'
                          ? 'bg-primary/10'
                          : 'bg-green-500/10'
                      }`}>
                        {coupon.discount_type === 'percentage'
                          ? <Percent className="w-7 h-7 text-primary" />
                          : <DollarSign className="w-7 h-7 text-green-600 dark:text-green-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[22px] font-bold text-foreground">{getDiscountLabel(coupon)}</p>
                          {coupon.is_reusable && (
                            <span className="px-2 py-0.5 bg-secondary rounded-full text-[11px] font-semibold text-muted-foreground">
                              Reutilizável
                            </span>
                          )}
                        </div>
                        {coupon.description && (
                          <p className="text-[13px] text-muted-foreground truncate">{coupon.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {expiry && (
                            <span className={`flex items-center gap-1 text-[12px] font-medium ${
                              isUrgent ? 'text-red-500' : 'text-muted-foreground'
                            }`}>
                              <Clock className="w-3 h-3" />
                              {expiry}
                            </span>
                          )}
                          {coupon.min_ride_value && (
                            <span className="text-[12px] text-muted-foreground">
                              Mín. R$ {coupon.min_ride_value.toFixed(0)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Divider with dashed */}
                    <div className="mx-5 border-t border-dashed border-border/60" />

                    {/* Bottom section */}
                    <div className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-mono font-bold text-[16px] tracking-widest text-foreground">
                          {coupon.code}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyCouponCode(coupon.code)}
                        className="px-4 py-2 bg-primary/10 text-primary rounded-full text-[13px] font-semibold ios-press"
                      >
                        Copiar
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
