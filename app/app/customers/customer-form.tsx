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
import { Plus, Pencil, Loader2, User, Phone, MapPin, Search } from 'lucide-react'
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
            <Button className="gap-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" /> Novo Cliente
            </Button>
          )
        )
      } />

      <DialogContent className="p-0 flex flex-col sm:max-w-2xl max-h-[90vh] overflow-hidden gap-0 rounded-2xl border-none shadow-2xl">
        {/* Header no estilo inspirado na imagem */}
        <DialogHeader className="px-6 py-5 border-b shrink-0 bg-white z-10 relative">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-600/20">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="text-left space-y-0.5">
              <DialogTitle className="text-xl font-bold text-slate-800">
                {initialData ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 font-medium">
                {initialData ? 'Atualize os dados detalhados' : 'Preencha os dados detalhados para o cadastro'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <form id="customer-form" onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">

            {/* Seção: Dados Pessoais */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <User className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold tracking-wide text-slate-700 uppercase">Dados Pessoais</span>
              </div>

              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nome / Razão Social <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Ex: João Silva ou Empresa LTDA"
                    className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo Documento</Label>
                  <Select
                    onValueChange={(val) => {
                      form.setValue('document_type', val as any)
                      form.setValue('document', '') // Limpa documento ao trocar tipo
                    }}
                    value={form.watch('document_type')}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 focus:ring-1 focus:ring-blue-500 text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                      <SelectItem value="cnpj_alphanumeric">CNPJ Alfanumérico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="document" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Documento</Label>
                  <Controller
                    name="document"
                    control={form.control}
                    render={({ field }) => {
                      const docType = form.watch('document_type')
                      return (
                        <Input
                          id="document"
                          {...field}
                          onChange={(e) => {
                            let masked = e.target.value
                            if (docType === 'cpf') masked = maskCPF(e.target.value)
                            else if (docType === 'cnpj') masked = maskCNPJ(e.target.value)
                            else if (docType === 'cnpj_alphanumeric') masked = maskCNPJAlphanumeric(e.target.value)
                            field.onChange(masked)
                          }}
                          placeholder={docType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                          className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 tabular-nums"
                          maxLength={docType === 'cpf' ? 14 : 18}
                        />
                      )
                    }}
                  />
                </div>
                {form.watch('document_type') === 'cpf' && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="birth_date" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Data de Nascimento</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        {...form.register('birth_date')}
                        className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="gender" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Gênero</Label>
                      <Select onValueChange={(val) => form.setValue('gender', val as any)} value={form.watch('gender')}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 focus:ring-1 focus:ring-blue-500 text-slate-700">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="nao_informado">Não Informado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Separador customizado (invisível apenas cria espaço ou linha sutil) */}
            <div className="border-t border-slate-200/60" />

            {/* Seção: Contato */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Phone className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold tracking-wide text-slate-700 uppercase">Informações de Contato</span>
              </div>

              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500"
                    placeholder="email@exemplo.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Telefone</Label>
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="phone"
                        {...field}
                        onChange={(e) => field.onChange(maskPhone(e.target.value))}
                        className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 tabular-nums"
                        placeholder="(00) 0000-0000"
                        maxLength={15}
                      />
                    )}
                  />
                </div>
                <div className="space-y-1.5 relative">
                  <Label htmlFor="whatsapp" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">WhatsApp</Label>
                  <div className="relative">
                    <Controller
                      name="whatsapp"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="whatsapp"
                          {...field}
                          onChange={(e) => field.onChange(maskPhone(e.target.value))}
                          className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 pr-10 tabular-nums"
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                        />
                      )}
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200/60" />

            {/* Seção: Endereço */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <MapPin className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold tracking-wide text-slate-700 uppercase">Endereço</span>
              </div>

              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="address_zip" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">CEP</Label>
                  <div className="flex gap-2">
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
                          className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 tabular-nums flex-1"
                          maxLength={9}
                        />
                      )}
                    />
                    <Button
                      type="button"
                      onClick={handleSearchCEP}
                      disabled={searchingCEP}
                      variant="outline"
                      className="h-11 w-11 shrink-0 rounded-xl border-slate-200 bg-white p-0 hover:bg-slate-50 hover:text-blue-600"
                      title="Buscar Endereço"
                    >
                      {searchingCEP ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                      <span className="sr-only">Buscar</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address_street" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Logradouro</Label>
                  <Input id="address_street" {...form.register('address_street')} className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500" placeholder="Rua, Avenida, etc." />
                </div>
                <div className="grid grid-cols-12 gap-4 sm:col-span-2">
                  <div className="col-span-4 space-y-1.5">
                    <Label htmlFor="address_number" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Número</Label>
                    <Input id="address_number" {...form.register('address_number')} className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500" />
                  </div>
                  <div className="col-span-8 space-y-1.5">
                    <Label htmlFor="address_complement" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Complemento</Label>
                    <Input id="address_complement" {...form.register('address_complement')} className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500" placeholder="Apto, Sala, Bloco..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address_neighborhood" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Bairro</Label>
                  <Input id="address_neighborhood" {...form.register('address_neighborhood')} className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address_city" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Cidade</Label>
                  <Input id="address_city" {...form.register('address_city')} className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address_state" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">UF</Label>
                  <Select onValueChange={(val) => form.setValue('address_state', val as any)} value={form.watch('address_state')}>
                    <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 focus:ring-1 focus:ring-blue-500 text-slate-700 uppercase">
                      <SelectValue placeholder="UF" />
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
        <div className="shrink-0 border-t border-slate-200 bg-white p-6 rounded-b-2xl">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <DialogClose render={
              <Button type="button" variant="ghost" className="w-full sm:w-auto h-11 px-6 font-semibold text-slate-600 hover:text-slate-900 rounded-xl">
                Cancelar
              </Button>
            } />
            <Button form="customer-form" type="submit" disabled={loading} className="w-full sm:w-auto sm:flex-1 max-w-[280px] h-11 font-bold text-base bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                initialData ? 'Salvar Alterações' : 'Cadastrar Cliente'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
