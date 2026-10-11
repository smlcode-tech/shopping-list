-- Alışveriş listesi: veritabanı şeması (Supabase / PostgreSQL)
-- Supabase panelinde SQL Editor'e yapıştırıp bir kez çalıştır.

create table public.items (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 200),
  price numeric(12,2) not null check (price >= 0),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade
);

create index items_user_id_idx on public.items (user_id);

-- Her kullanıcı yalnızca kendi satırlarını görür ve değiştirir.
alter table public.items enable row level security;

create policy "items_select_own" on public.items
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "items_insert_own" on public.items
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "items_update_own" on public.items
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "items_delete_own" on public.items
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- En az yetki: anonim kullanıcı tabloya hiç erişemez,
-- giriş yapmış kullanıcı yalnızca okuma/ekleme/güncelleme/silme yapabilir.
revoke all on table public.items from anon;
revoke truncate, references, trigger on table public.items from authenticated;
