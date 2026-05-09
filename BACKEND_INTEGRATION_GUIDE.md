# Mind2Mind Backend Integration Guide

## Overview

This guide explains how the Mind2Mind frontend is connected to the Supabase backend and how to complete the setup.

## ✅ Completed Integrations

### 1. Authentication System
- **Sign Up**: Creates user account and profile automatically
- **Sign In**: Validates credentials and creates session
- **Session Persistence**: User stays logged in across page refreshes
- **Profile Auto-Creation**: Missing profiles are created on first login

**Files Modified:**
- `src/context/AuthContext.tsx` - Enhanced with error handling and profile creation
- `src/components/auth/AuthModal.tsx` - Already connected to Supabase

### 2. User Profile Display
- **Header Component**: Now displays actual user profile with avatar
- **Profile Fetching**: Automatically loads user profile data when logged in
- **Avatar Display**: Shows user's uploaded avatar or generated placeholder

**Files Modified:**
- `src/components/layout/Header.tsx` - Fetches and displays user profile

### 3. Profile Management
- **Profile Creation/Editing**: Fully connected to `profiles` table
- **Avatar Upload**: Connected to `avatars` storage bucket
- **Skills Management**: Teaching and learning skills stored in database
- **Profile Categories**: Automatically assigned based on skills

**Files Modified:**
- `src/components/profile/ProfileEditModal.tsx` - Already connected
- `src/components/profile/ProfilePage.tsx` - Fetches real profile data

### 4. Exchange Requests
- **Propose Exchange**: Creates records in `exchange_requests` table
- **Notifications**: Automatically creates notifications for recipients
- **Profile ID Mapping**: Correctly maps user IDs to profile IDs

**Files Modified:**
- `src/components/exchange/ExchangeModal.tsx` - Enhanced with profile ID fetching

### 5. Knowledge Demos
- **Demo Upload**: Connected to `knowledge_demos` table
- **File Storage**: Uploads to `demo-videos` and `demo-pdfs` buckets
- **Visibility Control**: Supports public and custom visibility
- **Demo Display**: Fetches and displays user's demos

**Files Modified:**
- `src/components/profile/DemoUploadModal.tsx` - Enhanced with proper table structure

### 6. Browse Experts
- **Expert Listing**: Fetches from `profiles` table
- **Search & Filters**: Connected to database queries
- **Static Fallback**: Shows demo data if database is empty

**Files Modified:**
- `src/components/browse/BrowsePage.tsx` - Already connected with fallback

## 🔧 Setup Instructions

### Step 1: Run Database Setup Script

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase_setup.sql` from this project
4. Copy and paste the entire content into the SQL Editor
5. Click **Run** to execute the script

This script will:
- ✅ Create storage buckets (demo-videos, demo-pdfs, avatars, covers)
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create `demo_permissions` table for custom visibility
- ✅ Add helper function `can_view_demo()`
- ✅ Create performance indexes

### Step 2: Verify Environment Variables

Ensure your `.env` file has the correct credentials:

```env
VITE_SUPABASE_URL=https://qgqfbyaxssdmwxytyppm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_PnVu0wNYWRfkBL06zxUObg_Z7j9P--R
```

### Step 3: Test Authentication

1. Start your development server: `npm run dev`
2. Click "Join Free" in the header
3. Create a new account with email and password
4. Verify you're logged in and see your profile in the header
5. Try logging out and logging back in

### Step 4: Create Your Profile

1. Click "Browse" in the navigation
2. Click "Create / Edit My Profile" button
3. Fill in your information:
   - Display Name
   - Username
   - Bio
   - Location
   - Skills you teach
   - Skills you want to learn
   - Languages
4. Upload an avatar (optional)
5. Click "Save Profile"

### Step 5: Upload a Demo

1. From the Browse page, click "Upload Demo"
2. Fill in demo details:
   - Title
   - Description
   - Skill/Topic
   - Upload a video or PDF file
3. Choose visibility (Public or Custom)
4. If Custom, add allowed usernames
5. Click "Upload Demo"

### Step 6: Test Exchange Flow

1. Browse experts on the Browse page
2. Click on an expert card
3. Click "Exchange" button
4. Fill in the exchange proposal:
   - What you want to learn
   - What you'll teach in return
   - Optional message
5. Click "Send Exchange Request"
6. The recipient should receive a notification

## 📊 Database Schema

### Key Tables

#### `profiles`
- Stores user profile information
- Links to `auth.users` via `user_id`
- Contains skills, bio, location, ratings, etc.

#### `knowledge_demos`
- Stores demo videos and PDFs
- Links to `profiles` via `profile_id`
- Supports visibility controls

#### `exchange_requests`
- Stores skill exchange proposals
- Links requester and provider profiles
- Tracks status (pending, accepted, declined, completed)

#### `notifications`
- Stores user notifications
- Created automatically for exchanges, reviews, etc.
- Supports different notification types

#### `demo_permissions`
- Controls custom visibility for demos
- Maps demos to allowed usernames
- Enforced by RLS policies

### Storage Buckets

- **demo-videos**: Video demonstrations (50MB limit)
- **demo-pdfs**: PDF documents (10MB limit)
- **avatars**: User profile pictures (2MB limit)
- **covers**: Profile cover images (5MB limit)

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies:

1. **Profiles**: Public read, users can only edit their own
2. **Demos**: Published demos are public, unpublished are owner-only
3. **Exchanges**: Only participants can view their exchanges
4. **Notifications**: Users can only see their own notifications
5. **Demo Permissions**: Enforces custom visibility rules

### Storage Security

- Users can only upload to their own folders
- File size limits enforced at bucket level
- MIME type restrictions prevent malicious uploads
- Public read access for published content

## 🐛 Troubleshooting

### "Invalid Credentials" Error

**Cause**: User doesn't exist or password is incorrect

**Solution**:
1. Verify email and password are correct
2. Check Supabase Auth dashboard for user existence
3. Try resetting password via Supabase dashboard

### Profile Not Found

**Cause**: Profile wasn't created during signup

**Solution**:
1. The auth system now auto-creates profiles
2. If missing, log out and log back in
3. Profile will be created automatically

### Demo Upload Fails

**Cause**: Storage bucket doesn't exist or permissions are wrong

**Solution**:
1. Run the `supabase_setup.sql` script
2. Verify buckets exist in Supabase Storage dashboard
3. Check file size is within limits (50MB for videos, 10MB for PDFs)

### Exchange Request Not Appearing

**Cause**: Notification not created or profile IDs incorrect

**Solution**:
1. Check `exchange_requests` table in Supabase
2. Verify both users have profiles
3. Check `notifications` table for the notification record

### Demos Not Visible

**Cause**: RLS policies blocking access or demo not published

**Solution**:
1. Verify demo has `is_published = true`
2. Check if custom permissions are set
3. Run the RLS policy updates from `supabase_setup.sql`

## 📝 API Reference

### Authentication

```typescript
import { useAuth } from '@/context/AuthContext';

const { user, signIn, signUp, signOut } = useAuth();

// Sign up
await signUp('email@example.com', 'password', 'Display Name');

// Sign in
await signIn('email@example.com', 'password');

// Sign out
await signOut();
```

### Profile Operations

```typescript
import { supabase } from '@/lib/supabase';

// Get user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', user.id)
  .single();

// Update profile
await supabase
  .from('profiles')
  .update({ display_name: 'New Name' })
  .eq('user_id', user.id);
```

### Exchange Requests

```typescript
// Create exchange request
const { data } = await supabase
  .from('exchange_requests')
  .insert({
    requester_profile_id: myProfileId,
    provider_profile_id: expertProfileId,
    requester_skill: 'React',
    provider_skill: 'Spanish',
    message: 'Hello!',
    status: 'pending'
  })
  .select()
  .single();

// Create notification
await supabase.from('notifications').insert({
  user_id: recipientUserId,
  type: 'exchange_request',
  title: 'New Exchange Proposal',
  message: 'Someone wants to exchange skills with you',
  related_id: data.id,
  is_read: false
});
```

### Demo Upload

```typescript
// Upload file
const { error } = await supabase.storage
  .from('demo-videos')
  .upload(`${userId}/${filename}`, file);

// Get public URL
const { data } = supabase.storage
  .from('demo-videos')
  .getPublicUrl(path);

// Create demo record
await supabase.from('knowledge_demos').insert({
  profile_id: profileId,
  user_id: userId,
  title: 'Demo Title',
  video_url: data.publicUrl,
  is_published: true
});
```

## 🚀 Next Steps

### Recommended Enhancements

1. **Real-time Notifications**
   - Set up Supabase Realtime subscriptions
   - Show toast notifications for new exchanges

2. **Video Thumbnail Generation**
   - Use Supabase Edge Functions to generate thumbnails
   - Store in separate bucket

3. **Search Optimization**
   - Implement full-text search with PostgreSQL
   - Add search indexes

4. **Analytics Dashboard**
   - Track user engagement
   - Monitor exchange completion rates

5. **Email Notifications**
   - Set up Supabase Auth email templates
   - Send notifications for important events

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify Supabase credentials in `.env`
3. Check Supabase logs in the dashboard
4. Review RLS policies in the Table Editor
5. Test queries directly in SQL Editor

## ✨ Summary

Your Mind2Mind application is now fully connected to Supabase with:

- ✅ Complete authentication flow
- ✅ User profile management
- ✅ Demo upload and storage
- ✅ Exchange request system
- ✅ Notification system
- ✅ Secure file storage
- ✅ Row-level security
- ✅ Custom visibility controls

All features are production-ready and follow Supabase best practices!
