'use client'

import { Bell } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuGroup,
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { markNotificationAsReadAction, markAllAsReadAction } from '@/app/app/notifications-actions'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface NotificationItem {
  id: string
  title: string | null
  content: string
  created_at: string
  type: string
  isRead: boolean
}

interface RawNotification {
  id: string
  title: string | null
  content: string
  created_at: string
  type: string
  notification_reads: { read_at: string }[]
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Memoize o cliente supabase para evitar recriação a cada render
  const supabase = useMemo(() => createClient(), [])

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Buscar as 10 notificações mais recentes
    // RLS em notification_reads garante que só veremos nossas próprias marcações de leitura
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        title,
        content,
        created_at,
        type,
        notification_reads(read_at)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Erro ao buscar notificações:', error)
      return
    }

    const rawData = (data as unknown) as RawNotification[]

    const formatted: NotificationItem[] = (rawData || []).map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      created_at: n.created_at,
      type: n.type,
      isRead: n.notification_reads && n.notification_reads.length > 0
    }))

    setNotifications(formatted)
    setUnreadCount(formatted.filter(n => !n.isRead).length)
  }, [supabase])

  useEffect(() => {
    const init = async () => {
      await fetchNotifications()
    }
    init()

    // Canal unificado para notificações e status de leitura
    const channel = supabase
      .channel('notification-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        table: 'notifications', 
        schema: 'public' 
      }, () => {
        fetchNotifications()
        toast.info('Nova notificação recebida!')
      })
      .on('postgres_changes', { 
        event: '*', 
        table: 'notifications', 
        schema: 'public' 
      }, (payload) => {
        if (payload.eventType !== 'INSERT') {
          fetchNotifications()
        }
      })
      .on('postgres_changes', {
        event: '*', 
        table: 'notification_reads',
        schema: 'public'
      }, () => {
        // Atualiza quando o status de leitura muda (em outro dispositivo, por exemplo)
        fetchNotifications()
      })
      .subscribe()

    // Polling de segurança a cada 2 minutos
    const interval = setInterval(() => {
      fetchNotifications()
    }, 1000 * 60 * 2)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [fetchNotifications, supabase])

  const handleMarkAsRead = async (id: string) => {
    const res = await markNotificationAsReadAction(id)
    if (res.success) {
      fetchNotifications()
    }
  }

  const handleMarkAllAsRead = async () => {
    const res = await markAllAsReadAction()
    if (res.success) {
      fetchNotifications()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between font-normal">
            <span className="font-bold">Notificações</span>
            {unreadCount > 0 && (
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  handleMarkAllAsRead()
                }}
                className="text-xs text-primary hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma notificação por enquanto.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((n) => (
              <DropdownMenuItem 
                key={n.id} 
                className={`flex flex-col items-start p-4 cursor-pointer focus:bg-accent/50 ${!n.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                onSelect={(e) => {
                  if (!n.isRead) {
                    e.preventDefault()
                    handleMarkAsRead(n.id)
                  }
                }}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span className={`text-sm ${!n.isRead ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                    {n.title || 'Informativo'}
                  </span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-0.5">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {n.content}
                </p>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
