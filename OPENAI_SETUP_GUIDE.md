# OpenAI API Setup Guide

## Overview
Your health risk assessment application uses OpenAI API through Lovable's AI Gateway for several AI-powered features:

- **Health Chatbot**: AI-powered health conversations
- **Health Report Analysis**: Analyzes uploaded medical reports and images
- **Assessment Report Generation**: Creates personalized health risk assessments
- **Health Recommendations**: Provides personalized diet and lifestyle advice
- **Health Suggestions**: Auto-complete suggestions for illnesses, symptoms, allergies, and locations

## Current Status
✅ Supabase database connection is working
❌ OpenAI API key needs to be configured

## Setup Steps

### 1. Get Your Lovable API Key
1. Go to [Lovable.dev](https://lovable.dev)
2. Sign in to your account
3. Navigate to your workspace settings
4. Find your API key (it should start with a prefix like "lv_" or similar)

### 2. Update Environment Variables
Add your Lovable API key to the `.env` file:

```env
VITE_SUPABASE_URL=https://migbmlxdptbnnxluhtwy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZ2JtbHhkcHRibm54bHVodHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjA3MDEsImV4cCI6MjA3ODUzNjcwMX0.TrxdP7ZrdemH5oHx1M7H2BZqWFmkRcWDAHE7AwDS9To
LOVABLE_API_KEY=your_actual_lovable_api_key_here
```

### 3. Deploy Supabase Functions
Once you have the API key, deploy the Supabase functions:

```bash
# Set the environment variable for Supabase functions
supabase secrets set LOVABLE_API_KEY=your_actual_lovable_api_key_here

# Deploy all functions
supabase functions deploy
```

### 4. Test the Setup
Run the test script to verify everything works:

```bash
node test-supabase-connection.js
```

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

## Troubleshooting

### Common Issues

1. **"LOVABLE_API_KEY is not configured"**
   - Make sure you've added the key to both `.env` and Supabase secrets
   - Restart your development server after updating `.env`

2. **Rate Limiting (429 errors)**
   - Your Lovable workspace may have usage limits
   - Add credits to your Lovable account

3. **Payment Required (402 errors)**
   - Add funds to your Lovable AI workspace

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

1. Add your Lovable API key to the `.env` file
2. Set the secret in Supabase: `supabase secrets set LOVABLE_API_KEY=your_key`
3. Deploy functions: `supabase functions deploy`
4. Test the application at `http://localhost:8083`

Your health risk assessment app will then be fully functional with AI-powered features!
