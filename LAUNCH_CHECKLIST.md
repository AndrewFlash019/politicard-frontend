# PolitiScore Launch Checklist

The code is ready. The infrastructure isn't yet. Walk this list start-to-finish before pointing real users at politiscore.com.

## Infrastructure (do before flipping the switch)

### 1. Upgrade Supabase to Pro ($25/mo)
- supabase.com → Project Settings → Billing → **Upgrade to Pro**
- Eliminates auto-pause (free tier pauses after 1 week idle — would brick the app)
- Enables daily backups
- 8 GB database storage (we're well under)

### 2. Upgrade Render to Starter ($7/mo)
- render.com → `politicard-backend` → Settings → **Instance Type → Starter**
- Eliminates cold starts on first request after idle
- Always-on so the feed loads instantly

### 3. Configure custom domain
- netlify.com → Sites → `magnificent-meerkat-40c5aa` → Domain Settings
- Add custom domain: **politiscore.com**
- Add: **app.politiscore.com** → same site
- Add CNAME for `app` if needed
- Update CORS in backend env (already in code; just needs ENV=production)

### 4. Configure Supabase email (forgot password actually sends)
- supabase.com → Authentication → Email Templates (review wording)
- Settings → Auth → **SMTP Settings**
- Use [Resend](https://resend.com): create account, verify politiscore.com domain, get API key
- SMTP host: `smtp.resend.com`, port `465`, user `resend`, password = API key
- Test: trigger forgot-password from the app → confirm email arrives

### 5. Add environment variables to Render
```
DATABASE_URL=…              postgres://… from Supabase → Project Settings → Database → Connection string
SECRET_KEY=…                strong random value (e.g. `python -c "import secrets; print(secrets.token_urlsafe(64))"`); JWT signing key — backend refuses to start without it
SUPABASE_URL=…              from supabase project settings
SUPABASE_KEY=…              anon key
SUPABASE_SERVICE_KEY=…      service role key
CONGRESS_API_KEY=…          from api.congress.gov  (boosts photo coverage to ~28 federal officials)
GOOGLE_CSE_API_KEY=…        optional, for source 8 of photo fetcher
GOOGLE_CSE_ID=…             optional
COURTLISTENER_API_TOKEN=…   optional, for live misconduct ingestion
FBI_CDE_API_KEY=…           optional, for live crime trend
INTERNAL_HEALTH_KEY=…       set to gate /health/detailed
ANTHROPIC_API_KEY=…         only used by ingest scripts, not runtime
ENV=production              drops localhost + dev Netlify preview from CORS allow-list, disables /docs and /openapi.json
```

### 6. Add environment variables to Netlify
```
REACT_APP_SUPABASE_URL=…           same project
REACT_APP_SUPABASE_ANON_KEY=…      anon key only — never service key
REACT_APP_API_BASE_URL=https://politicard-backend.onrender.com  (or /api/v1 once ready)
REACT_APP_SENTRY_DSN=…             after creating sentry project (step 7)
```

### 7. Set up Sentry
- sentry.io → Create account → New Project → React → name: `politiscore-web`
- Copy DSN to Netlify env var `REACT_APP_SENTRY_DSN`
- Trigger Netlify rebuild

### 8. Trigger Render redeploy
- render.com → `politicard-backend` → Manual Deploy → Deploy latest commit
- Watch logs: must see "Application startup complete" with no `RuntimeError: Refusing to start`

### 9. Final smoke test
- ZIP **32164** → see Flagler County officials
- ZIP **33602** → see Hillsborough officials
- ZIP **33101** → see Miami-Dade officials
- ZIP **94110** (CA) → falls through to waitlist CTA
- Vote on a feed card → count increments
- Take typology quiz → result card renders, stored in profile
- Forgot password → email arrives
- Install as PWA from a phone (mobile Safari → Share → Add to Home Screen)

## Switch
1. Point politiscore.com DNS to Netlify (CNAME `magnificent-meerkat-40c5aa.netlify.app`)
2. Verify ENV=production set on Render so CORS allow-list takes effect
3. Verify `/internal/launch-checklist` shows all green
4. Announce
