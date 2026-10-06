-- ============================================================
-- Сенім жәшігі / Обращения о буллинге (#help)
-- Файлды толық қайта іске қосуға болады. Можно запускать повторно.
--
-- Принцип:
--  * ученик пишет без входа и без имени;
--  * IP-адрес и данные устройства к обращению НЕ привязываются;
--    для защиты от спама хранится только хэш IP в отдельной таблице help_rate,
--    без связи с обращением, и он удаляется через сутки;
--  * ученик получает код (GM-XXXX-XXXX); в базе лежит только хэш кода,
--    поэтому даже сотрудник не может «зайти» от имени ученика;
--  * читать обращения может только роль с правом «help»
--    (по умолчанию — «Психолог»; у администратора этого права НЕТ).
-- ============================================================

-- Роль психолога (право help)
insert into public.roles (id, name, perms, is_system)
values ('psychologist', 'Психолог', array['help'], false)
on conflict (id) do nothing;

-- ---------- Обращения ----------
create table if not exists public.help_reports (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  code_hash     text not null unique,
  who           text not null default 'self'  check (who in ('self','witness')),
  place         text not null default 'other' check (place in ('class','corridor','canteen','outside','online','other')),
  freq          text not null default 'once'  check (freq in ('once','several','long')),
  body          text not null check (char_length(body) between 10 and 3000),
  involved      text check (char_length(involved) <= 300),
  grade         text check (char_length(grade) <= 12),
  wants_talk    boolean not null default false,
  contact       text check (char_length(contact) <= 150),
  status        text not null default 'new' check (status in ('new','in_progress','closed','spam')),
  staff_unread  boolean not null default true,
  last_activity timestamptz not null default now()
);
create index if not exists help_reports_status on public.help_reports (status, last_activity desc);
alter table public.help_reports enable row level security;

create table if not exists public.help_messages (
  id          bigint generated always as identity primary key,
  report_id   bigint not null references public.help_reports(id) on delete cascade,
  created_at  timestamptz not null default now(),
  author      text not null check (author in ('student','staff')),
  body        text not null check (char_length(body) between 1 and 2000),
  staff_id    uuid references auth.users(id) on delete set null
);
create index if not exists help_messages_report on public.help_messages (report_id, created_at);
alter table public.help_messages enable row level security;

-- Антиспам: только хэш IP, без связи с обращением, хранится до суток
create table if not exists public.help_rate (
  ip_hash    text not null,
  kind       text not null,
  created_at timestamptz not null default now()
);
create index if not exists help_rate_idx on public.help_rate (ip_hash, kind, created_at desc);
alter table public.help_rate enable row level security;
-- политик нет: таблица доступна только функциям ниже

drop policy if exists "help read"   on public.help_reports;
drop policy if exists "help update" on public.help_reports;
drop policy if exists "help delete" on public.help_reports;
create policy "help read"   on public.help_reports for select to authenticated using (public.has_perm('help'));
create policy "help update" on public.help_reports for update to authenticated using (public.has_perm('help')) with check (public.has_perm('help'));
create policy "help delete" on public.help_reports for delete to authenticated using (public.has_perm('help'));

drop policy if exists "help msg read" on public.help_messages;
create policy "help msg read" on public.help_messages for select to authenticated using (public.has_perm('help'));
-- писать сообщения можно только через функции

-- ---------- Вспомогательные ----------
create or replace function public.help_ip_hash()
returns text language sql stable set search_path = public as $$
  select md5('gm-help:' || split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1));
$$;

create or replace function public.help_code_hash(p_code text)
returns text language sql immutable set search_path = public, extensions as $$
  select encode(extensions.digest('gm-help-code:' || upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g')), 'sha256'), 'hex');
$$;

-- лимит: сколько раз за интервал можно сделать действие kind
create or replace function public.help_limit(p_kind text, p_max int, p_window interval)
returns void language plpgsql security definer set search_path = public as $$
declare v_hash text := public.help_ip_hash();
begin
  delete from help_rate where created_at < now() - interval '1 day';
  if (select count(*) from help_rate where ip_hash = v_hash and kind = p_kind and created_at > now() - p_window) >= p_max then
    raise exception 'rate_limited';
  end if;
  insert into help_rate (ip_hash, kind) values (v_hash, p_kind);
end;
$$;

-- ---------- Отправить обращение (без входа) → код ----------
create or replace function public.help_submit(
  p_who text, p_place text, p_freq text, p_body text, p_involved text,
  p_grade text, p_talk boolean, p_contact text, p_hp text, p_elapsed int)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare
  v_body text := btrim(coalesce(p_body, ''));
  v_alpha text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_bytes bytea;
  v_raw text;
  v_code text;
  i int;
begin
  if coalesce(p_hp, '') <> '' then raise exception 'bad_request'; end if;
  if coalesce(p_elapsed, 0) < 4 then raise exception 'too_fast'; end if;
  if char_length(v_body) < 10 then raise exception 'too_short'; end if;
  if (select count(*) from help_reports where created_at > now() - interval '10 minutes') >= 60 then raise exception 'busy'; end if;
  perform public.help_limit('submit_h', 3, interval '1 hour');
  perform public.help_limit('submit_d', 8, interval '1 day');

  loop
    v_bytes := extensions.gen_random_bytes(8);
    v_raw := '';
    for i in 0..7 loop
      v_raw := v_raw || substr(v_alpha, (get_byte(v_bytes, i) % 31) + 1, 1);
    end loop;
    v_code := 'GM-' || substr(v_raw, 1, 4) || '-' || substr(v_raw, 5, 4);
    exit when not exists (select 1 from help_reports where code_hash = public.help_code_hash(v_code));
  end loop;

  insert into help_reports (code_hash, who, place, freq, body, involved, grade, wants_talk, contact)
  values (public.help_code_hash(v_code),
          case when p_who in ('self','witness') then p_who else 'self' end,
          case when p_place in ('class','corridor','canteen','outside','online','other') then p_place else 'other' end,
          case when p_freq in ('once','several','long') then p_freq else 'once' end,
          left(v_body, 3000),
          nullif(left(btrim(coalesce(p_involved, '')), 300), ''),
          nullif(left(btrim(coalesce(p_grade, '')), 12), ''),
          coalesce(p_talk, false),
          case when coalesce(p_talk, false) then nullif(left(btrim(coalesce(p_contact, '')), 150), '') end);
  return v_code;
end;
$$;

-- ---------- Ученик: открыть переписку по коду ----------
create or replace function public.help_thread(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare r help_reports;
begin
  select * into r from help_reports where code_hash = public.help_code_hash(p_code);
  if r.id is null then
    perform public.help_limit('miss', 15, interval '1 hour');
    return null;
  end if;
  return json_build_object(
    'created_at', r.created_at, 'status', case when r.status = 'spam' then 'closed' else r.status end,
    'who', r.who, 'place', r.place, 'freq', r.freq, 'body', r.body,
    'messages', coalesce((select json_agg(json_build_object('author', m.author, 'body', m.body, 'created_at', m.created_at) order by m.created_at)
                          from help_messages m where m.report_id = r.id), '[]'::json));
end;
$$;

-- ---------- Ученик: дописать ----------
create or replace function public.help_student_reply(p_code text, p_body text)
returns void language plpgsql security definer set search_path = public as $$
declare v_id bigint; v_body text := btrim(coalesce(p_body, ''));
begin
  if char_length(v_body) < 1 then raise exception 'too_short'; end if;
  select id into v_id from help_reports where code_hash = public.help_code_hash(p_code);
  if v_id is null then
    perform public.help_limit('miss', 15, interval '1 hour');
    raise exception 'not_found';
  end if;
  perform public.help_limit('reply', 10, interval '1 hour');
  insert into help_messages (report_id, author, body) values (v_id, 'student', left(v_body, 2000));
  update help_reports set staff_unread = true, last_activity = now(),
         status = case when status = 'closed' then 'in_progress' else status end
   where id = v_id;
end;
$$;

-- ---------- Психолог: ответить ----------
create or replace function public.help_staff_reply(p_id bigint, p_body text)
returns void language plpgsql security definer set search_path = public as $$
declare v_body text := btrim(coalesce(p_body, ''));
begin
  if not public.has_perm('help') then raise exception 'not allowed'; end if;
  if char_length(v_body) < 1 then raise exception 'too_short'; end if;
  insert into help_messages (report_id, author, body, staff_id) values (p_id, 'staff', left(v_body, 2000), auth.uid());
  update help_reports set staff_unread = false, last_activity = now(),
         status = case when status = 'new' then 'in_progress' else status end
   where id = p_id;
end;
$$;

revoke all on function public.help_ip_hash() from public, anon, authenticated;
revoke all on function public.help_code_hash(text) from public, anon, authenticated;
revoke all on function public.help_limit(text, int, interval) from public, anon, authenticated;
revoke all on function public.help_submit(text, text, text, text, text, text, boolean, text, text, int) from public;
revoke all on function public.help_thread(text) from public;
revoke all on function public.help_student_reply(text, text) from public;
revoke all on function public.help_staff_reply(bigint, text) from public, anon;
grant execute on function public.help_submit(text, text, text, text, text, text, boolean, text, text, int) to anon, authenticated;
grant execute on function public.help_thread(text) to anon, authenticated;
grant execute on function public.help_student_reply(text, text) to anon, authenticated;
grant execute on function public.help_staff_reply(bigint, text) to authenticated;
