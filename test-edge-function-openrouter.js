import fetch from 'node-fetch';

const SUPABASE_URL = 'https://migbmlxdptbnnxluhtwy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZ2JtbHhkcHRibm54bHVodHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjA3MDEsImV4cCI6MjA3ODUzNjcwMX0.TrxdP7ZrdemH5oHx1M7H2BZqWFmkRcWDAHE7AwDS9To';

async function testEdgeFunctionOpenRouter() {
  try {
    console.log('Testing health-chatbot edge function with OpenRouter...');

    const response = await fetch(`${SUPABASE_URL}/functions/v1/health-chatbot`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, can you help me with health advice?'
      }),
    });

    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response:', data);
    } else {
      const error = await response.text();
      console.log('❌ Error Response:', error);
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testEdgeFunctionOpenRouter();
