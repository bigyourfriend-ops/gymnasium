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
-- 6. Профиль өрістері, аватар, әкімшілерді басқару (v2)
-- ============================================================
alter table public.profiles add column if not exists grade      text;
alter table public.profiles add column if not exists phone      text;
alter table public.profiles add column if not exists avatar_url text;

-- Пайдаланушы өз профилін жасай алады (upsert үшін)
drop policy if exists "profiles insert" on public.profiles;
create policy "profiles insert" on public.profiles for insert to authenticated with check (id = auth.uid());

-- Бұрын тіркелгендерге профиль жасау
insert into public.profiles (id, email, full_name, role)
select u.id, u.email, u.raw_user_meta_data ->> 'full_name',
       case when u.raw_user_meta_data ->> 'role' in ('student','parent','teacher') then u.raw_user_meta_data ->> 'role' end
from auth.users u
on conflict (id) do nothing;

-- Аватар: әр пайдаланушы тек өз папкасына (avatars/<user id>/...) жүктей алады
drop policy if exists "avatar own insert" on storage.objects;
drop policy if exists "avatar own update" on storage.objects;
drop policy if exists "avatar own select" on storage.objects;
create policy "avatar own select" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "avatar own insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "avatar own update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text);

-- Әкімші басқа пайдаланушыны әкімші ете алады немесе құқығын ала алады
create or replace function public.set_admin(target uuid, make boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  if make then
    insert into public.admins (user_id) values (target) on conflict do nothing;
  else
    if (select count(*) from public.admins) <= 1 then
      raise exception 'last admin';
    end if;
    delete from public.admins where user_id = target;
  end if;
end;
$$;
revoke all on function public.set_admin(uuid, boolean) from public, anon;
grant execute on function public.set_admin(uuid, boolean) to authenticated;

-- Әкімші поштасының тізімі: осы поштамен тіркеліп, растаған адам автоматты түрде әкімші болады
-- Список почт администраторов: кто зарегистрируется с этой почтой и подтвердит её, сразу станет админом
create table if not exists public.admin_emails (email text primary key);
alter table public.admin_emails enable row level security;   -- сайттан оқуға/жазуға болмайды

create or replace function public.grant_listed_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null
     and exists (select 1 from public.admin_emails where lower(email) = lower(new.email)) then
    insert into public.admins (user_id) values (new.id) on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.grant_listed_admin();

-- ӘКІМШІ ПОШТАСЫН ОСЫ ЖЕРГЕ ЖАЗЫҢЫЗ / ВПИШИТЕ ПОЧТУ АДМИНИСТРАТОРА:
-- insert into public.admin_emails (email) values ('admin@example.com') on conflict do nothing;

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
