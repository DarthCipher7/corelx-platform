# CORELX (Formerly Nova) — Project Context & System Architecture

This document is designed to be copy-pasted directly into premium LLMs (ChatGPT Plus / Gemini Advanced) to instantly bring them up to speed on the codebase, architecture, database schemas, styling tokens, and project state.

---

## 1. System Overview
**CORELX** is a high-fidelity, cyber-minimalist social network for creators. It features a live discovery feed, personal studio profiles, direct messaging drawers, conversation inboxes, settings profiles, and a collaboration board.

### Tech Stack
* **Framework:** Next.js 16 (App Router, Turbopack, TypeScript)
* **Backend & Database:** Supabase (PostgreSQL, Real-Time Auth, Row-Level Security)
* **Hosting:** Vercel (Production URL: `https://nova-platform-rho.vercel.app`)
* **Styling:** CSS variables for a hybrid Acrylic / Cyber-Minimalist design system with Tailwind classes for layout.
* **Icons & Animation:** Lucide React and Framer Motion.

---

## 2. Directory & File Structure
Here is the core structure of the Next.js frontend project under `04_ENGINEERING/nova-platform/`:

```
src/
├── app/
│   ├── auth/callback/route.ts     # Handles OAuth & signup confirmations
│   ├── collabs/page.tsx           # Collaboration board (Currently mock data)
│   ├── explore/page.tsx           # Creator discovery network (Currently mock data)
│   ├── feed/page.tsx              # Live database feed + post creation modal
│   ├── login/page.tsx             # Authentication page (Google, LinkedIn, Email)
│   ├── messages/page.tsx          # Chat inbox list (Live Supabase messages grouping)
│   ├── settings/page.tsx          # Live profile updater (Display name, handle, bio, status)
│   ├── showcase/page.tsx          # Creator project showcase grid (Currently mock data)
│   ├── signup/page.tsx            # Account registration
│   ├── studio/[handle]/page.tsx   # Live Profile (Follow counts, live posts, message drawer)
│   ├── globals.css                # Style system, custom classes, custom colors
│   ├── layout.tsx                 # Core HTML structure wrapped in Providers
│   └── page.tsx                   # Main Landing Page (Hero, Features, Top Creators)
├── components/
│   ├── cards/
│   │   ├── CollabCard.tsx
│   │   ├── CreatorCard.tsx
│   │   ├── FeedPost.tsx
│   │   └── ProjectCard.tsx
│   ├── layout/
│   │   └── Navbar.tsx             # Responsive header with theme/messages/profile dropdown
│   └── ui/
│       ├── Button.tsx
│       ├── NeonBadge.tsx          # Styled badges with ambient glow
│       └── RevealEffect.tsx       # Glassmorphic hover highlight effect
├── lib/
│   ├── data.ts                    # Hardcoded mockup data (creators, collabs, posts)
│   └── utils.ts
└── utils/
    └── supabase/
        ├── client.ts              # Client-side Supabase instantiator
        ├── middleware.ts          # Page-protection and token refresh middleware
        └── server.ts              # Server-side Supabase instantiator
```

---

## 3. Database Schema (`schema.sql`)
Run live on Supabase with enabled RLS. When coding database queries, follow this structure:

```sql
-- Users table
create table public.users (
  id uuid references auth.users not null primary key,
  handle text unique not null,
  display_name text,
  avatar_url text,
  tagline text,
  availability_status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Skills table (User specialized tags)
create table public.skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  skill_name text not null
);

-- Feed Posts table
create table public.feed_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  media_url text,
  title text,
  caption text,
  category text not null default 'UI Design',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Saves table (Bookmarks)
create table public.saves (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  post_id uuid references public.feed_posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- Collab Calls table (Requests for partners/work)
create table public.collab_calls (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  time_commitment text,
  spots integer default 1,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sparks table (Direct collaboration intents)
create table public.sparks (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.users(id) on delete cascade not null,
  recipient_id uuid references public.users(id) on delete cascade not null,
  intent_type text not null,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'ignored')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Follows table
create table public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.users(id) on delete cascade not null,
  following_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.users(id) on delete cascade not null,
  recipient_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## 4. Design System CSS Tokens (`globals.css`)
We use variables for themes. Always reference these properties instead of hardcoded colors:

```css
:root {
  --bg-void: #030308;
  --bg-deep: #070714;
  --bg-surface: #0e0e24;
  --bg-elevated: #161635;
  --bg-frosted: rgba(14, 14, 36, 0.4);
  
  --text-primary: #f0f0ff;
  --text-secondary: #a2a2c2;
  --text-muted: #626282;
  
  --accent-primary: #6c5ce7;
  --accent-primary-glow: rgba(108, 92, 231, 0.15);
  --accent-secondary: #00d2ff;
  
  --glass-bg: rgba(7, 7, 20, 0.6);
  --glass-border: rgba(255, 255, 255, 0.05);
  --border-subtle: rgba(255, 255, 255, 0.08);
}
```

---

## 5. Live Feature Implementations (How They Work)

### Studio Profile (`/studio/[handle]`)
* Dynamic loading. If the route parameter `[handle]` matches `'me'`, it resolves to the authenticated user's profile and redirects to their canonical handle.
* Fetches user bio, tagline, skills join, and creator posts.
* Follows are tracked live: Follow button uses optimistic UI updates (incrementing/decrementing state) and posts to/deletes from the `follows` table.
* Includes a sliding DM drawer that loads and appends live direct messages between the active profile owner and current visitor.

### Messages Inbox (`/messages`)
* Fetches all records from the `messages` table containing the current user's ID as sender or recipient.
* Groups messages in memory by `otherUser.id` to show unique conversation heads.
* Sorts conversations by the latest message `created_at` timestamp.
* Clicking any conversation head redirects back to `/studio/[otherUser.handle]` with the DM drawer open.

### Discovery Feed (`/feed`)
* Fetches posts directly from `feed_posts`.
* Includes filters for categories: `All`, `UI Design`, `Code`, `3D`, `Writing`.
* Has a modal form allowing users to submit new feed entries with titles, captions, categories, and optional media URLs directly.

---

## 6. Prompting Instructions for LLMs
Copy the following system prompt along with any task you give ChatGPT or Gemini:

> "You are an expert full-stack developer working on CORELX. Your job is to write code that matches our cyber-minimalist design system (glassmorphism, subtle glows, dark-mode native variables) and uses modern Next.js 16 App Router standards along with Supabase RLS conventions. 
> 
> * Do not write plain CSS colors; always use variables like `var(--bg-frosted)`, `var(--text-primary)`, or `var(--accent-primary)`.
> * Use `lucide-react` for icon design and `framer-motion` for transitions.
> * Always query using Supabase SSR client syntax (`createClient()`).
> * Write type-safe TypeScript code."
