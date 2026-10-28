<?php
/* Ғани Мұратбаев атындағы гимназия — сервер сайта (PHP + MySQL на ps.kz).
   Общие функции: настройки, база данных, сессии, права, почта, ограничение частоты. */

if (!defined('GM')) { http_response_code(403); exit; }

/* ---------- настройки ----------
   Файл gm-config.php лежит ВНЕ папки сайта (рядом с httpdocs), его создаёт api/install.php.
   Если туда записать нельзя — в api/data/ (закрыт от просмотра). В GitHub его нет. */
function cfg_paths(): array {
  $web = dirname(__DIR__, 2);                 // httpdocs
  return [dirname($web) . '/gm-config.php', dirname(__DIR__) . '/data/gm-config.php'];
}
function cfg_file(): ?string {
  foreach (cfg_paths() as $p) { if (@is_file($p)) return $p; }
  return null;
}
function cfg(?string $k = null, $def = null) {
  static $c = null;
  if ($c === null) { $f = cfg_file(); $c = $f ? (include $f) : []; if (!is_array($c)) $c = []; }
  if ($k === null) return $c;
  return array_key_exists($k, $c) ? $c[$k] : $def;
}
function cfg_write(array $c): string {
  $body = "<?php\n// Настройки сайта gmonline.kz. Создано установщиком " . gmdate('Y-m-d H:i') . " UTC.\n// Не публикуйте этот файл: здесь пароль базы данных.\nreturn " . var_export($c, true) . ";\n";
  $paths = cfg_paths();
  if ($cur = cfg_file()) array_unshift($paths, $cur);   // сначала — туда, где файл уже лежит
  foreach ($paths as $p) {
    $dir = dirname($p);
    if (!is_dir($dir)) @mkdir($dir, 0750, true);
    if (@file_put_contents($p, $body, LOCK_EX) !== false) { @chmod($p, 0600); return $p; }
  }
  throw new RuntimeException('Не удалось сохранить файл настроек: нет прав на запись');
}
function site_url(): string {
  $u = rtrim((string)cfg('site_url', ''), '/');
  if ($u !== '') return $u;
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
  return ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
}
function web_root(): string { return dirname(__DIR__, 2); }
function media_dir(): string { return web_root() . '/uploads/media'; }
function media_url(string $path = ''): string { return site_url() . '/uploads/media/' . $path; }

/* ---------- база данных ---------- */
function db(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;
  if (cfg('db_driver') === 'sqlite') {          // только для проверки на компьютере разработчика
    $pdo = new PDO('sqlite:' . cfg('db_path'), null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec('PRAGMA journal_mode=WAL'); $pdo->exec('PRAGMA busy_timeout=5000');
    return $pdo;
  }
  $pdo = db_connect(cfg('db_host', 'localhost'), cfg('db_name', ''), cfg('db_user', ''), cfg('db_pass', ''), (int)cfg('db_port', 3306));
  return $pdo;
}
function is_sqlite(): bool { return cfg('db_driver') === 'sqlite'; }
/* INSERT, который молча пропускает дубликаты */
function sql_insert_ignore(string $table, array $cols): string {
  return (is_sqlite() ? 'INSERT OR IGNORE' : 'INSERT IGNORE') . " INTO $table (" . implode(',', $cols) . ') VALUES (' . implode(',', array_fill(0, count($cols), '?')) . ')';
}
/* INSERT … или UPDATE, если такой ключ уже есть */
function sql_upsert(string $table, array $cols, array $pk, array $upd): string {
  $s = "INSERT INTO $table (" . implode(',', $cols) . ') VALUES (' . implode(',', array_fill(0, count($cols), '?')) . ')';
  if (!$upd) return str_replace('INSERT INTO', is_sqlite() ? 'INSERT OR IGNORE INTO' : 'INSERT IGNORE INTO', $s);
  if (is_sqlite()) return $s . ' ON CONFLICT(' . implode(',', $pk) . ') DO UPDATE SET ' . implode(',', array_map(fn($c) => "$c=excluded.$c", $upd));
  return $s . ' ON DUPLICATE KEY UPDATE ' . implode(',', array_map(fn($c) => "$c=VALUES($c)", $upd));
}
/* момент «N секунд назад» / «через N секунд» в UTC (строкой для сравнения с DATETIME) */
function ago(int $sec): string { return gmdate('Y-m-d H:i:s', time() - $sec); }
function later(int $sec): string { return gmdate('Y-m-d H:i:s', time() + $sec); }
function db_connect(string $host, string $name, string $user, string $pass, int $port = 3306): PDO {
  $pdo = new PDO("mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::ATTR_STRINGIFY_FETCHES => false,
  ]);
  $pdo->exec("SET time_zone = '+00:00', NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
  return $pdo;
}
function q(string $sql, array $p = []): PDOStatement { $s = db()->prepare($sql); $s->execute($p); return $s; }
function q1(string $sql, array $p = []) { $r = q($sql, $p)->fetch(); return $r === false ? null : $r; }
function qv(string $sql, array $p = []) { $r = q($sql, $p)->fetchColumn(); return $r === false ? null : $r; }

/* время: в базе UTC DATETIME(6), наружу — ISO-строка как у Supabase */
function now_db(): string { $t = microtime(true); return gmdate('Y-m-d H:i:s', (int)$t) . sprintf('.%06d', ($t - floor($t)) * 1e6); }
function ts_out($v) { if ($v === null || $v === '') return null; $v = (string)$v; return str_replace(' ', 'T', $v) . (strpos($v, '.') === false ? '.000000' : '') . '+00:00'; }
function ts_in($v): ?string {
  if ($v === null || $v === '') return null;
  try { $d = new DateTime((string)$v); $d->setTimezone(new DateTimeZone('UTC')); return $d->format('Y-m-d H:i:s.u'); } catch (Throwable $e) { return null; }
}
function uuid4(): string {
  $b = random_bytes(16); $b[6] = chr((ord($b[6]) & 0x0f) | 0x40); $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
  return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
}

/* ---------- ответы ---------- */
class ApiError extends Exception {
  public $http; public $codeStr;
  function __construct(string $msg, int $http = 400, string $code = '') { parent::__construct($msg); $this->http = $http; $this->codeStr = $code; }
}
function fail(string $msg, int $http = 400, string $code = '') { throw new ApiError($msg, $http, $code); }
function out($data) { echo json_encode(['data' => $data, 'error' => null], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
function body(): array {
  static $b = null;
  if ($b !== null) return $b;
  $raw = file_get_contents('php://input');
  $b = $raw ? json_decode($raw, true) : [];
  if (!is_array($b)) $b = [];
  return $b;
}

/* ---------- IP и антиспам ---------- */
function client_ip(): string { return (string)($_SERVER['REMOTE_ADDR'] ?? ''); }
function ip_hash(string $salt): string { return hash('sha256', $salt . ':' . client_ip() . ':' . cfg('secret', '')); }
/* не больше $max событий $kind за $window секунд с одного адреса */
function rate_limit(string $kind, int $max, int $window, string $salt = 'gm'): void {
  $h = ip_hash($salt);
  $n = (int)qv('SELECT COUNT(*) FROM rate_log WHERE ip_hash=? AND kind=? AND created_at > ?', [$h, $kind, ago($window)]);
  if ($n >= $max) fail('rate_limited', 429, 'rate_limited');
  q('INSERT INTO rate_log (ip_hash, kind, created_at) VALUES (?,?,?)', [$h, $kind, now_db()]);
}
/* редкая уборка: старые счётчики, сессии, ссылки, спам-отзывы старше 90 дней */
function housekeeping(): void {
  if (mt_rand(1, 40) !== 1) return;
  try {
    q('DELETE FROM rate_log WHERE created_at < ?', [ago(86400)]);
    q('DELETE FROM sessions WHERE expires_at < ?', [ago(0)]);
    q('DELETE FROM auth_tokens WHERE expires_at < ?', [ago(0)]);
    q("DELETE FROM feedback WHERE status IN ('spam','rejected') AND created_at < ?", [ago(90 * 86400)]);
  } catch (Throwable $e) {}
}

/* ---------- пользователи и сессии ---------- */
const SESSION_DAYS = 30;
function bearer(): string {
  $h = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
  if ($h === '' && function_exists('apache_request_headers')) { foreach (apache_request_headers() as $k => $v) if (strcasecmp($k, 'Authorization') === 0) $h = $v; }
  if ($h === '') $h = $_SERVER['HTTP_X_GM_TOKEN'] ?? '';
  if (stripos($h, 'Bearer ') === 0) $h = substr($h, 7);
  return trim($h);
}
function session_user(?string $token = null): ?array {
  static $cache = [];
  $token = $token ?? bearer();
  if ($token === '' || !preg_match('/^[a-f0-9]{64}$/', $token)) return null;
  if (array_key_exists($token, $cache)) return $cache[$token];
  $row = q1('SELECT u.*, s.expires_at AS s_exp FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at > ?', [hash('sha256', $token), ago(0)]);
  if ($row && strtotime($row['s_exp'] . ' UTC') - time() < (SESSION_DAYS - 1) * 86400) {   // продлеваем раз в сутки
    q('UPDATE sessions SET expires_at=? WHERE token=?', [later(SESSION_DAYS * 86400), hash('sha256', $token)]);
  }
  return $cache[$token] = $row ?: null;
}
function me(): ?array { return session_user(); }
function uid(): ?string { $u = me(); return $u ? $u['id'] : null; }
function need_user(): array { $u = me(); if (!$u) fail('not_authenticated', 401, 'session_expired'); return $u; }
function new_session(string $userId): string {
  $tok = bin2hex(random_bytes(32));
  q('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?,?,?,?)', [hash('sha256', $tok), $userId, now_db(), later(SESSION_DAYS * 86400)]);
  q('UPDATE users SET last_sign_in=? WHERE id=?', [now_db(), $userId]);
  return $tok;
}
function user_out(array $u): array {
  $m = json_decode((string)$u['meta'], true) ?: [];
  $p = q1('SELECT full_name, role FROM profiles WHERE id=?', [$u['id']]);
  if ($p) { if ($p['full_name'] !== null) $m['full_name'] = $p['full_name']; $m['role'] = $p['role']; }
  return [
    'id' => $u['id'], 'email' => $u['email'], 'aud' => 'authenticated', 'role' => 'authenticated',
    'created_at' => ts_out($u['created_at']), 'email_confirmed_at' => ts_out($u['confirmed_at']),
    'last_sign_in_at' => ts_out($u['last_sign_in']), 'user_metadata' => (object)$m, 'identities' => [['provider' => 'email']],
  ];
}
function session_out(string $tok, array $u): array {
  return ['access_token' => $tok, 'token_type' => 'bearer', 'expires_in' => SESSION_DAYS * 86400, 'user' => user_out($u)];
}

/* ---------- роли и права (как было в Supabase) ---------- */
function my_perms(): array {
  static $p = null;
  if ($p !== null) return $p;
  $u = uid(); if (!$u) return $p = [];
  $r = qv('SELECT r.perms FROM staff s JOIN roles r ON r.id=s.role_id WHERE s.user_id=?', [$u]);
  $p = $r ? (json_decode($r, true) ?: []) : [];
  return $p;
}
function has_perm(string $p): bool { $m = my_perms(); return in_array($p, $m, true) || in_array('users', $m, true); }
function is_admin(): bool { return in_array('users', my_perms(), true); }
function is_staff(): bool { return count(my_perms()) > 0; }
function perm_strict(string $p): bool { return in_array($p, my_perms(), true); }   // письма директору и буллинг: только явное право
function section_perm(string $s): string {
  $map = ['posts' => 'news', 'events' => 'events', 'albums' => 'gallery', 'schedule' => 'schedule', 'docs' => 'docs', 'settings' => 'settings',
    'staff' => 'about', 'facilities' => 'about', 'partners' => 'about', 'faq' => 'about', 'clubs' => 'life', 'achievements' => 'life', 'alumni' => 'life', 'projects' => 'projects'];
  if (isset($map[$s])) return $map[$s];
  if (strpos($s, 'pi_') === 0) return 'projects';
  return 'users';
}
function can_edit_section(string $s): bool {
  return has_perm(section_perm($s)) || (strpos($s, 'pi_') === 0 && has_perm('p_' . substr($s, 3)));
}

/* ---------- ФИО: сравнение для привязки папки Google Диска ---------- */
function fio_key(string $s): string {
  $s = mb_strtoupper(trim($s), 'UTF-8');
  $s = strtr($s, ['Ё' => 'Е', 'Ә' => 'А', 'І' => 'И', 'Ң' => 'Н', 'Ғ' => 'Г', 'Ү' => 'У', 'Ұ' => 'У', 'Қ' => 'К', 'Ө' => 'О', 'Һ' => 'Х', 'Й' => 'И']);
  $w = preg_split('/[^\p{L}]+/u', $s, -1, PREG_SPLIT_NO_EMPTY);
  sort($w, SORT_STRING);
  return implode(' ', $w);
}

/* ---------- почта ---------- */
function send_mail(string $to, string $subject, string $html): bool {
  $from = (string)cfg('mail_from', 'noreply@' . preg_replace('/^www\./', '', parse_url(site_url(), PHP_URL_HOST) ?: 'localhost'));
  $name = (string)cfg('mail_name', 'Ғани Мұратбаев атындағы гимназия');
  $subj = '=?UTF-8?B?' . base64_encode($subject) . '?=';
  $fromH = '=?UTF-8?B?' . base64_encode($name) . "?= <$from>";
  $body = chunk_split(base64_encode($html));
  $hdr = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\nFrom: $fromH\r\nReply-To: $from\r\nX-Mailer: gmonline";
  if (cfg('smtp_host')) return smtp_send($from, $to, "Subject: $subj\r\nTo: <$to>\r\nDate: " . date('r') . "\r\n" . $hdr, $body);
  return @mail($to, $subj, $body, $hdr, '-f' . $from);
}
function smtp_send(string $from, string $to, string $headers, string $body): bool {
  $host = (string)cfg('smtp_host'); $port = (int)cfg('smtp_port', 465);
  $fp = @stream_socket_client(($port === 465 ? 'ssl://' : 'tcp://') . "$host:$port", $en, $es, 15);
  if (!$fp) return false;
  stream_set_timeout($fp, 15);
  $rd = function () use ($fp) { $d = ''; while (($l = fgets($fp, 515)) !== false) { $d .= $l; if (isset($l[3]) && $l[3] === ' ') break; } return $d; };
  $cmd = function ($c, $ok) use ($fp, $rd) { if ($c !== null) fwrite($fp, $c . "\r\n"); $r = $rd(); if ((int)substr($r, 0, 3) !== $ok) throw new RuntimeException(trim($r)); return $r; };
  try {
    $cmd(null, 220); $cmd('EHLO gmonline', 250);
    if ($port !== 465) { $cmd('STARTTLS', 220); stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT); $cmd('EHLO gmonline', 250); }
    if (cfg('smtp_user')) { $cmd('AUTH LOGIN', 334); $cmd(base64_encode((string)cfg('smtp_user')), 334); $cmd(base64_encode((string)cfg('smtp_pass')), 235); }
    $cmd("MAIL FROM:<$from>", 250); $cmd("RCPT TO:<$to>", 250); $cmd('DATA', 354);
    fwrite($fp, $headers . "\r\n\r\n" . str_replace("\n.", "\n..", $body) . "\r\n.\r\n"); $cmd(null, 250); $cmd('QUIT', 221);
    fclose($fp); return true;
  } catch (Throwable $e) { @fclose($fp); error_log('gm smtp: ' . $e->getMessage()); return false; }
}
function mail_layout(string $title, string $text, string $btnText, string $url): string {
  $e = fn($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
  return '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">'
    . '<h2 style="color:#14532d;margin:0 0 12px">' . $e($title) . '</h2><p style="line-height:1.5">' . nl2br($e($text)) . '</p>'
    . '<p style="margin:24px 0"><a href="' . $e($url) . '" style="background:#15803d;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">' . $e($btnText) . '</a></p>'
    . '<p style="color:#64748b;font-size:12px">Егер батырма ашылмаса / Если кнопка не открывается:<br>' . $e($url) . '</p>'
    . '<p style="color:#64748b;font-size:12px">Ғани Мұратбаев атындағы гимназия · ' . $e(site_url()) . '</p></div>';
}
