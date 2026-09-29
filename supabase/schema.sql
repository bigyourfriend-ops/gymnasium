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

-- ============================================================
-- 7. ПІКІРЛЕР МЕН ҰСЫНЫСТАР / ОТЗЫВЫ И ПРЕДЛОЖЕНИЯ (v3)
-- Тіркелусіз жазуға болады, бірақ:
--  • барлық пікір жариялау алдында әкімші тексереді (модерация)
--  • бір құрылғыдан/IP-ден сағатына 3, минутына 1 пікір ғана
--  • балағат сөздер мен сілтемелер автоматты түрде «Спам»-ға түседі
--  • бот-тұзақ (жасырын өріс) және тым жылдам жіберуді тексеру
--  • IP адрестің өзі сақталмайды, тек оның хэші
-- ============================================================
create table if not exists public.feedback (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  name         text check (char_length(name) <= 60),
  author_role  text not null default 'other' check (author_role in ('parent','student','graduate','other')),
  kind         text not null default 'review' check (kind in ('review','idea','thanks','complaint')),
  rating       smallint check (rating between 1 and 5),
  body         text not null check (char_length(body) between 15 and 1500),
  contact      text check (char_length(contact) <= 100),
  public_ok    boolean not null default true,
  status       text not null default 'pending' check (status in ('pending','approved','read','rejected','spam')),
  reply        text check (char_length(reply) <= 1500),
  ip_hash      text
);
create index if not exists feedback_ip_time on public.feedback (ip_hash, created_at desc);
create index if not exists feedback_status  on public.feedback (status, created_at desc);
alter table public.feedback enable row level security;

-- Тек әкімші көреді/өзгертеді/жояды. Қонақтар тікелей жаза алмайды (тек submit_feedback арқылы).
drop policy if exists "feedback admin read"   on public.feedback;
drop policy if exists "feedback admin update" on public.feedback;
drop policy if exists "feedback admin delete" on public.feedback;
create policy "feedback admin read"   on public.feedback for select to authenticated using (public.is_admin());
create policy "feedback admin update" on public.feedback for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "feedback admin delete" on public.feedback for delete to authenticated using (public.is_admin());

-- Жарияланған пікірлер ғана, байланыс пен IP-сіз
create or replace view public.feedback_public as
  select id, created_at, name, author_role, kind, rating, body, reply
  from public.feedback
  where status = 'approved' and public_ok;
grant select on public.feedback_public to anon, authenticated;

-- Тыйым салынған сөздер тізімі (өзіңіз толықтыра аласыз: insert into public.feedback_badwords values ('...');)
create table if not exists public.feedback_badwords (word text primary key);
alter table public.feedback_badwords enable row level security;
insert into public.feedback_badwords (word) values
  ('хуй'),('хуе'),('хуё'),('пизд'),('ебат'),('ебан'),('ебал'),('ёбан'),('бля'),('сука'),('мудак'),('мудил'),('пидор'),('пидар'),('гандон'),('залуп'),('шлюх'),('чмо'),('дебил'),('урод'),
  ('шешеңді'),('шешеңнің'),('атаңның'),('қотақ'),('сігейін'),('ақымақ'),('малғұн'),
  ('fuck'),('shit'),('bitch'),('casino'),('казино'),('ставки'),('crypto')
on conflict do nothing;

create or replace function public.submit_feedback(
  p_name text, p_role text, p_kind text, p_rating int, p_body text,
  p_contact text, p_public boolean, p_hp text, p_elapsed int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip   text := split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1);
  v_hash text := md5('gm-feedback:' || v_ip);
  v_body text := btrim(coalesce(p_body, ''));
  v_status text := 'pending';
begin
  -- бот-тұзақ толтырылса — ештеңе сақтамай, «сәтті» деп қайтарамыз
  if coalesce(p_hp, '') <> '' then return; end if;
  if coalesce(p_elapsed, 0) < 5 then raise exception 'too_fast'; end if;
  if char_length(v_body) < 15 then raise exception 'too_short'; end if;
  if char_length(v_body) > 1500 then v_body := left(v_body, 1500); end if;

  -- жиілікті шектеу
  if (select count(*) from feedback where ip_hash = v_hash and created_at > now() - interval '1 minute') >= 1
     or (select count(*) from feedback where ip_hash = v_hash and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from feedback where ip_hash = v_hash and created_at > now() - interval '1 day') >= 10 then
    raise exception 'rate_limited';
  end if;
  if (select count(*) from feedback where created_at > now() - interval '10 minutes') >= 40 then
    raise exception 'busy';
  end if;
  -- бір мәтінді қайта жіберу
  if exists (select 1 from feedback where ip_hash = v_hash and body = v_body and created_at > now() - interval '1 day') then
    return;
  end if;

  -- автоматты сүзгі: балағат, сілтеме, бір әріптің қайталануы, CAPS
  if exists (select 1 from feedback_badwords w
             where lower(v_body || ' ' || coalesce(p_name, '')) like '%' || lower(w.word) || '%')
     or v_body ~* '(https?://|www\.|\.(com|ru|kz|net|org)\b|t\.me/)'
     or v_body ~ '(.)\1{7,}'
     or (char_length(regexp_replace(v_body, '[^A-ZА-ЯЁӘҒҚҢӨҰҮҺІ]', '', 'g'))::float / greatest(char_length(v_body), 1)) > 0.6 then
    v_status := 'spam';
  end if;

  insert into feedback (name, author_role, kind, rating, body, contact, public_ok, status, ip_hash)
  values (
    nullif(left(btrim(coalesce(p_name, '')), 60), ''),
    case when p_role in ('parent','student','graduate','other') then p_role else 'other' end,
    case when p_kind in ('review','idea','thanks','complaint') then p_kind else 'review' end,
    case when p_rating between 1 and 5 then p_rating else null end,
    v_body,
    nullif(left(btrim(coalesce(p_contact, '')), 100), ''),
    coalesce(p_public, true),
    v_status,
    v_hash
  );
end;
$$;
revoke all on function public.submit_feedback(text, text, text, int, text, text, boolean, text, int) from public;
grant execute on function public.submit_feedback(text, text, text, int, text, text, boolean, text, int) to anon, authenticated;
