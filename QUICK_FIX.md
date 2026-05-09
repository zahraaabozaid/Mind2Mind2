# 🚨 QUICK FIX - Category Column Error

## Error Message
```
Could not find the 'category' column of 'profiles' in the schema cache
```

## ⚡ Quick Fix (30 seconds)

### Copy This SQL:
```sql
ALTER TABLE profiles ADD COLUMN category text;

ALTER TABLE profiles ADD CONSTRAINT profiles_category_check 
  CHECK (category IN ('Technology', 'Design', 'Language', 'Music', 'Fitness', 'Cooking', 'Business', 'Arts') OR category IS NULL);

CREATE INDEX idx_profiles_category ON profiles(category);
```

### Run It:
1. Open https://app.supabase.com
2. Click **SQL Editor**
3. Paste the SQL above
4. Click **Run**
5. Done! ✅

### Refresh Your App
- Press F5 in your browser
- Error should be gone!

---

## What This Does
Adds a `category` field to your profiles table so users can select their expertise category.

---

## Need Help?
See `FIX_CATEGORY_ERROR.md` for detailed instructions.
