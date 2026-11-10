-- BulkUp (Bulking & Workout Tracker) — skema database Supabase
-- Sudah diterapkan ke project "GlobDev" sebagai migration `buat_log_harian` dan `buat_profil`.
-- Untuk project baru: Dashboard → SQL Editor → New query → tempel seluruh file → Run.
--
-- Tabel:
--   public.log_harian  satu baris per user per tanggal (split, protein, berat, catatan)
--   public.profil      satu baris per user (nama, target protein), dibuat otomatis saat daftar

-- =====================================================================
-- 1. Log Harian
-- =====================================================================

create table if not exists public.log_harian (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tanggal         date not null,
  split           text not null check (split in ('Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Rest')),
  protein_gram    integer not null check (protein_gram between 0 and 500),
  berat_badan_kg  numeric(5, 1) check (berat_badan_kg is null or berat_badan_kg between 20 and 300),
  catatan         text not null default '' check (char_length(catatan) <= 200),
  created_at      timestamptz not null default now(),
  -- Satu log per tanggal per user (sekaligus indeks untuk query per user).
  constraint log_harian_satu_per_hari unique (user_id, tanggal)
);

-- Row Level Security: user hanya bisa melihat dan mengubah log miliknya sendiri.
-- (select auth.uid()) dievaluasi sekali per query, bukan per baris.
alter table public.log_harian enable row level security;

drop policy if exists "Lihat log sendiri" on public.log_harian;
create policy "Lihat log sendiri" on public.log_harian
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Tambah log sendiri" on public.log_harian;
create policy "Tambah log sendiri" on public.log_harian
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Ubah log sendiri" on public.log_harian;
create policy "Ubah log sendiri" on public.log_harian
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Hapus log sendiri" on public.log_harian;
create policy "Hapus log sendiri" on public.log_harian
  for delete to authenticated using ((select auth.uid()) = user_id);

-- =====================================================================
-- 2. Profil
-- =====================================================================

create table if not exists public.profil (
  id              uuid primary key references auth.users (id) on delete cascade,
  nama            text not null check (char_length(nama) between 1 and 80),
  target_protein  integer not null default 130 check (target_protein between 50 and 400),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.profil enable row level security;

drop policy if exists "Lihat profil sendiri" on public.profil;
create policy "Lihat profil sendiri" on public.profil
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "Buat profil sendiri" on public.profil;
create policy "Buat profil sendiri" on public.profil
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "Ubah profil sendiri" on public.profil;
create policy "Ubah profil sendiri" on public.profil
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Fungsi trigger di schema private (tidak terekspos lewat API).
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Saat ada akun baru di auth.users, buat baris profil dari metadata pendaftaran
-- (nama & target_protein dikirim aplikasi lewat supabase.auth.signUp options.data).
create or replace function private.buat_profil_baru()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nama   text := left(nullif(trim(new.raw_user_meta_data ->> 'nama'), ''), 80);
  v_target integer := 130;
begin
  if (new.raw_user_meta_data ->> 'target_protein') ~ '^\d{2,3}$' then
    v_target := (new.raw_user_meta_data ->> 'target_protein')::integer;
    if v_target not between 50 and 400 then v_target := 130; end if;
  end if;

  insert into public.profil (id, nama, target_protein)
  values (new.id, coalesce(v_nama, nullif(split_part(new.email, '@', 1), ''), 'Kamu'), v_target)
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.buat_profil_baru() from public, anon, authenticated;

drop trigger if exists saat_user_baru on auth.users;
create trigger saat_user_baru
  after insert on auth.users
  for each row execute function private.buat_profil_baru();

-- updated_at otomatis.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.set_updated_at() from public, anon, authenticated;

drop trigger if exists profil_updated_at on public.profil;
create trigger profil_updated_at
  before update on public.profil
  for each row execute function private.set_updated_at();
