
/*
  # Seed Data for Mind2Mind Platform

  ## Changes
  - Inserts 8 skill categories covering major domains
  - Inserts demo profiles to showcase platform content
  - Inserts demo knowledge demos linked to profiles

  ## Categories Added
  Technology, Design, Business, Languages, Music, Fitness, Cooking, Arts & Crafts

  ## Notes
  - Demo profiles use is_demo = true flag
  - Demo content uses royalty-free Pexels image URLs for avatars/thumbnails
*/

-- Seed skill categories
INSERT INTO skill_categories (name, icon, color, description) VALUES
  ('Technology', 'Code', 'blue', 'Programming, software development, web & mobile'),
  ('Design', 'Palette', 'rose', 'UI/UX, graphic design, branding, illustration'),
  ('Business', 'Briefcase', 'amber', 'Marketing, finance, entrepreneurship, management'),
  ('Languages', 'Globe', 'green', 'Spoken languages, translation, communication'),
  ('Music', 'Music', 'cyan', 'Instruments, production, music theory, vocals'),
  ('Fitness', 'Dumbbell', 'orange', 'Personal training, yoga, nutrition, sports'),
  ('Cooking', 'ChefHat', 'yellow', 'Cuisine techniques, baking, nutrition, recipes'),
  ('Arts & Crafts', 'Paintbrush', 'pink', 'Painting, sculpture, photography, crafts')
ON CONFLICT DO NOTHING;

-- Seed demo profiles
INSERT INTO profiles (
  display_name, username, avatar_url, bio, location,
  video_verified, teaching_skills, learning_skills,
  rating, review_count, exchange_count, response_rate,
  languages, is_available, is_demo, member_since
) VALUES
(
  'Maya Chen',
  'maya_chen',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Full-stack developer with 8 years of experience. Passionate about React, TypeScript, and teaching others the joy of clean code.',
  'San Francisco, CA',
  true,
  ARRAY['React', 'TypeScript', 'Node.js', 'System Design'],
  ARRAY['Spanish', 'Watercolor Painting', 'Guitar'],
  4.95, 47, 23, 98,
  ARRAY['English', 'Mandarin'],
  true, true,
  now() - interval '18 months'
),
(
  'Carlos Rivera',
  'carlos_rivera',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
  'UX designer and language tutor. I''ve shipped products at top tech companies and speak 4 languages fluently.',
  'Barcelona, Spain',
  true,
  ARRAY['Spanish', 'UX Design', 'Figma', 'Portuguese'],
  ARRAY['Python', 'Machine Learning', 'Piano'],
  4.88, 34, 18, 100,
  ARRAY['Spanish', 'English', 'Portuguese', 'French'],
  true, true,
  now() - interval '14 months'
),
(
  'Aisha Patel',
  'aisha_patel',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Yoga instructor & mindfulness coach with 10+ years. Also an accomplished home chef specializing in Indian cuisine.',
  'Mumbai, India',
  true,
  ARRAY['Yoga', 'Meditation', 'Indian Cooking', 'Ayurveda'],
  ARRAY['Web Development', 'Video Editing', 'English Writing'],
  4.97, 62, 31, 99,
  ARRAY['English', 'Hindi', 'Gujarati'],
  true, true,
  now() - interval '22 months'
),
(
  'James Okafor',
  'james_okafor',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Music producer and guitarist with 15 years in the industry. Produced tracks for major labels. Now giving back.',
  'Lagos, Nigeria',
  true,
  ARRAY['Guitar', 'Music Production', 'Ableton Live', 'Music Theory'],
  ARRAY['Graphic Design', 'French Language', 'Fitness Training'],
  4.92, 28, 15, 97,
  ARRAY['English', 'Yoruba'],
  false, true,
  now() - interval '10 months'
),
(
  'Sophie Dubois',
  'sophie_dubois',
  'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Pastry chef turned food blogger. I believe food is the universal language. Teach me code, I''ll teach you croissants.',
  'Paris, France',
  true,
  ARRAY['French Language', 'French Cooking', 'Pastry Arts', 'Food Photography'],
  ARRAY['Python', 'Digital Marketing', 'Yoga'],
  4.85, 41, 20, 95,
  ARRAY['French', 'English'],
  true, true,
  now() - interval '8 months'
),
(
  'Kenji Tanaka',
  'kenji_tanaka',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Fitness coach and martial arts instructor. 3x national champion. I exchange training for tech skills.',
  'Tokyo, Japan',
  true,
  ARRAY['Fitness Training', 'Martial Arts', 'Nutrition', 'Japanese Language'],
  ARRAY['iOS Development', 'Graphic Design', 'Public Speaking'],
  4.90, 53, 27, 100,
  ARRAY['Japanese', 'English'],
  true, true,
  now() - interval '16 months'
),
(
  'Priya Sharma',
  'priya_sharma',
  'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Growth marketer and startup founder. 2 exits, 1 failure, countless lessons. I trade marketing wisdom for design skills.',
  'Bangalore, India',
  true,
  ARRAY['Digital Marketing', 'SEO', 'Growth Hacking', 'Startup Strategy'],
  ARRAY['UI Design', 'Video Production', 'German Language'],
  4.78, 19, 11, 93,
  ARRAY['English', 'Hindi'],
  true, true,
  now() - interval '6 months'
),
(
  'Luca Rossi',
  'luca_rossi',
  'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Watercolor artist and illustrator. My work has been featured in galleries across Europe. I paint, you teach.',
  'Rome, Italy',
  false,
  ARRAY['Watercolor Painting', 'Illustration', 'Drawing', 'Italian Language'],
  ARRAY['React', 'Photography', 'Business Development'],
  4.83, 22, 12, 91,
  ARRAY['Italian', 'English'],
  true, true,
  now() - interval '4 months'
)
ON CONFLICT (username) DO NOTHING;

-- Seed knowledge demos linked to demo profiles
INSERT INTO knowledge_demos (
  profile_id, title, description, thumbnail_url, skill_name, category, duration_seconds, views, likes, is_published
)
SELECT
  p.id,
  'Building a Real-Time Dashboard with React & WebSockets',
  'Watch me build a production-ready dashboard from scratch. Covers component architecture, state management, and live data.',
  'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
  'React', 'Technology', 847, 3240, 287, true
FROM profiles p WHERE p.username = 'maya_chen' AND p.is_demo = true
ON CONFLICT DO NOTHING;

INSERT INTO knowledge_demos (
  profile_id, title, description, thumbnail_url, skill_name, category, duration_seconds, views, likes, is_published
)
SELECT
  p.id,
  'UX Research Methods That Actually Work',
  'I walk through my entire UX research process — from problem framing to insights. Real project, real outcomes.',
  'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
  'UX Design', 'Design', 1203, 2180, 194, true
FROM profiles p WHERE p.username = 'carlos_rivera' AND p.is_demo = true
ON CONFLICT DO NOTHING;

INSERT INTO knowledge_demos (
  profile_id, title, description, thumbnail_url, skill_name, category, duration_seconds, views, likes, is_published
)
SELECT
  p.id,
  'Morning Yoga Flow for Beginners: 20 Minutes to Transform Your Day',
  'A gentle but effective morning sequence. I explain the "why" behind each pose so you understand the practice.',
  'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Yoga', 'Fitness', 1264, 5820, 512, true
FROM profiles p WHERE p.username = 'aisha_patel' AND p.is_demo = true
ON CONFLICT DO NOTHING;

INSERT INTO knowledge_demos (
  profile_id, title, description, thumbnail_url, skill_name, category, duration_seconds, views, likes, is_published
)
SELECT
  p.id,
  'Guitar Chord Progressions: The Secret Language of Songs',
  'I break down how nearly every popular song uses 4 chords. By the end you''ll hear music differently forever.',
  'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Guitar', 'Music', 965, 4100, 378, true
FROM profiles p WHERE p.username = 'james_okafor' AND p.is_demo = true
ON CONFLICT DO NOTHING;

INSERT INTO knowledge_demos (
  profile_id, title, description, thumbnail_url, skill_name, category, duration_seconds, views, likes, is_published
)
SELECT
  p.id,
  'Perfect Croissants from Scratch: The Laminated Dough Method',
  'The most requested demo I''ve ever done. I show every fold, every rest period, every trick I learned in culinary school.',
  'https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg?auto=compress&cs=tinysrgb&w=800',
  'Pastry Arts', 'Cooking', 1847, 7340, 689, true
FROM profiles p WHERE p.username = 'sophie_dubois' AND p.is_demo = true
ON CONFLICT DO NOTHING;

INSERT INTO knowledge_demos (
  profile_id, title, description, thumbnail_url, skill_name, category, duration_seconds, views, likes, is_published
)
SELECT
  p.id,
  'High-Intensity Interval Training: Science-Based Fat Loss',
  'I explain the physiology behind HIIT and demonstrate a 20-minute workout that has worked for 500+ of my clients.',
  'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Fitness Training', 'Fitness', 1134, 6210, 543, true
FROM profiles p WHERE p.username = 'kenji_tanaka' AND p.is_demo = true
ON CONFLICT DO NOTHING;
