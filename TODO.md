# HealthTrack Deployment TODO - AbhayPratapSingh1234

## 1. GitHub Push [READY]
- [ ] Create repo: https://github.com/AbhayPratapSingh1234/healthtrack-app (click New → no README/.gitignore/license).
- [ ] ```
  git init
  git add .
  git commit -m "Initial deploy: HealthTrack w/ Supabase"
  git branch -M main
git remote set-url origin https://github.com/AbhayPratapSingh1234/healthtrack-app.git
  git push -u origin main
  ```

## 2. Get Supabase Anon Key (MUST BEFORE DEPLOY)
Go to https://supabase.com/dashboard/project/migbmlxdptbnnxluhtwy/settings/api
- Copy **anon/public** key.
- Create `.env.local` (untracked):
  ```
  VITE_SUPABASE_URL=https://migbmlxdptbnnxluhtwy.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=eyJ... (paste anon key)
  ```
- Test: `npm run dev` → sign up/login works?

## 3. Prerequisites (Android SDK for APK)

**Install Android SDK (No Studio – 5 mins):**
1. Download commandlinetools: https://developer.android.com/studio#downloads → "Command line tools only" → commandlinetools-win-*.zip
2. Extract to `C:\android-sdk\cmdline-tools\latest\bin`
3. Add to PATH: `$env:PATH += ';C:\android-sdk\cmdline-tools\latest\bin;C:\android-sdk\platform-tools'`
4. Run:
```
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```
5. local.properties:
```
sdk.dir=C:\\android-sdk
```

**Then APK build works.**
- [ ] `npm install`
- [ ] Run install-supabase-cli.bat
- [ ] `npx supabase login`
- [ ] `npx supabase link --project-ref migbmlxdptbnnxluhtwy`
- [ ] `npx supabase secrets set OPENAI_API_KEY=sk-your-key`
- [ ] `npx supabase db push`
- [ ] `npx supabase functions deploy`

## 4. Vercel Deploy
- [ ] vercel.com → New Project → Import GitHub repo.
- [ ] Add env vars (from .env.local).
- [ ] Deploy live!

**Test local after .env.local: npm run dev**

## 5. Make Installable App ✅ PWA READY

### PWA (Add to Home Screen)
- Deploy to Vercel (HTTPS).
- Chrome/Safari: Install icon appears.
- Offline capable (sw.js caches static).

### Downloadable APK (No Android Studio!)

**Debug APK (Installable):**
```
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk` – Copy to phone → Install (Unknown sources on).

**Release APK (Signed):**
```
keytool -genkey -v -keystore release.keystore -alias healthtrack -keyalg RSA -keysize 2048 -validity 10000 -storepass yourpass -keypass yourpass -dname "CN=HealthTrack"
```
Then:
```
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleRelease -Pandroid.injected.signing.store.file=../release.keystore -Pandroid.injected.signing.store.password=yourpass -Pandroid.injected.signing.key.alias=healthtrack -Pandroid.injected.signing.key.password=yourpass
```
APK: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

**Test:** `npm run preview` first.

**Done!**


- [ ] `git init`
- [ ] Create GitHub repo: https://github.com/new → 'healthtrack-app' (public/private).
- [ ] `git add .`
- [ ] `git commit -m "Initial commit: Health risk assessment app"`
- [ ] `git branch -M main`
- [ ] `git remote add origin https://github.com/YOUR_USERNAME/healthtrack-app.git`
- [ ] `git push -u origin main`

## 2. Prerequisites (Local Setup)

- [ ] `npm install`
- [ ] Add OpenAI billing (platform.openai.com/account/billing).
- [ ] `npx supabase login`
- [ ] `npx supabase link --project-ref migbmlxdptbnnxluhtwy`
- [ ] Set secrets: `npx supabase secrets set OPENAI_API_KEY=sk-...` (or OpenRouter).
- [ ] Deploy DB/functions: `npx supabase db push`<br>`npx supabase functions deploy`
- [ ] Test local: `npm run dev`

## 3. Vercel Frontend Deploy

- [ ] Connect GitHub repo to Vercel.com (New Project → Import).
- [ ] Set env vars in Vercel: `VITE_SUPABASE_URL=https://migbmlxdptbnnxluhtwy.supabase.co`, `VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...` (anon key from Supabase Settings → API).
- [ ] Push any change → Auto-deploy!

## 4. Test Production

- [ ] Visit Vercel URL.
- [ ] Test auth/questionnaire/AI features.
- [ ] Optional: Capacitor `npm run build && npx cap sync && npx cap run android`.

## Status Commands
`git status` | `npm run preview` | Supabase dashboard: app.supabase.com/project/migbmlxdptbnnxluhtwy

**Next: Run step 1, share GitHub repo URL after push.**

