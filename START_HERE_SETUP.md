# 🚀 QUICK SETUP - Ready to Test!

## ✅ Current Status
- **Dev Server:** Running on http://localhost:5174
- **.env:** All keys configured ✅
- **Code:** All features implemented ✅
- **Database:** Need to apply migration
- **Edge Functions:** Need to deploy
- **Stripe Webhook:** Need to register

---

## 📋 YOUR EXACT KEYS (Copy-Paste Ready)

### For Supabase Edge Functions Environment Variables:

```
STRIPE_SECRET_KEY
sk_test_YOUR_STRIPE_SECRET_KEY_HERE

STRIPE_WEBHOOK_SECRET
whsec_YOUR_WEBHOOK_SECRET_HERE

SITE_URL
http://localhost:5174

ANTHROPIC_API_KEY
sk-ant-YOUR_ANTHROPIC_KEY_HERE
```

---

## 🎯 DO THESE 3 THINGS:

### 1. Apply SQL Migration
1. Go: https://supabase.com/dashboard
2. Select your project
3. Left menu → **SQL Editor** → **New Query**
4. Open file in project: `COPY_TO_SUPABASE_SQL.sql`
5. Copy all content → Paste into Supabase
6. Click **RUN**
7. ✅ Done! (Takes 10 seconds)

**What it creates:**
- masterclasses table
- masterclass_enrollments table  
- session_summaries table
- RLS policies
- Indexes & triggers

---

### 2. Deploy 3 Edge Functions

**Go to:** Supabase Dashboard → **Functions** (left menu)

#### Function A: `create-checkout-session`
1. Click **Create a new function**
2. Name: `create-checkout-session`
3. Copy code from: `supabase/functions/create-checkout-session/index.ts`
4. Paste into editor → Click **Deploy**
5. Click **Settings** tab
6. Add all 4 environment variables (see above)
7. Save

#### Function B: `generate-session-summary`
1. Click **Create a new function**
2. Name: `generate-session-summary`
3. Copy code from: `supabase/functions/generate-session-summary/index.ts`
4. Paste → Deploy
5. Settings → Add all 4 env vars

#### Function C: `stripe-webhook`
1. Click **Create a new function**
2. Name: `stripe-webhook`
3. Copy code from: `supabase/functions/stripe-webhook/index.ts`
4. Paste → Deploy
5. Settings → Add all 4 env vars

---

### 3. Register Stripe Webhook

1. Go: https://dashboard.stripe.com/developers/webhooks
2. Click **Add endpoint**
3. For endpoint URL:
   - Go to Supabase Dashboard → Functions → Click `stripe-webhook`
   - Click the URL icon next to the function name
   - Copy the URL (looks like: `https://your-project-id.supabase.co/functions/v1/stripe-webhook`)
   - Paste into Stripe
4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.payment_failed`
5. Click **Add endpoint**
6. ✅ Done!

---

## ✅ THEN TEST!

### Open: http://localhost:5174

#### Test Feature 1: Group Masterclasses
1. Click **Masterclasses** (navbar, top right)
2. Sign in / Create account
3. Click **Host a Masterclass** (blue button)
4. Fill form:
   - Title: "Test Masterclass"
   - Description: "Testing the feature"
   - Topic: "Programming"
   - Date: Tomorrow
   - Time: 2:00 PM
   - Max Participants: 20
   - Price: $29.99
5. Click **Publish Masterclass**
6. ✅ Should see success screen
7. Go back to Masterclasses list
8. Your masterclass should appear!
9. Click **Join / Buy** button
10. ✅ Stripe Checkout should open
11. Use test card: `4242 4242 4242 4242`
12. Expiry: `12/26` (any future date)
13. CVC: `123` (any 3 digits)
14. Click **Pay**
15. ✅ Should show "You're Enrolled!" confirmation

#### Test Feature 2: AI Session Summary
1. Open: http://localhost:5174?page=session-summary&id=test-session:masterclass
2. Click **Generate Summary**
3. Fill form:
   - Session Title: "React Masterclass"
   - Expert Name: "Your Name"
   - Learner Name: "Your Name"
   - Duration: 60 minutes
4. Click **Generate AI Summary with Claude**
5. Wait 2-5 seconds
6. ✅ Beautiful summary appears!
7. Click **Download PDF** to test export

---

## 🎉 All Done!

Once you complete those 3 steps, everything works automatically!

**Questions?**
- Check: `COMPLETE_SETUP_CHECKLIST.md` (full guide)
- Check: `FEATURES_IMPLEMENTATION.md` (feature details)
- Check: `IMPLEMENTATION_VERIFICATION.md` (verification report)

**Your dev server keeps running at:** http://localhost:5174

---

## Quick Reference

| File | Purpose |
|------|---------|
| `.env` | ✅ All env vars configured |
| `COPY_TO_SUPABASE_SQL.sql` | Copy→Paste SQL to Supabase |
| `supabase/functions/` | 3 Edge Functions to deploy |
| `src/pages/` | 4 new React pages |
| `src/lib/masterclass-helpers.ts` | All database helpers |

**Ready? Start with Step 1 above! ⬆️**
