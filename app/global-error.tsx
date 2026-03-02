'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Algo deu errado</h1>
            <p className="text-gray-400">
              Encontramos um erro inesperado. Por favor, tente novamente.
            </p>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-gray-900 rounded-lg text-left">
              <p className="text-xs font-mono text-red-400 break-all">{error.message}</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Button onClick={reset} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Tentar novamente
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
              className="w-full border-gray-700 text-gray-300"
            >
              Voltar ao inicio
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
