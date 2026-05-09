# Fix: "Could not find the 'category' column" Error

## Problem
The `category` column doesn't exist in the `profiles` table in your Supabase database.

## Solution (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the SQL Script
1. Click **New Query**
2. Copy the content from `add_category_column.sql`
3. Paste it into the SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Wait for "Success" message

### Step 3: Verify
You should see a message: "Category column added successfully!"

### Step 4: Refresh Your App
1. Go back to your application
2. Refresh the page (F5)
3. Try editing your profile again
4. The error should be gone!

---

## Alternative: Run Full Setup Script

If you want to set up everything at once:

1. Open Supabase SQL Editor
2. Copy content from `supabase_setup.sql`
3. Paste and run
4. This will add the category column AND set up storage buckets

---

## What This Does

The script adds a new `category` column to your `profiles` table with:
- Valid values: Technology, Design, Language, Music, Fitness, Cooking, Business, Arts
- Optional (can be NULL)
- Indexed for fast filtering
- Validation constraint to ensure only valid categories

---

## After Running the Script

You'll be able to:
- ✅ Select a category when creating/editing your profile
- ✅ Filter experts by category on Browse page
- ✅ See real category counts on homepage
- ✅ No more "category column not found" error

---

## Quick Copy-Paste

```sql
-- Just copy this and paste in Supabase SQL Editor:

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS category text;

ALTER TABLE profiles ADD CONSTRAINT profiles_category_check 
  CHECK (category IN ('Technology', 'Design', 'Language', 'Music', 'Fitness', 'Cooking', 'Business', 'Arts') OR category IS NULL);

CREATE INDEX IF NOT EXISTS idx_profiles_category ON profiles(category);
```

---

**Estimated Time**: 2 minutes
**Difficulty**: Easy
**Risk**: None (safe to run)
