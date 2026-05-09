# Mind2Mind Database Documentation

## Overview

The Mind2Mind platform uses Supabase PostgreSQL for data persistence with Row Level Security (RLS) for access control. This document describes the complete database schema, relationships, and usage patterns.

## Tables

### 1. `skill_categories`

Master list of skill categories for organizing expertise.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Category name (unique) |
| icon | text | Lucide icon name |
| color | text | Tailwind color class |
| description | text | Category description |
| created_at | timestamptz | Creation timestamp |

**RLS Policies:**
- Public read access (anonymous & authenticated)
- No direct write access (admin only)

**Indexes:** `name`

---

### 2. `profiles`

User profiles with expertise and learning interests.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Auth user reference (unique) |
| display_name | text | Public display name |
| username | text | Unique username |
| avatar_url | text | Profile picture URL |
| cover_url | text | Cover image URL |
| bio | text | User biography |
| location | text | Geographic location |
| video_verified | boolean | Verified via video |
| verification_video_url | text | Video proof URL |
| teaching_skills | text[] | Array of skills user teaches |
| learning_skills | text[] | Array of skills user wants to learn |
| rating | numeric(3,2) | Average rating (0-5) |
| review_count | integer | Total reviews received |
| exchange_count | integer | Completed exchanges |
| response_rate | integer | Response rate % (0-100) |
| languages | text[] | Spoken languages |
| is_available | boolean | Currently available for exchanges |
| is_demo | boolean | Demo profile flag |
| member_since | timestamptz | Join date |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

**RLS Policies:**
- Public read access
- Authenticated users can create their own profile
- Users can only update their own profile

**Indexes:** `user_id`, `username`, `is_available`, `created_at DESC`, `rating DESC`

**Triggers:**
- Auto-update `updated_at` on modification

---

### 3. `knowledge_demos`

Video demonstrations of teaching expertise.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| profile_id | uuid | Profile reference |
| user_id | uuid | Auth user reference |
| title | text | Demo title |
| description | text | Demo description |
| video_url | text | Video file URL |
| thumbnail_url | text | Preview image URL |
| skill_name | text | Skill being taught |
| category | text | Skill category |
| duration_seconds | integer | Video length |
| views | integer | View count |
| likes | integer | Like count |
| is_published | boolean | Publication status |
| created_at | timestamptz | Creation timestamp |

**RLS Policies:**
- Published demos: public read
- Unpublished: owner only
- Insert/Update/Delete: owner only

**Indexes:** `profile_id`, `user_id`, `is_published`, `views DESC`, `created_at DESC`, `skill_name`

**Triggers:**
- Auto-sync like count from `demo_likes` table

---

### 4. `exchange_requests`

Skill exchange proposals between users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| requester_profile_id | uuid | Profile of requesting user |
| provider_profile_id | uuid | Profile of skill provider |
| requester_id | uuid | Requesting user ID |
| provider_id | uuid | Provider user ID |
| requester_skill | text | Skill requester teaches |
| provider_skill | text | Skill provider teaches |
| message | text | Proposal message |
| status | text | pending/accepted/declined/completed/cancelled |
| notes | text | Internal notes |
| scheduled_date | timestamptz | Proposed exchange date |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

**RLS Policies:**
- Participants can view their own exchanges
- Insert: authenticated users only
- Update/Delete: participants only

**Indexes:** `requester_id`, `provider_id`, `status`, `created_at DESC`, `requester_profile_id`, `provider_profile_id`

**Triggers:**
- Auto-update `updated_at` on modification
- Create notifications on status change

---

### 5. `reviews`

Post-exchange ratings and feedback.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| exchange_id | uuid | Exchange reference |
| reviewer_id | uuid | Reviewer user ID |
| reviewee_profile_id | uuid | Reviewed profile |
| rating | integer | Rating 1-5 stars |
| comment | text | Review text |
| helpful_count | integer | Helpful votes |
| created_at | timestamptz | Creation timestamp |

**RLS Policies:**
- Public read access
- Insert: after exchange completion only
- Update/Delete: reviewer only

**Indexes:** `exchange_id`, `reviewer_id`, `reviewee_profile_id`, `rating`, `created_at DESC`

**Triggers:**
- Recalculate profile rating after insert
- Create notification for reviewee

---

### 6. `demo_likes`

User likes on knowledge demos.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| demo_id | uuid | Demo reference |
| user_id | uuid | User who liked |
| created_at | timestamptz | Like timestamp |

**Constraints:** Unique on (demo_id, user_id)

**RLS Policies:**
- Public read access
- Insert: authenticated users only
- Delete: liker only

**Indexes:** `demo_id`, `user_id`, `created_at DESC`

**Triggers:**
- Auto-increment/decrement demo like count

---

### 7. `notifications`

System notifications for users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Recipient user ID |
| type | text | exchange_request/accepted/declined/review_received/message/milestone |
| title | text | Notification title |
| message | text | Notification message |
| related_id | uuid | Related entity ID (exchange, review, etc.) |
| is_read | boolean | Read status |
| created_at | timestamptz | Creation timestamp |

**RLS Policies:**
- Users can only view their own notifications
- Users can update/delete their own notifications

**Indexes:** `user_id`, `is_read`, `created_at DESC`

---

### 8. `user_preferences`

User notification and platform preferences.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User reference (unique) |
| email_notifications | boolean | Email notification toggle |
| exchange_notifications | boolean | Exchange notification toggle |
| review_notifications | boolean | Review notification toggle |
| message_notifications | boolean | Message notification toggle |
| language_preference | text | Language code (en/es/fr/de/it/pt/ja/zh) |
| theme_preference | text | light/dark/auto |
| newsletter_subscribed | boolean | Newsletter subscription |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

**RLS Policies:**
- Users can only view/update their own preferences

**Indexes:** `user_id`

**Triggers:**
- Auto-update `updated_at` on modification

---

### 9. `skill_endorsements`

Community endorsements for user skills.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| endorser_id | uuid | User giving endorsement |
| endorsee_profile_id | uuid | Profile being endorsed |
| skill_name | text | Skill being endorsed |
| created_at | timestamptz | Endorsement timestamp |

**Constraints:** Unique on (endorser_id, endorsee_profile_id, skill_name)

**RLS Policies:**
- Public read access
- Insert: authenticated users only
- Delete: endorser only

**Indexes:** `endorser_id`, `endorsee_profile_id`, `skill_name`, `created_at DESC`

---

### 10. `exchange_messages`

In-app messaging within exchanges.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| exchange_id | uuid | Exchange reference |
| sender_id | uuid | Message sender |
| message | text | Message content (1-5000 chars) |
| created_at | timestamptz | Sent timestamp |
| updated_at | timestamptz | Last edit timestamp |

**RLS Policies:**
- Exchange participants can view messages
- Participants can send/edit/delete their own messages

**Indexes:** `exchange_id`, `sender_id`, `created_at DESC`

**Triggers:**
- Auto-update `updated_at` on modification
- Real-time subscriptions via Supabase

---

### 11. `exchange_stats` (Denormalized)

Cached statistics for performance.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| profile_id | uuid | Profile reference (unique) |
| total_exchanges | integer | All exchanges count |
| completed_exchanges | integer | Completed count |
| pending_exchanges | integer | Pending count |
| average_rating | numeric(3,2) | Average rating |
| total_reviews | integer | Total reviews |
| positive_reviews | integer | 4-5 star reviews |
| negative_reviews | integer | 1-2 star reviews |
| response_time_hours | numeric | Avg response time |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

**RLS Policies:**
- Public read access

**Indexes:** `profile_id`, `completed_exchanges DESC`, `average_rating DESC`

---

### 12. `featured_profiles`

Curated list of top experts.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| profile_id | uuid | Profile reference (unique) |
| featured_reason | text | Why featured |
| featured_until | timestamptz | Feature expiry |
| display_order | integer | Display priority |
| created_at | timestamptz | Creation timestamp |

**RLS Policies:**
- Public read access (only active features)

**Indexes:** `profile_id`, `featured_until DESC`, `display_order`

---

### 13. `user_activity_log` (Audit Trail)

Audit trail of user actions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User reference |
| action | text | Action type |
| details | jsonb | Action details |
| ip_address | text | User IP |
| user_agent | text | Browser info |
| created_at | timestamptz | Timestamp |

**RLS Policies:**
- Users can only view their own activity

**Indexes:** `user_id`, `action`, `created_at DESC`

---

## Helper Functions

### `get_profile_with_stats(profile_id uuid)`

Returns profile with enriched stats and counts.

```sql
SELECT * FROM get_profile_with_stats('profile-uuid');
```

### `recalculate_profile_rating(profile_id uuid)`

Recalculates average rating from reviews.

```sql
SELECT recalculate_profile_rating('profile-uuid');
```

### `get_recommended_experts(learning_skill text, limit_count int, exclude_user_id uuid)`

Get experts teaching a specific skill.

```sql
SELECT * FROM get_recommended_experts('React', 10, 'user-uuid');
```

### `search_profiles(...)`

Full-text search with multiple filters.

```sql
SELECT * FROM search_profiles(
  'React',           -- search_query
  'Technology',      -- category_filter
  false,             -- verify_only
  true,              -- available_only
  4.0,               -- min_rating
  20,                -- limit_count
  0                  -- offset_count
);
```

### `get_user_exchange_history(user_id uuid, limit_count int)`

Get user's exchange history with details.

### `can_users_exchange(user_1_id uuid, user_2_id uuid)`

Check if two users can exchange (validation).

### `get_user_dashboard_stats(user_id uuid)`

Get comprehensive dashboard stats.

---

## Frontend Hooks

All database operations are abstracted into React hooks in `src/lib/hooks.ts`:

### Profile Hooks
- `useProfile(profileId)` - Single profile
- `useProfiles(filter)` - Multiple profiles
- `useCurrentUserProfile()` - Current user's profile

### Demo Hooks
- `useDemos(profileId, limit)` - Knowledge demos
- `useLikeDemo(demoId)` - Like/unlike demo

### Exchange Hooks
- `useExchanges(userId)` - User's exchanges
- `usePendingExchanges(userId)` - Pending only
- `useExchangeMessages(exchangeId)` - Messages with real-time

### Review Hooks
- `useProfileReviews(profileId)` - Reviews for profile

### Notification Hooks
- `useNotifications()` - User's notifications
- `useUnreadNotificationCount()` - Unread count

### Search Hooks
- `useRecommendedExperts(skillName)` - Recommended
- `useSearchProfiles(query, filters)` - Full search

### Stats Hooks
- `useDashboardStats()` - Dashboard stats

---

## Database Helpers

Common operations in `src/lib/db-helpers.ts`:

### Exchanges
- `createExchangeRequest()` - Propose exchange
- `updateExchangeStatus()` - Accept/decline/complete
- `sendExchangeMessage()` - Send message

### Reviews
- `createReview()` - Submit review

### Profile Management
- `updateUserProfile()` - Update profile
- `addTeachingSkill()` / `removeTeachingSkill()`
- `addLearningSkill()` / `removeLearningSkill()`

### Notifications
- `markNotificationAsRead()`
- `markAllNotificationsAsRead()`
- `deleteNotification()`

### Utilities
- `formatDate()` - Format timestamps
- `formatRelativeTime()` - Relative time (e.g., "2h ago")
- `calculateResponseTime()` - Hours between dates
- `getInitials()` - User initials

---

## Usage Examples

### Creating an Exchange Request

```typescript
import { createExchangeRequest } from '@/lib/db-helpers';

await createExchangeRequest(
  myProfileId,
  expertProfileId,
  'React',           // What I teach
  'Spanish',         // What I want to learn
  'Hi, I\'d love to learn Spanish from you!'
);
```

### Accepting an Exchange

```typescript
import { updateExchangeStatus } from '@/lib/db-helpers';

await updateExchangeStatus(exchangeId, 'accepted');
```

### Fetching Recommended Experts

```typescript
import { useRecommendedExperts } from '@/lib/hooks';

function Component() {
  const { experts, loading } = useRecommendedExperts('React', 10);
  
  return experts.map(expert => <ExpertCard key={expert.id} expert={expert} />);
}
```

### Real-time Messages

```typescript
import { useExchangeMessages } from '@/lib/hooks';

function ChatWindow({ exchangeId }) {
  const { messages, loading } = useExchangeMessages(exchangeId);
  
  // Messages update in real-time via Supabase subscriptions
  return messages.map(msg => <Message key={msg.id} {...msg} />);
}
```

### Submitting a Review

```typescript
import { createReview } from '@/lib/db-helpers';

await createReview(
  exchangeId,
  revieweeProfileId,
  5,                 // Rating
  'Excellent teacher! Very helpful.' // Comment
);
```

---

## Security Model

### Row Level Security (RLS)

All tables have RLS enabled. Key policies:

1. **Profiles**: Public read, authenticated users create their own, only owner can update
2. **Knowledge Demos**: Published demos are public, unpublished are owner-only
3. **Exchanges**: Only participants can view their own exchanges
4. **Reviews**: Public read, authenticated users can only review completed exchanges
5. **Notifications**: Users can only access their own
6. **Messages**: Only exchange participants can view/send messages
7. **Activity Logs**: Users can only view their own history

### Constraints

- Ratings are constrained to 1-5
- Counts have >= 0 checks
- Message length is 1-5000 characters
- Email/response_rate are percentage bounded

### Audit Trail

All user actions are logged to `user_activity_log` for compliance and debugging.

---

## Performance Optimization

### Indexes

Strategic indexes on:
- Foreign keys (user_id, profile_id)
- Status fields for filtering
- Timestamps for sorting
- Common search fields

### Denormalization

The `exchange_stats` table caches counts and ratings to avoid expensive aggregations.

### Triggers

Automatic triggers maintain:
- `updated_at` timestamps
- Denormalized like counts
- Profile rating calculations

### Pagination

All list endpoints support `limit` and `offset` for efficient pagination.

---

## Migration Pattern

New features should follow this pattern:

1. Create migration file: `create_feature_table.sql`
2. Define schema with constraints and defaults
3. Enable RLS and create policies
4. Add strategic indexes
5. Create triggers if needed
6. Add TypeScript types in `types/index.ts`
7. Create React hooks in `lib/hooks.ts`
8. Add helper functions in `lib/db-helpers.ts`

---

## Maintenance

### Regular Tasks

- Review and prune old audit logs
- Update featured profiles expiry
- Monitor table sizes
- Analyze query performance

### Backups

Supabase handles automated backups. Restore via Supabase dashboard.

### Extensions

Current extensions needed:
- `uuid-ossp` (UUID generation)
- `pljson` (JSON functions)

All are pre-enabled in Supabase.
