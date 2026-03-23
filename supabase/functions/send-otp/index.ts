import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log("Function called");
  console.log("Method:", req.method);
  console.log("Headers:", Object.fromEntries(req.headers.entries()));

  try {
    const body = await req.json();
    console.log("Body:", body);
    const { email, otp } = body;

    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }

    // Send OTP via Brevo Transactional Email API
    const brevoApiKey = 'caVXZhCsPJNn9Owk';

    const emailPayload = {
      sender: {
        name: "HealthTrack",
        email: "noreply@healthtrack.com"
      },
      to: [{
        email: email,
        name: email.split('@')[0]
      }],
      subject: "Password Reset Code - HealthTrack",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your HealthTrack account. Your verification code is:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes. If you didn't request this reset, please ignore this email.</p>
          <p>Best regards,<br>The HealthTrack Team</p>
        </div>
      `,
      textContent: `Hello,

You requested a password reset for your HealthTrack account. Your verification code is: ${otp}

This code will expire in 10 minutes. If you didn't request this reset, please ignore this email.

Best regards,
The HealthTrack Team`
    };

    console.log('Sending email to:', email);
    console.log('OTP:', otp);

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    console.log('Request payload:', JSON.stringify(emailPayload, null, 2));

    console.log('Brevo response status:', brevoResponse.status);

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.text();
      console.error('Brevo API error response:', errorData);
      console.error('Brevo API status:', brevoResponse.status);
      throw new Error(`Failed to send email via Brevo: ${brevoResponse.status} - ${errorData}`);
    }

    const brevoResult = await brevoResponse.json();
    console.log('Brevo API success response:', brevoResult);

    return new Response(JSON.stringify({
      success: true,
      message: 'OTP sent successfully via email'
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error in send-otp function:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
