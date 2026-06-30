'use client'

import { Bell, Check } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
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

    const channelId = `notification-updates-${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase
      .channel(channelId)
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
    <Sheet>
      <SheetTrigger render={
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </Button>
      } />
      <SheetContent side="right" className="w-full sm:max-w-md bg-white text-slate-900 p-0 overflow-hidden flex flex-col h-full border-l border-slate-200">
        <SheetHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-slate-100 shrink-0">
          <SheetTitle className="font-semibold text-sm text-slate-800 p-0">
            Notificações
          </SheetTitle>
          {unreadCount > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault()
                handleMarkAllAsRead()
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Marcar todas como lidas
            </button>
          )}
        </SheetHeader>

        {/* Guias/Tabs de Notificação */}
        <div className="flex border-b border-slate-100 px-3 shrink-0">
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 text-center transition-all cursor-pointer ${
              activeTab === 'unread'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Não lidas ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab('read')}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 text-center transition-all cursor-pointer ${
              activeTab === 'read'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Lidas
          </button>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-400">
            {activeTab === 'unread' ? 'Nenhuma notificação não lida.' : 'Nenhuma notificação lida por enquanto.'}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.isRead) {
                    handleMarkAsRead(n.id)
                  }
                }}
                className={`flex items-start p-4 cursor-pointer hover:bg-slate-50/80 relative group transition-colors ${
                  !n.isRead ? 'bg-slate-50/40' : 'bg-transparent'
                }`}
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
                    className="absolute right-3 top-4 flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-slate-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                    title="Marcar como lida"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
