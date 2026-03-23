import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { config } from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://migbmlxdptbnnxluhtwy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const sampleAssessmentData = {
  age: 35,
  gender: 'male',
  height: 175,
  weight: 85,
  bmi: 27.8,
  family_diabetes: true,
  family_hypertension: false,
  family_obesity: true,
  smoking_status: 'never',
  alcohol_consumption: 'moderate',
  exercise_frequency: '1-2',
  diet_type: 'balanced',
  sleep_hours: 6,
  diabetes_risk: 65,
  obesity_risk: 45,
  hypertension_risk: 30,
  past_illnesses: [''],
  current_symptoms: [],
  location: 'Kanpur',
  allergies: []
};

async function testFunction() {
  try {
    console.log('🚀 Testing generate-assessment-report...');
    const { data, error } = await supabase.functions.invoke('generate-assessment-report', {
      body: {
        assessmentData: sampleAssessmentData,
        api: 'openai'
      }
    });

    if (error) throw error;
    console.log('✅ SUCCESS:', JSON.stringify(data, null, 2));
    return data;
  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testFunction();

