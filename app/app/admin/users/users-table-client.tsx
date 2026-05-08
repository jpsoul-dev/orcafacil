'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { UserRowActions } from './user-row-actions'
import { Search } from 'lucide-react'

export interface UserProfile {
  id: string
  stripe_customer_id: string | null
  subscription_status: string | null
  trial_ends_at: string | null
  is_admin: boolean
  email?: string
  created_at?: string
}

export function UsersTableClient({ users }: { users: UserProfile[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const getStatusBadge = (status: string | null, trialEndsAt: string | null) => {
    if (status === 'active') return <Badge className="bg-emerald-500">Ativo</Badge>
    if (status === 'canceled') return <Badge variant="destructive">Cancelado</Badge>
    if (status === 'past_due') return <Badge variant="destructive">Pagamento Atrasado</Badge>
    
    if (status === 'trialing') {
      const isExpired = trialEndsAt ? new Date(trialEndsAt) < new Date() : false
      return isExpired ? (
        <Badge variant="outline" className="text-red-500 border-red-500">Trial Expirado</Badge>
      ) : (
        <Badge variant="outline" className="text-blue-500 border-blue-500">Em Trial</Badge>
      )
    }

    return <Badge variant="secondary">{status || 'Sem plano'}</Badge>
  }

  const getDerivedStatus = (status: string | null, trialEndsAt: string | null) => {
    if (status === 'active') return 'active'
    if (status === 'canceled') return 'canceled'
    if (status === 'past_due') return 'past_due'
    if (status === 'trialing') {
      const isExpired = trialEndsAt ? new Date(trialEndsAt) < new Date() : false
      return isExpired ? 'trial_expired' : 'trialing'
    }
    return 'none'
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Filtro de Busca
      const searchMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false

      // Filtro de Status
      const derivedStatus = getDerivedStatus(user.subscription_status, user.trial_ends_at)
      const statusMatch = statusFilter === 'all' || derivedStatus === statusFilter

      return searchMatch && statusMatch
    })
  }, [users, searchTerm, statusFilter])

  return (
    <div className="lg:col-span-2 border rounded-lg bg-white dark:bg-gray-900 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-bold text-lg">Usuários Cadastrados</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por e-mail..."
              className="pl-8 bg-white dark:bg-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>
            <SelectTrigger className="w-full sm:w-44 bg-white dark:bg-gray-900">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="active">Ativo (Pro)</SelectItem>
              <SelectItem value="trialing">Em Trial</SelectItem>
              <SelectItem value="trial_expired">Trial Expirado</SelectItem>
              <SelectItem value="canceled">Cancelado</SelectItem>
              <SelectItem value="past_due">Pagamento Atrasado</SelectItem>
              <SelectItem value="none">Sem plano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-mail</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fim do Trial</TableHead>
              <TableHead>Stripe ID</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhum usuário encontrado com estes filtros.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{getStatusBadge(user.subscription_status, user.trial_ends_at)}</TableCell>
                  <TableCell>
                    {user.trial_ends_at 
                      ? format(new Date(user.trial_ends_at), "dd 'de' MMM, yyyy", { locale: ptBR }) 
                      : '-'}
                  </TableCell>
                  <TableCell className="text-gray-500 font-mono text-xs">
                    {user.stripe_customer_id || 'Não criado'}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserRowActions 
                      userId={user.id} 
                      stripeCustomerId={user.stripe_customer_id} 
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
