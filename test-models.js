import fetch from 'node-fetch';

const OPENROUTER_API_KEY = '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';

async function testModels() {
  try {
    console.log('Fetching available models from OpenRouter...');

    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Available models:');
      const tongyiModels = data.data.filter(model => model.id.includes('tongyi'));
      console.log('Tongyi models:', tongyiModels.map(m => m.id));
    } else {
      const error = await response.text();
      console.log('❌ Error Response:', error);
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testModels();
