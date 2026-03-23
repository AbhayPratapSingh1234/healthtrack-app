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

async function testTongyiAssessment() {
  console.log('\n🔄 Testing generate-assessment-report with Tongyi API...');

  const testData = {
    assessmentData: {
      age: 45,
      gender: 'female',
      height: 165,
      weight: 80,
      bmi: 29.4,
      family_diabetes: true,
      family_hypertension: true,
      family_obesity: false,
      smoking_status: 'never',
      alcohol_consumption: 'occasional',
      exercise_frequency: '1-2',
      diet_type: 'high-carb',
      sleep_hours: 5.5,
      diabetes_risk: 65,
      obesity_risk: 72,
      hypertension_risk: 58,
      past_illnesses: ['prediabetes'],
      current_symptoms: ['fatigue', 'frequent urination'],
      location: 'Mumbai',
      allergies: ['nuts']
    },
    api: 'tongyi'
  };

  try {
    const { data, error } = await supabase.functions.invoke('generate-assessment-report', {
      body: testData
    });

    if (error) {
      console.error('❌ Tongyi Error:', error.message || error);
      console.error('Status:', error.status);
      console.error('Details:', error.data);
      return false;
    }

    console.log('✅ Tongyi Success! Report preview:', JSON.stringify(data?.report, null, 2).slice(0, 500));
    return true;
  } catch (err) {
    console.error('❌ Tongyi Failed:', err);
    return false;
  }
}

async function testOpenAIAssessment() {
  console.log('\n🔄 Testing generate-assessment-report with OpenAI...');

  const testData = {
    assessmentData: {
      age: 30,
      gender: 'male',
      height: 170,
      weight: 70,
      bmi: 24.2,
      family_diabetes: false,
      family_hypertension: false,
      family_obesity: false,
      smoking_status: 'never',
      alcohol_consumption: 'moderate',
      exercise_frequency: '3-4',
      diet_type: 'balanced',
      sleep_hours: 7,
      diabetes_risk: 15,
      obesity_risk: 20,
      hypertension_risk: 10,
      past_illnesses: [],
      current_symptoms: [],
      location: 'Delhi',
      allergies: []
    },
    api: 'openai'
  };

  try {
    const { data, error } = await supabase.functions.invoke('generate-assessment-report', {
      body: testData
    });

    if (error) {
      console.error('❌ OpenAI Error:', error.message || error);
      console.error('Status:', error.status);
      console.error('Details:', error.data);
      return false;
    }

    console.log('✅ OpenAI Success! Report preview:', JSON.stringify(data?.report, null, 2).slice(0, 500));
    return true;
  } catch (err) {
    console.error('❌ OpenAI Failed:', err);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  const tongyiWorks = await testTongyiAssessment();
  const openaiWorks = await testOpenAIAssessment();
  
  if (tongyiWorks) {
    console.log('\n🎉 Tongyi API working perfectly!');
  } else if (openaiWorks) {
    console.log('\n⚠️ Tongyi failed but OpenAI works - recommend OpenAI fallback');
  } else {
    console.log('\n💥 Both APIs failed - check API keys in Supabase env vars');
  }
}

runTests();

testOpenAIAssessment();
