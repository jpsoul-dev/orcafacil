'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function PwaRegister() {
  useEffect(() => {
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
        // Não registra o Service Worker em ambiente de desenvolvimento local
        // para evitar lentidão e loops de recompilação do Next.js HMR/Turbopack
        if (process.env.NODE_ENV === 'development') {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations()
            for (const reg of registrations) {
              await reg.unregister()
              console.log('Active service worker unregistered in development mode:', reg.scope)
            }
          } catch (err) {
            console.error('Error cleaning up service worker in development:', err)
          }
          return
        }

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

