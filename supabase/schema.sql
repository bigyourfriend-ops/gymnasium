-- ============================================================
-- Ғани Мұратбаев атындағы гимназия — Supabase схемасы (v4: рөлдер конструкторы)
-- Файлды толық қайта іске қосуға болады.
-- ============================================================

-- ---------- Рұқсаттар (өзгертпеңіз: сайт кодымен байланысты) ----------
-- news        Жаңалықтар мен хабарландырулар
-- events      Іс-шаралар күнтізбесі
-- gallery     Фотогалерея
-- schedule    Сабақ және қоңырау кестесі
-- about       Гимназия туралы: әкімшілік, педагогтар, база, серіктестер, сұрақтар
-- life        Үйірмелер, жетістіктер, түлектер
-- docs        Электронды ресурстар мен құжаттар
-- settings    Байланыс деректері, сайт баптаулары
-- feedback    Пікірлерді модерациялау
-- users       Пайдаланушылар мен рөлдерді басқару (толық әкімші)

-- ---------- Рөлдер ----------
create table if not exists public.roles (
  id          text primary key check (id ~ '^[a-z0-9_-]{2,32}$'),
  name        text not null check (char_length(name) between 1 and 60),
  perms       text[] not null default '{}',
  is_system   boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.roles enable row level security;

insert into public.roles (id, name, perms, is_system) values
  ('admin',     'Әкімші / Администратор', array['news','events','gallery','schedule','about','life','docs','settings','projects','feedback','users'], true),
  ('secretary', 'Хатшы / Секретарь',      array['news','events','gallery','schedule','about','life','docs','settings','projects','feedback'], false),
  ('teacher',   'Мұғалім / Учитель',      array['news','events','gallery'], false)
on conflict (id) do nothing;

-- Қызметкерлер: пайдаланушы → рөл
create table if not exists public.staff (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role_id    text not null references public.roles(id) on update cascade on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;

create or replace function public.my_perms()
returns text[] language sql stable security definer set search_path = public as $$
  select coalesce((select r.perms from staff s join roles r on r.id = s.role_id where s.user_id = auth.uid()), '{}'::text[]);
$$;
create or replace function public.has_perm(p text)
returns boolean language sql stable security definer set search_path = public as $$
  select p = any(public.my_perms());
$$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_perm('users');
$$;
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select cardinality(public.my_perms()) > 0;
$$;

drop policy if exists "roles read"   on public.roles;
drop policy if exists "roles insert" on public.roles;
drop policy if exists "roles update" on public.roles;
drop policy if exists "roles delete" on public.roles;
create policy "roles read"   on public.roles for select to authenticated using (true);
create policy "roles insert" on public.roles for insert to authenticated with check (public.is_admin() and not is_system);
create policy "roles update" on public.roles for update to authenticated using (public.is_admin() and not is_system) with check (public.is_admin() and not is_system);
create policy "roles delete" on public.roles for delete to authenticated using (public.is_admin() and not is_system);

drop policy if exists "staff read" on public.staff;
create policy "staff read" on public.staff for select to authenticated using (user_id = auth.uid() or public.is_admin());
-- staff кестесіне жазу тек set_role() арқылы

create or replace function public.set_role(target uuid, role text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  -- соңғы толық әкімшіні алып тастауға болмайды
  if exists (select 1 from staff s join roles r on r.id = s.role_id where s.user_id = target and 'users' = any(r.perms))
     and (role is null or not exists (select 1 from roles where id = role and 'users' = any(perms)))
     and (select count(*) from staff s join roles r on r.id = s.role_id where 'users' = any(r.perms)) <= 1 then
    raise exception 'last admin';
  end if;
  if role is null or role = '' then
    delete from staff where user_id = target;
  else
    insert into staff (user_id, role_id) values (target, role)
    on conflict (user_id) do update set role_id = excluded.role_id;
  end if;
end;
$$;
revoke all on function public.set_role(uuid, text) from public, anon;
grant execute on function public.set_role(uuid, text) to authenticated;

-- ---------- Сайт мазмұны: әр бөлім жеке жазба ----------
create table if not exists public.site_content (
  id          text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);
alter table public.site_content enable row level security;

create or replace function public.section_perm(section text)
returns text language sql immutable set search_path = public as $$
  select case
    when section = 'posts' then 'news'  when section = 'events' then 'events'  when section = 'albums' then 'gallery'
    when section = 'schedule' then 'schedule'  when section = 'docs' then 'docs'  when section = 'settings' then 'settings'
    when section in ('staff','facilities','partners','faq') then 'about'
    when section in ('clubs','achievements','alumni') then 'life'
    when section = 'projects' or section like 'pi\_%' then 'projects'
    else 'users' end;
$$;

-- Жоба материалдары (pi_<id>): "projects" құқығы немесе тек сол жобаның "p_<id>" құқығы
create or replace function public.can_edit_section(section text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_perm(public.section_perm(section))
      or (section like 'pi\_%' and public.has_perm('p_' || substr(section, 4)));
$$;
revoke execute on function public.can_edit_section(text) from anon;

drop policy if exists "content read"   on public.site_content;
drop policy if exists "content insert" on public.site_content;
drop policy if exists "content update" on public.site_content;
create policy "content read"   on public.site_content for select to anon, authenticated using (true);
create policy "content insert" on public.site_content for insert to authenticated with check (public.can_edit_section(id));
create policy "content update" on public.site_content for update to authenticated using (public.can_edit_section(id)) with check (public.can_edit_section(id));

-- ---------- Профильдер ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text check (char_length(full_name) <= 100),
  role        text check (role in ('student','parent','teacher')),
  grade       text check (char_length(grade) <= 12),
  phone       text check (char_length(phone) <= 30),
  avatar_url  text,
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles insert" on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, left(new.raw_user_meta_data ->> 'full_name', 100),
          case when new.raw_user_meta_data ->> 'role' in ('student','parent','teacher') then new.raw_user_meta_data ->> 'role' end)
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- Әкімші поштасы: растағаннан кейін автоматты түрде «admin» рөлі ----------
create table if not exists public.admin_emails (email text primary key);
alter table public.admin_emails enable row level security;
create or replace function public.grant_listed_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null and exists (select 1 from admin_emails where lower(email) = lower(new.email)) then
    insert into staff (user_id, role_id) values (new.id, 'admin') on conflict (user_id) do update set role_id = 'admin';
  end if;
  return new;
end;
$$;
drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed after insert or update of email_confirmed_at on auth.users
  for each row execute function public.grant_listed_admin();

-- ---------- Фото сақтау орны ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 20971520, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = true, file_size_limit = 20971520, allowed_mime_types = array['image/jpeg','image/png','image/webp','application/pdf'];

drop policy if exists "media staff insert" on storage.objects;
drop policy if exists "media staff update" on storage.objects;
drop policy if exists "media staff delete" on storage.objects;
drop policy if exists "avatar own insert"  on storage.objects;
drop policy if exists "avatar own update"  on storage.objects;
drop policy if exists "avatar own select"  on storage.objects;
create policy "media staff insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] <> 'avatars' and public.is_staff());
create policy "media staff update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] <> 'avatars' and public.is_staff());
create policy "media staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());
create policy "avatar own insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "avatar own update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "avatar own select" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text);

-- ---------- Пікірлер мен ұсыныстар ----------
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
drop policy if exists "feedback mod read"   on public.feedback;
drop policy if exists "feedback mod update" on public.feedback;
drop policy if exists "feedback mod delete" on public.feedback;
create policy "feedback mod read"   on public.feedback for select to authenticated using (public.has_perm('feedback'));
create policy "feedback mod update" on public.feedback for update to authenticated using (public.has_perm('feedback')) with check (public.has_perm('feedback'));
create policy "feedback mod delete" on public.feedback for delete to authenticated using (public.has_perm('feedback'));

drop view if exists public.feedback_public;
create or replace function public.public_feedback()
returns table (id bigint, created_at timestamptz, name text, author_role text, kind text, rating smallint, body text, reply text)
language sql stable security definer set search_path = public as $$
  select id, created_at, name, author_role, kind, rating, body, reply
  from feedback where status = 'approved' and public_ok
  order by created_at desc limit 200;
$$;
revoke all on function public.public_feedback() from public;
grant execute on function public.public_feedback() to anon, authenticated;

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
returns void language plpgsql security definer set search_path = public as $$
declare
  v_ip   text := split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1);
  v_hash text := md5('gm-feedback:' || v_ip);
  v_body text := btrim(coalesce(p_body, ''));
  v_status text := 'pending';
begin
  if coalesce(p_hp, '') <> '' then return; end if;
  if coalesce(p_elapsed, 0) < 5 then raise exception 'too_fast'; end if;
  if char_length(v_body) < 15 then raise exception 'too_short'; end if;
  if char_length(v_body) > 1500 then v_body := left(v_body, 1500); end if;
  if (select count(*) from feedback where ip_hash = v_hash and created_at > now() - interval '1 minute') >= 1
     or (select count(*) from feedback where ip_hash = v_hash and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from feedback where ip_hash = v_hash and created_at > now() - interval '1 day') >= 10 then
    raise exception 'rate_limited';
  end if;
  if (select count(*) from feedback where created_at > now() - interval '10 minutes') >= 40 then raise exception 'busy'; end if;
  if exists (select 1 from feedback where ip_hash = v_hash and body = v_body and created_at > now() - interval '1 day') then return; end if;
  if exists (select 1 from feedback_badwords w where lower(v_body || ' ' || coalesce(p_name, '')) like '%' || lower(w.word) || '%')
     or v_body ~* '(https?://|www\.|\.(com|ru|kz|net|org)\M|t\.me/)'
     or v_body ~ '(.)\1{7,}'
     or (char_length(regexp_replace(v_body, '[^A-ZА-ЯЁӘҒҚҢӨҰҮҺІ]', '', 'g'))::float / greatest(char_length(v_body), 1)) > 0.6 then
    v_status := 'spam';
  end if;
  insert into feedback (name, author_role, kind, rating, body, contact, public_ok, status, ip_hash)
  values (nullif(left(btrim(coalesce(p_name, '')), 60), ''),
          case when p_role in ('parent','student','graduate','other') then p_role else 'other' end,
          case when p_kind in ('review','idea','thanks','complaint') then p_kind else 'review' end,
          case when p_rating between 1 and 5 then p_rating else null end,
          v_body, nullif(left(btrim(coalesce(p_contact, '')), 100), ''), coalesce(p_public, true), v_status, v_hash);
end;
$$;
revoke all on function public.submit_feedback(text, text, text, int, text, text, boolean, text, int) from public;
grant execute on function public.submit_feedback(text, text, text, int, text, text, boolean, text, int) to anon, authenticated;

-- Ішкі функцияларды қонақтарға жабу
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.has_perm(text) from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_staff() from public, anon;
revoke execute on function public.my_perms() from public, anon;
grant execute on function public.has_perm(text) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.my_perms() to authenticated;
revoke execute on function public.grant_listed_admin() from public, anon, authenticated;

-- ============================================================
-- ӘКІМШІ ПОШТАСЫ / ПОЧТА АДМИНИСТРАТОРА:
-- insert into public.admin_emails (email) values ('admin@example.com') on conflict do nothing;
-- Немесе тіркелгеннен кейін / Или после регистрации:
-- insert into public.staff (user_id, role_id) select id, 'admin' from auth.users where email = 'admin@example.com'
--   on conflict (user_id) do update set role_id = 'admin';
-- ============================================================
