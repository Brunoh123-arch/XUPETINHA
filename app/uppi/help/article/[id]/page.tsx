'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { iosToast } from '@/lib/utils/ios-toast'
import { haptics } from '@/lib/utils/ios-haptics'
import { motion } from 'framer-motion'
import { ArrowLeft, ThumbsUp, ThumbsDown, Share2, BookOpen, ChevronRight } from 'lucide-react'

interface Article {
  id: string
  title: string
  content: string
  category: string
  helpful_count: number
  not_helpful_count: number
  updated_at: string
}

interface RelatedArticle {
  id: string
  title: string
  category: string
}

export default function HelpArticlePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [voted, setVoted] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (params.id) loadArticle()
  }, [params.id])

  async function loadArticle() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('knowledge_base_articles')
        .select('*')
        .eq('id', params.id as string)
        .eq('is_published', true)
        .single()

      if (data) {
        setArticle(data)
        // Buscar artigos relacionados da mesma categoria
        const { data: rel } = await supabase
          .from('knowledge_base_articles')
          .select('id, title, category')
          .eq('category', data.category)
          .eq('is_published', true)
          .neq('id', data.id)
          .limit(4)
        setRelated(rel || [])
      } else {
        iosToast.error('Artigo não encontrado')
        router.back()
      }
    } catch {
      iosToast.error('Erro ao carregar artigo')
    } finally {
      setLoading(false)
    }
  }

  async function handleVote(type: 'up' | 'down') {
    if (voted || !article) return
    haptics.light()
    setVoted(type)

    const field = type === 'up' ? 'helpful_count' : 'not_helpful_count'
    await supabase
      .from('knowledge_base_articles')
      .update({ [field]: (article[field] || 0) + 1 })
      .eq('id', article.id)

    setArticle(prev => prev ? { ...prev, [field]: (prev[field] || 0) + 1 } : prev)
    iosToast.success(type === 'up' ? 'Obrigado pelo feedback!' : 'Feedback registrado')
  }

  async function handleShare() {
    haptics.light()
    if (navigator.share && article) {
      await navigator.share({ title: article.title, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      iosToast.success('Link copiado!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-14 pb-4 border-b border-border">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div className="h-5 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-muted animate-pulse rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!article) return null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-14 pb-4 border-b border-border bg-background sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{article.category}</span>
        <button onClick={handleShare} className="p-2 -mr-2 rounded-full hover:bg-muted">
          <Share2 size={18} className="text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Titulo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pt-6 pb-4"
        >
          <h1 className="text-xl font-bold text-foreground leading-snug">{article.title}</h1>
          <p className="text-xs text-muted-foreground mt-2">
            Atualizado em {new Date(article.updated_at).toLocaleDateString('pt-BR')}
          </p>
        </motion.div>

        {/* Conteudo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="px-4 pb-6"
        >
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        </motion.div>

        {/* Votacao */}
        <div className="mx-4 mb-6 p-4 rounded-2xl bg-muted/50 border border-border">
          <p className="text-sm font-semibold text-foreground text-center mb-3">Este artigo foi útil?</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleVote('up')}
              disabled={!!voted}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                voted === 'up'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'border-border text-muted-foreground hover:border-green-500 hover:text-green-600'
              }`}
            >
              <ThumbsUp size={16} />
              Sim {article.helpful_count > 0 && `(${article.helpful_count})`}
            </button>
            <button
              onClick={() => handleVote('down')}
              disabled={!!voted}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                voted === 'down'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'border-border text-muted-foreground hover:border-red-500 hover:text-red-500'
              }`}
            >
              <ThumbsDown size={16} />
              Nao
            </button>
          </div>
        </div>

        {/* Artigos relacionados */}
        {related.length > 0 && (
          <div className="px-4 pb-8">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={16} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Artigos relacionados</span>
            </div>
            <div className="space-y-2">
              {related.map(rel => (
                <button
                  key={rel.id}
                  onClick={() => { haptics.light(); router.push(`/uppi/help/article/${rel.id}`) }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-foreground text-left">{rel.title}</span>
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nao resolveu */}
        <div className="mx-4 mb-8 p-4 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-sm font-semibold text-foreground mb-1">Ainda com dúvida?</p>
          <p className="text-xs text-muted-foreground mb-3">Fale com nosso suporte e resolva rapidinho.</p>
          <button
            onClick={() => { haptics.medium(); router.push('/uppi/suporte') }}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            Abrir ticket de suporte
          </button>
        </div>
      </div>
    </div>
  )
}
