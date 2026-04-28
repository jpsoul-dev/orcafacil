'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { saveCustomer } from './actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Plus, Pencil } from 'lucide-react'

const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document: z.string().optional(),
  gender: z.string().optional(),
  birth_date: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address_zip: z.string().optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
})

type CustomerValues = z.infer<typeof customerSchema>

export function CustomerForm({ initialData, asMenuItem }: { initialData?: any, asMenuItem?: boolean }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const form = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name || '',
      document: initialData?.document || '',
      gender: initialData?.gender || 'nao_informado',
      birth_date: initialData?.birth_date || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      whatsapp: initialData?.whatsapp || '',
      address_zip: initialData?.address_zip || '',
      address_street: initialData?.address_street || '',
      address_number: initialData?.address_number || '',
      address_complement: initialData?.address_complement || '',
      address_neighborhood: initialData?.address_neighborhood || '',
      address_city: initialData?.address_city || '',
      address_state: initialData?.address_state || '',
    },
  })

  async function onSubmit(data: CustomerValues) {
    setLoading(true)
    const result = await saveCustomer(data, initialData?.id)
    setLoading(false)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(initialData ? 'Cliente atualizado!' : 'Cliente cadastrado!')
      setOpen(false)
      if (!initialData) form.reset()
    }
  }

  const checkCEP = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '')
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          form.setValue('address_street', data.logradouro)
          form.setValue('address_neighborhood', data.bairro)
          form.setValue('address_city', data.localidade)
          form.setValue('address_state', data.uf)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={asMenuItem ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        )} />
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader className="mb-6">
          <SheetTitle>{initialData ? 'Editar Cliente' : 'Novo Cliente'}</SheetTitle>
          <SheetDescription>
            Preencha os dados do cliente. O endereço é preenchido automaticamente ao digitar o CEP.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-2">Dados Pessoais</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Nome / Razão Social *</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">CPF / CNPJ</Label>
                <Input id="document" {...form.register('document')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input id="birth_date" type="date" {...form.register('birth_date')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <Select onValueChange={(val) => form.setValue('gender', val as any)} defaultValue={form.getValues('gender')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="nao_informado">Não Informado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-2">Contato</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" {...form.register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" {...form.register('whatsapp')} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-2">Endereço</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address_zip">CEP</Label>
                <Input id="address_zip" {...form.register('address_zip')} placeholder="00000-000" onBlur={checkCEP} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address_street">Rua / Logradouro</Label>
                <Input id="address_street" {...form.register('address_street')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_number">Número</Label>
                <Input id="address_number" {...form.register('address_number')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_complement">Complemento</Label>
                <Input id="address_complement" {...form.register('address_complement')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_neighborhood">Bairro</Label>
                <Input id="address_neighborhood" {...form.register('address_neighborhood')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_city">Cidade</Label>
                <Input id="address_city" {...form.register('address_city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_state">Estado (UF)</Label>
                <Input id="address_state" {...form.register('address_state')} maxLength={2} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
