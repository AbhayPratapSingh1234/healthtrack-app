import fetch from 'node-fetch';

// const OPENAI_API_KEY = 'YOUR_OPENAI_KEY_HERE';

async function testOpenAIKey() {
  try {
    console.log('Testing OpenAI API key...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Write a haiku about AI' }],
        max_tokens: 100,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenAI API key is valid!');
      console.log('Response:', data.choices[0].message.content);
    } else {
      const error = await response.text();
      console.log('❌ OpenAI API key test failed:');
      console.log('Status:', response.status);
      console.log('Error:', error);
    }
  } catch (error) {
    console.log('❌ Error testing OpenAI API key:');
    console.log(error.message);
  }
}

testOpenAIKey();
