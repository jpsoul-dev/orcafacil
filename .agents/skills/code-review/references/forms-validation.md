# Referência: React Hook Form + Zod + TypeScript

## Checklist de Formulários e Validação

### Zod Schemas

- [ ] Schema definido **fora** do componente (evita recriação a cada render)
- [ ] Tipo inferido com `z.infer<typeof schema>` — sem duplicar tipos manualmente
- [ ] Mensagens de erro em português/idioma do usuário
- [ ] Validações de segurança: `min`, `max`, `regex` em campos de texto para evitar inputs maliciosos
- [ ] Senhas com validação de complexidade mínima
- [ ] Emails validados com `.email()`
- [ ] Campos opcionais marcados corretamente com `.optional()` ou `.nullable()`
- [ ] Refinamentos (`.refine()`, `.superRefine()`) para validações cruzadas (ex: confirmar senha)

### React Hook Form

- [ ] `useForm` com `resolver: zodResolver(schema)` — não validar manualmente
- [ ] `handleSubmit` sempre envolve a função de submit (trata erros de validação automaticamente)
- [ ] `formState.isSubmitting` usado para desabilitar botão durante submissão
- [ ] `reset()` chamado após submissão bem-sucedida quando necessário
- [ ] Campos controlados vs não-controlados: preferir `register()` para inputs simples; `Controller` para componentes externos (Shadcn Select, DatePicker, etc.)
- [ ] `watch()` usado com parcimônia — prefira `getValues()` quando não precisa de reatividade
- [ ] Obrigatoriamente utilizar debounce em validações assíncronas ativadas por input do usuário (`onChange` ou `onBlur`).

### Padrão correto:

```typescript
// ✅ Schema fora do componente
const checkoutSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(100),
  cardNumber: z.string().regex(/^\d{16}$/, 'Número de cartão inválido'),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

// ✅ Componente
export function CheckoutForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  const onSubmit = async (data: CheckoutFormData) => {
    // data já está validado e tipado aqui
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Processando...' : 'Confirmar'}
      </button>
    </form>
  )
}
```

### Validação Server-Side

- [ ] **SEMPRE** revalidar com Zod no servidor — nunca confiar apenas na validação client-side
- [ ] Em Server Actions: parsear com `schema.safeParse(formData)` antes de qualquer operação
- [ ] Retornar erros de validação estruturados para o cliente

```typescript
// ✅ Server Action com validação
'use server'
export async function createOrder(formData: unknown) {
  const result = orderSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }
  // Agora sim: acessar banco, processar pagamento etc.
  const { email, name } = result.data
}
```

### Anti-patterns comuns a detectar:

```typescript
// ❌ Schema dentro do componente (recriado a cada render)
export function Form() {
  const schema = z.object({ ... }) // ❌

// ❌ Sem resolver — validação manual e propensa a erros
const { register } = useForm()
const onSubmit = (data) => {
  if (!data.email.includes('@')) { ... } // ❌ use zod

// ❌ Tipo manual duplicando o schema
interface FormData { email: string; name: string } // ❌ use z.infer<>

// ❌ Sem isSubmitting — botão clicável durante submissão
<button type="submit">Enviar</button> // ❌ pode causar duplo envio
```
