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
