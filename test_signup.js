require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const email = 'test' + Date.now() + '@gmail.com';
  console.log("Testing new email...", email);
  try {
    const res1 = await supabase.auth.signUp({
      email,
      password: 'password123'
    });
    console.log("New Email Response:", JSON.stringify(res1, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
