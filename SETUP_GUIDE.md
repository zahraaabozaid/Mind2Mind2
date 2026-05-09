# Quick Setup Guide: Group Masterclasses & AI Summaries

## 🚀 Step-by-Step Setup

### 1. Database Migration
Apply the Supabase migration to create tables:
```bash
# In Supabase dashboard:
# - Go to SQL Editor
# - Paste contents of: supabase/migrations/20260509000001_add_masterclasses_and_summaries.sql
# - Run the query
# 
# OR if using Supabase CLI:
supabase db push
```

### 2. Set Environment Variables
Add to your `.env` file or Supabase project settings:

```bash
# .env (for local development)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# These go in Supabase Edge Functions environment (not .env):
STRIPE_SECRET_KEY=sk_live_or_sk_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SITE_URL=https://yourdomain.com (or http://localhost:5173 for dev)
```

#### Setting Edge Function Variables:
1. Go to Supabase Dashboard → Functions
2. Click on the function name
3. Click "Settings"
4. Add environment variables there

### 3. Deploy Edge Functions
```bash
# Make sure functions are deployed to Supabase
# They should be automatically deployed, but verify:

# Get function URLs:
supabase functions list

# You should see:
# - create-checkout-session
# - generate-session-summary  
# - stripe-webhook
```

### 4. Configure Stripe
#### Get API Keys:
1. Go to https://stripe.com/docs/keys
2. Copy "Secret key" 
3. Add to Edge Functions env vars

#### Register Webhook:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://<your-project-id>.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the "Signing secret"
6. Add to Edge Functions env vars as `STRIPE_WEBHOOK_SECRET`

### 5. Get Anthropic API Key
1. Go to https://console.anthropic.com
2. Create account if needed
3. Go to API keys section
4. Generate new key
5. Add to Edge Functions env vars as `ANTHROPIC_API_KEY`

---

## 🧪 Testing

### Local Development
```bash
# Start dev server
npm run dev

# Navigate to:
# - Homepage: http://localhost:5173
# - Masterclasses: http://localhost:5173 → click "Masterclasses" in navbar
```

### Test Creating a Masterclass (As Expert)
1. Sign in (or create account)
2. Go to Masterclasses page
3. Click "Host a Masterclass" button
4. Fill form:
   - Title: "React Hooks Masterclass"
   - Description: "Learn advanced React patterns"
   - Topic: "Programming"
   - Date: Tomorrow
   - Time: 2:00 PM
   - Max Participants: 20
   - Price: $29.99
5. Click "Publish Masterclass"
6. Should see success screen

### Test Viewing Masterclasses (As Learner)
1. Masterclasses page should now show your created masterclass
2. Should see:
   - Title, expert name, topic
   - Date, time, spots remaining
   - Expert rating
   - Price badge
   - "Join / Buy" button

### Test Stripe Checkout (In Test Mode)
1. Go to Masterclasses page
2. Click "Join / Buy" on a masterclass
3. Should redirect to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g. 12/26)
   - CVC: Any 3 digits (e.g. 123)
5. Click "Pay"
6. Should be redirected to success page
7. Should see: "Payment Received!" → "You're Enrolled!" (after webhook)

### Test AI Session Summary
1. After session "completes", go to summary page:
   - URL: `http://localhost:5173?page=session-summary&id=test-session-123:masterclass`
2. Click "Generate Summary"
3. Fill form:
   - Session Title: "React Hooks Masterclass"
   - Expert Name: "Your Expert Name"
   - Learner Name: "Your Name"
   - Duration: 60 minutes
4. Click "Generate AI Summary with Claude"
5. Wait 2-5 seconds for Claude response
6. Should see beautiful summary card with:
   - Session overview
   - Key takeaways
   - Action items
   - Recommended topics
7. Click "Download PDF" to test PDF export

---

## 🐛 Debugging

### Stripe Webhook Not Confirming Payment
1. Check Stripe Dashboard → Events
   - Should show `checkout.session.completed` event
   - If missing, webhook endpoint not receiving events
2. Verify webhook URL in Stripe is correct
3. Check webhook signing secret in Edge Functions
4. Look at Supabase Edge Function logs for errors

### Claude API Returning Errors
1. Check `ANTHROPIC_API_KEY` is set in Edge Functions
2. Verify key is valid (test in Anthropic dashboard)
3. Check Supabase Function logs for error messages
4. Model name: `claude-sonnet-4-20250514` is correct

### Masterclass Not Showing After Creation
1. Check Supabase - should have new row in `masterclasses` table
2. Verify status is 'upcoming' (not 'completed' or 'cancelled')
3. Check scheduled_at is in future
4. Refresh page to reload data

### Enrollment Count Showing 0
1. Check `get_masterclass_enrollment_count()` RPC function exists
2. Verify `masterclass_enrollments` table has paid enrollments
3. Check payment_status is 'paid' (not 'pending')

---

## 📁 File Locations

```
/src
  /pages
    - MasterclassesPage.tsx (browse & filter masterclasses)
    - CreateMasterclassPage.tsx (create new masterclass)
    - MasterclassSuccessPage.tsx (after checkout)
    - SessionSummaryPage.tsx (AI summary display)
  /lib
    - masterclass-helpers.ts (all database & API functions)
  /components
    - /ui
      - Button.tsx (reused component)
      - Badge.tsx (reused component)
    - /layout
      - Header.tsx (navbar with Masterclasses link)

/supabase
  /functions
    - /create-checkout-session (Stripe checkout)
    - /generate-session-summary (Claude API)
    - /stripe-webhook (webhook handler)
  /migrations
    - 20260509000001_add_masterclasses_and_summaries.sql

/
  - .env (environment variables)
  - FEATURES_IMPLEMENTATION.md (full documentation)
  - SETUP_GUIDE.md (this file)
```

---

## ✅ Verification Checklist

- [ ] Migration applied in Supabase
- [ ] Masterclasses table created
- [ ] Masterclass_enrollments table created
- [ ] Session_summaries table created
- [ ] get_masterclass_enrollment_count() RPC function works
- [ ] Edge functions deployed
- [ ] create-checkout-session function accessible
- [ ] generate-session-summary function accessible
- [ ] stripe-webhook function accessible
- [ ] STRIPE_SECRET_KEY set in Edge Functions
- [ ] STRIPE_WEBHOOK_SECRET set in Edge Functions
- [ ] ANTHROPIC_API_KEY set in Edge Functions
- [ ] SITE_URL set in Edge Functions (for Stripe redirects)
- [ ] Stripe webhook registered at correct URL
- [ ] Can create masterclass (form submits)
- [ ] Masterclass appears in list
- [ ] Can click Join/Buy without error
- [ ] Stripe Checkout page loads
- [ ] Payment completes successfully
- [ ] Webhook confirms enrollment (see paid status)
- [ ] Success page shows confirmation
- [ ] Can generate AI summary
- [ ] Claude returns valid JSON
- [ ] Summary displays correctly
- [ ] PDF download works
- [ ] Navbar shows "Masterclasses" link
- [ ] Mobile responsive works
- [ ] Dark mode works

---

## 🆘 Support

If you encounter issues:

1. **Check Supabase logs:**
   - Dashboard → Logs → Database or Edge Functions logs
   - Look for error messages

2. **Check browser console:**
   - Dev Tools → Console tab
   - Network tab to see API calls

3. **Check Stripe logs:**
   - Dashboard → Developers → Events
   - Look for webhook delivery status

4. **Check function environment:**
   - Supabase → Functions → Function name → Settings
   - Verify all env vars are set

---

## Next Deployment

Before deploying to production:

1. Switch Stripe from test to live mode
2. Update `STRIPE_SECRET_KEY` to live key
3. Update `SITE_URL` to production domain
4. Test end-to-end with real payments
5. Monitor webhook deliveries
6. Have Stripe support contact available
7. Test PDF download on production

---

Generated: 2025-05-09
Features Complete: Group Masterclasses + AI Session Summaries
