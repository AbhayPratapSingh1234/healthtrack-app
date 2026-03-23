# 🚀 Deploy to Production Supabase (Fix All Errors)

## Your Setup: PRODUCTION Supabase (not local)

**Project:** migbmlxdptbnnxluhtwy.supabase.co

## 1. DEPLOY EDGE FUNCTION
```bash
cd supabase/functions/generate-assessment-report
npx supabase@latest functions deploy generate-assessment-report
```

## 2. ADD OPENAI KEY (Dashboard)
1. https://supabase.com/dashboard/project/migbmlxdptbnnxluhtwy/settings/api
2. **Edge Functions** tab → **Secrets**
3. Add: `OPENAI_API_KEY` = `sk-proj-yourkey`

## 3. TEST
http://localhost:8082/assessment-report
Network → Status **200**

## Verify Deployment
```bash
npx supabase@latest functions list
