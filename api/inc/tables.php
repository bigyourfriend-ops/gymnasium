<?php
/* Чтение и запись таблиц (то, что раньше делали запросы sb.from(...) к Supabase).
   Права доступа — те же правила, что были в Supabase (RLS), только проверяет их PHP. */
if (!defined('GM')) { http_response_code(403); exit; }

/* типы столбцов: s — текст, i — число, b — да/нет, j — JSON, t — дата-время */
function tdef(): array {
  return [
    'site_content' => ['pk' => ['id'], 'cols' => ['id' => 's', 'data' => 'j', 'updated_at' => 't', 'updated_by' => 's']],
    'roles' => ['pk' => ['id'], 'cols' => ['id' => 's', 'name' => 's', 'perms' => 'j', 'is_system' => 'b', 'created_at' => 't']],
    'staff' => ['pk' => ['user_id'], 'cols' => ['user_id' => 's', 'role_id' => 's', 'created_at' => 't']],
    'profiles' => ['pk' => ['id'], 'cols' => ['id' => 's', 'email' => 's', 'full_name' => 's', 'role' => 's', 'grade' => 's', 'phone' => 's', 'avatar_url' => 's', 'created_at' => 't'],
      'virt' => ['confirmed' => ['(SELECT u.confirmed_at FROM users u WHERE u.id=profiles.id)', 't'], 'last_sign_in' => ['(SELECT u.last_sign_in FROM users u WHERE u.id=profiles.id)', 't']]],
    'feedback' => ['pk' => ['id'], 'cols' => ['id' => 'i', 'created_at' => 't', 'name' => 's', 'author_role' => 's', 'kind' => 's', 'rating' => 'i', 'body' => 's', 'contact' => 's', 'public_ok' => 'b', 'status' => 's', 'reply' => 's']],
    'feedback_badwords' => ['pk' => ['word'], 'cols' => ['word' => 's']],
    'help_reports' => ['pk' => ['id'], 'cols' => ['id' => 'i', 'created_at' => 't', 'who' => 's', 'place' => 's', 'freq' => 's', 'body' => 's', 'involved' => 's', 'grade' => 's', 'wants_talk' => 'b', 'contact' => 's', 'status' => 's', 'staff_unread' => 'b', 'last_activity' => 't']],
    'help_messages' => ['pk' => ['id'], 'cols' => ['id' => 'i', 'report_id' => 'i', 'created_at' => 't', 'author' => 's', 'body' => 's', 'staff_id' => 's']],
    'dir_letters' => ['pk' => ['id'], 'cols' => ['id' => 'i', 'created_at' => 't', 'user_id' => 's', 'author_role' => 's', 'topic' => 's', 'subject' => 's', 'body' => 's', 'name' => 's', 'grade' => 's', 'contact' => 's', 'anonymous' => 'b', 'status' => 's', 'dir_unread' => 'b', 'author_unread' => 'b', 'last_activity' => 't']],
    'dir_messages' => ['pk' => ['id'], 'cols' => ['id' => 'i', 'letter_id' => 'i', 'created_at' => 't', 'author' => 's', 'body' => 's', 'staff_id' => 's']],
    'prof_results' => ['pk' => ['id'], 'cols' => ['id' => 'i', 'created_at' => 't', 'user_id' => 's', 'grade' => 's', 'code' => 's', 'scores' => 'j']],
    'prof_favs' => ['pk' => ['user_id'], 'cols' => ['user_id' => 's', 'favs' => 'j', 'updated_at' => 't']],
  ];
}

/* кто какие строки видит: [условие WHERE, параметры] или null — ничего */
function read_scope(string $t): ?array {
  $u = uid(); $all = ['1=1', []];
  switch ($t) {
    case 'site_content': return $all;
    case 'roles': return $u ? $all : null;
    case 'staff': return !$u ? null : (is_admin() ? $all : ['user_id=?', [$u]]);
    case 'profiles': return !$u ? null : (is_admin() ? $all : ['id=?', [$u]]);
    case 'feedback': return has_perm('feedback') ? $all : null;
    case 'feedback_badwords': return is_admin() ? $all : null;
    case 'help_reports': case 'help_messages': return perm_strict('help') ? $all : null;
    case 'dir_letters': case 'dir_messages': return perm_strict('director') ? $all : null;
    case 'prof_results': case 'prof_favs': return $u ? ['user_id=?', [$u]] : null;
  }
  return null;
}

function cast_out(string $type, $v) {
  if ($v === null) return null;
  switch ($type) {
    case 'i': return (int)$v;
    case 'b': return (bool)(int)$v;
    case 'j': $d = json_decode((string)$v, true); return $d === null && $v !== 'null' ? $v : $d;
    case 't': return ts_out($v);
  }
  return (string)$v;
}
function row_out(array $types, array $r): array { $o = []; foreach ($r as $k => $v) $o[$k] = isset($types[$k]) ? cast_out($types[$k], $v) : $v; return $o; }

/* WHERE из фильтров клиента: [["id","eq",5], ["report_id","in",[1,2]]] */
function where_from(array $def, array $filters): array {
  $w = []; $p = [];
  foreach ($filters as $f) {
    if (!is_array($f) || count($f) < 3) fail('bad filter');
    [$c, $op, $v] = $f;
    if (!isset($def['cols'][$c])) fail("column $c does not exist", 400, '42703');
    if ($op === 'eq') { if ($v === null) $w[] = "$c IS NULL"; else { $w[] = "$c=?"; $p[] = is_bool($v) ? (int)$v : $v; } }
    elseif ($op === 'in') { $v = array_values((array)$v); if (!$v) { $w[] = '1=0'; continue; } $w[] = "$c IN (" . implode(',', array_fill(0, count($v), '?')) . ')'; array_push($p, ...$v); }
    else fail('bad filter op');
  }
  return [$w, $p];
}

function db_select(string $t, array $def, array $b) {
  $scope = read_scope($t);
  $single = $b['single'] ?? null;
  if ($scope === null) return $single ? null : [];
  $types = $def['cols'];
  $sel = trim((string)($b['cols'] ?? '*')); $embedRoles = false; $cols = [];
  if (preg_match('/,?\s*roles\(([^)]*)\)/', $sel, $m)) { if ($t !== 'staff') fail('bad select'); $embedRoles = array_map('trim', explode(',', $m[1])); $sel = trim(str_replace($m[0], '', $sel), ', '); if (!in_array('role_id', array_map('trim', explode(',', $sel)), true)) $sel .= ($sel ? ',' : '') . 'role_id'; }
  if ($sel === '*' || $sel === '') $cols = array_keys($def['cols']);
  else foreach (explode(',', $sel) as $c) {
    $c = trim($c);
    if (isset($def['cols'][$c])) $cols[] = $c;
    elseif (isset($def['virt'][$c]) && is_admin()) { $cols[] = $def['virt'][$c][0] . " AS $c"; $types[$c] = $def['virt'][$c][1]; }
    else fail("column $t.$c does not exist", 400, '42703');
  }
  [$w, $p] = where_from($def, $b['filters'] ?? []);
  array_unshift($w, $scope[0]); $p = array_merge($scope[1], $p);
  $sql = 'SELECT ' . implode(',', $cols) . " FROM $t WHERE " . implode(' AND ', $w);
  $ord = [];
  foreach (($b['order'] ?? []) as $o) { if (!isset($def['cols'][$o[0]])) fail('bad order'); $ord[] = $o[0] . (!empty($o[1]) ? ' ASC' : ' DESC'); }
  if ($ord) $sql .= ' ORDER BY ' . implode(',', $ord);
  $lim = isset($b['limit']) ? max(1, min(5000, (int)$b['limit'])) : 5000;
  $sql .= ' LIMIT ' . $lim;
  $rows = array_map(fn($r) => row_out($types, $r), q($sql, $p)->fetchAll());
  if ($embedRoles) foreach ($rows as &$r) {
    $ro = q1('SELECT * FROM roles WHERE id=?', [$r['role_id']]);
    $r['roles'] = $ro ? array_intersect_key(row_out(tdef()['roles']['cols'], $ro), array_flip($embedRoles)) : null;
  }
  unset($r);
  if ($single) {
    if (!$rows) { if ($single === 'one') fail('JSON object requested, multiple (or no) rows returned', 406, 'PGRST116'); return null; }
    return $rows[0];
  }
  return $rows;
}

function deny() { fail('new row violates row-level security policy', 403, '42501'); }
function clip($v, int $n) { return $v === null ? null : mb_substr((string)$v, 0, $n); }

/* insert / upsert */
function db_write(string $t, array $b) {
  $rows = $b['values'] ?? null;
  if (!is_array($rows)) fail('no values');
  if (!array_is_list($rows)) $rows = [$rows];
  $u = uid(); if (!$u) deny();
  $now = now_db();
  db()->beginTransaction();
  try {
    foreach ($rows as $r) {
      if (!is_array($r)) fail('bad row');
      switch ($t) {
        case 'site_content':
          $id = (string)($r['id'] ?? '');
          if (!preg_match('/^[a-z0-9_]{1,64}$/', $id) || !can_edit_section($id)) deny();
          if (!array_key_exists('data', $r)) fail('no data');
          q(sql_upsert('site_content', ['id', 'data', 'updated_at', 'updated_by'], ['id'], ['data', 'updated_at', 'updated_by']),
            [$id, json_encode($r['data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $now, $u]);
          break;
        case 'roles':
          $id = (string)($r['id'] ?? '');
          if (!is_admin() || !preg_match('/^[a-z0-9_-]{2,32}$/', $id) || !empty($r['is_system'])) deny();
          if ((int)qv('SELECT is_system FROM roles WHERE id=?', [$id])) deny();
          $name = trim((string)($r['name'] ?? ''));
          if ($name === '' || mb_strlen($name) > 60) fail('bad name');
          $perms = array_values(array_filter(array_map('strval', (array)($r['perms'] ?? [])), fn($x) => preg_match('/^[a-z0-9_]{1,40}$/', $x)));
          q(sql_upsert('roles', ['id', 'name', 'perms', 'is_system', 'created_at'], ['id'], ['name', 'perms']), [$id, $name, json_encode($perms), 0, $now]);
          break;
        case 'profiles':
          if (($r['id'] ?? '') !== $u) deny();
          $cur = q1('SELECT * FROM profiles WHERE id=?', [$u]);
          if (!$cur) { q('INSERT INTO profiles (id,email,created_at) VALUES (?,?,?)', [$u, me()['email'], $now]); $cur = q1('SELECT * FROM profiles WHERE id=?', [$u]); }
          $set = []; $p = [];
          foreach (['full_name' => 100, 'grade' => 12, 'phone' => 30, 'avatar_url' => 500] as $c => $n) {
            if (!array_key_exists($c, $r)) continue;
            $v = $r[$c] === null ? null : trim((string)$r[$c]);
            // ФИО подтверждённого учителя меняет только администратор (к нему привязана папка на Google Диске)
            if ($c === 'full_name' && $cur['role'] === 'teacher' && !is_admin() && $v !== $cur['full_name']) continue;
            $set[] = "$c=?"; $p[] = clip($v, $n);
          }
          if ($set) { $p[] = $u; q('UPDATE profiles SET ' . implode(',', $set) . ' WHERE id=?', $p); }
          break;
        case 'prof_favs':
          if (($r['user_id'] ?? '') !== $u) deny();
          $f = array_slice(array_values(array_map('strval', (array)($r['favs'] ?? []))), 0, 300);
          q(sql_upsert('prof_favs', ['user_id', 'favs', 'updated_at'], ['user_id'], ['favs', 'updated_at']), [$u, json_encode($f, JSON_UNESCAPED_UNICODE), $now]);
          break;
        default: deny();
      }
    }
    db()->commit();
  } catch (Throwable $e) { db()->rollBack(); throw $e; }
  return null;
}

/* update (...).eq("id", …) */
function db_update(string $t, array $def, array $b) {
  $patch = $b['values'] ?? null; if (!is_array($patch) || !$patch) fail('no values');
  $allowed = [
    'feedback' => [fn() => has_perm('feedback'), ['status' => ['pending', 'approved', 'read', 'rejected', 'spam'], 'reply' => 1500, 'public_ok' => 'b']],
    'help_reports' => [fn() => perm_strict('help'), ['status' => ['new', 'in_progress', 'closed', 'spam'], 'staff_unread' => 'b']],
    'dir_letters' => [fn() => perm_strict('director'), ['status' => ['new', 'in_progress', 'closed', 'spam'], 'dir_unread' => 'b']],
  ];
  if (!isset($allowed[$t]) || !$allowed[$t][0]()) deny();
  if (empty($b['filters'])) fail('update needs a filter');
  $set = []; $p = [];
  foreach ($patch as $c => $v) {
    if (!isset($allowed[$t][1][$c])) fail("column $c cannot be changed");
    $rule = $allowed[$t][1][$c];
    if (is_array($rule)) { if (!in_array($v, $rule, true)) fail("bad $c"); }
    elseif ($rule === 'b') $v = $v ? 1 : 0;
    else $v = $v === null ? null : clip(trim((string)$v), $rule);
    $set[] = "$c=?"; $p[] = $v;
  }
  [$w, $wp] = where_from($def, $b['filters']);
  q("UPDATE $t SET " . implode(',', $set) . ' WHERE ' . implode(' AND ', $w), array_merge($p, $wp));
  return null;
}

/* delete (...).eq("id", …) */
function db_delete(string $t, array $def, array $b) {
  if (empty($b['filters'])) fail('delete needs a filter');
  [$w, $wp] = where_from($def, $b['filters']);
  $where = implode(' AND ', $w);
  switch ($t) {
    case 'roles':
      if (!is_admin()) deny();
      $ids = q("SELECT id FROM roles WHERE is_system=0 AND $where", $wp)->fetchAll(PDO::FETCH_COLUMN);
      foreach ($ids as $id) { q('DELETE FROM staff WHERE role_id=?', [$id]); q('DELETE FROM roles WHERE id=?', [$id]); }
      return null;
    case 'feedback':
      if (!has_perm('feedback')) deny();
      q("DELETE FROM feedback WHERE $where", $wp); return null;
    case 'help_reports':
      if (!perm_strict('help')) deny();
      foreach (q("SELECT id FROM help_reports WHERE $where", $wp)->fetchAll(PDO::FETCH_COLUMN) as $id) { q('DELETE FROM help_messages WHERE report_id=?', [$id]); q('DELETE FROM help_reports WHERE id=?', [$id]); }
      return null;
    case 'dir_letters':
      if (!perm_strict('director')) deny();
      foreach (q("SELECT id FROM dir_letters WHERE $where", $wp)->fetchAll(PDO::FETCH_COLUMN) as $id) { q('DELETE FROM dir_messages WHERE letter_id=?', [$id]); q('DELETE FROM dir_letters WHERE id=?', [$id]); }
      return null;
    case 'prof_results':
      $u = need_user()['id'];
      q("DELETE FROM prof_results WHERE user_id=? AND $where", array_merge([$u], $wp)); return null;
  }
  deny();
}

function handle_db(): void {
  $b = body(); $t = (string)($b['table'] ?? ''); $D = tdef();
  if (!isset($D[$t])) fail("relation $t does not exist", 404, '42P01');
  switch ($b['op'] ?? 'select') {
    case 'select': out(db_select($t, $D[$t], $b));
    case 'insert': case 'upsert': out(db_write($t, $b));
    case 'update': out(db_update($t, $D[$t], $b));
    case 'delete': out(db_delete($t, $D[$t], $b));
  }
  fail('bad op');
}
