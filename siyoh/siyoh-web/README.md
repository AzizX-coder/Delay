# Siyoh

A premium, modern writing + audio social platform.
Stories worth slowing down for.

## Stack

- **Next.js 14** App Router · **TypeScript** · **Tailwind**
- **Supabase** — Postgres, auth (email + magic link + OAuth), storage, RLS
- Server Actions for all mutations · Middleware-gated routes
- Pure CSS animations (no framer-motion dep)

## What's in the box

### Public
| Route | Notes |
| --- | --- |
| `/` | **Animated landing page** — hero with grad-text, floating blobs, marquee of titles, features, writers, "how it works" 3-step, CTA, footer |
| `/auth/login` | Email + password, magic link, Google + GitHub OAuth |
| `/auth/signup` | Display name + username + email + password |
| `/auth/verify` | "Check your inbox" with resend |
| `/auth/callback` | Route handler — exchanges code for session |
| `/auth/forgot` · `/auth/reset` | Password reset flow |
| `/auth/confirmed` | Success state, auto-redirect to feed |
| `/auth/signout` | POST → `signOut()` → home |

### App (auth-gated where it matters)
| Route | Notes |
| --- | --- |
| `/feed` | Home: featured + latest, like/bookmark inline |
| `/explore` | Moods, curated collections, writers to follow |
| `/books` | Filterable library (text/audio · genre · sort) |
| `/story/[slug]` | Detail with drop cap, **like**, **bookmark**, **follow**, **share**, **comments** (all live) |
| `/create` | Write/Record/Both composer → `publishStory` server action |
| `/profile/[username]` | Public profile + tabs |
| `/profile/edit` | Avatar style, display name, bio |
| `/notifications` | Real-time-ready feed of follow/like/comment events; auto-marks read |
| `/search` | Title / author / tag |
| `/settings` | Theme toggle + sign out |

### Admin (`role = 'admin'` required)
- `/admin` overview · `/admin/stories` · `/admin/users` · `/admin/contests` · `/admin/moderation`

### Special
- `not-found.tsx` — animated 404
- `error.tsx` — global error boundary with reset button
- `loading.tsx` — branded shimmer

## Social actions (real, with optimistic UI)

`src/lib/actions.ts` exposes server actions for:
- `toggleLike`, `toggleBookmark`, `toggleFollow`
- `addComment`, `deleteComment`
- `publishStory`, `saveDraft`
- `updateProfile`, `markNotificationsRead`

Notifications are inserted as side-effects (e.g. comment → notify the story author).

## Quick start

```bash
cd siyoh-web
npm install
npm run dev   # http://localhost:3000
```

The app runs out of the box on **mock data** — no Supabase needed to see the prototype.

## Wiring Supabase (real auth + DB)

1. Create a project at [supabase.com](https://supabase.com).
2. SQL editor → paste **`supabase/schema.sql`** (tables, enums, indexes, RLS, triggers, storage buckets).
3. Optionally paste **`supabase/seed.sql`** for demo content.
4. Authentication → Providers — enable Google / GitHub if you want OAuth (set the redirect URL to `https://yourdomain/auth/callback`).
5. Authentication → URL Configuration — set Site URL to your domain.
6. `cp .env.local.example .env.local` and fill in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

7. Restart `npm run dev`.

The data layer in `src/lib/queries.ts` automatically switches from mock to Supabase
when both public env vars are set.

To grant yourself admin:

```sql
update public.profiles set role = 'admin' where username = '<your username>';
```

## Project layout

```
siyoh-web/
├─ src/
│  ├─ middleware.ts                 auth + admin gating
│  ├─ app/
│  │  ├─ page.tsx                   landing (animated)
│  │  ├─ landing/LandingPage.tsx    landing component
│  │  ├─ feed/                      home feed
│  │  ├─ explore/ books/ search/    discovery
│  │  ├─ story/[slug]/              story + comments
│  │  ├─ create/                    composer (publishes via server action)
│  │  ├─ profile/[username]/        public profile + follow
│  │  ├─ profile/edit/              owner-only edit
│  │  ├─ notifications/             real activity feed
│  │  ├─ settings/                  theme + sign out
│  │  ├─ auth/
│  │  │  ├─ login/  signup/         email + OAuth + magic link
│  │  │  ├─ verify/ confirmed/      post-signup states
│  │  │  ├─ forgot/ reset/          password reset
│  │  │  ├─ callback/route.ts       Supabase code exchange
│  │  │  └─ signout/route.ts        signOut + redirect
│  │  ├─ admin/                     dashboard, library, users, contests, mod
│  │  ├─ not-found.tsx error.tsx loading.tsx
│  │  └─ globals.css                tokens + animations
│  ├─ components/
│  │  ├─ AppShell.tsx ShellChrome.tsx  layout (server fetches user, client renders)
│  │  ├─ Sidebar.tsx RightRail.tsx MiniPlayer.tsx
│  │  ├─ Logo.tsx Avatar.tsx Chip.tsx CoverPlaceholder.tsx Icon.tsx BgBlobs.tsx
│  │  ├─ StoryRow.tsx Reveal.tsx Toast.tsx ThemeProvider.tsx
│  │  └─ social/
│  │     ├─ LikeButton.tsx BookmarkButton.tsx FollowButton.tsx
│  │     ├─ ShareButton.tsx CommentThread.tsx
│  └─ lib/
│     ├─ tokens.ts types.ts mock-data.ts
│     ├─ queries.ts                 reads (Supabase ⇄ mock)
│     ├─ actions.ts                 server actions for mutations
│     ├─ auth.ts                    getCurrentUser()
│     └─ supabase/{client,server}.ts
└─ supabase/
   ├─ schema.sql                    full schema + RLS + triggers + storage
   └─ seed.sql                      8 stories, 9 profiles, 2 contests
```

## Animations

All defined in `globals.css` — `float-slow`, `float-slower`, `drift`, `shimmer`,
`fade-up`, `fade-in`, `scale-in`, `marquee`, `pulse-ring`, `gradient-shift`,
`spin-slow`, `toast-in`. `Reveal.tsx` uses `IntersectionObserver` to add
`.is-visible` on scroll. Honors `prefers-reduced-motion`.

## Auth gating (middleware)

`src/middleware.ts` automatically:
- Redirects unauthenticated users hitting `/create`, `/notifications`, `/settings`,
  `/profile/edit`, or `/admin/*` to `/auth/login?next=...`
- For `/admin/*`, additionally checks `profiles.role = 'admin'`

When Supabase env vars are absent, middleware no-ops so demo mode keeps working.

## Notes

- Audio recording in `/create` shows a styled placeholder. Wire to Supabase
  Storage (`audio` bucket already declared in `schema.sql`) to ship real audio.
- The mini-player at the bottom is decorative until you connect real audio.
- For real-time notifications, subscribe to the `notifications` table:
  `sb.channel('n').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, ...)`
