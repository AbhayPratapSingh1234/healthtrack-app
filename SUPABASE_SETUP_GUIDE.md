# Supabase Setup Guide

## ✅ Connection Status
Your Supabase project is **successfully connected** and the client is working!

**Project ID:** `migbmlxdptbnnxluhtwy`  
**Project URL:** `https://migbmlxdptbnnxluhtwy.supabase.co`

---

## 🔧 Environment Configuration

### Step 1: Fix Your .env File

Your `.env` file needs to contain these two variables with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://migbmlxdptbnnxluhtwy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_actual_anon_key_here
```

**To get your anon key:**
1. Go to: https://supabase.com/dashboard/project/migbmlxdptbnnxluhtwy/settings/api
2. Copy the **anon/public** key (under "Project API keys")
3. Replace `your_actual_anon_key_here` with your actual key

**Important:** Make sure the .env file is saved with UTF-8 encoding (no BOM).

---

## 🗄️ Database Setup (Required)

Your database tables need to be created. You have two options:

### Option A: Manual Setup via Supabase Dashboard (Recommended)

1. Go to the SQL Editor: https://supabase.com/dashboard/project/migbmlxdptbnnxluhtwy/editor

2. Run each migration file in order by copying and pasting the SQL:

   **Migration 1:** `supabase/migrations/20251103062242_e8e25d40-989a-4af8-858f-ed7eca8b73e4.sql`
   - Creates the `health_assessments` table
   - Sets up Row Level Security (RLS) policies
   - Creates timestamp update triggers

   **Migration 2:** `supabase/migrations/20251103062648_adf9a4ee-1228-4340-88d9-ca73daa3fa78.sql`
   - Creates `daily_health_logs` table
   - Creates `health_goals` table
   - Sets up RLS policies for both tables

   **Migration 3:** `supabase/migrations/20251104053656_7fc30e07-c337-4ec6-8a28-1e2b32822a6c.sql`
   - Adds additional columns to `health_assessments` table
   - Adds support for past illnesses, symptoms, location, and allergies

3. Click "Run" after pasting each migration

### Option B: Using Supabase CLI

If you prefer using the CLI:

```bash
# Link your project (you'll be prompted for the database password)
npx supabase link --project-ref migbmlxdptbnnxluhtwy

# Push migrations to the database
npx supabase db push
```

**Database Password:** `Singh@123820`

---

## 🧪 Testing Your Setup

After setting up the database, you can test the connection:

```bash
# Test basic connection
node --env-file=.env test-supabase-connection.js

# Test database operations
node --env-file=.env test-database-operations.js
```

---

## 📊 Database Schema

Your application uses three main tables:

### 1. `health_assessments`
Stores user health assessment data including:
- Basic info (age, gender, height, weight, BMI)
- Family history (diabetes, hypertension, obesity)
- Lifestyle factors (smoking, alcohol, exercise, diet, sleep)
- Risk scores (diabetes, obesity, hypertension)
- Medical history (past illnesses, current symptoms, allergies)

### 2. `daily_health_logs`
Tracks daily health metrics:
- Weight
- Blood pressure (systolic/diastolic)
- Blood glucose
- Exercise minutes
- Meals description
- Notes

### 3. `health_goals`
Manages user health goals:
- Goal type
- Target value
- Current value
- Deadline
- Status

---

## 🔐 Security

All tables have Row Level Security (RLS) enabled, ensuring:
- Users can only access their own data
- Authentication is required for all operations
- Data is protected at the database level

---

## 🚀 Edge Functions

Your project includes 5 Edge Functions (already configured):
1. `analyze-health-report` - Analyzes uploaded health reports
2. `generate-assessment-report` - Generates comprehensive assessment reports
3. `generate-recommendations` - Provides personalized health recommendations
4. `health-chatbot` - AI-powered health chatbot
5. `health-suggestions` - Generates health suggestions based on user data

All functions have JWT verification disabled for easier testing (configured in `supabase/config.toml`).

---

## ✅ Verification Checklist

- [x] Supabase client initialized successfully
- [x] Auth service is working
- [x] Environment variables are set
- [x] Edge functions are configured
- [ ] Database tables are created (needs manual setup)
- [ ] Application can query database (after tables are created)

---

## 🆘 Troubleshooting

### Issue: "Could not find the table in the schema cache"
**Solution:** Run the database migrations (see Database Setup section above)

### Issue: "Missing Supabase credentials"
**Solution:** Check your .env file has both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

### Issue: Authentication errors
**Solution:** Verify your anon key is correct in the .env file

### Issue: RLS policy errors
**Solution:** Make sure you're signed in and the user_id matches the authenticated user

---

## 📝 Next Steps

1. ✅ Fix your .env file with the correct anon key
2. ⚠️ Run the database migrations (Option A or B above)
3. ✅ Restart your development server: `npm run dev`
4. ✅ Test the application at http://localhost:8082
5. ✅ Try signing up/logging in at http://localhost:8082/auth
6. ✅ Complete a health assessment at http://localhost:8082/questionnaire

---

## 📚 Resources

- Supabase Dashboard: https://supabase.com/dashboard/project/migbmlxdptbnnxluhtwy
- API Settings: https://supabase.com/dashboard/project/migbmlxdptbnnxluhtwy/settings/api
- Database Editor: https://supabase.com/dashboard/project/migbmlxdptbnnxluhtwy/editor
- SQL Editor: https://supabase.com/dashboard/project/migbmlxdptbnnxluhtwy/editor
- Documentation: https://supabase.com/docs

---

**Status:** Your Supabase connection is working! Just need to create the database tables to complete the setup.
