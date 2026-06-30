# Data Model: Catalog Refactoring & Improvements

## Database Schema (Existing)

The feature utilizes the existing physical table `catalog_items` in the Supabase database. No schema migration is required.

### Table: `catalog_items`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary Key (Default: `uuid_generate_v4()`) |
| `user_id` | `uuid` | No | Foreign Key to `auth.users` (owner of the item) |
| `name` | `text` | No | Name of the item (sanitized, trim, no HTML) |
| `type` | `text` | No | Type of item. Allowed values: `'product'`, `'service'` |
| `unit_price` | `numeric` | No | Unit cost of the item (positive float, non-zero) |
| `unit_measure` | `text` | Yes | Unit of measurement abbreviation (e.g. `'un'`, `'m'`) |
| `description` | `text` | Yes | Additional details (sanitized, no HTML) |
| `created_at` | `timestamp with time zone` | No | Creation date/time |

### Row Level Security (RLS) policies
The table must enforce strict multi-tenant isolation:
- `SELECT`: Only allow rows where `user_id = auth.uid()`
- `INSERT`: Force `user_id = auth.uid()`
- `UPDATE`: Only allow where `user_id = auth.uid()`
- `DELETE`: Only allow where `user_id = auth.uid()`

---

## Validation & Sanitization Schema (Zod)

The validation rules will be updated in `app/app/catalog/actions.ts` (and shared with React Hook Form) to enforce the new stakeholder constraints.

### Zod Validation Model (`catalogItemSchema`)

```typescript
import { z } from 'zod'

// Helper to strip HTML tags from input fields to prevent XSS
const sanitizeHtml = (val: string) => {
  return val.replace(/<[^>]*>/g, '').trim()
}

export const catalogItemSchema = z.object({
  type: z.enum(['product', 'service'], {
    required_error: 'O tipo do item é obrigatório.',
    invalid_type_error: 'Tipo inválido selecionado.',
  }),
  name: z.string()
    .min(2, 'O nome deve conter pelo menos 2 caracteres.')
    .max(100, 'O nome deve conter no máximo 100 caracteres.')
    .transform(sanitizeHtml),
  unit_price: z.coerce.number({
    invalid_type_error: 'O valor unitário deve ser um número válido.',
  })
    .min(0.01, 'O valor unitário deve ser estritamente maior que zero.'),
  unit_measure: z.string({
    required_error: 'A unidade de medida é obrigatória.',
  })
    .min(1, 'A unidade de medida é obrigatória.')
    .max(10, 'A unidade de medida deve conter no máximo 10 caracteres.')
    .transform(sanitizeHtml),
  description: z.string()
    .max(300, 'A descrição deve conter no máximo 300 caracteres.')
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((val) => val ? sanitizeHtml(val) : val),
})

export type CatalogItemInput = z.infer<typeof catalogItemSchema>
```

### Sanitization Pipeline
For string fields (`name`, `unit_measure`, `description`), the sanitization is applied during Zod parsing via the `.transform()` step:
1. **Trim spaces**: Remove leading and trailing whitespace.
2. **HTML Stripping**: Regular expression `/<[^>]*>/g` strips out HTML elements (e.g. `<b>item</b>` becomes `item`).
3. **Price Conversion**: `z.coerce.number()` processes standard decimal strings.
