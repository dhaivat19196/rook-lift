-- Chess Climb sync table. Run once in the Supabase SQL editor.
create table if not exists public.chess_kv (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create index if not exists chess_kv_user_updated_idx on public.chess_kv (user_id, updated_at);

alter table public.chess_kv enable row level security;

drop policy if exists "chess_kv select own" on public.chess_kv;
drop policy if exists "chess_kv insert own" on public.chess_kv;
drop policy if exists "chess_kv update own" on public.chess_kv;
drop policy if exists "chess_kv delete own" on public.chess_kv;

create policy "chess_kv select own" on public.chess_kv for select using (auth.uid() = user_id);
create policy "chess_kv insert own" on public.chess_kv for insert with check (auth.uid() = user_id);
create policy "chess_kv update own" on public.chess_kv for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chess_kv delete own" on public.chess_kv for delete using (auth.uid() = user_id);
