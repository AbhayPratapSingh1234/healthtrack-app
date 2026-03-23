import fetch from 'node-fetch';

const SUPABASE_URL = 'https://migbmlxdptbnnxluhtwy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3NjI5NjA3MDEsImV4cCI6MjA3ODUzNjcwMX0.TrxdP7ZrdemH5oHx1M7H2BZqWFmkRcWDAHE7AwDS9To';

async function testAnalyzeHealthReport() {
  console.log('Testing analyze-health-report edge function...');

  // Test 1: Valid image file (mock base64 data)
  console.log('\n--- Test 1: Image Analysis ---');
  try {
    const mockImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // Minimal 1x1 pixel PNG

    const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-health-report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileData: mockImageData,
        fileName: 'test-blood-report.png',
        fileType: 'image/png'
      }),
    });

    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Error Response:', error);
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }

  // Test 2: PDF/Document file
  console.log('\n--- Test 2: PDF Analysis ---');
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-health-report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileData: 'mock-pdf-content',
        fileName: 'test-blood-report.pdf',
        fileType: 'application/pdf'
      }),
    });

    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Error Response:', error);
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }

  // Test 3: Error case - No file data
  console.log('\n--- Test 3: Error - No File Data ---');
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-health-report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: 'test.pdf',
        fileType: 'application/pdf'
      }),
    });

    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);

    const error = await response.text();
    console.log('Error Response:', error);
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }

  // Test 4: Error case - Invalid file type
  console.log('\n--- Test 4: Error - Invalid File Type ---');
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-health-report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileData: 'invalid-data',
        fileName: 'test.txt',
        fileType: 'text/plain'
      }),
    });

    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);

    const error = await response.text();
    console.log('Error Response:', error);
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testAnalyzeHealthReport();
