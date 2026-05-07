require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const email = 'horiannyf@gmail.com';
  console.log("Testing existing email...", email);
  try {
    const res1 = await supabase.auth.signUp({
      email,
      password: 'password123'
    });
    console.log("Existing Email Response:", JSON.stringify(res1, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
