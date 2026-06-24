'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { initOfflineSyncListener } from '@/lib/offline-sync'

export function PwaRegister() {
  useEffect(() => {
    initOfflineSyncListener()

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Evita loops infinitos de recarregamento
      let refreshing = false

      const handleControllerChange = () => {
        if (refreshing) return
        refreshing = true

        // Só exibe toast se já existia um service worker controlando a página anteriormente
        // Isso evita disparar o toast na primeira instalação do app
        if (navigator.serviceWorker.controller) {
          toast.info('Nova versão do app disponível!', {
            description: 'Clique em atualizar para carregar as últimas melhorias.',
            action: {
              label: 'Atualizar',
              onClick: () => {
                window.location.reload()
              },
            },
            duration: 15000, // Exibe por 15 segundos
          })
        }
      }

      const handleRegister = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          console.log('Service Worker registered successfully with scope:', registration.scope)

          // Escuta por atualizações futuras (quando um novo SW toma o controle)
          navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
        } catch (error) {
          console.error('Service Worker registration failed:', error)
        }
      }

      if (document.readyState === 'complete') {
        handleRegister()
      } else {
        window.addEventListener('load', handleRegister)
        return () => {
          window.removeEventListener('load', handleRegister)
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
        }
      }
    }
  }, [])

  return null
}

