require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      stripe_customer_id: 'test_cus_123'
    })
    .eq('id', '6ce32b44-481c-4653-bec5-bb93e250db07')
    .select();
    
  console.log('Data:', data);
  console.log('Error:', error);
}

run();
