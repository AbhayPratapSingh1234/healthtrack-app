# OpenAI API Setup Guide (Updated)

## Overview
Your health risk assessment application now uses **direct OpenAI API** instead of Lovable's AI Gateway. All Supabase functions have been updated to use OpenAI's API endpoints.

## Current Status
✅ Supabase database connection is working
✅ All Supabase functions updated to use OpenAI API
❌ OpenAI API key needs to be configured

## Setup Steps

### 1. Get Your OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the generated API key (it starts with "sk-")

### 2. Update Environment Variables
The `.env` file has been updated with a placeholder. Replace `your_openai_api_key_here` with your actual OpenAI API key:

```env
VITE_SUPABASE_URL=https://migbmlxdptbnnxluhtwy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZ2JtbHhkcHRibm54bHVodHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjA3MDEsImV4cCI6MjA3ODUzNjcwMX0.TrxdP7ZrdemH5oHx1M7H2BZqWFmkRcWDAHE7AwDS9To
OPENAI_API_KEY=sk-your_actual_openai_key_here
```

### 3. Set Supabase Secret
Set the OpenAI API key as a Supabase secret:

```bash
supabase secrets set OPENAI_API_KEY=sk-your_actual_openai_key_here
```

### 4. Deploy Supabase Functions
Deploy all the updated functions:

```bash
supabase functions deploy
```

### 5. Test the Setup
Run the connection test:

```bash
node test-supabase-connection.js
```

## AI Models Used

- **Health Chatbot**: `gpt-3.5-turbo` - For conversational health advice
- **Report Analysis**: `gpt-4-vision-preview` - For analyzing medical images and documents
- **Assessment Reports**: `gpt-3.5-turbo` - For generating health risk assessments
- **Health Recommendations**: `gpt-3.5-turbo` - For personalized health advice
- **Health Suggestions**: `gpt-3.5-turbo` - For auto-complete suggestions

## Features That Will Work After Setup

### Health Chatbot
- AI-powered conversations about health topics
- Provides medical advice and wellness tips
- Available in the chatbot component

### Report Analysis
- Upload and analyze medical reports (PDFs, images)
- Extract health parameters and compare with normal ranges
- Identify potential health concerns

### Assessment Reports
- Generate comprehensive health risk assessments
- Based on user questionnaire responses
- Includes personalized recommendations

### Health Recommendations
- Personalized diet and exercise plans
- Based on user's health data and goals
- Lifestyle improvement suggestions

### Smart Suggestions
- Auto-complete for medical conditions
- Symptom suggestions
- Allergy suggestions
- Location-based health services

## Cost Considerations

OpenAI API has usage costs:
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **GPT-4-vision-preview**: ~$0.03 per image + text costs

Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage).

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY is not configured"**
   - Make sure you've added the key to both `.env` and Supabase secrets
   - Restart your development server after updating `.env`

2. **Rate Limiting (429 errors)**
   - OpenAI has rate limits based on your account tier
   - Free tier: 3 RPM, 200 RPD
   - Paid tier: Higher limits based on usage

3. **Payment Required (402 errors)**
   - Add credits to your OpenAI account

4. **Function Deployment Issues**
   - Ensure Supabase CLI is installed and authenticated
   - Check that you're in the correct project directory

### Testing Individual Functions

You can test each Supabase function individually:

```bash
# Test health chatbot
curl -X POST 'https://migbmlxdptbnnxluhtwy.supabase.co/functions/v1/health-chatbot' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"message": "What are some healthy breakfast options?"}'

# Test health suggestions
curl -X POST 'https://migbmlxdptbnnxluhtwy.supabase.co/functions/v1/health-suggestions' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"type": "symptom", "input": "head"}'
```

## Next Steps

1. Get your OpenAI API key from https://platform.openai.com/api-keys
2. Update the `.env` file with your actual key
3. Set the secret: `supabase secrets set OPENAI_API_KEY=sk-your_key`
4. Deploy functions: `supabase functions deploy`
5. Test the application at `http://localhost:8083`

Your health risk assessment app will then be fully functional with AI-powered features!
