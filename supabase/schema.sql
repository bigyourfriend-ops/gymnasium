-- ============================================================
-- Ғани Мұратбаев атындағы гимназия — Supabase схемасы
-- Supabase → SQL Editor → New query → осы файлды толық қойып, Run басыңыз.
-- Supabase → SQL Editor → New query → вставьте файл целиком и нажмите Run.
-- Файлды қайта іске қосуға болады (қауіпсіз).
-- ============================================================

-- 1. Сайт мазмұны (жаңалықтар, кесте, галерея...) — бір JSON жазба
create table if not exists public.site_content (
  id          text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);

-- 2. Сайт әкімшілері (өңдеу құқығы бар пайдаланушылар)
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 3. Тіркелген пайдаланушылар профилі (аты-жөні, рөлі)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  role       text check (role in ('student','parent','teacher')),
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.admins       enable row level security;
alter table public.profiles     enable row level security;

-- Ағымдағы пайдаланушы әкімші ме?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- site_content: барлығы оқи алады, тек әкімші жазады
drop policy if exists "content read"   on public.site_content;
drop policy if exists "content insert" on public.site_content;
drop policy if exists "content update" on public.site_content;
create policy "content read"   on public.site_content for select to anon, authenticated using (true);
create policy "content insert" on public.site_content for insert to authenticated with check (public.is_admin());
create policy "content update" on public.site_content for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- admins: пайдаланушы тек өзінің жазбасын көреді; тізімді әкімші көреді.
-- Әкімшіні қосу/жою тек SQL Editor арқылы (сайттан мүмкін емес).
drop policy if exists "admins read" on public.admins;
create policy "admins read" on public.admins for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- profiles: өз профилін көреді және өзгертеді; әкімші барлығын көреді
drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Тіркелгенде профильді автоматты түрде жасау
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    case when new.raw_user_meta_data ->> 'role' in ('student','parent','teacher')
         then new.raw_user_meta_data ->> 'role' else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Фото сақтау орны (Storage): "media" бакеті, барлығына ашық оқу
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media admin insert" on storage.objects;
drop policy if exists "media admin update" on storage.objects;
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ============================================================
-- 5. ӘКІМШІНІ ТАҒАЙЫНДАУ / НАЗНАЧИТЬ АДМИНИСТРАТОРА
-- Алдымен сайтта осы поштамен тіркеліп, хатты растаңыз.
-- Сначала зарегистрируйтесь на сайте с этой почтой и подтвердите письмо.
-- Содан кейін төмендегі жолда поштаны ауыстырып, тек осы жолды іске қосыңыз:
-- Затем замените почту в строке ниже и выполните только её:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'admin@example.com'
-- on conflict do nothing;
-- ============================================================
