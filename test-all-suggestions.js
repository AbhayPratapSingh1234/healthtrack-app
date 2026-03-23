import fetch from 'node-fetch';

const SUPABASE_URL = 'https://migbmlxdptbnnxluhtwy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZ2JtbHhkcHRibm54bHVodHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjA3MDEsImV4cCI6MjA3ODUzNjcwMX0.TrxdP7ZrdemH5oHx1M7H2BZqWFmkRcWDAHE7AwDS9To';

const testCases = [
  { type: 'illness', input: 'diab' },
  { type: 'symptom', input: 'head' },
  { type: 'allergy', input: 'peanut' },
  { type: 'location', input: 'mum' }
];

async function testHealthSuggestions(type, input) {
  try {
    console.log(`\nTesting ${type} with input "${input}"...`);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/health-suggestions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        input
      }),
    });

    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response:', data);
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Error Response:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Testing all health-suggestions types...');
  let passed = 0;
  let total = testCases.length;

  for (const testCase of testCases) {
    const success = await testHealthSuggestions(testCase.type, testCase.input);
    if (success) passed++;
  }

  console.log(`\nTest Results: ${passed}/${total} tests passed`);
  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️ Some tests failed');
  }
}

runAllTests();
