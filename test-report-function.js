import fetch from 'node-fetch';

const SUPABASE_URL = 'https://migbmlxdptbnnxluhtwy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZ2JtbHhkcHRibm54bHVodHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjA3MDEsImV4cCI6MjA3ODUzNjcwMX0.TrxdP7ZrdemH5oHx1M7H2BZqWFmkRcWDAHE7AwDS9To';

async function testGenerateAssessmentReport() {
  try {
    console.log('🧪 Testing generate-assessment-report Edge Function...');

    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-assessment-report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assessmentData: {
          age: 35,
          gender: 'male',
          bmi: 27.5,
          weight: 80,
          height: 175,
          family_diabetes: false,
          family_hypertension: true,
          family_obesity: false,
          smoking_status: 'never',
          alcohol_consumption: 'occasional',
          exercise_frequency: '2-3 times/week',
          diet_type: 'mixed',
          sleep_hours: 6,
          past_illnesses: [],
          current_symptoms: [],
          allergies: [],
          location: 'USA',
          diabetes_risk: 25,
          obesity_risk: 40,
          hypertension_risk: 60
        },
        api: 'openai'
      }),
    });

    console.log('📊 Status:', response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Report generated:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ ERROR Details:');
      console.log('Status:', response.status);
      console.log('Response:', errorText);
    }
  } catch (error) {
    console.log('💥 Network/Request Error:', error.message);
  }
}

testGenerateAssessmentReport();
