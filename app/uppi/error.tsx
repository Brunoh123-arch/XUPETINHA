'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function UppiError({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    console.error('[Uppi Error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        {/* Icone animado */}
        <div className="mx-auto w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center animate-pulse">
          <AlertTriangle className="w-12 h-12 text-orange-500" />
        </div>

        {/* Mensagem */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">
            Ops! Algo deu errado
          </h1>
          <p className="text-sm text-muted-foreground">
            Nao se preocupe, estamos trabalhando para resolver isso.
          </p>
        </div>

        {/* Botoes */}
        <div className="space-y-3">
          <Button 
            onClick={reset} 
            className="w-full bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>

          <Button 
            variant="outline" 
            onClick={() => router.push('/uppi/home')}
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao inicio
          </Button>

          <Button 
            variant="ghost" 
            onClick={() => router.push('/uppi/support')}
            className="w-full text-muted-foreground"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Falar com suporte
          </Button>
        </div>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left text-xs text-muted-foreground">
            <summary className="cursor-pointer">Detalhes do erro</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-auto max-h-32">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
