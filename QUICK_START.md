# Mind2Mind - Quick Start Guide 🚀

## 🎯 Get Started in 3 Steps

### Step 1: Setup Database (5 min)
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Copy content from `supabase_setup.sql`
4. Paste and click **Run**
5. ✅ Wait for success message

### Step 2: Start Application (1 min)
```bash
npm install
npm run dev
```
Open: http://localhost:5173

### Step 3: Create Account (2 min)
1. Click **"Join Free"**
2. Enter email & password
3. Enter your name
4. Click **"Create Free Account"**
5. ✅ You're logged in!

---

## ✅ Verify Everything Works

### Test 1: Profile (3 min)
1. Click **"Browse"** → **"Create / Edit My Profile"**
2. Fill in your info
3. Add skills you teach
4. Add skills you want to learn
5. Click **"Save Profile"**
6. ✅ Profile appears in Browse page

### Test 2: Upload Demo (3 min)
1. Click **"Upload Demo"**
2. Add title & description
3. Upload a video or PDF
4. Choose visibility (Public/Custom)
5. Click **"Upload Demo"**
6. ✅ Demo appears on your profile

### Test 3: Exchange Request (2 min)
1. Browse experts
2. Click on any expert
3. Click **"Exchange"**
4. Fill in what you want to learn/teach
5. Click **"Send Exchange Request"**
6. ✅ Request sent!

---

## 📋 Quick Checklist

- [ ] Database setup complete
- [ ] App running locally
- [ ] Account created
- [ ] Profile created
- [ ] Demo uploaded
- [ ] Exchange sent
- [ ] Notifications working

---

## 🆘 Quick Fixes

### Can't login?
- Check email/password
- Try creating new account
- Verify `.env` has correct credentials

### Profile not showing?
- Log out and log back in
- Check Supabase Table Editor for profile

### Upload fails?
- Run `supabase_setup.sql` script
- Check file size (videos: 50MB, PDFs: 10MB)
- Verify file type (MP4, MOV, WebM, PDF)

---

## 📚 Full Documentation

- **SETUP_CHECKLIST.md** - Detailed setup steps
- **BACKEND_INTEGRATION_GUIDE.md** - Complete integration guide
- **IMPLEMENTATION_COMPLETE.md** - What was implemented
- **DATABASE.md** - Database schema
- **supabase_setup.sql** - Database setup script

---

## 🎉 You're Ready!

Your Mind2Mind app is fully connected to Supabase and ready to use!

**Total Setup Time**: ~15 minutes
**Difficulty**: Beginner-friendly
**Status**: Production-ready ✅

---

**Need Help?** Check the troubleshooting sections in the documentation files above.
