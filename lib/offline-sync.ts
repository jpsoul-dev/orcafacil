import { saveCustomer } from '@/app/app/customers/actions'
import { toast } from 'sonner'
import { triggerHaptic } from './haptic'
import type { CustomerInput } from '@/lib/services/customer-service'

export interface OfflineAction {
  type: 'SAVE_CUSTOMER'
  payload: {
    data: CustomerInput
    id?: string
  }
  timestamp: number
}

const OFFLINE_QUEUE_KEY = 'orcafacil_offline_actions'

export function enqueueOfflineAction(type: OfflineAction['type'], payload: OfflineAction['payload']) {
  if (typeof window === 'undefined') return

  try {
    const queueJson = localStorage.getItem(OFFLINE_QUEUE_KEY)
    const queue: OfflineAction[] = queueJson ? JSON.parse(queueJson) : []
    
    queue.push({
      type,
      payload,
      timestamp: Date.now()
    })
    
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
    triggerHaptic('success')
  } catch (e) {
    console.error('Erro ao enfileirar ação offline:', e)
  }
}

export async function processOfflineQueue() {
  if (typeof window === 'undefined' || !navigator.onLine) return

  try {
    const queueJson = localStorage.getItem(OFFLINE_QUEUE_KEY)
    if (!queueJson) return

    const queue: OfflineAction[] = JSON.parse(queueJson)
    if (queue.length === 0) return

    toast.info(`Sincronizando ${queue.length} alteração(ões) pendente(s)...`)

    const remainingActions: OfflineAction[] = []
    let successCount = 0
    let errorCount = 0

    for (const action of queue) {
      try {
        if (action.type === 'SAVE_CUSTOMER') {
          const result = await saveCustomer(action.payload.data, action.payload.id)
          if (result.success) {
            successCount++
          } else {
            console.error('Falha ao sincronizar cliente offline:', result.error)
            remainingActions.push(action)
            errorCount++
          }
        }
      } catch (err) {
        console.error('Erro ao sincronizar ação offline:', err)
        remainingActions.push(action)
        errorCount++
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingActions))

    if (successCount > 0) {
      triggerHaptic('success')
      toast.success(`${successCount} item(ns) sincronizado(s) com sucesso!`)
      // Força o Next.js a atualizar os dados na tela
      window.location.reload()
    }

    if (errorCount > 0) {
      triggerHaptic('error')
      toast.error(`Falha ao sincronizar ${errorCount} item(ns). Tentaremos mais tarde.`)
    }
  } catch (e) {
    console.error('Erro ao processar fila offline:', e)
  }
}

export function initOfflineSyncListener() {
  if (typeof window === 'undefined') return

  window.addEventListener('online', () => {
    processOfflineQueue()
  })

  // Tenta processar no carregamento inicial se estiver online
  if (navigator.onLine) {
    processOfflineQueue()
  }
}
