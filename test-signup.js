require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { stripe } = require('./lib/stripe'); // need to compile or run via tsx, let's just use REST or inline stripe

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const email = 'test_signup_123@example.com';
  console.log('Signing up...');
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });
  console.log('Auth data:', authData.user ? authData.user.id : null, error);
  
  // Now simulate what setupNewUser does
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  console.log('Updating profile...');
  const { data, error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: 'cus_mock123' })
    .eq('id', authData.user.id)
    .select();
    
  console.log('Update result:', data, updateError);
}

run();
