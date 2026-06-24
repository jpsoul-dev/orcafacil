'use client'

import { Bell, Check } from 'lucide-react'
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
import { triggerHaptic } from '@/lib/haptic'

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
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread')
  
  const supabase = useMemo(() => createClient(), [])

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Obter a data de criação da conta em profiles para filtrar notificações antigas
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', user.id)
      .single()

    const userCreatedAt = profile?.created_at

    // 2. Buscar as notificações
    let query = supabase
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
      .limit(50)

    if (userCreatedAt) {
      query = query.gte('created_at', userCreatedAt)
    }

    const { data, error } = await query

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

    const newUnreadCount = formatted.filter(n => !n.isRead).length
    setNotifications(formatted)
    setUnreadCount(newUnreadCount)
  }, [supabase])

  // Badge API Integration
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount).catch(err => console.error('Erro ao definir badge:', err))
      } else {
        navigator.clearAppBadge().catch(err => console.error('Erro ao limpar badge:', err))
      }
    }
  }, [unreadCount])

  useEffect(() => {
    const init = async () => {
      await fetchNotifications()
    }
    init()

    const channel = supabase
      .channel('notification-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        table: 'notifications', 
        schema: 'public' 
      }, () => {
        fetchNotifications()
        triggerHaptic('success')
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
        fetchNotifications()
      })
      .subscribe()

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

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => activeTab === 'unread' ? !n.isRead : n.isRead)
  }, [notifications, activeTab])

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
      <DropdownMenuContent align="end" className="w-80 bg-white border border-slate-200 text-slate-900 p-0 overflow-hidden rounded-xl shadow-lg">
        <DropdownMenuGroup className="p-3 pb-2 flex items-center justify-between">
          <DropdownMenuLabel className="font-semibold text-sm text-slate-800 p-0">
            Notificações
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button 
              onClick={(e) => {
                e.preventDefault()
                handleMarkAllAsRead()
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Marcar todas como lidas
            </button>
          )}
        </DropdownMenuGroup>
        
        {/* Guias/Tabs de Notificação */}
        <div className="flex border-b border-slate-200 px-3">
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center transition-all ${
              activeTab === 'unread' 
                ? 'border-slate-900 text-slate-900' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Não lidas ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab('read')}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center transition-all ${
              activeTab === 'read' 
                ? 'border-slate-900 text-slate-900' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Lidas
          </button>
        </div>

        <DropdownMenuSeparator className="my-0" />

        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {activeTab === 'unread' ? 'Nenhuma notificação não lida.' : 'Nenhuma notificação lida por enquanto.'}
          </div>
        ) : (
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.map((n) => (
              <DropdownMenuItem 
                key={n.id} 
                className={`flex items-start p-4 cursor-pointer focus:bg-slate-50/80 relative group ${
                  !n.isRead ? 'bg-slate-50/40' : 'bg-transparent'
                }`}
                onSelect={(e) => {
                  if (!n.isRead) {
                    e.preventDefault()
                    handleMarkAsRead(n.id)
                  }
                }}
              >
                <div className="flex flex-col items-start gap-1 w-full pr-6">
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-500'}`}>
                      {n.title || 'Informativo'}
                    </span>
                    <span className="text-[9px] text-slate-400 whitespace-nowrap pt-0.5">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${!n.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                    {n.content}
                  </p>
                </div>

                {/* Botão de Leitura Rápida */}
                {!n.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      handleMarkAsRead(n.id)
                    }}
                    className="absolute right-3 top-4 flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-slate-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                    title="Marcar como lida"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
