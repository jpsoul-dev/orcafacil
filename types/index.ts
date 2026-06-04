import type { Database } from './database.types'

export type QuoteRow = Database['public']['Tables']['quotes']['Row'] & { original_status: string | null }

export type QuoteStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'expired'

export type Quote = Omit<QuoteRow, 'status'> & {
  status: QuoteStatus
  customers?: { name: string } | null
  quote_receipts?: { id: string } | null
}
