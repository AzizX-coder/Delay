-- ============================================================================
-- SIYOH — Supabase schema
-- Run this in the Supabase SQL editor (or psql) on a fresh project.
-- Order: extensions → tables → indexes → RLS policies → triggers → seed.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

do $$ begin
  create type story_type as enum ('text', 'audio', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type story_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('reader', 'writer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contest_status as enum ('upcoming', 'open', 'judging', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('open', 'dismissed', 'actioned');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- PROFILES (1:1 with auth.users)
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_seed int not null default 0,
  role user_role not null default 'reader',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

-- ============================================================================
-- STORIES
-- ============================================================================

create table if not exists public.stories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  subtitle text,
  excerpt text not null,
  body text,
  type story_type not null default 'text',
  audio_url text,
  cover_seed int not null default 0,
  mins int not null default 5,
  plays int not null default 0,
  likes int not null default 0,
  status story_status not null default 'draft',
  author_id uuid not null references public.profiles(id) on delete cascade,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists stories_author_idx on public.stories (author_id);
create index if not exists stories_status_idx on public.stories (status);
create index if not exists stories_published_idx on public.stories (published_at desc);
create index if not exists stories_tags_idx on public.stories using gin (tags);

-- ============================================================================
-- COMMENTS
-- ============================================================================

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_story_idx on public.comments (story_id);

-- ============================================================================
-- LIKES, BOOKMARKS, FOLLOWS
-- ============================================================================

create table if not exists public.likes (
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

create table if not exists public.bookmarks (
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ============================================================================
-- CONTESTS
-- ============================================================================

create table if not exists public.contests (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  starts_at date not null,
  ends_at date not null,
  prize text,
  status contest_status not null default 'upcoming',
  created_at timestamptz not null default now()
);

create table if not exists public.contest_entries (
  id uuid primary key default uuid_generate_v4(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  unique (contest_id, story_id)
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,            -- 'follow' | 'like' | 'comment' | 'contest' | ...
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- ============================================================================
-- REPORTS (moderation queue)
-- ============================================================================

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_kind text not null,     -- 'story' | 'comment' | 'profile'
  target_id uuid not null,
  reason text not null,
  status report_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Maintain stories.likes counter
create or replace function public.bump_story_likes()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.stories set likes = likes + 1 where id = new.story_id;
  elsif (tg_op = 'DELETE') then
    update public.stories set likes = greatest(0, likes - 1) where id = old.story_id;
  end if;
  return null;
end $$;

drop trigger if exists likes_bump on public.likes;
create trigger likes_bump
  after insert or delete on public.likes
  for each row execute function public.bump_story_likes();

-- Updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists stories_touch on public.stories;
create trigger stories_touch before update on public.stories
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.follows enable row level security;
alter table public.contests enable row level security;
alter table public.contest_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- Helper: is admin?
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select using (true);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles admin all" on public.profiles;
create policy "profiles admin all" on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- stories
drop policy if exists "stories public read published" on public.stories;
create policy "stories public read published" on public.stories for select
  using (status = 'published' or author_id = auth.uid() or public.is_admin());

drop policy if exists "stories author insert" on public.stories;
create policy "stories author insert" on public.stories for insert
  with check (author_id = auth.uid());

drop policy if exists "stories author update" on public.stories;
create policy "stories author update" on public.stories for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "stories author delete" on public.stories;
create policy "stories author delete" on public.stories for delete
  using (author_id = auth.uid() or public.is_admin());

-- comments
drop policy if exists "comments read" on public.comments;
create policy "comments read" on public.comments for select using (true);

drop policy if exists "comments insert auth" on public.comments;
create policy "comments insert auth" on public.comments for insert
  with check (auth.uid() = author_id);

drop policy if exists "comments author or admin delete" on public.comments;
create policy "comments author or admin delete" on public.comments for delete
  using (author_id = auth.uid() or public.is_admin());

-- likes / bookmarks / follows
drop policy if exists "likes self" on public.likes;
create policy "likes self" on public.likes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "likes read" on public.likes;
create policy "likes read" on public.likes for select using (true);

drop policy if exists "bookmarks self" on public.bookmarks;
create policy "bookmarks self" on public.bookmarks for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "follows self" on public.follows;
create policy "follows self" on public.follows for all
  using (follower_id = auth.uid()) with check (follower_id = auth.uid());

drop policy if exists "follows read" on public.follows;
create policy "follows read" on public.follows for select using (true);

-- contests
drop policy if exists "contests read" on public.contests;
create policy "contests read" on public.contests for select using (true);

drop policy if exists "contests admin write" on public.contests;
create policy "contests admin write" on public.contests for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "contest entries read" on public.contest_entries;
create policy "contest entries read" on public.contest_entries for select using (true);

drop policy if exists "contest entries author insert" on public.contest_entries;
create policy "contest entries author insert" on public.contest_entries for insert
  with check (exists (select 1 from public.stories s where s.id = story_id and s.author_id = auth.uid()));

-- notifications
drop policy if exists "notifications self" on public.notifications;
create policy "notifications self" on public.notifications for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reports
drop policy if exists "reports insert auth" on public.reports;
create policy "reports insert auth" on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "reports admin manage" on public.reports;
create policy "reports admin manage" on public.reports for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- STORAGE BUCKETS (covers + audio)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true), ('audio', 'audio', true)
on conflict (id) do nothing;

-- Public read for covers + audio
drop policy if exists "covers public read" on storage.objects;
create policy "covers public read" on storage.objects for select
  using (bucket_id in ('covers', 'audio'));

-- Authed upload to own folder (path prefix = user id)
drop policy if exists "covers user upload" on storage.objects;
create policy "covers user upload" on storage.objects for insert
  with check (
    bucket_id in ('covers', 'audio')
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
