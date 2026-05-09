# Mind2Mind Database Documentation Index

## 📚 Documentation Files

### 1. **DATABASE.md** - Complete Reference
The definitive guide to the entire database schema.
- Full table descriptions with all fields
- RLS policies explanation
- Index strategy
- Helper functions documentation
- Usage examples
- Migration patterns
- Security model
- Best practices

**When to use:** You need to understand how the database works or troubleshoot data issues.

---

### 2. **DB_QUICK_START.md** - Developer Guide
Quick reference for the 30 most common operations with code snippets.
- Most common operations with examples
- Component patterns
- Real-time patterns
- Exchange workflow diagram
- Error handling
- Utility functions

**When to use:** You're writing new features and need code examples.

---

### 3. **IMPLEMENTATION_SUMMARY.md** - Overview
High-level summary of what was built and why.
- Architecture overview
- Feature checklist
- Performance optimizations
- Security implementation
- Data flow diagrams
- Getting started guide
- Quality checklist

**When to use:** You need an overview or onboarding documentation.

---

## 🗂️ File Organization

```
Mind2Mind Project/
│
├── DATABASE.md                    ← Complete schema documentation
├── DB_QUICK_START.md             ← Developer quick reference
├── IMPLEMENTATION_SUMMARY.md     ← High-level overview
├── DATABASE_INDEX.md             ← This file
│
├── src/
│   ├── lib/
│   │   ├── supabase.ts           ← Supabase client
│   │   ├── hooks.ts              ← 20+ React hooks
│   │   └── db-helpers.ts         ← 30+ database operations
│   ├── types/
│   │   └── index.ts              ← TypeScript types for all tables
│   ├── context/
│   │   └── AuthContext.tsx       ← Authentication
│   └── components/               ← React components
│
└── supabase/
    └── migrations/               ← SQL migrations
```

---

## 🎯 Quick Navigation by Task

### I want to...

#### **Understand the Database Structure**
→ Read: DATABASE.md sections 1-6

#### **Build a New Feature**
→ Check: DB_QUICK_START.md relevant section
→ Then: src/lib/hooks.ts or db-helpers.ts for examples

#### **Add a New Table**
→ Read: DATABASE.md "Migration Pattern"
→ Create: supabase/migrations/*.sql
→ Add: types in src/types/index.ts

#### **Debug an Issue**
→ Check: DATABASE.md RLS Policies section
→ Look at: user_activity_log table data
→ Read: Console errors from hooks

#### **Optimize a Slow Query**
→ Check: DATABASE.md Indexes section
→ Look at: Query patterns in hooks.ts

#### **Add a New Hook**
→ Study: Existing hooks in lib/hooks.ts
→ Copy pattern from DB_QUICK_START.md

#### **Find Code Examples**
→ Go to: DB_QUICK_START.md
→ 30+ code snippets for all operations

---

## 📊 Database Tables Summary

| Table | Purpose | Rows | Public Read | Auth Write |
|-------|---------|------|-------------|-----------|
| **skill_categories** | Skill organization | ~10 | ✅ | ❌ |
| **profiles** | User profiles | ~1M* | ✅ | Own only |
| **knowledge_demos** | Video expertise | ~10K* | Published only | Own only |
| **exchange_requests** | Skill proposals | ~100K* | Participants only | Participants |
| **reviews** | Ratings/feedback | ~50K* | ✅ | Verified |
| **demo_likes** | Like tracking | ~100K* | ✅ | Liker only |
| **notifications** | User alerts | ~500K* | User only | System/User |
| **user_preferences** | Settings | ~100K* | User only | User only |
| **skill_endorsements** | Endorsements | ~50K* | ✅ | Auth users |
| **exchange_messages** | Chat | ~1M* | Participants only | Participants |
| **exchange_stats** | Analytics | ~100K* | ✅ | System |
| **featured_profiles** | Curation | ~50 | ✅ | ❌ |
| **user_activity_log** | Audit trail | ~1M* | User only | System |

*Projected at scale

---

## 🔑 Key Concepts

### Row Level Security (RLS)
Database-level access control. Every table has policies.

**Key Rule:** Without explicit policy, no access (secure by default)

**Common Patterns:**
- Public read, authenticated write
- Owner-only access
- Participant-only access

### Helper Functions
PostgreSQL functions that encapsulate business logic:
- `get_recommended_experts()` - Smart search
- `search_profiles()` - Full-text search
- `recalculate_profile_rating()` - Auto-compute ratings

### Custom Hooks
React hooks that fetch from database:
- Automatic loading states
- Real-time subscriptions
- Error handling

### Real-time Subscriptions
Messages and notifications update automatically via Supabase subscriptions.

---

## 🛠️ Most Used Operations

### By Frequency

1. **useSearchProfiles()** - Browse experts
2. **useProfile()** - Get single profile
3. **createExchangeRequest()** - Propose exchange
4. **updateExchangeStatus()** - Accept/complete
5. **useExchangeMessages()** - Chat (real-time)
6. **sendExchangeMessage()** - Send message
7. **createReview()** - Rate after exchange
8. **useDashboardStats()** - Dashboard data
9. **useNotifications()** - Notifications
10. **useDemos()** - Knowledge demos

---

## 🚀 Getting Started Checklist

- [ ] Read IMPLEMENTATION_SUMMARY.md (10 min)
- [ ] Skim DATABASE.md overview (5 min)
- [ ] Study 3 examples in DB_QUICK_START.md (10 min)
- [ ] Clone a hook pattern from lib/hooks.ts (15 min)
- [ ] Test with dev server: `npm run dev`
- [ ] Build to verify: `npm run build`

**Total time:** ~40 minutes to be productive

---

## 💡 Common Patterns

### Pattern 1: Browse & Select
```
useSearchProfiles() → Display list → Click expert → useProfile()
```

### Pattern 2: Propose Exchange
```
createExchangeRequest() → Notification → Provider accepts
→ updateExchangeStatus() → Chat opens
```

### Pattern 3: Complete & Review
```
Exchange complete → createReview() → Rating auto-calculated
→ Profile updated → Notification sent
```

### Pattern 4: Real-time Chat
```
useExchangeMessages() → Real-time subscription
→ New message arrives → UI auto-updates
```

---

## 🔐 Security Practices

### Don't
- ❌ Disable RLS
- ❌ Use `USING (true)` policies
- ❌ Fetch data without auth checks
- ❌ Trust client-side validation only

### Do
- ✅ Verify RLS is enabled on all tables
- ✅ Check policies are restrictive
- ✅ Use `auth.uid()` in policies
- ✅ Log sensitive actions
- ✅ Validate at both client and database

---

## 📈 Performance Tips

### Query Optimization
1. Use appropriate hooks (already optimized)
2. Add indexes for new fields
3. Use denormalized tables when available
4. Implement pagination (limit/offset)

### Real-time Performance
1. Only subscribe to needed channels
2. Unsubscribe when component unmounts
3. Use `maybeSingle()` instead of `single()`
4. Cache when possible

### Frontend Performance
1. Use React.memo for list items
2. Implement virtualization for large lists
3. Debounce search queries
4. Use code splitting for routes

---

## 🆘 Troubleshooting

### "Access denied" on data fetch
- Check RLS policies in DATABASE.md
- Verify user is authenticated
- Check policy logic matches your use case

### Hook not updating
- Verify network tab (should see API call)
- Check browser console for errors
- Ensure auth state is correct

### Messages not real-time
- Browser must be online
- Subscription must be active
- Verify exchange participants are authenticated

### Slow queries
- Check indexes in DATABASE.md
- Look for N+1 patterns
- Use EXPLAIN ANALYZE in SQL editor
- Check exchange_stats is being used

---

## 📞 Document Cross-References

### From DATABASE.md
- RLS Policies → DB_QUICK_START.md "How RLS works"
- Helper Functions → DB_QUICK_START.md "Function Reference"
- Indexes → IMPLEMENTATION_SUMMARY.md "Performance"

### From DB_QUICK_START.md
- Hook patterns → DATABASE.md "Hooks Explained"
- Error handling → DATABASE.md "Security Model"
- Component patterns → See src/components/

### From IMPLEMENTATION_SUMMARY.md
- Architecture → DATABASE.md "Tables"
- Hooks → DB_QUICK_START.md "All Hooks"
- Security → DATABASE.md "RLS Policies"

---

## ✨ What's Documented

### ✅ Complete
- All 13 tables with all fields
- Every RLS policy
- All helper functions
- All React hooks
- 30+ code examples
- Error handling patterns
- Real-time patterns
- Security practices

### 📝 Code Examples
- Browsing profiles
- Creating exchanges
- Sending messages
- Submitting reviews
- Managing preferences
- Logging activity

### 🎯 Use Cases
- Complete user workflows
- Component patterns
- Search patterns
- Real-time patterns
- Error handling

---

## 🎓 Learning Path

### For Designers
1. IMPLEMENTATION_SUMMARY.md (overview)
2. DB_QUICK_START.md (understand data flow)

### For Frontend Developers
1. DATABASE_INDEX.md (this file) - navigate
2. DB_QUICK_START.md - see examples
3. lib/hooks.ts - study patterns
4. lib/db-helpers.ts - understand operations

### For Backend/Database Developers
1. DATABASE.md - complete schema
2. supabase/migrations/ - SQL code
3. DATABASE.md "Helper Functions" - business logic
4. DATABASE.md "Performance" - optimization

### For DevOps/Deployment
1. IMPLEMENTATION_SUMMARY.md "Scalability"
2. DATABASE.md "Security Model"
3. DATABASE.md "Maintenance"

---

## 🎉 You're Ready!

With these three documents, you have everything needed to:
- Understand the complete database
- Build new features
- Debug issues
- Optimize performance
- Maintain the system

**Start with the task index above, find your scenario, and jump to the right section!**
