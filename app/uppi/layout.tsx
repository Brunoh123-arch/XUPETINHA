'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { initOfflineHandling } from '@/lib/utils/offline-handler'
import { Capacitor } from '@capacitor/core'

/**
 * Variantes de transição iOS Stack Navigation.
 * Slide da direita na entrada, volta levemente para a direita na saída.
 * Usa spring para imitar a física do UINavigationController.
 */
const stackVariants = {
  initial: { x: '100%', opacity: 1 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-28%', opacity: 0 },
}

const stackTransition = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 38,
  mass: 0.9,
}

export default function UppiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isNative = Capacitor.isNativePlatform()

  useEffect(() => {
    initOfflineHandling()
  }, [])

  // Aplica transições de slide apenas no nativo — no web usa render direto
  // para não interferir com o comportamento esperado em browser
  if (!isNative) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={stackVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={stackTransition}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
