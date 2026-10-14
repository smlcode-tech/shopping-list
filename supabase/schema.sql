-- Alışveriş listesi: veritabanı şeması (Supabase / PostgreSQL)
-- Supabase panelinde SQL Editor'e yapıştırıp bir kez çalıştır.
-- Üç seviyeli hiyerarşi: shopping_sessions (tarih bazlı alışveriş) > lists (kullanıcının adlandırdığı liste) > items (ürün + fiyat)

drop table if exists public.items cascade;

create table public.shopping_sessions (
  id bigint generated always as identity primary key,
  date date not null,
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade
);

create table public.lists (
  id bigint generated always as identity primary key,
  session_id bigint not null references public.shopping_sessions(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now()
);

create table public.items (
  id bigint generated always as identity primary key,
  list_id bigint not null references public.lists(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  price numeric(12,2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

create index shopping_sessions_user_id_idx on public.shopping_sessions (user_id);
create index lists_session_id_idx on public.lists (session_id);
create index items_list_id_idx on public.items (list_id);

-- Her kullanıcı yalnızca kendi verisini görür ve değiştirir.
-- lists ve items'ın doğrudan user_id'si yok; sahiplik, session'a kadar zincirleme kontrol edilir.
alter table public.shopping_sessions enable row level security;
alter table public.lists enable row level security;
alter table public.items enable row level security;

create policy "sessions_select_own" on public.shopping_sessions
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "sessions_insert_own" on public.shopping_sessions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "sessions_update_own" on public.shopping_sessions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "sessions_delete_own" on public.shopping_sessions
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "lists_select_own" on public.lists
  for select to authenticated
  using (exists (
    select 1 from public.shopping_sessions s
    where s.id = lists.session_id and s.user_id = (select auth.uid())
  ));

create policy "lists_insert_own" on public.lists
  for insert to authenticated
  with check (exists (
    select 1 from public.shopping_sessions s
    where s.id = lists.session_id and s.user_id = (select auth.uid())
  ));

create policy "lists_update_own" on public.lists
  for update to authenticated
  using (exists (
    select 1 from public.shopping_sessions s
    where s.id = lists.session_id and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.shopping_sessions s
    where s.id = lists.session_id and s.user_id = (select auth.uid())
  ));

create policy "lists_delete_own" on public.lists
  for delete to authenticated
  using (exists (
    select 1 from public.shopping_sessions s
    where s.id = lists.session_id and s.user_id = (select auth.uid())
  ));

create policy "items_select_own" on public.items
  for select to authenticated
  using (exists (
    select 1 from public.lists l join public.shopping_sessions s on s.id = l.session_id
    where l.id = items.list_id and s.user_id = (select auth.uid())
  ));

create policy "items_insert_own" on public.items
  for insert to authenticated
  with check (exists (
    select 1 from public.lists l join public.shopping_sessions s on s.id = l.session_id
    where l.id = items.list_id and s.user_id = (select auth.uid())
  ));

create policy "items_update_own" on public.items
  for update to authenticated
  using (exists (
    select 1 from public.lists l join public.shopping_sessions s on s.id = l.session_id
    where l.id = items.list_id and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.lists l join public.shopping_sessions s on s.id = l.session_id
    where l.id = items.list_id and s.user_id = (select auth.uid())
  ));

create policy "items_delete_own" on public.items
  for delete to authenticated
  using (exists (
    select 1 from public.lists l join public.shopping_sessions s on s.id = l.session_id
    where l.id = items.list_id and s.user_id = (select auth.uid())
  ));

-- En az yetki: anonim kullanıcı hiçbir tabloya erişemez.
revoke all on table public.shopping_sessions from anon;
revoke all on table public.lists from anon;
revoke all on table public.items from anon;
revoke truncate, references, trigger on table public.shopping_sessions from authenticated;
revoke truncate, references, trigger on table public.lists from authenticated;
revoke truncate, references, trigger on table public.items from authenticated;
