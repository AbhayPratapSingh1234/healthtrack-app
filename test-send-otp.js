import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSendOtp() {
  console.log('Testing send-otp edge function...');

  try {
    const { data, error } = await supabase.functions.invoke('send-otp', {
      body: {
        email: 'test@example.com',
        otp: '123456'
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Success! Response:', data);
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

testSendOtp();
