<?php
/* Установщик сайта на ps.kz: подключает базу MySQL, создаёт таблицы и переносит данные из Supabase.
   Открыть: https://gmonline.kz/api/install.php — после завершения установщик сам закрывается. */
define('GM', 1);
require __DIR__ . '/inc/core.php';
require __DIR__ . '/inc/schema.php';
@set_time_limit(120);
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function h($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function page(string $title, string $body): void {
  echo '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>' . h($title) . '</title><style>
  body{margin:0;font:15px/1.5 Inter,Segoe UI,Roboto,Arial,sans-serif;background:#f0fdf4;color:#0f172a}main{max-width:640px;margin:32px auto;padding:0 16px}
  .card{background:#fff;border:1px solid #d1fae5;border-radius:16px;padding:24px;margin-bottom:16px;box-shadow:0 10px 30px -20px rgba(20,83,45,.4)}
  h1{font-size:22px;color:#14532d;margin:0 0 4px}h2{font-size:17px;margin:0 0 10px}p{margin:8px 0}label{display:block;font-weight:600;font-size:13px;margin:12px 0 4px;color:#334155}
  input[type=text],input[type=password],input[type=email],input[type=file]{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #cbd5e1;border-radius:10px;font:inherit}
  button,.btn{display:inline-block;margin-top:16px;background:#15803d;color:#fff;border:0;border-radius:10px;padding:11px 18px;font:600 15px inherit;cursor:pointer;text-decoration:none}
  .soft{background:#e2e8f0;color:#0f172a}.err{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;padding:10px 12px;border-radius:10px}.ok{background:#ecfdf3;border:1px solid #bbf7d0;color:#14532d;padding:10px 12px;border-radius:10px}
  small,.hint{color:#64748b;font-size:13px}code{background:#f1f5f9;padding:1px 5px;border-radius:5px}progress{width:100%;height:14px}ol{padding-left:20px}
  </style></head><body><main><div class="card"><h1>' . h($title) . '</h1><p class="hint">Ғани Мұратбаев атындағы гимназия · ' . h(site_url()) . '</p></div>' . $body . '</main></body></html>';
  exit;
}
function card(string $html): string { return '<div class="card">' . $html . '</div>'; }
function host_ok(string $host): bool {
  $h = strtolower(preg_replace('/:\d+$/', '', trim($host)));
  return in_array($h, ['localhost', '127.0.0.1', '::1'], true) || (bool)preg_match('/(^|\.)ps\.kz$/', $h);
}
function json_out($x): void { header('Content-Type: application/json; charset=utf-8'); echo json_encode($x, JSON_UNESCAPED_UNICODE); exit; }
function todo_path(): string { return __DIR__ . '/data/media-todo.json'; }
function http_get(string $url, array $headers = [], ?string $saveTo = null): array {
  $ch = curl_init($url);
  $opt = [CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 60, CURLOPT_CONNECTTIMEOUT => 15, CURLOPT_HTTPHEADER => $headers, CURLOPT_USERAGENT => 'gmonline-installer'];
  $fp = null;
  if ($saveTo) { @mkdir(dirname($saveTo), 0755, true); $fp = fopen($saveTo . '.part', 'wb'); $opt[CURLOPT_FILE] = $fp; } else $opt[CURLOPT_RETURNTRANSFER] = true;
  curl_setopt_array($ch, $opt);
  $res = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE); $err = curl_error($ch); curl_close($ch);
  if ($fp) { fclose($fp); if ($code === 200) rename($saveTo . '.part', $saveTo); else @unlink($saveTo . '.part'); }
  return [$code, $saveTo ? null : $res, $err];
}

$cfg = cfg();
$key = (string)($_GET['key'] ?? $_POST['key'] ?? '');

/* ---------- 0. уже установлено ---------- */
if ($cfg && !empty($cfg['installed'])) {
  http_response_code(403);
  page('Сайт уже установлен', card('<p>Установка завершена. Этот мастер больше не работает.</p><p class="hint">Повторная установка: удалить файл настроек <code>gm-config.php</code> (через «Файлы» в панели ps.kz).</p><a class="btn" href="' . h(site_url()) . '/">Открыть сайт</a>'));
}

/* ---------- 1. подключение базы ---------- */
if (!$cfg) {
  $err = '';
  $v = ['db_host' => 'localhost', 'db_name' => 'gmonlin1_site', 'db_user' => '', 'site_url' => 'https://gmonline.kz', 'mail_from' => 'noreply@gmonline.kz'];
  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    foreach ($v as $k => $_) $v[$k] = trim((string)($_POST[$k] ?? ''));
    $pass = (string)($_POST['db_pass'] ?? '');
    $port = 3306; $host = $v['db_host'];
    if (preg_match('/^(.+):(\d+)$/', $host, $m)) { $host = $m[1]; $port = (int)$m[2]; }
    if (!host_ok($v['db_host'])) $err = 'Сервер базы должен быть на хостинге ps.kz (обычно localhost).';
    elseif (!filter_var($v['site_url'], FILTER_VALIDATE_URL)) $err = 'Проверьте адрес сайта.';
    else {
      try {
        db_connect($host, $v['db_name'], $v['db_user'], $pass, $port);
        $new = ['db_host' => $host, 'db_port' => $port, 'db_name' => $v['db_name'], 'db_user' => $v['db_user'], 'db_pass' => $pass,
          'site_url' => rtrim($v['site_url'], '/'), 'mail_from' => $v['mail_from'], 'mail_name' => 'Ғани Мұратбаев атындағы гимназия',
          'confirm_email' => true, 'smtp_host' => '', 'smtp_port' => 465, 'smtp_user' => '', 'smtp_pass' => '',
          'secret' => bin2hex(random_bytes(24)), 'install_key' => bin2hex(random_bytes(12)), 'installed' => false];
        $where = cfg_write($new);
        header('Location: install.php?key=' . $new['install_key']);
        exit;
      } catch (PDOException $e) { $err = 'Не удалось подключиться к базе: ' . $e->getMessage(); }
      catch (Throwable $e) { $err = $e->getMessage(); }
    }
  }
  page('Установка сайта · шаг 1 из 3', ($err ? '<p class="err">' . h($err) . '</p>' : '') . card('<h2>База данных MySQL</h2>
    <p class="hint">Данные — в панели ps.kz: «Базы данных» (имя базы и пользователь) или «Информация о подключении». Пароль пользователя базы можно сменить там же, если он забыт.</p>
    <form method="post" autocomplete="off">
    <label>Сервер базы</label><input type="text" name="db_host" value="' . h($v['db_host']) . '">
    <label>Имя базы</label><input type="text" name="db_name" value="' . h($v['db_name']) . '" required>
    <label>Пользователь базы</label><input type="text" name="db_user" value="' . h($v['db_user']) . '" required>
    <label>Пароль пользователя базы</label><input type="password" name="db_pass" required>
    <label>Адрес сайта</label><input type="text" name="site_url" value="' . h($v['site_url']) . '">
    <label>Почта, с которой сайт отправляет письма</label><input type="email" name="mail_from" value="' . h($v['mail_from']) . '">
    <small>Создайте этот ящик в панели ps.kz → «Почта», чтобы письма не попадали в спам.</small><br>
    <button>Подключить</button></form>'));
}

/* дальше — только по ключу из адреса */
if (!hash_equals((string)($cfg['install_key'] ?? ''), $key)) {
  http_response_code(403);
  page('Установка уже начата', card('<p>Сайт подключён к базе, установка не завершена. Продолжить можно только по ссылке, которую показал установщик после шага 1.</p><p class="hint">Если ссылка потерялась: удалите файл <code>gm-config.php</code> (папка над httpdocs или <code>httpdocs/api/data/</code>) и начните заново.</p>'));
}
$K = '?key=' . urlencode($key);
try { schema_install(); } catch (Throwable $e) { page('Ошибка', '<p class="err">Не удалось создать таблицы: ' . h($e->getMessage()) . '</p>'); }
$step = (string)($_GET['step'] ?? '');

/* ---------- 3a. скачивание фото и PDF порциями (вызывается из страницы) ---------- */
if ($step === 'media') {
  $todo = json_decode((string)@file_get_contents(todo_path()), true);
  if (!$todo) json_out(['done' => true, 'total' => 0, 'pos' => 0, 'fail' => []]);
  $t0 = microtime(true);
  while ($todo['pos'] < count($todo['files']) && microtime(true) - $t0 < 20) {
    $n = $todo['files'][$todo['pos']++];
    $dst = media_dir() . '/' . $n;
    if (!is_file($dst)) {
      $url = $todo['base'] . '/storage/v1/object/public/media/' . implode('/', array_map('rawurlencode', explode('/', $n)));
      [$code, , $e] = http_get($url, [], $dst);
      if ($code !== 200) $todo['fail'][] = $n . ' (' . ($code ?: $e) . ')';
    }
  }
  file_put_contents(todo_path(), json_encode($todo, JSON_UNESCAPED_UNICODE));
  json_out(['done' => $todo['pos'] >= count($todo['files']), 'total' => count($todo['files']), 'pos' => $todo['pos'], 'fail' => $todo['fail']]);
}

/* ---------- 3b. завершение: ссылки на фото → свой хостинг, закрыть установщик ---------- */
if ($step === 'finish') {
  $todo = json_decode((string)@file_get_contents(todo_path()), true);
  if ($todo && !empty($todo['base'])) {
    $old = $todo['base'] . '/storage/v1/object/public/media/'; $new = media_url();
    foreach (q('SELECT id, data FROM site_content')->fetchAll() as $r) {
      $d = str_replace([$old, str_replace('/', '\\/', $old)], [$new, str_replace('/', '\\/', $new)], $r['data']);
      if ($d !== $r['data']) q('UPDATE site_content SET data=? WHERE id=?', [$d, $r['id']]);
    }
    q('UPDATE profiles SET avatar_url=REPLACE(avatar_url, ?, ?) WHERE avatar_url IS NOT NULL', [$old, $new]);
  }
  @unlink(todo_path());
  $c = cfg(); $c['installed'] = true; unset($c['install_key']); cfg_write($c);
  $users = (int)qv('SELECT COUNT(*) FROM users');
  page('Готово!', card('<p class="ok">Сайт работает на ps.kz. База MySQL подключена' . ($todo ? ', данные и файлы перенесены' : '') . '.</p>
    <ol><li>Откройте сайт и войдите' . ($users ? ' своей прежней почтой и паролем' : '') . '.</li>
    <li>Проверьте новости, фото, расписание.</li>
    ' . ($todo && !empty($todo['fail']) ? '<li>Не скачались файлы: ' . count($todo['fail']) . ' — их можно загрузить заново через админку.</li>' : '') . '
    <li>Удалите файл <b>migration.json</b> со своего компьютера — в нём учётные записи.</li></ol>
    <a class="btn" href="' . h(site_url()) . '/">Открыть сайт</a>'));
}

/* ---------- 2. перенос данных ---------- */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && ($_POST['do'] ?? '') === 'import') {
  $f = $_FILES['mig'] ?? null;
  $j = ($f && $f['error'] === UPLOAD_ERR_OK) ? json_decode((string)file_get_contents($f['tmp_name']), true) : null;
  if (!is_array($j) || ($j['format'] ?? '') !== 'gmonline-migration-1') page('Ошибка', '<p class="err">Это не файл переноса migration.json.</p><a class="btn soft" href="install.php' . h($K) . '">Назад</a>');
  $log = [];
  try {
    db()->beginTransaction();
    $ins = function (string $table, array $rows, array $cols, ?callable $map = null) use (&$log) {
      $n = 0;
      foreach ($rows as $r) { if ($map) $r = $map($r); if ($r === null) continue; q(sql_upsert($table, $cols, [$cols[0]], array_slice($cols, 1)), array_map(fn($c) => $r[$c] ?? null, $cols)); $n++; }
      $log[] = "$table: $n";
    };
    $ts = fn($v) => ts_in($v);
    $ins('users', $j['users'] ?? [], ['id', 'email', 'pass', 'confirmed_at', 'meta', 'created_at', 'last_sign_in'], fn($r) => [
      'id' => $r['id'], 'email' => mb_strtolower($r['email']), 'pass' => $r['encrypted_password'] ?: password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT),
      'confirmed_at' => $ts($r['email_confirmed_at']), 'meta' => json_encode(array_diff_key((array)($r['raw_user_meta_data'] ?? []), ['sub' => 1, 'email_verified' => 1, 'phone_verified' => 1]), JSON_UNESCAPED_UNICODE),
      'created_at' => $ts($r['created_at']), 'last_sign_in' => $ts($r['last_sign_in_at'] ?? null)]);
    $ins('profiles', $j['profiles'] ?? [], ['id', 'email', 'full_name', 'role', 'grade', 'phone', 'avatar_url', 'created_at'], fn($r) => array_merge($r, ['created_at' => $ts($r['created_at'])]));
    $ins('roles', $j['roles'] ?? [], ['id', 'name', 'perms', 'is_system', 'created_at'], fn($r) => ['id' => $r['id'], 'name' => $r['name'],
      'perms' => json_encode(array_values(array_diff((array)$r['perms'], ['tests', 'tests_all']))), 'is_system' => $r['is_system'] ? 1 : 0, 'created_at' => $ts($r['created_at'])]);
    $ins('staff', $j['staff'] ?? [], ['user_id', 'role_id', 'created_at'], fn($r) => array_merge($r, ['created_at' => $ts($r['created_at'])]));
    $ins('admin_emails', $j['admin_emails'] ?? [], ['email']);
    $ins('feedback_badwords', $j['feedback_badwords'] ?? [], ['word']);
    $ins('feedback', $j['feedback'] ?? [], ['id', 'created_at', 'name', 'author_role', 'kind', 'rating', 'body', 'contact', 'public_ok', 'status', 'reply', 'ip_hash'],
      fn($r) => array_merge($r, ['created_at' => $ts($r['created_at']), 'public_ok' => $r['public_ok'] ? 1 : 0, 'ip_hash' => null]));
    $ins('prof_results', $j['prof_results'] ?? [], ['id', 'created_at', 'user_id', 'grade', 'code', 'scores'], fn($r) => array_merge($r, ['created_at' => $ts($r['created_at']), 'scores' => json_encode($r['scores'])]));
    $ins('prof_favs', $j['prof_favs'] ?? [], ['user_id', 'favs', 'updated_at'], fn($r) => array_merge($r, ['favs' => json_encode($r['favs'], JSON_UNESCAPED_UNICODE), 'updated_at' => $ts($r['updated_at'])]));
    foreach (['help_reports' => ['created_at', 'last_activity'], 'help_messages' => ['created_at'], 'dir_letters' => ['created_at', 'last_activity'], 'dir_messages' => ['created_at']] as $t => $tcols) {
      $rows = $j[$t] ?? []; if (!$rows) { $log[] = "$t: 0"; continue; }
      $cols = array_keys($rows[0]);
      $ins($t, $rows, $cols, function ($r) use ($tcols, $ts) { foreach ($tcols as $c) $r[$c] = $ts($r[$c]); foreach ($r as $k => $v) if (is_bool($v)) $r[$k] = $v ? 1 : 0; return $r; });
    }
    db()->commit();
  } catch (Throwable $e) { if (db()->inTransaction()) db()->rollBack(); page('Ошибка переноса', '<p class="err">' . h($e->getMessage()) . '</p><a class="btn soft" href="install.php' . h($K) . '">Назад</a>'); }

  // содержимое сайта — прямо из Supabase (оно публичное)
  $base = rtrim((string)($j['supabase_url'] ?? ''), '/'); $apikey = (string)($j['supabase_key'] ?? '');
  [$code, $res, $e] = http_get($base . '/rest/v1/site_content?select=id,data,updated_at,updated_by', ['apikey: ' . $apikey, 'Authorization: Bearer ' . $apikey]);
  $rows = $code === 200 ? json_decode($res, true) : null;
  if (!is_array($rows)) page('Ошибка переноса', '<p class="err">Не удалось получить содержимое сайта из Supabase (' . h($code ?: $e) . '). Учётные записи уже перенесены — нажмите «Назад» и загрузите файл ещё раз.</p><a class="btn soft" href="install.php' . h($K) . '">Назад</a>');
  $skip = ['clubs'];   // раздел «Кружки и секции» удалён с сайта
  foreach ($rows as $r) {
    if (in_array($r['id'], $skip, true)) continue;
    q(sql_upsert('site_content', ['id', 'data', 'updated_at', 'updated_by'], ['id'], ['data', 'updated_at', 'updated_by']),
      [$r['id'], json_encode($r['data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), ts_in($r['updated_at']) ?: now_db(), $r['updated_by']]);
  }
  $log[] = 'site_content: ' . count($rows);
  // список файлов: всё из хранилища + всё, на что ссылаются страницы и профили
  $files = array_values(array_filter((array)($j['media'] ?? []), 'is_string'));
  $re = '~' . preg_quote($base, '~') . '/storage/v1/object/public/media/([^"\'\s?)\\\\<>]+)~';
  $scan = json_encode($rows, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ' ' . implode(' ', array_column($j['profiles'] ?? [], 'avatar_url'));
  if (preg_match_all($re, $scan, $mm)) foreach ($mm[1] as $x) $files[] = rawurldecode($x);
  $files = array_values(array_unique(array_filter($files, fn($n) => preg_match('~^[A-Za-z0-9][A-Za-z0-9._/ ()-]*$~u', $n) && strpos($n, '..') === false && !preg_match('/\.(php\d?|phtml|phar|htaccess)$/i', $n))));
  file_put_contents(todo_path(), json_encode(['base' => $base, 'files' => $files, 'pos' => 0, 'fail' => []], JSON_UNESCAPED_UNICODE));
  page('Установка сайта · шаг 3 из 3', card('<p class="ok">Перенесено: ' . h(implode(', ', $log)) . '</p><h2>Фото и PDF</h2><p>Скачиваю файлы из Supabase на хостинг. Не закрывайте страницу.</p>
    <progress id="pb" max="' . count($files) . '" value="0"></progress><p id="st" class="hint">0 / ' . count($files) . '</p><p id="fl" class="err" hidden></p>
    <a id="fin" class="btn" href="install.php' . h($K) . '&step=finish" hidden>Завершить установку</a>') . '
    <script>(function run(){fetch("install.php' . $K . '&step=media",{cache:"no-store"}).then(function(r){return r.json()}).then(function(j){
      document.getElementById("pb").value=j.pos;document.getElementById("st").textContent=j.pos+" / "+j.total;
      if(j.fail&&j.fail.length){var f=document.getElementById("fl");f.hidden=false;f.textContent="Не скачались: "+j.fail.length+" — "+j.fail.slice(0,5).join(", ")}
      if(j.done)document.getElementById("fin").hidden=false;else run()}).catch(function(){setTimeout(run,3000)})})();</script>');
}

/* экран шага 2 */
$users = (int)qv('SELECT COUNT(*) FROM users');
page('Установка сайта · шаг 2 из 3', '<p class="ok">База подключена, таблицы созданы. Сохраните эту страницу в закладки, пока установка не закончится.</p>' .
  card('<h2>Перенести всё из Supabase</h2><p>Выберите файл <b>migration.json</b> (его прислал Claude). Перенесутся учётные записи с паролями, роли, содержимое сайта, фото и PDF.</p>' .
    ($users ? '<p class="hint">В базе уже есть пользователи (' . $users . '). Повторный перенос обновит записи, ничего не удалит.</p>' : '') .
    '<form method="post" enctype="multipart/form-data"><input type="hidden" name="key" value="' . h($key) . '"><input type="hidden" name="do" value="import"><input type="file" name="mig" accept=".json,application/json" required><button>Перенести</button></form>') .
  card('<h2>Или начать с пустого сайта</h2><p class="hint">Содержимое будет из файла assets/data.js. Первый администратор: впишите почту в таблицу <code>admin_emails</code> через phpMyAdmin и зарегистрируйтесь на сайте.</p><a class="btn soft" href="install.php' . h($K) . '&step=finish">Завершить без переноса</a>'));
