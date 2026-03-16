'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, MessageSquare, Bug, Lightbulb, Heart, Star, CheckCircle2 } from 'lucide-react'
import { iosToast } from '@/lib/utils/ios-toast'

const TYPES = [
  { key: 'bug', label: 'Reportar Bug', desc: 'Algo não está funcionando', icon: Bug, color: 'text-red-500', bg: 'bg-red-500/15' },
  { key: 'suggestion', label: 'Sugestão', desc: 'Tenho uma ideia de melhoria', icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-500/15' },
  { key: 'compliment', label: 'Elogio', desc: 'Quero agradecer algo', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/15' },
  { key: 'nps', label: 'NPS', desc: 'Avaliar o app de 0 a 10', icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/15' },
]

const CATEGORIES = ['app', 'ride', 'driver', 'payment', 'support', 'other']
const CATEGORY_LABELS: Record<string, string> = {
  app: 'Aplicativo', ride: 'Corrida', driver: 'Motorista',
  payment: 'Pagamento', support: 'Suporte', other: 'Outro',
}

export default function FeedbackPage() {
  const router = useRouter()
  const supabase = createClient()

  const [type, setType] = useState('')
  const [category, setCategory] = useState('app')
  const [message, setMessage] = useState('')
  const [npsScore, setNpsScore] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!type) { iosToast.error('Selecione o tipo de feedback'); return }
    if (type !== 'nps' && message.length < 10) { iosToast.error('Escreva sua mensagem (mín. 10 caracteres)'); return }
    if (type === 'nps' && npsScore === null) { iosToast.error('Selecione uma nota de 0 a 10'); return }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from('user_feedback').insert({
        user_id: user?.id || null,
        type,
        category,
        message: message || `NPS: ${npsScore}`,
        nps_score: type === 'nps' ? npsScore : null,
        status: 'new',
      })

      if (error) throw error
      setSubmitted(true)
    } catch {
      iosToast.error('Erro ao enviar feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-dvh overflow-y-auto bg-[#F2F2F7] dark:bg-black pb-10 ios-scroll">
      <header className="bg-white/80 dark:bg-black/80 ios-blur-heavy border-b border-black/[0.08] dark:border-white/[0.08] sticky top-0 z-20">
        <div className="px-5 pt-safe-offset-4 pb-4 flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/60 ios-press">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">Feedback</h1>
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto">
        {submitted ? (
          <div className="text-center py-10 space-y-4 animate-ios-fade-up">
            <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={2} />
            </div>
            <p className="text-[22px] font-bold text-foreground">Obrigado pelo feedback!</p>
            <p className="text-[15px] text-muted-foreground">Seu feedback é muito importante para melhorarmos o Uppi.</p>
            <button type="button" onClick={() => router.back()} className="w-full h-[54px] bg-blue-500 text-white font-bold text-[17px] rounded-[18px] ios-press shadow-lg shadow-blue-500/20 mt-4">
              Voltar
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Tipo */}
            <div>
              <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Tipo de feedback</p>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setType(t.key)}
                    className={`p-4 rounded-[18px] text-left border ios-press transition-colors ${
                      type === t.key ? 'border-blue-500/40 bg-blue-500/5' : 'bg-white/90 dark:bg-[#1C1C1E]/90 border-black/[0.04] dark:border-white/[0.08]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center mb-3 ${t.bg}`}>
                      <t.icon className={`w-5 h-5 ${t.color}`} strokeWidth={2} />
                    </div>
                    <p className="text-[14px] font-bold text-foreground">{t.label}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Categoria */}
            {type && type !== 'nps' && (
              <div className="animate-ios-fade-up">
                <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Categoria</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`px-4 py-2 rounded-xl text-[13px] font-semibold ios-press ${
                        category === c ? 'bg-blue-500 text-white' : 'bg-white/90 dark:bg-[#1C1C1E]/90 text-muted-foreground border border-black/[0.04] dark:border-white/[0.08]'
                      }`}
                    >
                      {CATEGORY_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* NPS */}
            {type === 'nps' && (
              <div className="animate-ios-fade-up">
                <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 px-1">De 0 a 10, quanto você recomendaria o Uppi?</p>
                <p className="text-[12px] text-muted-foreground mb-3 px-1">0 = não recomendaria · 10 = com certeza recomendaria</p>
                <div className="grid grid-cols-11 gap-1.5">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNpsScore(i)}
                      className={`aspect-square rounded-xl text-[14px] font-bold ios-press transition-colors ${
                        npsScore === i
                          ? i >= 9 ? 'bg-emerald-500 text-white' : i >= 7 ? 'bg-yellow-400 text-slate-900' : 'bg-red-500 text-white'
                          : 'bg-white/90 dark:bg-[#1C1C1E]/90 text-foreground border border-black/[0.04] dark:border-white/[0.08]'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagem */}
            {type && type !== 'nps' && (
              <div className="animate-ios-fade-up">
                <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide block mb-2 px-1">Sua mensagem</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Escreva aqui seu feedback..."
                  rows={5}
                  maxLength={500}
                  className="w-full px-4 py-3.5 rounded-[18px] bg-white/90 dark:bg-[#1C1C1E]/90 border border-black/[0.04] dark:border-white/[0.08] text-foreground text-[14px] placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <p className="text-[11px] text-muted-foreground px-1 mt-1">{message.length}/500</p>
              </div>
            )}

            {type && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-[54px] bg-blue-500 text-white font-bold text-[17px] rounded-[18px] ios-press shadow-lg shadow-blue-500/20 disabled:opacity-40 animate-ios-fade-up"
              >
                {submitting ? 'Enviando...' : 'Enviar Feedback'}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
