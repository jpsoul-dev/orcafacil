export interface Receipt {
  id: string
  receipt_number: string
  title: string
  amount: number
  payment_method: string
  services_description: string
  issued_at: string
}

export interface ReceiptCompany {
  name: string
  phone: string
  cnpj?: string | null
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  address_complement?: string
}

export interface ReceiptCustomer {
  name: string
  document: string
  phone: string
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_zip?: string
}

export interface ReceiptQuoteItem {
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
  unit_measure?: string | null
}

export interface ReceiptQuote {
  id: string
  quote_number: number
  title?: string | null
  company: ReceiptCompany
  customer: ReceiptCustomer
  items?: ReceiptQuoteItem[]
}

export interface ReceiptRow {
  id: string
  user_id: string
  receipt_number: string
  title: string
  amount: number
  payment_method: string
  services_description: string | null
  issued_at: string
  quote_id: string | null
  quote_number: number | null
  customer_id: string | null
  customer_name: string
  receipt_type: 'standalone' | 'quote'
  created_at: string
}

