import fetch from 'node-fetch';

const OPENROUTER_API_KEY = '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';

async function testTongyiDirect() {
  try {
    console.log('Testing Tongyi DeepResearch 30B A3B directly via OpenRouter...');

    const url = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    };
    const payload = {
      model: "alibaba/tongyi-deepresearch-30b-a3b:free",
      messages: [
        {
          role: "user",
          content: "Hello, can you help me with health advice?"
        }
      ]
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response:', data.choices[0].message.content);
    } else {
      const error = await response.text();
      console.log('❌ Error Response:', error);
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testTongyiDirect();
