'use client'

import { useEffect } from 'react'

export function PwaSplashRemover() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const splash = document.getElementById('pwa-splash')
      if (splash) {
        // Suaviza a saída com fade-out
        splash.style.opacity = '0'
        setTimeout(() => {
          splash.remove()
        }, 300)
      }
    }
  }, [])

  return null
}
