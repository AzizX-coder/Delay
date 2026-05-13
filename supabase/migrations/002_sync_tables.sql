-- user_notes (mirrors local Dexie notes)
create table if not exists user_notes (
  id text not null,
  user_id uuid references auth.users on delete cascade not null,
  title text default '',
  content text default '',
  content_text text default '',
  color text,
  pinned int default 0,
  is_public int default 0,
  public_slug text,
  created_at bigint not null default 0,
  updated_at bigint not null default 0,
  deleted_at bigint default 0,
  primary key (id)
);
create index if not exists user_notes_user_id_idx on user_notes(user_id, updated_at);
create index if not exists user_notes_public_slug_idx on user_notes(public_slug) where is_public = 1;
alter table user_notes enable row level security;
create policy "users_own_notes" on user_notes using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "public_notes_read" on user_notes for select using (is_public = 1);

-- user_tasks
create table if not exists user_tasks (
  id text not null primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text default '',
  description text default '',
  completed int default 0,
  priority int default 0,
  due_date bigint,
  list_id text default 'inbox',
  sort_order int default 0,
  created_at bigint not null default 0,
  updated_at bigint not null default 0,
  deleted_at bigint default 0
);
create index if not exists user_tasks_user_id_idx on user_tasks(user_id, updated_at);
alter table user_tasks enable row level security;
create policy "users_own_tasks" on user_tasks using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_task_lists
create table if not exists user_task_lists (
  id text not null primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text default '',
  color text,
  icon text default 'list',
  sort_order int default 0,
  created_at bigint not null default 0
);
alter table user_task_lists enable row level security;
create policy "users_own_task_lists" on user_task_lists using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_events
create table if not exists user_events (
  id text not null primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text default '',
  description text,
  start_time bigint not null default 0,
  end_time bigint not null default 0,
  all_day boolean default false,
  color text,
  category text,
  recurrence text,
  created_at bigint not null default 0,
  updated_at bigint not null default 0,
  deleted_at bigint default 0
);
create index if not exists user_events_user_id_idx on user_events(user_id, start_time);
alter table user_events enable row level security;
create policy "users_own_events" on user_events using (auth.uid() = user_id) with check (auth.uid() = user_id);
