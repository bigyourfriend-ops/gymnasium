<?php
/* Серверные функции (раньше — функции базы Supabase, вызывались через sb.rpc(...)). */
if (!defined('GM')) { http_response_code(403); exit; }

const CODE_ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function str_arg(array $a, string $k, int $max = 0): string { $v = trim((string)($a[$k] ?? '')); return $max ? mb_substr($v, 0, $max) : $v; }
function nz(string $v): ?string { return $v === '' ? null : $v; }
function make_code(string $prefix, callable $exists): string {
  do {
    $r = ''; for ($i = 0; $i < 8; $i++) $r .= CODE_ALPHA[random_int(0, 30)];
    $c = $prefix . '-' . substr($r, 0, 4) . '-' . substr($r, 4, 4);
  } while ($exists($c));
  return $c;
}
function code_hash(string $salt, string $code): string { return hash('sha256', $salt . strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $code))); }
function msgs(string $table, string $fk, $id): array {
  return array_map(fn($m) => ['author' => $m['author'], 'body' => $m['body'], 'created_at' => ts_out($m['created_at'])],
    q("SELECT author, body, created_at FROM $table WHERE $fk=? ORDER BY created_at, id", [$id])->fetchAll());
}

/* ---------- отзывы ---------- */
function rpc_submit_feedback(array $a) {
  if (str_arg($a, 'p_hp') !== '') return null;
  if ((int)($a['p_elapsed'] ?? 0) < 5) fail('too_fast');
  $body = str_arg($a, 'p_body'); $name = str_arg($a, 'p_name', 60);
  if (mb_strlen($body) < 15) fail('too_short');
  $body = mb_substr($body, 0, 1500);
  $h = ip_hash('gm-feedback');
  $cnt = fn($sec) => (int)qv('SELECT COUNT(*) FROM feedback WHERE ip_hash=? AND created_at > ?', [$h, ago($sec)]);
  if ($cnt(60) >= 1 || $cnt(3600) >= 3 || $cnt(86400) >= 10) fail('rate_limited', 429);
  if ((int)qv('SELECT COUNT(*) FROM feedback WHERE created_at > ?', [ago(600)]) >= 40) fail('busy', 429);
  if (qv('SELECT 1 FROM feedback WHERE ip_hash=? AND body=? AND created_at > ?', [$h, $body, ago(86400)])) return null;
  $low = mb_strtolower($body . ' ' . $name, 'UTF-8'); $spam = false;
  foreach (q('SELECT word FROM feedback_badwords')->fetchAll(PDO::FETCH_COLUMN) as $w) { if ($w !== '' && mb_strpos($low, mb_strtolower($w, 'UTF-8')) !== false) { $spam = true; break; } }
  if (!$spam && (preg_match('~(https?://|www\.|\.(com|ru|kz|net|org)\b|t\.me/)~iu', $body) || preg_match('/(.)\1{7,}/u', $body))) $spam = true;
  if (!$spam) { $caps = preg_match_all('/[A-ZА-ЯЁӘҒҚҢӨҰҮҺІ]/u', $body); if ($caps / max(mb_strlen($body), 1) > 0.6) $spam = true; }
  $role = in_array($a['p_role'] ?? '', ['parent', 'student', 'graduate', 'other'], true) ? $a['p_role'] : 'other';
  $kind = in_array($a['p_kind'] ?? '', ['review', 'idea', 'thanks', 'complaint'], true) ? $a['p_kind'] : 'review';
  $rating = (int)($a['p_rating'] ?? 0);
  q('INSERT INTO feedback (created_at,name,author_role,kind,rating,body,contact,public_ok,status,ip_hash) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [now_db(), nz($name), $role, $kind, ($rating >= 1 && $rating <= 5) ? $rating : null, $body, nz(str_arg($a, 'p_contact', 100)), ($a['p_public'] ?? true) ? 1 : 0, $spam ? 'spam' : 'pending', $h]);
  return null;
}
function rpc_public_feedback(array $a) {
  return array_map(fn($r) => row_out(['id' => 'i', 'created_at' => 't', 'rating' => 'i'], $r),
    q("SELECT id, created_at, name, author_role, kind, rating, body, reply FROM feedback WHERE status='approved' AND public_ok=1 ORDER BY created_at DESC LIMIT 200")->fetchAll());
}

/* ---------- роли ---------- */
function rpc_set_role(array $a) {
  if (!is_admin()) fail('not allowed', 403);
  $target = (string)($a['target'] ?? ''); $role = (string)($a['role'] ?? '');
  if (!qv('SELECT 1 FROM users WHERE id=?', [$target])) fail('not_found', 404);
  $isAdminRole = function ($rid) { $p = qv('SELECT perms FROM roles WHERE id=?', [$rid]); return $p && in_array('users', json_decode($p, true) ?: [], true); };
  $cur = qv('SELECT role_id FROM staff WHERE user_id=?', [$target]);
  if ($cur && $isAdminRole($cur) && ($role === '' || !$isAdminRole($role))) {
    $n = 0; foreach (q('SELECT role_id FROM staff')->fetchAll(PDO::FETCH_COLUMN) as $r) if ($isAdminRole($r)) $n++;
    if ($n <= 1) fail('last admin');
  }
  if ($role === '') q('DELETE FROM staff WHERE user_id=?', [$target]);
  else {
    if (!qv('SELECT 1 FROM roles WHERE id=?', [$role])) fail('bad role');
    q(sql_upsert('staff', ['user_id', 'role_id', 'created_at'], ['user_id'], ['role_id']), [$target, $role, now_db()]);
  }
  return null;
}

/* ---------- управление пользователями (только администратор) ---------- */
function rpc_admin_user_update(array $a) {
  if (!is_admin()) fail('not allowed', 403);
  $id = (string)($a['id'] ?? '');
  $u = q1('SELECT * FROM users WHERE id=?', [$id]); if (!$u) fail('not_found', 404);
  $meta = json_decode((string)$u['meta'], true) ?: [];
  if (!q1('SELECT 1 FROM profiles WHERE id=?', [$id])) q('INSERT INTO profiles (id,email,created_at) VALUES (?,?,?)', [$id, $u['email'], $u['created_at']]);
  if (array_key_exists('email', $a)) {
    $em = mb_strtolower(trim((string)$a['email']));
    if (!filter_var($em, FILTER_VALIDATE_EMAIL) || mb_strlen($em) > 190) fail('bad_email');
    if ($em !== $u['email']) {
      if (qv('SELECT 1 FROM users WHERE email=? AND id<>?', [$em, $id])) fail('email_exists');
      q('UPDATE users SET email=?, confirmed_at=COALESCE(confirmed_at, ?) WHERE id=?', [$em, now_db(), $id]);
      q('UPDATE profiles SET email=? WHERE id=?', [$em, $id]);
      $meta['email'] = $em;
    }
  }
  if (array_key_exists('full_name', $a)) {
    $fn = mb_substr(preg_replace('/\s+/u', ' ', trim((string)$a['full_name'])), 0, 100);
    if ($fn === '') fail('needTitle');
    q('UPDATE profiles SET full_name=? WHERE id=?', [$fn, $id]); $meta['full_name'] = $fn;
  }
  if (array_key_exists('role', $a)) {
    $r = (string)$a['role']; if (!in_array($r, ['', 'student', 'parent', 'teacher'], true)) fail('bad role');
    q('UPDATE profiles SET role=? WHERE id=?', [nz($r), $id]); $meta['role'] = nz($r);
  }
  if (array_key_exists('grade', $a)) q('UPDATE profiles SET grade=? WHERE id=?', [nz(mb_substr(trim((string)$a['grade']), 0, 12)), $id]);
  if (!empty($a['confirm'])) q('UPDATE users SET confirmed_at=COALESCE(confirmed_at, ?) WHERE id=?', [now_db(), $id]);
  if (isset($a['password']) && $a['password'] !== '') {
    $pw = (string)$a['password']; if (strlen($pw) < 8) fail('password too short');
    q('UPDATE users SET pass=? WHERE id=?', [password_hash($pw, PASSWORD_BCRYPT), $id]);
    // выход на всех устройствах этого пользователя (кроме текущей сессии самого администратора)
    q('DELETE FROM sessions WHERE user_id=? AND token<>?', [$id, hash('sha256', bearer())]);
  }
  q('UPDATE users SET meta=? WHERE id=?', [json_encode($meta, JSON_UNESCAPED_UNICODE), $id]);
  return null;
}
function rpc_admin_user_delete(array $a) {
  if (!is_admin()) fail('not allowed', 403);
  $id = (string)($a['id'] ?? '');
  if ($id === uid()) fail('cannot delete yourself');
  if (!qv('SELECT 1 FROM users WHERE id=?', [$id])) fail('not_found', 404);
  $rid = qv('SELECT role_id FROM staff WHERE user_id=?', [$id]);
  if ($rid) rpc_set_role(['target' => $id, 'role' => '']);   // проверит «последнего администратора»
  foreach (['sessions' => 'user_id', 'auth_tokens' => 'user_id', 'profiles' => 'id', 'prof_favs' => 'user_id', 'users' => 'id'] as $t => $c) q("DELETE FROM $t WHERE $c=?", [$id]);
  q('UPDATE prof_results SET user_id=NULL WHERE user_id=?', [$id]);
  q('UPDATE dir_letters SET user_id=NULL WHERE user_id=?', [$id]);
  return null;
}

/* ---------- «Маған көмек керек» (буллинг) ---------- */
function rpc_help_submit(array $a) {
  if (str_arg($a, 'p_hp') !== '') fail('bad_request');
  if ((int)($a['p_elapsed'] ?? 0) < 4) fail('too_fast');
  $body = str_arg($a, 'p_body'); if (mb_strlen($body) < 10) fail('too_short');
  if ((int)qv('SELECT COUNT(*) FROM help_reports WHERE created_at > ?', [ago(600)]) >= 60) fail('busy', 429);
  rate_limit('help_submit_h', 3, 3600, 'gm-help'); rate_limit('help_submit_d', 8, 86400, 'gm-help');
  $code = make_code('GM', fn($c) => (bool)qv('SELECT 1 FROM help_reports WHERE code_hash=?', [code_hash('gm-help-code:', $c)]));
  $talk = !empty($a['p_talk']); $now = now_db();
  q('INSERT INTO help_reports (created_at,code_hash,who,place,freq,body,involved,grade,wants_talk,contact,status,staff_unread,last_activity) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [
    $now, code_hash('gm-help-code:', $code),
    in_array($a['p_who'] ?? '', ['self', 'witness'], true) ? $a['p_who'] : 'self',
    in_array($a['p_place'] ?? '', ['class', 'corridor', 'canteen', 'outside', 'online', 'other'], true) ? $a['p_place'] : 'other',
    in_array($a['p_freq'] ?? '', ['once', 'several', 'long'], true) ? $a['p_freq'] : 'once',
    mb_substr($body, 0, 3000), nz(str_arg($a, 'p_involved', 300)), nz(str_arg($a, 'p_grade', 12)), $talk ? 1 : 0,
    $talk ? nz(str_arg($a, 'p_contact', 150)) : null, 'new', 1, $now]);
  return $code;
}
function help_find(string $code) {
  $r = q1('SELECT * FROM help_reports WHERE code_hash=?', [code_hash('gm-help-code:', $code)]);
  if (!$r) rate_limit('help_miss', 15, 3600, 'gm-help');
  return $r;
}
function rpc_help_thread(array $a) {
  $r = help_find(str_arg($a, 'p_code')); if (!$r) return null;
  return ['created_at' => ts_out($r['created_at']), 'status' => $r['status'] === 'spam' ? 'closed' : $r['status'], 'who' => $r['who'], 'place' => $r['place'], 'freq' => $r['freq'], 'body' => $r['body'],
    'messages' => msgs('help_messages', 'report_id', $r['id'])];
}
function rpc_help_student_reply(array $a) {
  $body = str_arg($a, 'p_body'); if (mb_strlen($body) < 1) fail('too_short');
  $r = help_find(str_arg($a, 'p_code')); if (!$r) fail('not_found', 404);
  rate_limit('help_reply', 10, 3600, 'gm-help');
  $now = now_db();
  q('INSERT INTO help_messages (report_id,created_at,author,body) VALUES (?,?,?,?)', [$r['id'], $now, 'student', mb_substr($body, 0, 2000)]);
  q("UPDATE help_reports SET staff_unread=1, last_activity=?, status=CASE WHEN status='closed' THEN 'in_progress' ELSE status END WHERE id=?", [$now, $r['id']]);
  return null;
}
function rpc_help_staff_reply(array $a) {
  if (!perm_strict('help')) fail('not allowed', 403);
  $body = str_arg($a, 'p_body'); if (mb_strlen($body) < 1) fail('too_short');
  $id = (int)($a['p_id'] ?? 0); if (!qv('SELECT 1 FROM help_reports WHERE id=?', [$id])) fail('not_found', 404);
  $now = now_db();
  q('INSERT INTO help_messages (report_id,created_at,author,body,staff_id) VALUES (?,?,?,?,?)', [$id, $now, 'staff', mb_substr($body, 0, 2000), uid()]);
  q("UPDATE help_reports SET staff_unread=0, last_activity=?, status=CASE WHEN status='new' THEN 'in_progress' ELSE status END WHERE id=?", [$now, $id]);
  return null;
}

/* ---------- «Директорға хат» ---------- */
function dir_json(array $r): array {
  return ['id' => (int)$r['id'], 'created_at' => ts_out($r['created_at']), 'status' => $r['status'] === 'spam' ? 'closed' : $r['status'], 'topic' => $r['topic'],
    'subject' => $r['subject'], 'body' => $r['body'], 'unread' => (bool)(int)$r['author_unread'], 'messages' => msgs('dir_messages', 'letter_id', $r['id'])];
}
function rpc_dir_submit(array $a) {
  if (str_arg($a, 'p_hp') !== '') fail('bad_request');
  if ((int)($a['p_elapsed'] ?? 0) < 4) fail('too_fast');
  $body = str_arg($a, 'p_body'); if (mb_strlen($body) < 10) fail('too_short');
  if ((int)qv('SELECT COUNT(*) FROM dir_letters WHERE created_at > ?', [ago(600)]) >= 40) fail('busy', 429);
  rate_limit('dir_submit_h', 3, 3600, 'gm-dir'); rate_limit('dir_submit_d', 8, 86400, 'gm-dir');
  $anon = !empty($a['p_anon']); $now = now_db();
  $code = make_code('DR', fn($c) => (bool)qv('SELECT 1 FROM dir_letters WHERE code_hash=?', [code_hash('gm-dir-code:', $c)]));
  q('INSERT INTO dir_letters (created_at,code_hash,user_id,author_role,topic,subject,body,name,grade,contact,anonymous,status,dir_unread,author_unread,last_activity) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
    $now, code_hash('gm-dir-code:', $code), $anon ? null : uid(),
    in_array($a['p_role'] ?? '', ['parent', 'student', 'teacher', 'graduate', 'other'], true) ? $a['p_role'] : 'other',
    in_array($a['p_topic'] ?? '', ['question', 'suggestion', 'complaint', 'thanks', 'other'], true) ? $a['p_topic'] : 'other',
    nz(str_arg($a, 'p_subject', 120)), mb_substr($body, 0, 4000), $anon ? null : nz(str_arg($a, 'p_name', 80)), nz(str_arg($a, 'p_grade', 12)),
    $anon ? null : nz(str_arg($a, 'p_contact', 150)), $anon ? 1 : 0, 'new', 1, 0, $now]);
  return $code;
}
function dir_find(string $code) {
  $r = q1('SELECT * FROM dir_letters WHERE code_hash=?', [code_hash('gm-dir-code:', $code)]);
  if (!$r) rate_limit('dir_miss', 15, 3600, 'gm-dir');
  return $r;
}
function rpc_dir_thread(array $a) {
  $r = dir_find(str_arg($a, 'p_code')); if (!$r) return null;
  q('UPDATE dir_letters SET author_unread=0 WHERE id=?', [$r['id']]); $r['author_unread'] = 0;
  return dir_json($r);
}
function rpc_dir_my_letters(array $a) {
  $u = uid(); if (!$u) return [];
  return array_map('dir_json', q('SELECT * FROM dir_letters WHERE user_id=? ORDER BY last_activity DESC', [$u])->fetchAll());
}
function rpc_dir_my_seen(array $a) { $u = uid(); if ($u) q('UPDATE dir_letters SET author_unread=0 WHERE id=? AND user_id=?', [(int)($a['p_id'] ?? 0), $u]); return null; }
function rpc_dir_author_reply(array $a) {
  $body = str_arg($a, 'p_body'); if (mb_strlen($body) < 1) fail('too_short');
  $r = null;
  if (str_arg($a, 'p_code') !== '') $r = dir_find(str_arg($a, 'p_code'));
  elseif (!empty($a['p_id']) && uid()) $r = q1('SELECT * FROM dir_letters WHERE id=? AND user_id=?', [(int)$a['p_id'], uid()]);
  if (!$r) { rate_limit('dir_miss', 15, 3600, 'gm-dir'); fail('not_found', 404); }
  rate_limit('dir_reply', 10, 3600, 'gm-dir');
  $now = now_db();
  q('INSERT INTO dir_messages (letter_id,created_at,author,body) VALUES (?,?,?,?)', [$r['id'], $now, 'author', mb_substr($body, 0, 3000)]);
  q("UPDATE dir_letters SET dir_unread=1, last_activity=?, status=CASE WHEN status IN ('closed','spam') THEN 'in_progress' ELSE status END WHERE id=?", [$now, $r['id']]);
  return null;
}
function rpc_dir_reply(array $a) {
  if (!perm_strict('director')) fail('not allowed', 403);
  $body = str_arg($a, 'p_body'); if (mb_strlen($body) < 1) fail('too_short');
  $id = (int)($a['p_id'] ?? 0); if (!qv('SELECT 1 FROM dir_letters WHERE id=?', [$id])) fail('not_found', 404);
  $now = now_db();
  q('INSERT INTO dir_messages (letter_id,created_at,author,body,staff_id) VALUES (?,?,?,?,?)', [$id, $now, 'director', mb_substr($body, 0, 3000), uid()]);
  q("UPDATE dir_letters SET dir_unread=0, author_unread=1, last_activity=?, status=CASE WHEN status='new' THEN 'in_progress' ELSE status END WHERE id=?", [$now, $id]);
  return null;
}

/* ---------- «Мамандықтар әлемі» ---------- */
function rpc_prof_save(array $a) {
  $code = (string)($a['p_code'] ?? ''); if (!preg_match('/^[RIASEC]{3}$/', $code)) fail('bad_request');
  $sc = []; $in = (array)($a['p_scores'] ?? []);
  foreach (['R', 'I', 'A', 'S', 'E', 'C'] as $k) $sc[$k] = max(0, min(100, (int)($in[$k] ?? 0)));
  rate_limit('prof_save', 15, 3600, 'gm-prof');
  q('INSERT INTO prof_results (created_at,user_id,grade,code,scores) VALUES (?,?,?,?,?)', [now_db(), uid(), nz(str_arg($a, 'p_grade', 12)), $code, json_encode($sc)]);
  return null;
}
function rpc_prof_stats(array $a) {
  if (!array_intersect(['help', 'director', 'users'], my_perms())) fail('not allowed', 403);
  $last = []; $seen = [];
  foreach (q('SELECT id, user_id, grade, code FROM prof_results ORDER BY created_at DESC, id DESC')->fetchAll() as $r) {
    $k = $r['user_id'] ?: ('a' . $r['id']); if (isset($seen[$k])) continue; $seen[$k] = 1;
    $last[] = ['grade' => (string)($r['grade'] ?? ''), 't' => substr($r['code'], 0, 1)];
  }
  $byType = []; $g = [];
  foreach ($last as $x) {
    $byType[$x['t']] = ($byType[$x['t']] ?? 0) + 1;
    if (!isset($g[$x['grade']])) $g[$x['grade']] = ['grade' => $x['grade'], 'n' => 0, 'R' => 0, 'I' => 0, 'A' => 0, 'S' => 0, 'E' => 0, 'C' => 0];
    $g[$x['grade']]['n']++; $g[$x['grade']][$x['t']]++;
  }
  $g = array_values($g);
  usort($g, fn($a, $b) => (ctype_digit($a['grade']) ? (int)$a['grade'] : 99) <=> (ctype_digit($b['grade']) ? (int)$b['grade'] : 99));
  return ['total' => count($last), 'by_type' => (object)$byType, 'by_grade' => $g];
}

function handle_rpc(): void {
  $b = body(); $fn = (string)($b['fn'] ?? ''); $args = is_array($b['args'] ?? null) ? $b['args'] : [];
  $ok = ['submit_feedback', 'public_feedback', 'set_role', 'admin_user_update', 'admin_user_delete', 'help_submit', 'help_thread', 'help_student_reply', 'help_staff_reply',
    'dir_submit', 'dir_thread', 'dir_my_letters', 'dir_my_seen', 'dir_author_reply', 'dir_reply', 'prof_save', 'prof_stats'];
  if (!in_array($fn, $ok, true)) fail("function $fn does not exist", 404, '42883');
  out(('rpc_' . $fn)($args));
}
