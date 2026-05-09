-- Update user_preferences table to include Arabic 'ar' in language_preference constraint

DO $$
BEGIN
    -- Drop the old constraint if it exists
    ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_language_preference_check;
    
    -- Add the new constraint including 'ar'
    ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_language_preference_check 
    CHECK (language_preference IN ('en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ar'));
END $$;
