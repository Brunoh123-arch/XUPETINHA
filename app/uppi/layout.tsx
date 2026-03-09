'use client'

import React, { useEffect } from 'react'
import { initOfflineHandling } from '@/lib/utils/offline-handler'

export default function UppiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Inicializa o handler de offline UMA vez ao montar o layout raiz do app
  useEffect(() => {
    initOfflineHandling()
  }, [])

  return <>{children}</>
}
