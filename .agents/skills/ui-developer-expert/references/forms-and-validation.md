# Formulários e Validação — React Hook Form + Zod

## Setup básico

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form, FormControl, FormDescription, FormField, FormItem,
  FormLabel, FormMessage,
} from '@/components/ui/form'

// 1. Defina o schema
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

// 2. Componente do formulário
export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      // await loginUser(values)
    } catch (error) {
      form.setError('root', { message: 'Email ou senha incorretos' })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="você@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Entrar
        </Button>
      </form>
    </Form>
  )
}
```

---

## Schemas Zod comuns

```tsx
// String com transformação
const nameSchema = z.string()
  .min(2, 'Nome muito curto')
  .max(100, 'Nome muito longo')
  .transform(s => s.trim())

// CPF/CNPJ
const cpfSchema = z.string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (use 000.000.000-00)')

// Telefone brasileiro
const phoneSchema = z.string()
  .regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, 'Telefone inválido')

// Moeda (string → number)
const currencySchema = z.string()
  .transform(val => parseFloat(val.replace(/\./g, '').replace(',', '.')))
  .pipe(z.number().min(0, 'Valor deve ser positivo'))

// Upload de arquivo
const fileSchema = z.instanceof(File)
  .refine(f => f.size < 5_000_000, 'Arquivo deve ter menos de 5MB')
  .refine(
    f => ['image/jpeg', 'image/png', 'application/pdf'].includes(f.type),
    'Formato aceito: JPG, PNG ou PDF'
  )

// Confirmação de senha
const passwordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(
  data => data.password === data.confirmPassword,
  { message: 'As senhas não coincidem', path: ['confirmPassword'] }
)

// Campo condicional
const addressSchema = z.object({
  hasBilling: z.boolean(),
  billingAddress: z.string().optional(),
}).refine(
  data => !data.hasBilling || (data.billingAddress && data.billingAddress.length > 0),
  { message: 'Endereço de cobrança obrigatório', path: ['billingAddress'] }
)
```

---

## Formulário multi-step

```tsx
const steps = ['Dados Pessoais', 'Endereço', 'Revisão'] as const
type Step = typeof steps[number]

// Schema por step
const step1Schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

const step2Schema = z.object({
  street: z.string().min(3),
  city: z.string().min(2),
  state: z.string().length(2),
})

const fullSchema = step1Schema.merge(step2Schema)
type FormValues = z.infer<typeof fullSchema>

function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<FormValues>>({})

  const schemas = [step1Schema, step2Schema]

  const form = useForm({
    resolver: zodResolver(schemas[currentStep] as any),
    defaultValues: formData,
  })

  const handleNext = form.handleSubmit(data => {
    const updated = { ...formData, ...data }
    setFormData(updated)

    if (currentStep < steps.length - 2) {
      setCurrentStep(prev => prev + 1)
      form.reset(updated)
    } else {
      // Submit final
      submitForm(updated as FormValues)
    }
  })

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <nav aria-label="Progresso" className="flex items-center gap-2">
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              i <= currentStep ? "text-primary" : "text-muted-foreground"
            )}>
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                i < currentStep && "bg-primary text-primary-foreground",
                i === currentStep && "border-2 border-primary text-primary",
                i > currentStep && "border border-muted-foreground",
              )}>
                {i < currentStep ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className="hidden sm:inline">{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "h-px flex-1",
                i < currentStep ? "bg-primary" : "bg-border"
              )} />
            )}
          </React.Fragment>
        ))}
      </nav>

      <Form {...form}>
        <form onSubmit={handleNext} className="space-y-4">
          {currentStep === 0 && <Step1Fields />}
          {currentStep === 1 && <Step2Fields />}
          {currentStep === 2 && <ReviewStep data={formData} />}

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={() => setCurrentStep(p => p - 1)}>
                Voltar
              </Button>
            )}
            <Button type="submit" className="flex-1">
              {currentStep === steps.length - 1 ? 'Confirmar' : 'Próximo'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
```

---

## Upload de arquivo com preview

```tsx
function FileUploadField({ name, control }: { name: string; control: Control<any> }) {
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { onChange, value, ...field } }) => (
        <FormItem>
          <FormLabel>Arquivo</FormLabel>
          <FormControl>
            <div
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
                "cursor-pointer hover:border-primary hover:bg-primary/5",
                value && "border-primary bg-primary/5"
              )}
              onClick={() => inputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) {
                  onChange(file)
                  if (file.type.startsWith('image/')) {
                    setPreview(URL.createObjectURL(file))
                  }
                }
              }}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-32 rounded object-contain" />
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Arraste ou <span className="font-medium text-primary">escolha um arquivo</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, PDF até 5MB</p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                className="sr-only"
                accept="image/*,.pdf"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) {
                    onChange(file)
                    if (file.type.startsWith('image/')) {
                      setPreview(URL.createObjectURL(file))
                    }
                  }
                }}
                {...field}
              />
            </div>
          </FormControl>
          {value && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>{value.name}</span>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onChange(null); setPreview(null) }}
                className="ml-auto text-destructive hover:underline"
              >
                Remover
              </button>
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

---

## Máscara de input (sem biblioteca)

```tsx
function useMask(mask: string) {
  return (value: string) => {
    const digits = value.replace(/\D/g, '')
    let result = ''
    let digitIndex = 0

    for (const char of mask) {
      if (digitIndex >= digits.length) break
      if (char === '#') {
        result += digits[digitIndex++]
      } else {
        result += char
      }
    }
    return result
  }
}

// Uso:
const maskPhone = useMask('(##) #####-####')
const maskCPF = useMask('###.###.###-##')
const maskCNPJ = useMask('##.###.###/####-##')
const maskCEP = useMask('#####-###')

// No formulário:
<Input
  {...field}
  onChange={e => field.onChange(maskPhone(e.target.value))}
  maxLength={15}
  placeholder="(11) 99999-9999"
/>
```