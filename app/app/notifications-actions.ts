'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markNotificationAsReadAction(notificationId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Não autenticado' }

    const { error } = await supabase
      .from('notification_reads')
      .upsert({
        notification_id: notificationId,
        user_id: user.id,
        read_at: new Date().toISOString()
      })

    if (error) throw error

    revalidatePath('/app')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro ao marcar como lida:', error)
    const message = error instanceof Error ? error.message : 'Erro ao marcar como lida'
    return { error: message }
  }
}

export async function markAllAsReadAction() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Não autenticado' }

    // Simplificação: Vamos pegar as notificações existentes e inserir o registro de leitura.
    const { data: allNotifications } = await supabase.from('notifications').select('id')
    
    if (allNotifications && allNotifications.length > 0) {
      const reads = allNotifications.map(n => ({
        notification_id: n.id,
        user_id: user.id
      }))

      const { error } = await supabase
        .from('notification_reads')
        .upsert(reads, { onConflict: 'notification_id,user_id' })

      if (error) throw error
    }

    revalidatePath('/app')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro ao marcar todas como lidas:', error)
    const message = error instanceof Error ? error.message : 'Erro ao marcar todas como lidas'
    return { error: message }
  }
}
