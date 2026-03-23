import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseOperations() {
  console.log('Testing database operations...');

  try {
    // Test 1: Check if tables exist by querying them
    console.log('1. Checking health_assessments table...');
    const { data: assessments, error: assessmentsError } = await supabase
      .from('health_assessments')
      .select('count', { count: 'exact', head: true });

    if (assessmentsError) {
      console.error('❌ health_assessments table error:', assessmentsError.message);
    } else {
      console.log('✅ health_assessments table exists, count:', assessments);
    }

    console.log('2. Checking daily_health_logs table...');
    const { data: logs, error: logsError } = await supabase
      .from('daily_health_logs')
      .select('count', { count: 'exact', head: true });

    if (logsError) {
      console.error('❌ daily_health_logs table error:', logsError.message);
    } else {
      console.log('✅ daily_health_logs table exists, count:', logs);
    }

    console.log('3. Checking health_goals table...');
    const { data: goals, error: goalsError } = await supabase
      .from('health_goals')
      .select('count', { count: 'exact', head: true });

    if (goalsError) {
      console.error('❌ health_goals table error:', goalsError.message);
    } else {
      console.log('✅ health_goals table exists, count:', goals);
    }

    console.log('Database operations test completed.');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDatabaseOperations();
