import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Key:', supabaseKey ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseKey) {
  console.error('Environment variables not set properly');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('health_assessments').select('count').limit(1);

    if (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful!');
    console.log('Database query result:', data);
    return true;
  } catch (err) {
    console.error('Connection test failed:', err.message);
    return false;
  }
}

testConnection();
