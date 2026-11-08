-- Bulking & Workout Tracker — Fase 1
-- Jalankan sekali di Supabase: Dashboard → SQL Editor → New query → tempel → Run.

create table if not exists public.log_harian (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tanggal         date not null,
  split           text not null check (split in ('Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Rest')),
  protein_gram    integer not null check (protein_gram between 0 and 500),
  berat_badan_kg  numeric(5, 1) check (berat_badan_kg is null or berat_badan_kg between 20 and 300),
  catatan         text not null default '' check (char_length(catatan) <= 200),
  created_at      timestamptz not null default now(),
  -- Satu log per tanggal per user.
  constraint log_harian_satu_per_hari unique (user_id, tanggal)
);

-- Row Level Security: user hanya bisa melihat dan mengubah log miliknya sendiri.
alter table public.log_harian enable row level security;

drop policy if exists "Lihat log sendiri" on public.log_harian;
create policy "Lihat log sendiri" on public.log_harian
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Tambah log sendiri" on public.log_harian;
create policy "Tambah log sendiri" on public.log_harian
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Ubah log sendiri" on public.log_harian;
create policy "Ubah log sendiri" on public.log_harian
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Hapus log sendiri" on public.log_harian;
create policy "Hapus log sendiri" on public.log_harian
  for delete to authenticated using (auth.uid() = user_id);
