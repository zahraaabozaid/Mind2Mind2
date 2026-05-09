# Mind2Mind Backend Setup Checklist

## 🎯 Quick Setup Guide

Follow these steps in order to complete your backend integration:

### ☐ Step 1: Database Setup (5 minutes)

1. Open Supabase Dashboard: https://app.supabase.com
2. Select your project: `qgqfbyaxssdmwxytyppm`
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Open `supabase_setup.sql` from your project
6. Copy entire content and paste into SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for "Success" message
9. Verify in **Storage** section that buckets were created:
   - ✅ demo-videos
   - ✅ demo-pdfs
   - ✅ avatars
   - ✅ covers

### ☐ Step 2: Verify Environment Variables (1 minute)

1. Open `.env` file in your project root
2. Confirm these values are present:
   ```
   VITE_SUPABASE_URL=https://qgqfbyaxssdmwxytyppm.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_PnVu0wNYWRfkBL06zxUObg_Z7j9P--R
   ```
3. If missing, add them and restart dev server

### ☐ Step 3: Test Authentication (2 minutes)

1. Start dev server: `npm run dev`
2. Open browser: http://localhost:5173
3. Click **"Join Free"** button in header
4. Create test account:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
5. Click **"Create Free Account"**
6. ✅ You should see success message
7. ✅ Header should show your profile icon
8. ✅ Click profile icon to see dropdown menu

### ☐ Step 4: Create Your Profile (3 minutes)

1. Click **"Browse"** in navigation
2. Click **"Create / Edit My Profile"** button
3. Fill in your information:
   - Display Name: `Your Name`
   - Username: `your_username`
   - Bio: `Brief description about yourself`
   - Location: `City, Country`
4. Add teaching skills (press Enter after each):
   - Example: `React`, `JavaScript`, `Web Development`
5. Add learning skills:
   - Example: `Spanish`, `Photography`, `Guitar`
6. Add languages:
   - Example: `English`, `Arabic`
7. Upload avatar (optional)
8. Toggle "Available for exchanges" ON
9. Click **"Save Profile"**
10. ✅ You should see success message
11. ✅ Profile should appear in Browse page

### ☐ Step 5: Upload a Demo (3 minutes)

1. From Browse page, click **"Upload Demo"** button
2. Fill in demo details:
   - Title: `Introduction to React Hooks`
   - Description: `Learn how to use React hooks effectively`
   - Skill/Topic: `React`
3. Upload a file:
   - Video: MP4, MOV, or WebM (max 50MB)
   - OR PDF: Any PDF document (max 10MB)
4. Choose visibility:
   - **Public**: Everyone can see
   - **Custom**: Only specific users (add usernames)
5. Click **"Upload Demo"**
6. ✅ Upload progress should show
7. ✅ Success message appears
8. ✅ Demo appears in your profile

### ☐ Step 6: Test Exchange Flow (3 minutes)

1. Go to **Browse** page
2. Find an expert (or create second test account)
3. Click on expert card to view profile
4. Click **"Exchange"** button
5. Fill in exchange proposal:
   - "I want to learn": Select or type skill
   - "In exchange, I will teach": Type your skill
   - Message: Optional greeting
6. Click **"Send Exchange Request"**
7. ✅ Success message appears
8. ✅ Request is sent

### ☐ Step 7: Verify Notifications (2 minutes)

1. Click bell icon in header
2. ✅ Should show notification count
3. Click to view notifications
4. ✅ Exchange request notification should appear
5. Click notification to view details

### ☐ Step 8: Test Profile Display (1 minute)

1. Click your profile icon in header
2. Click **"My Profile"**
3. ✅ Your profile page loads
4. ✅ Shows your avatar, bio, skills
5. ✅ Shows your uploaded demos
6. ✅ Stats are displayed (exchanges, reviews, etc.)

## 🔍 Verification Checklist

After completing all steps, verify these features work:

### Authentication
- [ ] Sign up creates account and profile
- [ ] Sign in works with correct credentials
- [ ] Sign in shows error with wrong credentials
- [ ] User stays logged in after page refresh
- [ ] Sign out works correctly
- [ ] Header shows user profile when logged in

### Profile Management
- [ ] Can create new profile
- [ ] Can edit existing profile
- [ ] Avatar upload works
- [ ] Skills can be added and removed
- [ ] Profile appears in Browse page
- [ ] Profile page displays all information

### Demo Upload
- [ ] Video upload works (MP4, MOV, WebM)
- [ ] PDF upload works
- [ ] Public visibility works
- [ ] Custom visibility can be set
- [ ] Demos appear in profile
- [ ] Demo thumbnails display

### Exchange System
- [ ] Can propose exchange to any expert
- [ ] Exchange request is created in database
- [ ] Notification is sent to recipient
- [ ] Exchange appears in exchanges page
- [ ] Can view exchange details

### Browse & Search
- [ ] Browse page shows all experts
- [ ] Search filters work
- [ ] Category filters work
- [ ] Can view expert profiles
- [ ] Static demo data shows if database empty

## 🐛 Common Issues & Solutions

### Issue: "Invalid Credentials" on login
**Solution**: 
- Verify email is correct
- Check password is at least 6 characters
- Try creating new account
- Check Supabase Auth dashboard for user

### Issue: Profile not showing in header
**Solution**:
- Log out and log back in
- Check browser console for errors
- Verify profile exists in Supabase Table Editor
- Clear browser cache and reload

### Issue: Demo upload fails
**Solution**:
- Verify storage buckets exist (run SQL script)
- Check file size (videos: 50MB, PDFs: 10MB)
- Check file type (MP4, MOV, WebM, PDF only)
- Check browser console for specific error

### Issue: Exchange request not appearing
**Solution**:
- Check both users have profiles
- Verify exchange_requests table exists
- Check notifications table for notification
- Refresh the page

### Issue: Storage bucket not found
**Solution**:
- Run `supabase_setup.sql` script again
- Check Storage section in Supabase dashboard
- Verify bucket names match code (demo-videos, demo-pdfs, etc.)

## 📊 Database Verification

To verify everything is set up correctly, check these in Supabase:

### Tables (Table Editor)
- [ ] `profiles` - Has your profile record
- [ ] `knowledge_demos` - Has your demo records
- [ ] `exchange_requests` - Has exchange records
- [ ] `notifications` - Has notification records
- [ ] `demo_permissions` - Exists (may be empty)

### Storage (Storage section)
- [ ] `demo-videos` bucket exists
- [ ] `demo-pdfs` bucket exists
- [ ] `avatars` bucket exists
- [ ] `covers` bucket exists
- [ ] Your uploaded files appear in buckets

### Authentication (Authentication section)
- [ ] Your user account appears in Users list
- [ ] Email is confirmed (or confirmation email sent)

## ✅ Success Criteria

Your setup is complete when:

1. ✅ You can sign up and sign in
2. ✅ Your profile appears in the header
3. ✅ You can create/edit your profile
4. ✅ You can upload demos (video or PDF)
5. ✅ You can browse other experts
6. ✅ You can propose exchanges
7. ✅ Notifications work
8. ✅ All data persists after page refresh

## 🎉 Next Steps

Once setup is complete:

1. **Invite Users**: Share the app with friends to test exchanges
2. **Add Content**: Upload more demos to showcase your skills
3. **Customize**: Adjust styling and branding as needed
4. **Deploy**: Deploy to production (Vercel, Netlify, etc.)
5. **Monitor**: Check Supabase logs and analytics

## 📚 Documentation

For detailed information, see:
- `BACKEND_INTEGRATION_GUIDE.md` - Complete integration details
- `DATABASE.md` - Full database schema
- `DB_QUICK_START.md` - Quick database reference
- `supabase_setup.sql` - Database setup script

## 🆘 Need Help?

If you're stuck:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Review the troubleshooting section above
4. Check `BACKEND_INTEGRATION_GUIDE.md` for detailed solutions

---

**Estimated Total Setup Time**: 20 minutes

**Difficulty Level**: Beginner-friendly

**Prerequisites**: 
- Node.js installed
- Supabase account created
- Project credentials in `.env` file

Good luck! 🚀
