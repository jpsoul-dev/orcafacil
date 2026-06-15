import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

function getClient(): ReturnType<typeof createClient<Database>> {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('Supabase URL and Service Role Key are required for admin client.')
    }
    _supabaseAdmin = createClient<Database>(url, key)
  }
  return _supabaseAdmin
}

// Export a proxy that mimics the SupabaseClient object but delays actual client creation
// until a property or method is accessed at runtime.
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop, receiver) {
    const client = getClient()
    const value = Reflect.get(client, prop)
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})
