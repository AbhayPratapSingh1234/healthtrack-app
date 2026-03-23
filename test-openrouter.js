import fetch from 'node-fetch';

const OPENROUTER_API_KEY = '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';

async function testOpenRouter() {
  try {
    console.log('Testing OpenRouter API...');

    const url = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    };
    const payload = {
      model: "mistralai/mistral-small-3.1-24b-instruct:free",
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

testOpenRouter();
