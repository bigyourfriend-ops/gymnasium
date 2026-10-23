-- ============================================================
-- Мамандықтар әлемі / профориентация (#prof)
-- Файлды толық қайта іске қосуға болады. Можно запускать повторно.
--
--  * результаты теста сохраняются через prof_save (можно без входа — тогда только для статистики);
--  * вошедший ученик видит свою историю (prof_results) и избранные профессии (prof_favs);
--  * сводную статистику (prof_stats) видят роли с правами help, director или users;
--  * IP не хранится, для антиспама — только хэш IP в prof_rate, удаляется через сутки.
-- ============================================================

create table if not exists public.prof_results (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  user_id     uuid references auth.users(id) on delete cascade,
  grade       text check (char_length(grade) <= 12),
  code        text not null check (code ~ '^[RIASEC]{3}$'),
  scores      jsonb not null
);
create index if not exists prof_results_user on public.prof_results (user_id, created_at desc);
alter table public.prof_results enable row level security;

create table if not exists public.prof_favs (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  favs       text[] not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.prof_favs enable row level security;

create table if not exists public.prof_rate (
  ip_hash    text not null,
  created_at timestamptz not null default now()
);
create index if not exists prof_rate_idx on public.prof_rate (ip_hash, created_at desc);
alter table public.prof_rate enable row level security;

create or replace function public.prof_is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.my_perms() && array['help','director','users'];
$$;

drop policy if exists "prof own read"   on public.prof_results;
drop policy if exists "prof own delete" on public.prof_results;
create policy "prof own read"   on public.prof_results for select to authenticated using (user_id = auth.uid());
create policy "prof own delete" on public.prof_results for delete to authenticated using (user_id = auth.uid());

drop policy if exists "prof favs own" on public.prof_favs;
create policy "prof favs own" on public.prof_favs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.prof_save(p_grade text, p_code text, p_scores jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_hash text := md5('gm-prof:' || split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1));
  v_sc jsonb := '{}'::jsonb;
  k text;
begin
  if coalesce(p_code, '') !~ '^[RIASEC]{3}$' then raise exception 'bad_request'; end if;
  foreach k in array array['R','I','A','S','E','C'] loop
    v_sc := v_sc || jsonb_build_object(k, least(100, greatest(0, coalesce((p_scores ->> k)::int, 0))));
  end loop;
  delete from prof_rate where created_at < now() - interval '1 day';
  if (select count(*) from prof_rate where ip_hash = v_hash and created_at > now() - interval '1 hour') >= 15 then raise exception 'rate_limited'; end if;
  insert into prof_rate (ip_hash) values (v_hash);
  insert into prof_results (user_id, grade, code, scores)
  values (auth.uid(), nullif(left(btrim(coalesce(p_grade, '')), 12), ''), p_code, v_sc);
end;
$$;

-- последняя попытка каждого вошедшего ученика + все анонимные попытки
create or replace function public.prof_stats()
returns json language plpgsql stable security definer set search_path = public as $$
declare v json;
begin
  if not public.prof_is_staff() then raise exception 'not allowed'; end if;
  with last as (
    select distinct on (coalesce(user_id::text, 'a' || id)) grade, left(code, 1) t
    from prof_results order by coalesce(user_id::text, 'a' || id), created_at desc
  ), g as (
    select coalesce(grade, '') grade, count(*) n,
           count(*) filter (where t = 'R') "R", count(*) filter (where t = 'I') "I", count(*) filter (where t = 'A') "A",
           count(*) filter (where t = 'S') "S", count(*) filter (where t = 'E') "E", count(*) filter (where t = 'C') "C"
    from last group by 1
  )
  select json_build_object(
    'total', (select count(*) from last),
    'by_type', (select coalesce(json_object_agg(t, n), '{}'::json) from (select t, count(*) n from last group by t) x),
    'by_grade', (select coalesce(json_agg(row_to_json(g) order by case when grade ~ '^\d+$' then grade::int else 99 end), '[]'::json) from g)
  ) into v;
  return v;
end;
$$;

revoke all on function public.prof_is_staff() from public, anon;
revoke all on function public.prof_save(text, text, jsonb) from public;
revoke all on function public.prof_stats() from public, anon;
grant execute on function public.prof_is_staff() to authenticated;
grant execute on function public.prof_save(text, text, jsonb) to anon, authenticated;
grant execute on function public.prof_stats() to authenticated;
