export type QuoteStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'expired'

export interface QuoteItem {
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
  unit_measure?: string
  discount_type?: 'none' | 'percentage' | 'fixed' | null
  discount_value?: number | null
}

export interface Customer {
  name: string
  document: string
  phone: string
  address_street: string
  address_number?: string
  address_neighborhood: string
  address_city: string
  address_state: string
  address_zip: string
  address_complement?: string
  email?: string
  whatsapp?: string
}

export interface Company {
  name: string
  logo_url?: string
  phone?: string
  whatsapp?: string
  cnpj?: string
  email?: string
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  address_complement?: string
  show_quote_number?: boolean
}

export interface Quote {
  id: string
  quote_number: number
  public_uuid: string
  status: QuoteStatus
  title: string
  created_at: string
  valid_until?: string | null
  subtotal: number
  discount_value: number
  discount_type: 'percentage' | 'fixed'
  total: number
  notes?: string
  payment_method?: string | string[] | null
  customer_id: string
  customer: Customer
  company: Company
  items: QuoteItem[]
  cancellation_reason?: string | null
  show_quote_number: boolean
}
