# Mind2Mind Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    React Components                            │ │
│  ├─ HomePage          ├─ BrowsePage        ├─ ProfilePage       │ │
│  ├─ Header            ├─ ExpertCard        ├─ ExchangeModal     │ │
│  ├─ Footer            ├─ AuthModal         └─ NotificationCenter│ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ↓                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │            React Context + State Management                    │ │
│  ├─ AuthContext (User session, login/logout)                     │ │
│  ├─ Page state (current page, filters, sorting)                  │ │
│  └─ Component state (modals, loading, errors)                    │ │
│                              ↓                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │          Custom React Hooks (lib/hooks.ts)                    │ │
│  ├─ useProfile()              ├─ useDemos()                      │ │
│  ├─ useSearchProfiles()        ├─ useExchanges()                 │ │
│  ├─ useRecommendedExperts()    ├─ useExchangeMessages()          │ │
│  ├─ useNotifications()         ├─ useDashboardStats()            │ │
│  ├─ useProfileReviews()        └─ useUserPreferences()           │ │
│  └─ 10+ more hooks                                                │ │
│                              ↓                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │        Database Helpers (lib/db-helpers.ts)                   │ │
│  ├─ createExchangeRequest()     ├─ createReview()               │ │
│  ├─ sendExchangeMessage()        ├─ updateUserProfile()          │ │
│  ├─ updateExchangeStatus()       ├─ addTeachingSkill()           │ │
│  ├─ markNotificationAsRead()     ├─ updateUserPreferences()      │ │
│  └─ 20+ more helpers                                              │ │
│                              ↓                                        │
└──────────────────────────── ✂ ─────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────────┐
│                    SUPABASE LAYER (BaaS)                             │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Supabase Client (@supabase/supabase-js)           │ │
│  ├─ Authentication (signUp, signIn, signOut, getUser)            │ │
│  ├─ Database queries (CRUD operations)                           │ │
│  ├─ Real-time subscriptions (messages, updates)                  │ │
│  └─ Function calls (RPC to helper functions)                     │ │
│                              ↓                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                  PostgreSQL Database                           │ │
│  │                                                                 │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │              Core Tables (13)                            │  │ │
│  │  ├─ skill_categories      ├─ notifications                  │  │ │
│  │  ├─ profiles              ├─ user_preferences               │  │ │
│  │  ├─ knowledge_demos       ├─ skill_endorsements             │  │ │
│  │  ├─ exchange_requests     ├─ exchange_messages              │  │ │
│  │  ├─ reviews               ├─ exchange_stats                 │  │ │
│  │  ├─ demo_likes            ├─ featured_profiles              │  │ │
│  │  └─ user_activity_log     (audit trail)                     │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  │                              ↓                                    │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │          Row Level Security (RLS)                        │  │ │
│  │  ├─ Public read on profiles, categories                    │  │ │
│  │  ├─ Authenticated-owner write on profiles                  │  │ │
│  │  ├─ Participant-only access to exchanges                   │  │ │
│  │  ├─ User-only access to notifications                      │  │ │
│  │  └─ 20+ policies ensuring data security                    │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  │                              ↓                                    │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │        Helper Functions + Triggers                       │  │ │
│  │  ├─ get_recommended_experts()                              │  │ │
│  │  ├─ search_profiles()                                      │  │ │
│  │  ├─ recalculate_profile_rating()                           │  │ │
│  │  ├─ Auto-update timestamps (triggers)                      │  │ │
│  │  ├─ Sync like counts (triggers)                            │  │ │
│  │  └─ Update stats on completion (triggers)                  │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  │                              ↓                                    │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │           Indexes (25+) for Performance                  │  │ │
│  │  ├─ Foreign keys for joins                                 │  │ │
│  │  ├─ Status fields for filtering                            │  │ │
│  │  ├─ Timestamps for sorting                                 │  │ │
│  │  ├─ Ratings for ranking                                    │  │ │
│  │  └─ Search fields for discovery                            │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │           Auth & API Services                                  │ │
│  ├─ Supabase Auth (Email/Password)                              │ │
│  ├─ JWT tokens with secure cookies                              │ │
│  └─ CORS configured for client domain                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │           Storage (optional, for videos)                       │ │
│  └─ S3-compatible storage for demo videos, avatars               │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────┐
│   User      │
│ Interaction │
└──────┬──────┘
       │ (click, type, scroll)
       ↓
┌──────────────────────────────┐
│  React Component             │
│ (BrowsePage, ProfilePage)    │
└──────┬───────────────────────┘
       │ (calls custom hook)
       ↓
┌──────────────────────────────┐
│  React Hook                  │
│ (useSearchProfiles,          │
│  useProfile, useExchanges)   │
└──────┬───────────────────────┘
       │ (calls db helper or rpc)
       ↓
┌──────────────────────────────┐
│  Database Helper or RPC      │
│ (createExchange,             │
│  updateStatus, search)       │
└──────┬───────────────────────┘
       │ (Supabase client call)
       ↓
┌──────────────────────────────────────────────┐
│  PostgreSQL Database                          │
│  (RLS checks ← enforces security)             │
│  ↓ Query execution with policies              │
│  ↓ Triggers fire (auto-timestamps, counts)    │
│  ↓ Notifications created (if applicable)      │
└──────┬───────────────────────────────────────┘
       │ (results sent back)
       ↓
┌──────────────────────────────┐
│  Supabase Client             │
│ (parses JSON response)       │
└──────┬───────────────────────┘
       │ (updates React state)
       ↓
┌──────────────────────────────┐
│  React Component             │
│ (renders with new data)      │
└──────┬───────────────────────┘
       │ (DOM update)
       ↓
┌──────────────────────────────┐
│  Browser renders UI          │
│ (User sees new content)      │
└──────────────────────────────┘
```

---

## Real-time Flow Diagram

```
┌───────────────┐
│   User A      │
│ Sends Message │
└───────┬───────┘
        │
        ↓
┌─────────────────────────────────────────┐
│  sendExchangeMessage()                  │
│  ↓ Insert into exchange_messages        │
│  ↓ Notification created via trigger     │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│  PostgreSQL                             │
│  ↓ Message inserted                     │
│  ↓ Trigger fires                        │
│  ↓ Notification inserted for User B     │
│  ↓ Realtime event emitted               │
└────────┬────────────────────────────────┘
         │
    ┌────┴────┐
    │          │
    ↓          ↓
┌────────┐  ┌─────────────────────────────┐
│User A  │  │ Supabase Real-time Event    │
│(no     │  │ (broadcast to subscribers)  │
│update  │  └────────┬────────────────────┘
│needed) │           │
└────────┘     ┌─────┴──────┐
               │             │
               ↓             ↓
         User B App    User B Browser
         (if subscribed) (if subscribed)
         ↓
      React Hook Listener
      (useExchangeMessages)
      ↓
      Update local state
      ↓
      Re-render component
      ↓
      New message appears
      ↓
      User B sees message instantly
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────┐
│            Browser / Client                      │
├─────────────────────────────────────────────────┤
│ ✓ HTTPS/TLS encryption (transport)              │
│ ✓ JWT tokens in secure cookies                  │
│ ✓ Auth context validation                       │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        │   Supabase Service       │
        └────────────┬─────────────┘
                     │
        ┌────────────▼──────────────────────────┐
        │   Authentication Layer                │
        │ - JWT verification                    │
        │ - Session validation                  │
        │ - Rate limiting                       │
        └────────────┬───────────────────────────┘
                     │
        ┌────────────▼──────────────────────────┐
        │  Row Level Security (RLS)             │
        │ - Query rewriting at SQL level        │
        │ - Can't bypass, even with SQL inject  │
        │ - 20+ policies per operation          │
        └────────────┬───────────────────────────┘
                     │
        ┌────────────▼──────────────────────────┐
        │  Data Layer                           │
        │ - Constraints enforce data integrity  │
        │ - Foreign keys prevent orphans        │
        │ - Check constraints on ranges         │
        │ - Encryption at rest                  │
        └────────────┬───────────────────────────┘
                     │
        ┌────────────▼──────────────────────────┐
        │  Audit Layer                          │
        │ - Activity logging                    │
        │ - Compliance ready                    │
        │ - Debug trail                         │
        └───────────────────────────────────────┘
```

---

## Component Hierarchy

```
App
├── Header
│   ├── Navigation
│   ├── Search (mobile)
│   └── Auth buttons
│
├── Main Content
│   ├── HomePage
│   │   ├── HeroSection
│   │   ├── StatsBar
│   │   ├── HowItWorks
│   │   ├── SkillCategories
│   │   ├── FeaturedDemos
│   │   ├── FeaturedExperts
│   │   └── CTASection
│   │
│   ├── BrowsePage
│   │   ├── SearchBar
│   │   ├── Filters
│   │   ├── ExpertCard[] (grid)
│   │   └── Pagination
│   │
│   └── ProfilePage
│       ├── CoverImage
│       ├── ProfileHeader
│       ├── StatsGrid
│       ├── TabView
│       │   ├── DemoGrid
│       │   ├── ReviewsList
│       │   └── AboutSection
│       └── ExchangeModal
│
├── Footer (on HomePage only)
│
└── Modals
    ├── AuthModal (login/signup)
    ├── ExchangeModal
    └── NotificationCenter
```

---

## Database Dependency Graph

```
skill_categories
│
├─ profiles
│  ├─ knowledge_demos
│  │  ├─ demo_likes
│  │  └─ (views, likes counts)
│  │
│  ├─ exchange_requests
│  │  ├─ exchange_messages
│  │  └─ reviews
│  │
│  ├─ reviews (reviewee_profile_id)
│  │
│  ├─ skill_endorsements
│  │
│  ├─ exchange_stats (denormalized)
│  │
│  └─ featured_profiles
│
└─ exchange_requests (requester/provider)
   ├─ reviews
   ├─ exchange_messages
   └─ notifications

User Auth (auth.users)
├─ profiles (user_id)
├─ knowledge_demos (user_id)
├─ exchange_requests (requester_id, provider_id)
├─ reviews (reviewer_id)
├─ demo_likes (user_id)
├─ notifications (user_id)
├─ skill_endorsements (endorser_id)
├─ exchange_messages (sender_id)
├─ user_preferences (user_id)
└─ user_activity_log (user_id)
```

---

## Performance Optimization Strategy

```
Request comes in
│
├─ Is it a list query?
│  └─ Use limit/offset pagination
│  └─ Use indexes on status/timestamps
│
├─ Is it a profile lookup?
│  └─ Direct query with index
│  └─ Join with exchange_stats (denormalized)
│
├─ Is it a search?
│  └─ Use search_profiles() RPC function
│  └─ Full-text search indexed
│
├─ Is it aggregating data?
│  └─ Use exchange_stats table (cached)
│  └─ Use dashboard_stats function
│
└─ Is it real-time?
   └─ Use Supabase subscriptions
   └─ Efficient change detection
```

---

## Scalability Architecture

```
Single Server Phase (0-1000 users)
├─ All data in one database
├─ Simple indexes
└─ Works out of the box

Growth Phase (1000-10K users)
├─ Add read replicas for reporting
├─ Use materialized views for stats
├─ Implement query result caching
└─ Monitor slow queries

Enterprise Phase (10K+ users)
├─ Shard user data by region
├─ Separate read/write databases
├─ Use CDN for static content
├─ Implement connection pooling
├─ Archive old activity logs
└─ Use analytics data warehouse

Current: Single Server Phase
Ready for: Growth Phase (built-in)
Designed for: Enterprise Phase
```

---

## Deployment Architecture (Future)

```
┌─────────────────────────────────────┐
│  Load Balancer                      │
│  (CloudFlare / AWS ALB)             │
└────────┬────────────────────────────┘
         │
    ┌────┴─────┬────────┐
    │           │        │
    ↓           ↓        ↓
┌──────────┐ ┌──────┐ ┌──────┐
│ Region 1 │ │ Reg2 │ │ Reg3 │  Frontend (Vite)
│ React    │ │React │ │React │  (CDN-distributed)
│ App      │ │ App  │ │ App  │
└──────┬───┘ └───┬──┘ └───┬──┘
       │         │        │
       └─────────┼────────┘
                 │
           ┌─────▼──────┐
           │ Supabase   │
           │ PostgreSQL │
           │ (primary)  │
           └─────┬──────┘
                 │
        ┌────────┴─────────┐
        │                  │
        ↓                  ↓
    ┌────────┐        ┌──────────┐
    │ Replica│        │ Backups  │
    │ (read) │        │ (S3)     │
    └────────┘        └──────────┘
```

---

## Development Workflow

```
Developer works on feature
│
├─ Writes React component
├─ Uses hooks from lib/hooks.ts
├─ Calls helpers from lib/db-helpers.ts
│
├─ Local Testing
│  ├─ npm run dev
│  ├─ Connects to dev Supabase project
│  ├─ RLS policies still enforced
│  └─ Can test auth flow
│
├─ Type checking
│  └─ npm run typecheck
│
├─ Build test
│  └─ npm run build
│
└─ Commit & Deploy
   ├─ Tests run automatically
   ├─ Build runs automatically
   ├─ Deploy to hosting
   └─ Live!
```

---

## Caching Strategy (Future)

```
Request
│
├─ Check browser cache (React state)
│  └─ If hit, return cached data
│
├─ Check CDN cache
│  └─ For public data (skills, featured)
│
├─ Check Supabase cache
│  └─ Recent queries cached
│
├─ Query database
│  └─ Hit indexes
│  └─ RLS applied
│
└─ Cache result
   ├─ React state
   ├─ localStorage (profiles)
   └─ CDN (public data)
```

This gives developers a clear mental model of how all the pieces fit together!
