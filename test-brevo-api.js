import fetch from 'node-fetch';

async function testBrevoAPI() {
  console.log('Testing Brevo API directly...');

  const emailPayload = {
    sender: {
      name: "HealthTrack",
      email: "noreply@healthtrack.com"
    },
    to: [{
      email: "test@example.com",
      name: "Test"
    }],
    subject: "Test Email from HealthTrack",
    htmlContent: "<p>This is a test email from HealthTrack</p>",
    textContent: "This is a test email from HealthTrack"
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
// 'api-key': 'YOUR_BREVO_KEY_HERE',
        'content-type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    } else {
      const result = await response.json();
      console.log('Success response:', result);
    }
  } catch (error) {
    console.error('Exception:', error.message);
  }
}

testBrevoAPI();
