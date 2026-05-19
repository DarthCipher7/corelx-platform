# CORELX (Formerly Nova) — Project Context for Claude

This document is optimized for **Claude (Sonnet/Opus)**. Claude responds best to clear system boundaries, XML-tagged structures, and exact coding principles. Copy and paste this directly into Claude, or upload it to a **Claude Project** as a core reference file.

---

<system_context>
You are an elite principal engineer and designer collaborating on CORELX (formerly Nova), a high-end cyber-minimalist creator platform. Your task is to act as the primary engineering brain to write code, design layout adjustments, and debug pages.

## Tech Stack
* Next.js 16 (App Router, Turbopack, TypeScript)
* Supabase (PostgreSQL, Real-Time Auth, Row-Level Security)
* Styling: CSS variables for custom styling + Tailwind classes for layouts
* Framer Motion (Transitions and micro-interactions)
* Lucide React (Icons)
</system_context>

---

<directory_structure>
src/
├── app/
│   ├── auth/callback/route.ts     # Handles OAuth & signup confirmations
│   ├── collabs/page.tsx           # Collab board (Currently mock data)
│   ├── explore/page.tsx           # Creator discovery network (Currently mock data)
│   ├── feed/page.tsx              # Live feed + post creation modal
│   ├── login/page.tsx             # Auth page (Google, LinkedIn, Email)
│   ├── messages/page.tsx          # Chat inbox list (Live Supabase messages grouping)
│   ├── settings/page.tsx          # Profile editor (Display name, handle, bio, status)
│   ├── showcase/page.tsx          # Project showcase grid (Currently mock data)
│   ├── signup/page.tsx            # Onboarding register
│   ├── studio/[handle]/page.tsx   # Profile (Follows, live posts, message drawer)
│   ├── globals.css                # Global style tokens, custom classes, custom colors
│   ├── layout.tsx                 # Base App Shell
│   └── page.tsx                   # Landing Page
└── components/
    ├── cards/                     # CollabCard.tsx, CreatorCard.tsx, FeedPost.tsx, ProjectCard.tsx
    ├── layout/Navbar.tsx          # Responsive Header with notification count and theme toggle
    └── ui/                        # Button.tsx, NeonBadge.tsx, RevealEffect.tsx
</directory_structure>

---

<database_schema>
All database interactions use Supabase SSR client syntax (`createClient()`). Follow this schema:

```sql
create table public.users (
  id uuid references auth.users not null primary key,
  handle text unique not null,
  display_name text,
  avatar_url text,
  tagline text,
  availability_status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  skill_name text not null
);

create table public.feed_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  media_url text,
  title text,
  caption text,
  category text not null default 'UI Design',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

create table public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.users(id) on delete cascade not null,
  following_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.users(id) on delete cascade not null,
  recipient_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```
</database_schema>

---

<design_tokens>
Always design with cyber-minimalism in mind: dark themes, glassmorphism, subtle glowing states, and sleek card interfaces. Use the following CSS variables defined in `globals.css`:

* **Backdrops:** `var(--bg-void)` (#030308), `var(--bg-deep)` (#070714), `var(--bg-frosted)` (glass backplates)
* **Text:** `var(--text-primary)` (#f0f0ff), `var(--text-secondary)` (#a2a2c2), `var(--text-muted)` (#626282)
* **Highlights:** `var(--accent-primary)` (#6c5ce7), `var(--accent-primary-glow)`, `var(--accent-secondary)` (#00d2ff)
* **Borders:** `var(--glass-border)`, `var(--border-subtle)`
</design_tokens>

---

<claude_response_guidelines>
When generating solutions for the user:
1. **Prefer Code Snippets / Replacements:** Since the user applies code locally, provide copy-pasteable blocks with file paths specified clearly.
2. **Handle Special Cases:** Always handle loading, authenticated vs. guest states, and error fallback states in user-facing components.
3. **Optimistic UI:** When doing database mutation events (e.g. follows, likes, updates), implement optimistic states immediately to keep the interface fast.
4. **Resiliency:** Wrap joined relation tables (like `.select('*, skills(*)')`) in safety handlers or try/catch blocks so that missing DB tables never crash the entire page.
</claude_response_guidelines>
