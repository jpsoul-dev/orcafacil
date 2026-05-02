'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { saveCustomer } from './actions'
import { maskCPF, maskCNPJ, maskCNPJAlphanumeric, maskPhone, maskCEP } from '@/lib/masks'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Loader2, User, Phone, MapPin, Search, UserPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogHeader, DialogDescription, DialogClose } from '@/components/ui/dialog'

const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document_type: z.enum(['cpf', 'cnpj', 'cnpj_alphanumeric']).optional(),
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

export function CustomerForm({ initialData, asMenuItem, trigger }: { initialData?: any, asMenuItem?: boolean, trigger?: React.ReactElement }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchingCEP, setSearchingCEP] = useState(false)

  const form = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name || '',
      document_type: initialData?.document_type || 'cpf',
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

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || '',
        document_type: initialData?.document_type || 'cpf',
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
      })
    }
  }, [open, initialData, form])

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

  const handleSearchCEP = async () => {
    const currentCep = form.getValues('address_zip') || ''
    const cep = currentCep.replace(/\D/g, '')
    if (cep.length === 8) {
      setSearchingCEP(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          form.setValue('address_street', data.logradouro)
          form.setValue('address_neighborhood', data.bairro)
          form.setValue('address_city', data.localidade)
          form.setValue('address_state', data.uf)
        } else {
          toast.error('CEP não encontrado')
        }
      } catch (err) {
        console.error(err)
        toast.error('Erro ao buscar CEP')
      } finally {
        setSearchingCEP(false)
      }
    } else {
      toast.error('Digite um CEP válido')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        trigger ? trigger : (
          asMenuItem ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
          ) : (
            <Button className="gap-2 font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-lg">
              <UserPlus className="h-4 w-4" /> Novo cliente
            </Button>
          )
        )
      } />

      <DialogContent className="p-0 flex flex-col sm:max-w-3xl max-h-[95vh] overflow-hidden gap-0 rounded-2xl border-none shadow-2xl bg-white">
        <DialogHeader className="px-6 py-6 border-none shrink-0 bg-white z-10 relative">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-800">
              {initialData ? 'Editar cliente' : 'Novo cliente'}
            </DialogTitle>
            <DialogClose render={
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <Plus className="h-6 w-6 rotate-45" />
                <span className="sr-only">Fechar</span>
              </button>
            } />
          </div>
        </DialogHeader>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto">
          <form id="customer-form" onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">

            {/* Dados gerais */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-start">
                  <span className="bg-white pr-3 text-xs font-medium text-slate-400">Dados gerais</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-bold text-slate-800">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Ex: Maria Silva"
                    className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950"
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-bold text-slate-800">Telefone</Label>
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="phone"
                        {...field}
                        onChange={(e) => field.onChange(maskPhone(e.target.value))}
                        className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950 tabular-nums"
                        placeholder="(11) 9 9999-9999"
                        maxLength={15}
                      />
                    )}
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label htmlFor="document" className="text-sm font-bold text-slate-800">CPF/CNPJ</Label>
                  <Controller
                    name="document"
                    control={form.control}
                    render={({ field }) => {
                      return (
                        <Input
                          id="document"
                          {...field}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '')
                            let masked = e.target.value
                            if (val.length <= 11) masked = maskCPF(e.target.value)
                            else masked = maskCNPJ(e.target.value)
                            field.onChange(masked)
                          }}
                          placeholder="000.000.000-00 ou 00.000.000/0000-00"
                          className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950 tabular-nums"
                          maxLength={18}
                        />
                      )
                    }}
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-800">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950"
                    placeholder="email@exemplo.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Campos adicionais que não estão na imagem mas existem no banco */}
                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label htmlFor="gender" className="text-sm font-bold text-slate-800">Gênero</Label>
                  <Select onValueChange={(val) => form.setValue('gender', val as any)} value={form.watch('gender')}>
                    <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200 focus:ring-1 focus:ring-slate-950 text-slate-700">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="nao_informado">Não Informado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label htmlFor="birth_date" className="text-sm font-bold text-slate-800">Data de Nasc.</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    {...form.register('birth_date')}
                    className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950 text-slate-700"
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label htmlFor="whatsapp" className="text-sm font-bold text-slate-800">WhatsApp</Label>
                  <Controller
                    name="whatsapp"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="whatsapp"
                        {...field}
                        onChange={(e) => field.onChange(maskPhone(e.target.value))}
                        className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950 tabular-nums"
                        placeholder="(11) 9 9999-9999"
                        maxLength={15}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Dados de endereço */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-start">
                  <span className="bg-white pr-3 text-xs font-medium text-slate-400">Dados de endereço</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label htmlFor="address_zip" className="text-sm font-bold text-slate-800">CEP</Label>
                  <div className="relative">
                    <Controller
                      name="address_zip"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="address_zip"
                          {...field}
                          onChange={(e) => field.onChange(maskCEP(e.target.value))}
                          onBlur={handleSearchCEP}
                          placeholder="00000-000"
                          className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950 tabular-nums pr-8"
                          maxLength={9}
                        />
                      )}
                    />
                    {searchingCEP ? (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                    ) : (
                      <Search onClick={handleSearchCEP} className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                    )}
                  </div>
                </div>

                <div className="col-span-12 sm:col-span-8 space-y-1.5">
                  <Label htmlFor="address_street" className="text-sm font-bold text-slate-800">Logradouro</Label>
                  <Input id="address_street" {...form.register('address_street')} className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950" placeholder="Rua, Av., etc." />
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label htmlFor="address_number" className="text-sm font-bold text-slate-800">Número</Label>
                  <Input id="address_number" {...form.register('address_number')} placeholder="123" className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950" />
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label htmlFor="address_complement" className="text-sm font-bold text-slate-800">Complemento</Label>
                  <Input id="address_complement" {...form.register('address_complement')} placeholder="Apto, sala, etc." className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950" />
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label htmlFor="address_neighborhood" className="text-sm font-bold text-slate-800">Bairro</Label>
                  <Input id="address_neighborhood" {...form.register('address_neighborhood')} placeholder="Bairro" className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950" />
                </div>

                <div className="col-span-12 sm:col-span-8 space-y-1.5">
                  <Label htmlFor="address_city" className="text-sm font-bold text-slate-800">Cidade</Label>
                  <Input id="address_city" {...form.register('address_city')} placeholder="Cidade" className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950" />
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label htmlFor="address_state" className="text-sm font-bold text-slate-800">Estado</Label>
                  <Select onValueChange={(val) => form.setValue('address_state', val as any)} value={form.watch('address_state')}>
                    <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200 focus:ring-1 focus:ring-slate-950 text-slate-700">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer com botões lado a lado */}
        <div className="shrink-0 border-none bg-white p-6 pt-0">
          <div className="flex items-center justify-end">
            <Button form="customer-form" type="submit" disabled={loading} className="h-10 px-10 font-bold text-sm bg-slate-950 hover:bg-slate-800 text-white rounded-lg shadow-sm">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
