# Mind2Mind Database Quick Start

## 🚀 Quick Reference

### Most Common Operations

#### Browse Experts
```typescript
import { useSearchProfiles } from '@/lib/hooks';

const { results, loading } = useSearchProfiles(
  'React',              // search query
  'Technology',         // category
  true,                 // verified only
  true                  // available only
);
```

#### Get Expert Profile
```typescript
import { useProfile } from '@/lib/hooks';

const { profile, loading } = useProfile(profileId);
```

#### Propose an Exchange
```typescript
import { createExchangeRequest } from '@/lib/db-helpers';

await createExchangeRequest(
  myProfileId,
  expertProfileId,
  'React',     // skill I teach
  'Spanish'    // skill I want to learn
);
```

#### Send Message in Exchange
```typescript
import { sendExchangeMessage } from '@/lib/db-helpers';

await sendExchangeMessage(exchangeId, 'Great! When can we start?');
```

#### Accept Exchange
```typescript
import { updateExchangeStatus } from '@/lib/db-helpers';

await updateExchangeStatus(exchangeId, 'accepted');
```

#### Submit Review
```typescript
import { createReview } from '@/lib/db-helpers';

await createReview(exchangeId, revieweeProfileId, 5, 'Excellent!');
```

#### Get Real-time Messages
```typescript
import { useExchangeMessages } from '@/lib/hooks';

const { messages, loading } = useExchangeMessages(exchangeId);
// Messages update in real-time automatically
```

---

## 📊 Dashboard Stats

```typescript
import { useDashboardStats } from '@/lib/hooks';

const { stats, loading } = useDashboardStats();

// Returns:
// - total_exchanges
// - pending_exchanges
// - completed_exchanges
// - average_rating
// - total_reviews
// - demos_published
// - skills_taught
// - skills_learning
// - response_rate
// - new_notifications
```

---

## 🔔 Notifications

```typescript
import { useNotifications, useUnreadNotificationCount } from '@/lib/hooks';

// Get all notifications
const { notifications, loading } = useNotifications();

// Get unread count
const { count } = useUnreadNotificationCount();

// Mark as read
import { markNotificationAsRead } from '@/lib/db-helpers';
await markNotificationAsRead(notificationId);

// Mark all as read
import { markAllNotificationsAsRead } from '@/lib/db-helpers';
await markAllNotificationsAsRead();
```

---

## 🎬 Knowledge Demos

```typescript
import { useDemos, useLikeDemo } from '@/lib/hooks';

// Get demos for a profile
const { demos, loading } = useDemos(profileId, 50);

// Like a demo
const { liked, toggleLike } = useLikeDemo(demoId);
<button onClick={toggleLike}>
  {liked ? '❤️ Unlike' : '🤍 Like'}
</button>
```

---

## 👤 Profile Management

### Update Current Profile
```typescript
import { updateUserProfile } from '@/lib/db-helpers';

await updateUserProfile(profileId, {
  display_name: 'New Name',
  bio: 'New bio',
  location: 'New Location'
});
```

### Manage Skills
```typescript
import { 
  addTeachingSkill, 
  removeTeachingSkill,
  addLearningSkill,
  removeLearningSkill 
} from '@/lib/db-helpers';

// Add a skill I teach
await addTeachingSkill(profileId, 'React');

// Remove a skill
await removeTeachingSkill(profileId, 'React');

// Same for learning skills
await addLearningSkill(profileId, 'Spanish');
await removeLearningSkill(profileId, 'Spanish');
```

### Availability
```typescript
import { updateProfileAvailability } from '@/lib/db-helpers';

// Set available for exchanges
await updateProfileAvailability(profileId, true);

// Set busy
await updateProfileAvailability(profileId, false);
```

---

## 💬 Exchange Messages (Real-time)

```typescript
import { useExchangeMessages } from '@/lib/hooks';
import { sendExchangeMessage } from '@/lib/db-helpers';

function ChatWindow({ exchangeId }) {
  const { messages } = useExchangeMessages(exchangeId);
  
  const handleSend = async (text) => {
    await sendExchangeMessage(exchangeId, text);
    // Messages automatically update in real-time
  };
  
  return (
    <>
      {messages.map(msg => (
        <div key={msg.id}>{msg.message}</div>
      ))}
      <input onSubmit={handleSend} />
    </>
  );
}
```

---

## 🌟 Recommendations & Search

### Get Recommended Experts for a Skill
```typescript
import { useRecommendedExperts } from '@/lib/hooks';

const { experts, loading } = useRecommendedExperts('React', 10);
```

### Full-Text Search
```typescript
import { useSearchProfiles } from '@/lib/hooks';

const { results, loading } = useSearchProfiles(
  query,                  // search term
  category,              // optional: 'Technology', 'Design', etc
  verifyOnly,            // optional: true for video-verified only
  availableOnly,         // optional: true for available only
  limit                  // optional: default 20
);
```

---

## 📈 Ratings & Reviews

### Get Profile Reviews
```typescript
import { useProfileReviews } from '@/lib/hooks';

const { reviews, loading } = useProfileReviews(profileId);
```

### Create Review After Exchange
```typescript
import { createReview } from '@/lib/db-helpers';

// Only possible after exchange is completed
await createReview(
  exchangeId,
  revieweeProfileId,
  4,                    // rating 1-5
  'Great experience!'   // comment
);
```

---

## ⚙️ User Preferences

```typescript
import { useUserPreferences, updateUserPreferences } from '@/lib/hooks';

// Get preferences
const { preferences, loading } = useUserPreferences();

// Update preferences
await updateUserPreferences({
  email_notifications: false,
  theme_preference: 'dark',
  language_preference: 'es'
});
```

---

## 🏆 Skill Endorsements

```typescript
import { useSkillEndorsements, useEndorseSkill } from '@/lib/hooks';

// Get endorsements for a profile
const { endorsements, loading } = useSkillEndorsements(profileId);

// Endorse a skill
const { endorse, loading } = useEndorseSkill(profileId, 'React');
await endorse();
```

---

## 🎯 Exchange Validation

```typescript
import { canUsersExchange } from '@/lib/db-helpers';

const canExchange = await canUsersExchange(userId1, userId2);
if (canExchange) {
  // Can propose exchange
}
```

---

## 📝 Activity Logging

```typescript
import { logActivity } from '@/lib/db-helpers';

// Log an action
await logActivity('profile_updated', {
  changes: { bio: 'new bio' }
});
```

---

## 🛠️ Utility Functions

```typescript
import {
  formatDate,           // 'Jan 15, 2025'
  formatRelativeTime,   // '2h ago'
  calculateResponseTime, // hours between dates
  getInitials,          // 'MC' for Maya Chen
  formatRating,         // '4.95'
  getUserExchangeHistory,
  getProfileWithStats
} from '@/lib/db-helpers';

// Examples
formatDate('2025-01-15T10:30:00Z');  // 'Jan 15, 2025'
formatRelativeTime('2025-01-15T10:30:00Z'); // '2h ago'
getInitials('Maya Chen'); // 'MC'
formatRating(4.95); // '4.95'
```

---

## 🔄 Exchange Workflow

```
1. Browse experts
   → useSearchProfiles()

2. View profile
   → useProfile()

3. Create exchange request
   → createExchangeRequest()
   (triggers notification to provider)

4. Provider accepts/declines
   → updateExchangeStatus('accepted'|'declined')
   (triggers notification to requester)

5. Exchange conversations
   → useExchangeMessages()
   → sendExchangeMessage()
   (real-time messages)

6. Mark complete
   → updateExchangeStatus('completed')

7. Submit review
   → createReview()
   (triggers notification + rating recalculation)
```

---

## 🔐 Authentication Pattern

```typescript
import { useAuth } from '@/context/AuthContext';

function Component() {
  const { user, signIn, signUp, signOut } = useAuth();
  
  if (!user) {
    return <AuthModal />;
  }
  
  return <Dashboard />;
}
```

---

## 📱 Common Component Patterns

### Profile Card
```typescript
function ProfileCard({ profile }) {
  const { reviews } = useProfileReviews(profile.id);
  
  return (
    <div>
      <img src={profile.avatar_url} />
      <h3>{profile.display_name}</h3>
      <div>Rating: {profile.rating} ({reviews.length} reviews)</div>
      <div>Skills: {profile.teaching_skills.join(', ')}</div>
      <button onClick={() => proposeExchange(profile)}>
        Propose Exchange
      </button>
    </div>
  );
}
```

### Exchange Card
```typescript
function ExchangeCard({ exchange }) {
  const { messages } = useExchangeMessages(exchange.id);
  
  return (
    <div>
      <span>{exchange.requester_skill} ↔ {exchange.provider_skill}</span>
      <span className={`status-${exchange.status}`}>
        {exchange.status}
      </span>
      <div>{messages.length} messages</div>
    </div>
  );
}
```

### Notification List
```typescript
function NotificationCenter() {
  const { notifications } = useNotifications();
  const { count } = useUnreadNotificationCount();
  
  return (
    <div>
      <h3>Notifications ({count} unread)</h3>
      {notifications.map(notif => (
        <div key={notif.id}>
          <strong>{notif.title}</strong>
          <p>{notif.message}</p>
          <time>{formatRelativeTime(notif.created_at)}</time>
        </div>
      ))}
    </div>
  );
}
```

---

## 🚨 Error Handling

All functions throw errors on failure:

```typescript
try {
  await createExchangeRequest(...);
} catch (error) {
  console.error('Failed to create exchange:', error.message);
  // Show error to user
}
```

---

## 📚 Full Documentation

See `DATABASE.md` for complete schema documentation and advanced usage.
