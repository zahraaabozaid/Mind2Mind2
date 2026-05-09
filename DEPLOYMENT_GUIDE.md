# Deployment Guide - Mind2Mind

This guide explains how to deploy the Mind2Mind application on **Vercel** (frontend) and **Railway** (frontend/backend).

---

## Prerequisites

1. **Supabase Project** - Create a free project at [supabase.com](https://supabase.com)
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Railway Account** - Sign up at [railway.app](https://railway.app)
4. **GitHub Repository** - Push your code to GitHub

---

## Step 1: Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon Public Key** (under "Project API keys")

---

## Step 2: Deploy on Vercel (Recommended for Frontend)

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables when prompted:
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your GitHub repository
3. Click **Deploy**
4. After deployment, go to **Settings** → **Environment Variables**
5. Add these variables:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase Anon Key
6. Redeploy from the **Deployments** tab

### Verify Vercel Deployment

- Your app should be live at `https://your-project.vercel.app`
- If you see a "Configuration Required" message, the env vars are not set correctly
- Check the browser console (F12) for any errors

---

## Step 3: Deploy on Railway (Alternative for Frontend)

### Using Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Railway will auto-detect the `railway.json` configuration
5. Go to **Variables** and add:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase Anon Key
6. Click **Deploy**

### Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Set environment variables
railway variables set VITE_SUPABASE_URL=https://xxxxx.supabase.co
railway variables set VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Deploy
railway up
```

### Verify Railway Deployment

- Your app should be live at the Railway-provided URL
- Check **Logs** in Railway dashboard for any errors
- If build fails, check the build logs for missing dependencies

---

## Troubleshooting

### Issue: "VITE_SUPABASE_URL or Anon Key is missing"

**Solution:**
1. Verify environment variables are set in your platform (Vercel/Railway)
2. Rebuild/redeploy after setting variables
3. Clear browser cache (Ctrl+Shift+Del)
4. Check that variable names start with `VITE_`

### Issue: "Cannot read property 'from' of undefined"

**Solution:**
1. This means Supabase client is not initialized
2. Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Ensure they are not empty strings

### Issue: Build fails with "Cannot find module"

**Solution:**
1. Run `npm install` locally to verify dependencies
2. Check that all imports use correct paths
3. Ensure `package-lock.json` is committed to git

### Issue: "Row Level Security (RLS) violation"

**Solution:**
1. This is a database permission issue, not a deployment issue
2. Check your Supabase RLS policies
3. Ensure your database migrations have been applied

### Issue: Blank white screen after deployment

**Solution:**
1. Open browser DevTools (F12)
2. Check the **Console** tab for errors
3. Check the **Network** tab to see if API calls are failing
4. If you see CORS errors, check Supabase CORS settings

---

## Environment Variables Reference

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | Yes | `https://project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | `eyJhbGc...` |

**Note:** All variables must start with `VITE_` to be exposed to the browser in Vite projects.

---

## Local Development

To test locally before deployment:

```bash
# Create .env.local file
cp .env.example .env.local

# Edit .env.local and add your Supabase credentials
nano .env.local

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

---

## Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Environment variables documented in `.env.example`
- [ ] `vercel.json` configured for SPA routing
- [ ] `railway.json` configured for build/start commands
- [ ] `package.json` has `start` and `preview` scripts
- [ ] Tested locally with `npm run dev`
- [ ] Built successfully with `npm run build`
- [ ] Pushed all changes to GitHub
- [ ] Environment variables set in Vercel/Railway
- [ ] Deployment successful and app is accessible
- [ ] Tested core features (auth, browse, profile, messages)

---

## Next Steps

1. **Set up database migrations** - Run Supabase migrations from `supabase/migrations/`
2. **Configure authentication** - Set up email templates in Supabase Auth
3. **Enable real-time** - Ensure Realtime is enabled in Supabase
4. **Add custom domain** - Configure custom domain in Vercel/Railway
5. **Set up monitoring** - Enable error tracking and analytics

---

## Support

For issues with:
- **Vercel**: See [vercel.com/docs](https://vercel.com/docs)
- **Railway**: See [docs.railway.app](https://docs.railway.app)
- **Supabase**: See [supabase.com/docs](https://supabase.com/docs)
- **Vite**: See [vitejs.dev](https://vitejs.dev)

---

## Quick Deploy Links

- **Vercel**: [Deploy to Vercel](https://vercel.com/new)
- **Railway**: [Deploy to Railway](https://railway.app/new)
