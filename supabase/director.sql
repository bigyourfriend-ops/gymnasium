-- ============================================================
-- Директорға хат / Письмо директору (#director)
-- Файлды толық қайта іске қосуға болады. Можно запускать повторно.
--
-- Принцип:
--  * писать можно без входа; имя и контакт — по желанию (можно анонимно);
--  * автор получает код (DR-XXXX-XXXX) и по нему видит ответ директора и может дописать;
--    в базе лежит только хэш кода;
--  * если автор вошёл на сайт и не выбрал «анонимно», письмо видно ему в разделе
--    «Менің хаттарым» без кода;
--  * читать письма может ТОЛЬКО роль с правом «director» (роль «Директор»).
--    У администратора сайта этого права НЕТ — письма личные, для директора;
--  * IP не хранится; для антиспама — только хэш IP в отдельной таблице, удаляется через сутки.
-- ============================================================

-- Роль директора
insert into public.roles (id, name, perms, is_system)
values ('director', 'Директор', array['director','feedback','news'], false)
on conflict (id) do nothing;

-- Строгая проверка: только явное право director (полный админ НЕ получает его автоматически)
create or replace function public.dir_is_director()
returns boolean language sql stable security definer set search_path = public as $$
  select 'director' = any(public.my_perms());
$$;

-- ---------- Письма ----------
create table if not exists public.dir_letters (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  code_hash     text not null unique,
  user_id       uuid references auth.users(id) on delete set null,
  author_role   text not null default 'other' check (author_role in ('parent','student','teacher','graduate','other')),
  topic         text not null default 'question' check (topic in ('question','suggestion','complaint','thanks','other')),
  subject       text check (char_length(subject) <= 120),
  body          text not null check (char_length(body) between 10 and 4000),
  name          text check (char_length(name) <= 80),
  grade         text check (char_length(grade) <= 12),
  contact       text check (char_length(contact) <= 150),
  anonymous     boolean not null default false,
  status        text not null default 'new' check (status in ('new','in_progress','closed','spam')),
  dir_unread    boolean not null default true,
  author_unread boolean not null default false,
  last_activity timestamptz not null default now()
);
create index if not exists dir_letters_status on public.dir_letters (status, last_activity desc);
create index if not exists dir_letters_user   on public.dir_letters (user_id, last_activity desc);
alter table public.dir_letters enable row level security;

create table if not exists public.dir_messages (
  id          bigint generated always as identity primary key,
  letter_id   bigint not null references public.dir_letters(id) on delete cascade,
  created_at  timestamptz not null default now(),
  author      text not null check (author in ('author','director')),
  body        text not null check (char_length(body) between 1 and 3000),
  staff_id    uuid references auth.users(id) on delete set null
);
create index if not exists dir_messages_letter on public.dir_messages (letter_id, created_at);
alter table public.dir_messages enable row level security;

create table if not exists public.dir_rate (
  ip_hash    text not null,
  kind       text not null,
  created_at timestamptz not null default now()
);
create index if not exists dir_rate_idx on public.dir_rate (ip_hash, kind, created_at desc);
alter table public.dir_rate enable row level security;
-- политик нет: таблица доступна только функциям ниже

drop policy if exists "dir read"   on public.dir_letters;
drop policy if exists "dir update" on public.dir_letters;
drop policy if exists "dir delete" on public.dir_letters;
create policy "dir read"   on public.dir_letters for select to authenticated using (public.dir_is_director());
create policy "dir update" on public.dir_letters for update to authenticated using (public.dir_is_director()) with check (public.dir_is_director());
create policy "dir delete" on public.dir_letters for delete to authenticated using (public.dir_is_director());

drop policy if exists "dir msg read" on public.dir_messages;
create policy "dir msg read" on public.dir_messages for select to authenticated using (public.dir_is_director());
-- писать сообщения можно только через функции

-- ---------- Вспомогательные ----------
create or replace function public.dir_ip_hash()
returns text language sql stable set search_path = public as $$
  select md5('gm-dir:' || split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1));
$$;

create or replace function public.dir_code_hash(p_code text)
returns text language sql immutable set search_path = public as $$
  select encode(sha256(convert_to('gm-dir-code:' || upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g')), 'UTF8')), 'hex');
$$;

create or replace function public.dir_limit(p_kind text, p_max int, p_window interval)
returns void language plpgsql security definer set search_path = public as $$
declare v_hash text := public.dir_ip_hash();
begin
  delete from dir_rate where created_at < now() - interval '1 day';
  if (select count(*) from dir_rate where ip_hash = v_hash and kind = p_kind and created_at > now() - p_window) >= p_max then
    raise exception 'rate_limited';
  end if;
  insert into dir_rate (ip_hash, kind) values (v_hash, p_kind);
end;
$$;

create or replace function public.dir_thread_json(r public.dir_letters)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'id', r.id, 'created_at', r.created_at, 'status', case when r.status = 'spam' then 'closed' else r.status end,
    'topic', r.topic, 'subject', r.subject, 'body', r.body, 'unread', r.author_unread,
    'messages', coalesce((select json_agg(json_build_object('author', m.author, 'body', m.body, 'created_at', m.created_at) order by m.created_at)
                          from dir_messages m where m.letter_id = r.id), '[]'::json));
$$;

-- ---------- Отправить письмо → код ----------
create or replace function public.dir_submit(
  p_role text, p_topic text, p_subject text, p_body text, p_name text,
  p_grade text, p_contact text, p_anon boolean, p_hp text, p_elapsed int)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_body text := btrim(coalesce(p_body, ''));
  v_alpha text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_hex text;
  v_raw text;
  v_code text;
  v_anon boolean := coalesce(p_anon, false);
  i int;
begin
  if coalesce(p_hp, '') <> '' then raise exception 'bad_request'; end if;
  if coalesce(p_elapsed, 0) < 4 then raise exception 'too_fast'; end if;
  if char_length(v_body) < 10 then raise exception 'too_short'; end if;
  if (select count(*) from dir_letters where created_at > now() - interval '10 minutes') >= 40 then raise exception 'busy'; end if;
  perform public.dir_limit('submit_h', 3, interval '1 hour');
  perform public.dir_limit('submit_d', 8, interval '1 day');

  loop
    v_hex := replace(gen_random_uuid()::text, '-', '');
    v_raw := '';
    for i in 0..7 loop
      v_raw := v_raw || substr(v_alpha, (('x' || substr(v_hex, i * 2 + 1, 2))::bit(8)::int % 31) + 1, 1);
    end loop;
    v_code := 'DR-' || substr(v_raw, 1, 4) || '-' || substr(v_raw, 5, 4);
    exit when not exists (select 1 from dir_letters where code_hash = public.dir_code_hash(v_code));
  end loop;

  insert into dir_letters (code_hash, user_id, author_role, topic, subject, body, name, grade, contact, anonymous)
  values (public.dir_code_hash(v_code),
          case when v_anon then null else auth.uid() end,
          case when p_role in ('parent','student','teacher','graduate','other') then p_role else 'other' end,
          case when p_topic in ('question','suggestion','complaint','thanks','other') then p_topic else 'other' end,
          nullif(left(btrim(coalesce(p_subject, '')), 120), ''),
          left(v_body, 4000),
          case when v_anon then null else nullif(left(btrim(coalesce(p_name, '')), 80), '') end,
          nullif(left(btrim(coalesce(p_grade, '')), 12), ''),
          case when v_anon then null else nullif(left(btrim(coalesce(p_contact, '')), 150), '') end,
          v_anon);
  return v_code;
end;
$$;

-- ---------- Автор: открыть переписку по коду ----------
create or replace function public.dir_thread(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare r dir_letters;
begin
  select * into r from dir_letters where code_hash = public.dir_code_hash(p_code);
  if r.id is null then
    perform public.dir_limit('miss', 15, interval '1 hour');
    return null;
  end if;
  update dir_letters set author_unread = false where id = r.id;
  return public.dir_thread_json(r);
end;
$$;

-- ---------- Автор (вошёл на сайт): мои письма ----------
create or replace function public.dir_my_letters()
returns json language sql security definer set search_path = public as $$
  select coalesce(json_agg(public.dir_thread_json(l) order by l.last_activity desc), '[]'::json)
  from dir_letters l where auth.uid() is not null and l.user_id = auth.uid();
$$;

create or replace function public.dir_my_seen(p_id bigint)
returns void language sql security definer set search_path = public as $$
  update dir_letters set author_unread = false where id = p_id and user_id = auth.uid();
$$;

-- ---------- Автор: дописать (по коду или по своему письму) ----------
create or replace function public.dir_author_reply(p_code text, p_id bigint, p_body text)
returns void language plpgsql security definer set search_path = public as $$
declare v_id bigint; v_body text := btrim(coalesce(p_body, ''));
begin
  if char_length(v_body) < 1 then raise exception 'too_short'; end if;
  if coalesce(p_code, '') <> '' then
    select id into v_id from dir_letters where code_hash = public.dir_code_hash(p_code);
  elsif p_id is not null and auth.uid() is not null then
    select id into v_id from dir_letters where id = p_id and user_id = auth.uid();
  end if;
  if v_id is null then
    perform public.dir_limit('miss', 15, interval '1 hour');
    raise exception 'not_found';
  end if;
  perform public.dir_limit('reply', 10, interval '1 hour');
  insert into dir_messages (letter_id, author, body) values (v_id, 'author', left(v_body, 3000));
  update dir_letters set dir_unread = true, last_activity = now(),
         status = case when status in ('closed','spam') then 'in_progress' else status end
   where id = v_id;
end;
$$;

-- ---------- Директор: ответить ----------
create or replace function public.dir_reply(p_id bigint, p_body text)
returns void language plpgsql security definer set search_path = public as $$
declare v_body text := btrim(coalesce(p_body, ''));
begin
  if not public.dir_is_director() then raise exception 'not allowed'; end if;
  if char_length(v_body) < 1 then raise exception 'too_short'; end if;
  insert into dir_messages (letter_id, author, body, staff_id) values (p_id, 'director', left(v_body, 3000), auth.uid());
  update dir_letters set dir_unread = false, author_unread = true, last_activity = now(),
         status = case when status = 'new' then 'in_progress' else status end
   where id = p_id;
end;
$$;

revoke all on function public.dir_is_director() from public, anon;
revoke all on function public.dir_ip_hash() from public, anon, authenticated;
revoke all on function public.dir_code_hash(text) from public, anon, authenticated;
revoke all on function public.dir_limit(text, int, interval) from public, anon, authenticated;
revoke all on function public.dir_thread_json(public.dir_letters) from public, anon, authenticated;
revoke all on function public.dir_submit(text, text, text, text, text, text, text, boolean, text, int) from public;
revoke all on function public.dir_thread(text) from public;
revoke all on function public.dir_my_letters() from public, anon;
revoke all on function public.dir_my_seen(bigint) from public, anon;
revoke all on function public.dir_author_reply(text, bigint, text) from public;
revoke all on function public.dir_reply(bigint, text) from public, anon;
grant execute on function public.dir_is_director() to authenticated;
grant execute on function public.dir_submit(text, text, text, text, text, text, text, boolean, text, int) to anon, authenticated;
grant execute on function public.dir_thread(text) to anon, authenticated;
grant execute on function public.dir_my_letters() to authenticated;
grant execute on function public.dir_my_seen(bigint) to authenticated;
grant execute on function public.dir_author_reply(text, bigint, text) to anon, authenticated;
grant execute on function public.dir_reply(bigint, text) to authenticated;
