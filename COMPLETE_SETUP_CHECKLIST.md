# Complete Setup Guide - Group Masterclasses & AI Summaries

## 🎯 Status: Dev Server Running ✅
**URL:** http://localhost:5174/

## ⚙️ Step 1: Database Migration (Manual - Supabase Dashboard)

1. Go to: https://supabase.com/dashboard
2. Click your project: `Mind2Mind2`
3. Go to: **SQL Editor**
4. Click **New Query**
5. Paste the entire migration SQL from: `supabase/migrations/20260509000001_add_masterclasses_and_summaries.sql`
6. Click **Run**
7. Wait for success message (should complete in 2-5 seconds)

**What it creates:**
- ✅ `masterclasses` table
- ✅ `masterclass_enrollments` table
- ✅ `session_summaries` table
- ✅ RLS Policies (Row Level Security)
- ✅ `get_masterclass_enrollment_count()` RPC function
- ✅ Auto-update triggers

---

## ⚙️ Step 2: Deploy Edge Functions

### Method: Use Supabase Dashboard

#### Function 1: Create Checkout Session
1. Go to: **Functions** in Supabase Dashboard
2. Click **Create a new function**
3. Name: `create-checkout-session`
4. Copy contents of: `supabase/functions/create-checkout-session/index.ts`
5. Paste into editor
6. Set environment variables (see below)
7. Deploy

#### Function 2: Generate Session Summary
1. Create new function named: `generate-session-summary`
2. Copy contents of: `supabase/functions/generate-session-summary/index.ts`
3. Paste into editor
4. Deploy (uses ANTHROPIC_API_KEY already in .env)

#### Function 3: Stripe Webhook
1. Create new function named: `stripe-webhook`
2. Copy contents of: `supabase/functions/stripe-webhook/index.ts`
3. Paste into editor
4. Deploy

### Set Environment Variables for Each Function
For all three functions, go to **Settings** tab and add:

```
STRIPE_SECRET_KEY = sk_test_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET = whsec_YOUR_WEBHOOK_SECRET_HERE
SITE_URL = http://localhost:5174
ANTHROPIC_API_KEY = sk-ant-YOUR_ANTHROPIC_KEY_HERE
```

---

## ⚙️ Step 3: Register Stripe Webhook

1. Go to: https://dashboard.stripe.com/developers/webhooks
2. Click **Add endpoint**
3. Endpoint URL: Copy from Supabase Function → `stripe-webhook` → click URL icon
   - Should look like: `https://your-project-id.supabase.co/functions/v1/stripe-webhook`
4. Events: Select:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.payment_failed`
5. Click **Add endpoint**
6. On the webhook details page, scroll down to **Signing secret**
7. Click **Reveal** (should match your `STRIPE_WEBHOOK_SECRET`)

---

## ✅ You're All Set!

Once you complete the 3 steps above, the features will be fully operational:

### Feature 1: Group Masterclasses
- ✅ Navigate to: http://localhost:5174 → Click **Masterclasses** in navbar
- ✅ Sign in (or create account)
- ✅ Click **Host a Masterclass** button
- ✅ Fill form and publish
- ✅ Click **Join / Buy** to test Stripe Checkout
- ✅ Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)
- ✅ Should redirect to success page after payment

### Feature 2: AI Session Summaries
- ✅ After masterclass (or anytime), navigate to summary page
- ✅ Click **Generate AI Summary**
- ✅ Fill in session details
- ✅ Claude will generate beautiful summary in 2-5 seconds
- ✅ Click **Download PDF** to save

---

## 🧪 Test Checklist

### Before Testing:
- [ ] Database migration applied successfully
- [ ] All 3 Edge Functions deployed
- [ ] Environment variables set on each function
- [ ] Stripe webhook registered

### Testing Masterclasses:
- [ ] Navbar shows "Masterclasses" link
- [ ] Can click "Host a Masterclass" button
- [ ] Form validation works (future date required)
- [ ] Can publish masterclass
- [ ] Masterclass appears in browse list
- [ ] Can search/filter masterclasses
- [ ] Can click "Join / Buy" button
- [ ] Stripe Checkout opens
- [ ] Test payment completes
- [ ] Success page shows confirmation
- [ ] Enrollment status shows "Enrolled"

### Testing AI Summaries:
- [ ] Can navigate to summary page
- [ ] "Generate Summary" button works
- [ ] Form accepts session details
- [ ] Claude generates summary (check logs if error)
- [ ] Summary displays beautifully
- [ ] PDF download button works
- [ ] "Regenerate" button works

### Responsive Testing:
- [ ] Desktop view (1920px+)
- [ ] Tablet view (768px)
- [ ] Mobile view (320px)
- [ ] Dark mode toggle works

---

## 🐛 Troubleshooting

### Stripe Checkout Not Opening
1. Check browser console for errors (DevTools → Console)
2. Verify `VITE_STRIPE_PUBLISHABLE_KEY` in .env
3. Check Supabase function logs for API errors
4. Verify Stripe keys are in Edge Functions env vars

### Claude Summary Generation Fails
1. Check Supabase function logs
2. Verify `ANTHROPIC_API_KEY` in Edge Functions env vars
3. Verify API key is still valid (hasn't expired)
4. Check browser console for errors

### Webhook Not Confirming Payment
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click your webhook → scroll to Recent events
3. Should see `checkout.session.completed` event
4. Click to see details and verify it was received
5. Check Supabase function logs for errors

### Masterclass Not Appearing in List
1. Verify status is `'upcoming'` in database
2. Verify `scheduled_at` is in the future
3. Refresh page (browser cache)
4. Check Supabase RLS policies

---

## 📂 File Reference

```
/src
  ✅ pages/MasterclassesPage.tsx
  ✅ pages/CreateMasterclassPage.tsx
  ✅ pages/MasterclassSuccessPage.tsx
  ✅ pages/SessionSummaryPage.tsx
  ✅ lib/masterclass-helpers.ts
  ✅ components/layout/Header.tsx (navbar link added)
  ✅ App.tsx (routing added)
  ✅ types/index.ts (types added)

/supabase/functions
  ✅ create-checkout-session/index.ts
  ✅ generate-session-summary/index.ts
  ✅ stripe-webhook/index.ts

/supabase/migrations
  ✅ 20260509000001_add_masterclasses_and_summaries.sql

/.env
  ✅ STRIPE configuration added
```

---

## 🚀 Deploy to Production

When ready:
1. Switch Stripe to live mode
2. Update `STRIPE_SECRET_KEY` to `sk_live_xxx`
3. Update `STRIPE_WEBHOOK_SECRET` to webhook signing secret
4. Update `SITE_URL` to production domain
5. Deploy functions with new env vars
6. Test with real payments

---

**Generated:** May 9, 2026  
**Dev Server:** http://localhost:5174  
**Status:** Ready for Supabase setup
