'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, BookOpen, CheckCircle, Clock, Star } from 'lucide-react'

interface Training {
  id: string
  module_name: string
  completed: boolean
  score: number | null
  completed_at: string | null
}

interface Article {
  id: string
  title: string
  category: string
  views: number
  helpful_count: number
  is_published: boolean
}

export default function DriverTrainingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [tRes, aRes] = await Promise.all([
        supabase.from('driver_training').select('*').eq('driver_id', user.id).order('created_at'),
        supabase.from('knowledge_base_articles').select('*').in('target_audience', ['driver', 'all']).eq('is_published', true).order('views', { ascending: false }).limit(8),
      ])
      if (tRes.data) setTrainings(tRes.data)
      if (aRes.data) setArticles(aRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const completed = trainings.filter(t => t.completed).length
  const total = trainings.length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted">
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-foreground text-lg">Treinamentos</h1>
            <p className="text-xs text-muted-foreground">Qualifique-se e ganhe mais</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="p-4 space-y-5">

          {total > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">Progresso geral</span>
                <span className="text-sm font-bold text-primary">{completed}/{total} modulos</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{progress}% concluido</p>
            </div>
          )}

          {trainings.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                Modulos de Treinamento
              </h2>
              <div className="bg-card rounded-xl border border-border divide-y divide-border">
                {trainings.map(t => (
                  <div key={t.id} className="p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${t.completed ? 'bg-green-100' : 'bg-muted'}`}>
                      {t.completed ? <CheckCircle size={18} className="text-green-600" /> : <Clock size={18} className="text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{t.module_name}</p>
                      {t.completed && t.completed_at && (
                        <p className="text-xs text-muted-foreground">
                          Concluido em {new Date(t.completed_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      {!t.completed && <p className="text-xs text-muted-foreground">Pendente</p>}
                    </div>
                    {t.score !== null && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star size={14} className="fill-yellow-500" />
                        <span className="text-sm font-bold">{t.score}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {articles.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                Central de Ajuda para Motoristas
              </h2>
              <div className="space-y-2">
                {articles.map(a => (
                  <div key={a.id} className="bg-card rounded-xl border border-border p-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{a.category}</span>
                        <span className="text-xs text-muted-foreground">{a.views} views</span>
                      </div>
                    </div>
                    <ChevronLeft size={16} className="text-muted-foreground rotate-180 ml-2 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {trainings.length === 0 && articles.length === 0 && (
            <div className="text-center py-12">
              <BookOpen size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum treinamento disponivel no momento</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
