-- ============================================================
-- GMTest: мұғалімдер тест жасайды, оқушылар тапсырады, статистика тақырыптар бойынша.
-- GMTest: учителя создают тесты, ученики проходят, статистика по темам.
-- Рұқсаттар / права:  tests      — өз тесттерін жасау және статистикасын көру
--                     tests_all  — барлық мұғалімдердің тесттері мен статистикасы (завуч)
-- Ответы проверяет база данных: правильные варианты ученик не получает никогда до сдачи.
-- ============================================================

create table if not exists public.gt_tests (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid references auth.users(id) on delete set null default auth.uid(),
  author_name   text,
  subject       text not null check (char_length(subject) between 1 and 80),
  title         text not null check (char_length(title) between 1 and 160),
  descr         text check (char_length(descr) <= 1000),
  grade         smallint check (grade between 1 and 11),            -- параллель; null = для всех
  time_limit    smallint check (time_limit between 1 and 240),      -- минут; null = без ограничения
  max_attempts  smallint not null default 1 check (max_attempts between 1 and 10),
  show_answers  boolean not null default true,                      -- показать ученику верные ответы после сдачи
  shuffle       boolean not null default false,                     -- перемешивать вопросы и варианты
  status        text not null default 'draft' check (status in ('draft','published','closed')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.gt_topics (
  id       uuid primary key default gen_random_uuid(),
  test_id  uuid not null references public.gt_tests(id) on delete cascade,
  title    text not null check (char_length(title) between 1 and 160),
  pos      int not null default 0
);
create index if not exists gt_topics_test on public.gt_topics (test_id, pos);

create table if not exists public.gt_questions (
  id        uuid primary key default gen_random_uuid(),
  test_id   uuid not null references public.gt_tests(id) on delete cascade,
  topic_id  uuid references public.gt_topics(id) on delete set null,
  pos       int not null default 0,
  kind      text not null default 'single' check (kind in ('single','multi')),
  body      text not null check (char_length(body) between 1 and 3000),
  image     text check (char_length(image) <= 500),
  options   jsonb not null default '[]' check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) <= 10),  -- [{"id":"a","t":"..."}]
  correct   text[] not null default '{}',
  points    smallint not null default 1 check (points between 1 and 10)
);
create index if not exists gt_questions_test on public.gt_questions (test_id, pos);
create index if not exists gt_questions_topic on public.gt_questions (topic_id);

create table if not exists public.gt_attempts (
  id             uuid primary key default gen_random_uuid(),
  test_id        uuid not null references public.gt_tests(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  attempt_no     smallint not null default 1,
  student_name   text,
  student_grade  text,             -- сынып тапсыру сәтінде / класс на момент прохождения
  started_at     timestamptz not null default now(),
  finished_at    timestamptz,
  answers        jsonb,            -- {"<question id>": ["a","c"]}
  score          numeric(7,2),
  max_score      numeric(7,2),
  unique (test_id, user_id, attempt_no)
);
create index if not exists gt_attempts_user on public.gt_attempts (user_id, test_id);
create index if not exists gt_attempts_test on public.gt_attempts (test_id, finished_at);

create table if not exists public.gt_answers (
  attempt_id   uuid not null references public.gt_attempts(id) on delete cascade,
  question_id  uuid not null references public.gt_questions(id) on delete cascade,
  topic_id     uuid references public.gt_topics(id) on delete set null,
  chosen       text[] not null default '{}',
  points       numeric(5,2) not null default 0,
  max_points   smallint not null,
  primary key (attempt_id, question_id)
);
create index if not exists gt_answers_question on public.gt_answers (question_id);
create index if not exists gt_answers_topic on public.gt_answers (topic_id);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------- Кім басқара алады / кто управляет тестом ----------
create or replace function public.gt_can_manage(p_test uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_perm('tests_all')
      or exists (select 1 from gt_tests t where t.id = p_test and t.author_id = auth.uid() and public.has_perm('tests'));
$$;
revoke all on function public.gt_can_manage(uuid) from public, anon;
grant execute on function public.gt_can_manage(uuid) to authenticated;

-- Автор мен уақыт: автор өзгермейді, аты профильден алынады
create or replace function private.gt_tests_touch()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.author_id := auth.uid();
    new.author_name := (select coalesce(nullif(full_name, ''), email) from profiles where id = auth.uid());
    new.created_at := now();
  else
    new.author_id := old.author_id;
    new.author_name := old.author_name;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists gt_tests_touch on public.gt_tests;
create trigger gt_tests_touch before insert or update on public.gt_tests for each row execute function private.gt_tests_touch();

-- ---------- RLS ----------
alter table public.gt_tests     enable row level security;
alter table public.gt_topics    enable row level security;
alter table public.gt_questions enable row level security;
alter table public.gt_attempts  enable row level security;
alter table public.gt_answers   enable row level security;

drop policy if exists "gt tests read"   on public.gt_tests;
drop policy if exists "gt tests insert" on public.gt_tests;
drop policy if exists "gt tests update" on public.gt_tests;
drop policy if exists "gt tests delete" on public.gt_tests;
create policy "gt tests read"   on public.gt_tests for select to authenticated using (status <> 'draft' or public.gt_can_manage(id));
create policy "gt tests insert" on public.gt_tests for insert to authenticated with check (public.has_perm('tests') or public.has_perm('tests_all'));
create policy "gt tests update" on public.gt_tests for update to authenticated using (public.gt_can_manage(id)) with check (public.gt_can_manage(id));
create policy "gt tests delete" on public.gt_tests for delete to authenticated using (public.gt_can_manage(id));

drop policy if exists "gt topics read"  on public.gt_topics;
drop policy if exists "gt topics write" on public.gt_topics;
create policy "gt topics read"  on public.gt_topics for select to authenticated
  using (public.gt_can_manage(test_id) or exists (select 1 from gt_tests t where t.id = test_id and t.status <> 'draft'));
create policy "gt topics write" on public.gt_topics for all to authenticated
  using (public.gt_can_manage(test_id)) with check (public.gt_can_manage(test_id));

-- Сұрақтар мен дұрыс жауаптарды тек мұғалім көреді. Оқушы сұрақтарды gt_start() арқылы жауапсыз алады.
drop policy if exists "gt questions manage" on public.gt_questions;
create policy "gt questions manage" on public.gt_questions for all to authenticated
  using (public.gt_can_manage(test_id)) with check (public.gt_can_manage(test_id));

-- Талпыныстар: оқушы өзінікін көреді, мұғалім өз тестінікін көреді және өшіре алады (қайта тапсыруға рұқсат).
-- Жазу тек функциялар арқылы.
drop policy if exists "gt attempts read"   on public.gt_attempts;
drop policy if exists "gt attempts delete" on public.gt_attempts;
create policy "gt attempts read"   on public.gt_attempts for select to authenticated using (user_id = auth.uid() or public.gt_can_manage(test_id));
create policy "gt attempts delete" on public.gt_attempts for delete to authenticated using (public.gt_can_manage(test_id));

drop policy if exists "gt answers read" on public.gt_answers;
create policy "gt answers read" on public.gt_answers for select to authenticated
  using (exists (select 1 from gt_attempts a where a.id = attempt_id and (a.user_id = auth.uid() or public.gt_can_manage(a.test_id))));

-- ---------- Тексеру (ішкі) / проверка ответов (внутренняя) ----------
-- Бір жауапты: толық балл немесе 0. Көп жауапты: (дұрыс таңдалған − қате таңдалған) / дұрыстар саны, 0-ден төмен емес.
create or replace function private.gt_grade(p_attempt uuid, p_answers jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_test uuid; q record; v_ch text[]; v_hit int; v_miss int; v_pts numeric; v_tot numeric := 0; v_max numeric := 0;
  v_ans jsonb := case when jsonb_typeof(p_answers) = 'object' then p_answers else '{}'::jsonb end;
begin
  select test_id into v_test from gt_attempts where id = p_attempt for update;
  for q in select * from gt_questions where test_id = v_test and cardinality(correct) > 0 order by pos loop
    select coalesce(array_agg(distinct x.v), '{}') into v_ch
      from jsonb_array_elements_text(case when jsonb_typeof(v_ans -> q.id::text) = 'array' then v_ans -> q.id::text else '[]'::jsonb end) as x(v)
      where x.v in (select o ->> 'id' from jsonb_array_elements(q.options) o);
    if q.kind = 'single' then
      v_pts := case when cardinality(v_ch) = 1 and v_ch[1] = any(q.correct) then q.points else 0 end;
    else
      v_hit  := (select count(*) from unnest(v_ch) as c(v) where c.v = any(q.correct));
      v_miss := cardinality(v_ch) - v_hit;
      v_pts  := round(greatest(0, (v_hit - v_miss)::numeric / cardinality(q.correct)) * q.points, 2);
    end if;
    insert into gt_answers (attempt_id, question_id, topic_id, chosen, points, max_points)
    values (p_attempt, q.id, q.topic_id, v_ch, v_pts, q.points)
    on conflict (attempt_id, question_id) do update set topic_id = excluded.topic_id, chosen = excluded.chosen, points = excluded.points, max_points = excluded.max_points;
    v_tot := v_tot + v_pts; v_max := v_max + q.points;
  end loop;
  update gt_attempts set finished_at = now(), answers = v_ans, score = v_tot, max_score = v_max where id = p_attempt;
end;
$$;

-- Оқушыға берілетін тест (дұрыс жауаптарсыз)
create or replace function private.gt_payload(p_attempt uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'attempt', jsonb_build_object('id', a.id, 'started_at', a.started_at, 'now', now(), 'answers', coalesce(a.answers, '{}'::jsonb), 'attempt_no', a.attempt_no),
    'test', jsonb_build_object('id', t.id, 'title', t.title, 'subject', t.subject, 'descr', t.descr, 'grade', t.grade,
                               'time_limit', t.time_limit, 'shuffle', t.shuffle, 'max_attempts', t.max_attempts),
    'topics', coalesce((select jsonb_agg(jsonb_build_object('id', tp.id, 'title', tp.title) order by tp.pos) from gt_topics tp where tp.test_id = t.id), '[]'::jsonb),
    'questions', coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'topic_id', q.topic_id, 'kind', q.kind, 'body', q.body,
                                                               'image', q.image, 'points', q.points, 'options', q.options) order by q.pos)
                           from gt_questions q where q.test_id = t.id and cardinality(q.correct) > 0), '[]'::jsonb))
  from gt_attempts a join gt_tests t on t.id = a.test_id where a.id = p_attempt;
$$;

-- Тестті бастау немесе жалғастыру
create or replace function public.gt_start(p_test uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); t gt_tests; a gt_attempts; v_done int; p profiles;
begin
  if v_uid is null then raise exception 'auth_required'; end if;
  select * into t from gt_tests where id = p_test;
  if not found or t.status <> 'published' then raise exception 'not_available'; end if;
  select * into a from gt_attempts where test_id = p_test and user_id = v_uid and finished_at is null order by started_at desc limit 1;
  if found then
    if t.time_limit is null or now() <= a.started_at + make_interval(mins => t.time_limit) + interval '1 minute' then
      return private.gt_payload(a.id);
    end if;
    perform private.gt_grade(a.id, coalesce(a.answers, '{}'::jsonb));   -- уақыт бітті: сақталған жауаптармен аяқтау
  end if;
  select count(*) into v_done from gt_attempts where test_id = p_test and user_id = v_uid and finished_at is not null;
  if v_done >= t.max_attempts then raise exception 'no_attempts'; end if;
  select * into p from profiles where id = v_uid;
  insert into gt_attempts (test_id, user_id, attempt_no, student_name, student_grade)
  values (p_test, v_uid, v_done + 1, coalesce(nullif(p.full_name, ''), p.email, (select email from auth.users where id = v_uid)), nullif(p.grade, ''))
  returning * into a;
  return private.gt_payload(a.id);
end;
$$;

-- Жауаптарды аралықта сақтау (телефон өшсе де жоғалмайды)
create or replace function public.gt_save(p_attempt uuid, p_answers jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if jsonb_typeof(p_answers) <> 'object' or pg_column_size(p_answers) > 200000 then raise exception 'bad_answers'; end if;
  update gt_attempts set answers = p_answers where id = p_attempt and user_id = auth.uid() and finished_at is null;
end;
$$;

-- Нәтиже
create or replace function public.gt_result(p_attempt uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare a gt_attempts; t gt_tests; v_reveal boolean; v_mgr boolean;
begin
  select * into a from gt_attempts where id = p_attempt;
  if not found then raise exception 'not_found'; end if;
  v_mgr := public.gt_can_manage(a.test_id);
  if a.user_id is distinct from auth.uid() and not v_mgr then raise exception 'not_allowed'; end if;
  if a.finished_at is null then raise exception 'not_finished'; end if;
  select * into t from gt_tests where id = a.test_id;
  v_reveal := t.show_answers or v_mgr;
  return jsonb_build_object(
    'mine', a.user_id = auth.uid(),
    'attempt', jsonb_build_object('id', a.id, 'score', a.score, 'max', a.max_score, 'started_at', a.started_at, 'finished_at', a.finished_at,
                                  'attempt_no', a.attempt_no, 'name', a.student_name, 'grade', a.student_grade),
    'test', jsonb_build_object('id', t.id, 'title', t.title, 'subject', t.subject, 'show_answers', t.show_answers, 'max_attempts', t.max_attempts, 'status', t.status,
                               'used', (select count(*) from gt_attempts x where x.test_id = t.id and x.user_id = a.user_id and x.finished_at is not null)),
    'topics', coalesce((select jsonb_agg(jsonb_build_object('id', s.topic_id, 'title', tp.title, 'pts', s.pts, 'max', s.mx) order by tp.pos nulls last)
                        from (select topic_id, sum(points) pts, sum(max_points) mx from gt_answers where attempt_id = a.id group by topic_id) s
                        left join gt_topics tp on tp.id = s.topic_id), '[]'::jsonb),
    'questions', case when v_reveal then coalesce((
        select jsonb_agg(jsonb_build_object('id', q.id, 'topic_id', q.topic_id, 'kind', q.kind, 'body', q.body, 'image', q.image, 'options', q.options,
                                            'correct', to_jsonb(q.correct), 'chosen', to_jsonb(an.chosen), 'pts', an.points, 'max', an.max_points) order by q.pos)
        from gt_answers an join gt_questions q on q.id = an.question_id where an.attempt_id = a.id), '[]'::jsonb) end);
end;
$$;

-- Тапсыру
create or replace function public.gt_submit(p_attempt uuid, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a gt_attempts;
begin
  select * into a from gt_attempts where id = p_attempt and user_id = auth.uid();
  if not found then raise exception 'not_found'; end if;
  if a.finished_at is null then perform private.gt_grade(p_attempt, p_answers); end if;
  return public.gt_result(p_attempt);
end;
$$;

-- Оқушыға қолжетімді тесттер
create or replace function public.gt_available()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x order by x->>'created_at' desc), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', t.id, 'title', t.title, 'subject', t.subject, 'descr', t.descr, 'grade', t.grade, 'time_limit', t.time_limit,
      'max_attempts', t.max_attempts, 'status', t.status, 'author', t.author_name, 'created_at', t.created_at,
      'q_count', (select count(*) from gt_questions q where q.test_id = t.id and cardinality(q.correct) > 0),
      'topics', coalesce((select jsonb_agg(tp.title order by tp.pos) from gt_topics tp where tp.test_id = t.id), '[]'::jsonb),
      'used', (select count(*) from gt_attempts a where a.test_id = t.id and a.user_id = auth.uid() and a.finished_at is not null),
      'open_attempt', (select a.id from gt_attempts a where a.test_id = t.id and a.user_id = auth.uid() and a.finished_at is null limit 1),
      'last', (select jsonb_build_object('id', a.id, 'score', a.score, 'max', a.max_score, 'at', a.finished_at)
               from gt_attempts a where a.test_id = t.id and a.user_id = auth.uid() and a.finished_at is not null order by a.finished_at desc limit 1)
    ) x
    from gt_tests t
    where auth.uid() is not null
      and (t.status = 'published' or (t.status = 'closed' and exists (select 1 from gt_attempts a where a.test_id = t.id and a.user_id = auth.uid())))
  ) s;
$$;

-- Бір тест бойынша статистика: әр оқушының бірінші аяқталған талпынысы
create or replace function public.gt_stats(p_test uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.gt_can_manage(p_test) then raise exception 'not_allowed'; end if;
  return (
    with fa as (
      select distinct on (user_id) * from gt_attempts
      where test_id = p_test and finished_at is not null order by user_id, started_at)
    select jsonb_build_object(
      'attempts', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'user_id', user_id, 'name', student_name, 'grade', student_grade,
                                     'score', score, 'max', max_score, 'started_at', started_at, 'finished_at', finished_at) order by student_grade, student_name) from fa), '[]'::jsonb),
      'answers', coalesce((select jsonb_agg(jsonb_build_array(an.attempt_id, an.question_id, an.topic_id, an.points, an.max_points, to_jsonb(an.chosen)))
                           from gt_answers an join fa on fa.id = an.attempt_id), '[]'::jsonb),
      'total_attempts', (select count(*) from gt_attempts where test_id = p_test and finished_at is not null),
      'in_progress', (select count(*) from gt_attempts where test_id = p_test and finished_at is null))
  );
end;
$$;

-- Жалпы аналитика: пән → тақырып → сынып бойынша меңгеру
create or replace function public.gt_overview()
returns table (test_id uuid, subject text, test_title text, grade smallint, topic_id uuid, topic_title text, cls text, pts numeric, mx numeric, students bigint)
language sql stable security definer set search_path = public as $$
  with mine as (select t.* from gt_tests t where public.gt_can_manage(t.id)),
  fa as (
    select distinct on (a.test_id, a.user_id) a.* from gt_attempts a join mine m on m.id = a.test_id
    where a.finished_at is not null order by a.test_id, a.user_id, a.started_at)
  select m.id, m.subject, m.title, m.grade, an.topic_id, tp.title, coalesce(fa.student_grade, ''),
         sum(an.points), sum(an.max_points), count(distinct fa.user_id)
  from fa join mine m on m.id = fa.test_id
       join gt_answers an on an.attempt_id = fa.id
       left join gt_topics tp on tp.id = an.topic_id
  group by m.id, m.subject, m.title, m.grade, an.topic_id, tp.title, fa.student_grade;
$$;

revoke all on function public.gt_start(uuid) from public, anon;
revoke all on function public.gt_save(uuid, jsonb) from public, anon;
revoke all on function public.gt_submit(uuid, jsonb) from public, anon;
revoke all on function public.gt_result(uuid) from public, anon;
revoke all on function public.gt_available() from public, anon;
revoke all on function public.gt_stats(uuid) from public, anon;
revoke all on function public.gt_overview() from public, anon;
grant execute on function public.gt_start(uuid) to authenticated;
grant execute on function public.gt_save(uuid, jsonb) to authenticated;
grant execute on function public.gt_submit(uuid, jsonb) to authenticated;
grant execute on function public.gt_result(uuid) to authenticated;
grant execute on function public.gt_available() to authenticated;
grant execute on function public.gt_stats(uuid) to authenticated;
grant execute on function public.gt_overview() to authenticated;

grant select, insert, update, delete on public.gt_tests, public.gt_topics, public.gt_questions to authenticated;
grant select, delete on public.gt_attempts to authenticated;
grant select on public.gt_answers to authenticated;

-- Рөлдерге құқық қосу: әкімшіге — барлығы, мұғалімге — өз тесттері
update public.roles set perms = array(select distinct unnest(perms || array['tests','tests_all'])) where id = 'admin';
update public.roles set perms = array(select distinct unnest(perms || array['tests'])) where id = 'teacher';

-- ============================================================
-- Автотазалау / автоочистка (pg_cron): әр жексенбі түнде
--  • 90 күннен ескі спам мен қабылданбаған пікірлер
--  • 30 күннен бері аяқталмаған тест талпыныстары
-- ============================================================
create extension if not exists pg_cron;
create or replace function private.cleanup_old_data()
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.feedback where status in ('spam', 'rejected') and created_at < now() - interval '90 days';
  delete from public.gt_attempts where finished_at is null and started_at < now() - interval '30 days';
end;
$$;
revoke all on function private.cleanup_old_data() from public, anon, authenticated;
select cron.unschedule(jobid) from cron.job where jobname = 'cleanup-old-data';
select cron.schedule('cleanup-old-data', '15 21 * * 0', 'select private.cleanup_old_data();');
