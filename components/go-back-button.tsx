'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function GoBackButton() {
  const router = useRouter()
  return (
    <Button
      variant="outline"
      onClick={() => router.back()}
      className="w-full"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Voltar
    </Button>
  )
}
