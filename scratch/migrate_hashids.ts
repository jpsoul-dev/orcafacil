import { createClient } from '@supabase/supabase-js'
import Hashids from 'hashids'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 

const SALT = 'orca-facil-salt-2026'
const MIN_LENGTH = 6
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
const hashids = new Hashids(SALT, MIN_LENGTH, ALPHABET)

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrate() {
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select('id, quote_number')

  if (error) {
    console.error('Error fetching quotes:', error)
    return
  }

  console.log(`Found ${quotes?.length} quotes to migrate.`)

  if (!quotes) return

  for (const quote of quotes) {
    const hashId = hashids.encode(quote.quote_number)
    const { error: updateError } = await supabase
      .from('quotes')
      .update({ hash_id: hashId })
      .eq('id', quote.id)

    if (updateError) {
      console.error(`Error updating quote ${quote.id}:`, updateError)
    } else {
      console.log(`Updated quote ${quote.id} with hash_id ${hashId}`)
    }
  }

  console.log('Migration complete.')
}

migrate()
