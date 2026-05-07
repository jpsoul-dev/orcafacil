import { createClient } from '@supabase/supabase-js'

require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function run() {
  const email = 'test_signup_124@example.com'
  console.log('Signing up...')
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
  })
  console.log('Auth data:', authData?.user?.id, error)

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('Updating profile...')
  const { data, error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: 'cus_mock124' })
    .eq('id', authData!.user!.id)
    .select()

  console.log('Update result:', data, updateError)
}

run()
