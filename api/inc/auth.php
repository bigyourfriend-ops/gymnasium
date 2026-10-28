<?php
/* Регистрация, вход, подтверждение почты, восстановление пароля, загрузка файлов. */
if (!defined('GM')) { http_response_code(403); exit; }

function norm_email($e): string { return mb_strtolower(trim((string)$e)); }
function make_link_token(string $userId, string $kind, int $ttl): string {
  $t = bin2hex(random_bytes(32));
  q('DELETE FROM auth_tokens WHERE user_id=? AND kind=?', [$userId, $kind]);
  q('INSERT INTO auth_tokens (token,user_id,kind,expires_at) VALUES (?,?,?,?)', [hash('sha256', $t), $userId, $kind, later($ttl)]);
  return $t;
}
function verify_link(string $t, string $kind): string { return site_url() . '/api/?a=verify&type=' . $kind . '&t=' . $t; }
/* почта из списка admin_emails после подтверждения автоматически получает роль «Администратор» */
function grant_listed_admin(array $u): void {
  if ($u['confirmed_at'] && qv('SELECT 1 FROM admin_emails WHERE LOWER(email)=?', [norm_email($u['email'])]))
    q(sql_upsert('staff', ['user_id', 'role_id', 'created_at'], ['user_id'], ['role_id']), [$u['id'], 'admin', now_db()]);
}

function auth_signup(): void {
  $b = body(); $email = norm_email($b['email'] ?? ''); $pw = (string)($b['password'] ?? '');
  $data = is_array($b['data'] ?? null) ? $b['data'] : [];
  if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) fail('Unable to validate email address: invalid format', 400);
  if (strlen($pw) < 8) fail('Password should be at least 8 characters', 422);
  rate_limit('signup', 5, 3600);
  if (qv('SELECT 1 FROM users WHERE email=?', [$email])) fail('User already registered', 422);
  $name = mb_substr(preg_replace('/\s+/u', ' ', trim((string)($data['full_name'] ?? ''))), 0, 100);
  $id = uuid4(); $now = now_db();
  $autoConfirm = !cfg('confirm_email', true);
  // тип пользователя (ученик / родитель / учитель) при регистрации не выбирается — его ставит администратор
  q('INSERT INTO users (id,email,pass,confirmed_at,meta,created_at) VALUES (?,?,?,?,?,?)',
    [$id, $email, password_hash($pw, PASSWORD_BCRYPT), $autoConfirm ? $now : null, json_encode(['full_name' => $name, 'email' => $email], JSON_UNESCAPED_UNICODE), $now]);
  q('INSERT INTO profiles (id,email,full_name,created_at) VALUES (?,?,?,?)', [$id, $email, nz($name), $now]);
  $u = q1('SELECT * FROM users WHERE id=?', [$id]);
  if ($autoConfirm) { grant_listed_admin($u); $tok = new_session($id); out(['user' => user_out($u), 'session' => session_out($tok, $u)]); }
  $link = verify_link(make_link_token($id, 'signup', 3 * 86400), 'signup');
  $ok = send_mail($email, 'Поштаны растау / Подтверждение почты', mail_layout('Тіркелуді растаңыз / Подтвердите регистрацию',
    "Сәлеметсіз бе! Гимназия сайтында тіркелуді аяқтау үшін батырманы басыңыз.\nЗдравствуйте! Чтобы завершить регистрацию на сайте гимназии, нажмите кнопку.\nСілтеме 3 күн жарамды / Ссылка действует 3 дня.",
    'Поштаны растау / Подтвердить почту', $link));
  if (!$ok) error_log('gm: confirmation mail to ' . $email . ' was not sent');
  out(['user' => user_out($u), 'session' => null]);
}

function auth_login(): void {
  $b = body(); $email = norm_email($b['email'] ?? ''); $pw = (string)($b['password'] ?? '');
  rate_limit('login', 10, 600);
  $u = q1('SELECT * FROM users WHERE email=?', [$email]);
  // старые хэши Supabase имеют вид $2a$… — password_verify понимает их как обычный bcrypt
  if (!$u || !password_verify($pw, $u['pass'])) fail('Invalid login credentials', 400);
  if (!$u['confirmed_at']) fail('Email not confirmed', 400);
  if (password_needs_rehash($u['pass'], PASSWORD_BCRYPT)) q('UPDATE users SET pass=? WHERE id=?', [password_hash($pw, PASSWORD_BCRYPT), $u['id']]);
  grant_listed_admin($u);
  $tok = new_session($u['id']);
  out(['user' => user_out($u), 'session' => session_out($tok, $u)]);
}

function auth_logout(): void {
  $u = me();
  if ($u) {
    if ((body()['scope'] ?? '') === 'global') q('DELETE FROM sessions WHERE user_id=?', [$u['id']]);
    else q('DELETE FROM sessions WHERE token=?', [hash('sha256', bearer())]);
  }
  out(null);
}

function auth_user(): void { $u = need_user(); out(['user' => user_out($u)]); }

function auth_update(): void {
  $u = need_user(); $b = body();
  if (isset($b['password'])) {
    $pw = (string)$b['password']; if (strlen($pw) < 8) fail('Password should be at least 8 characters', 422);
    q('UPDATE users SET pass=? WHERE id=?', [password_hash($pw, PASSWORD_BCRYPT), $u['id']]);
    q('DELETE FROM sessions WHERE user_id=? AND token<>?', [$u['id'], hash('sha256', bearer())]);   // выход на других устройствах
  }
  if (is_array($b['data'] ?? null)) {
    $meta = json_decode((string)$u['meta'], true) ?: [];
    foreach ($b['data'] as $k => $v) {
      if (in_array($k, ['role', 'email'], true)) continue;            // эти поля меняет только администратор
      if ($k === 'full_name') continue;                                 // ФИО хранится в профиле
      if (preg_match('/^[a-z_]{1,30}$/', $k) && (is_scalar($v) || $v === null)) $meta[$k] = $v === null ? null : mb_substr((string)$v, 0, 200);
    }
    q('UPDATE users SET meta=? WHERE id=?', [json_encode($meta, JSON_UNESCAPED_UNICODE), $u['id']]);
  }
  $u = q1('SELECT * FROM users WHERE id=?', [$u['id']]);
  out(['user' => user_out($u)]);
}

function auth_recover(): void {
  $email = norm_email(body()['email'] ?? '');
  rate_limit('recover', 4, 3600);
  $u = q1('SELECT * FROM users WHERE email=?', [$email]);
  if ($u) {
    $link = verify_link(make_link_token($u['id'], 'recovery', 3600), 'recovery');
    send_mail($email, 'Құпия сөзді қалпына келтіру / Восстановление пароля', mail_layout('Жаңа құпия сөз / Новый пароль',
      "Құпия сөзді өзгерту үшін батырманы басыңыз. Сілтеме 1 сағат жарамды.\nЧтобы задать новый пароль, нажмите кнопку. Ссылка действует 1 час.\nЕгер сіз сұрамасаңыз, хатты елемеңіз. / Если вы не запрашивали — просто проигнорируйте письмо.",
      'Құпия сөзді өзгерту / Сменить пароль', $link));
  }
  out(null);   // всегда «ок», чтобы по форме нельзя было узнать, есть ли такая почта
}

/* переход по ссылке из письма → вход на сайт */
function auth_verify(): void {
  $t = (string)($_GET['t'] ?? ''); $type = (string)($_GET['type'] ?? '');
  $home = site_url() . '/';
  $row = preg_match('/^[a-f0-9]{64}$/', $t) ? q1('SELECT * FROM auth_tokens WHERE token=? AND kind=? AND expires_at > ?', [hash('sha256', $t), $type, ago(0)]) : null;
  if (!$row) { header('Location: ' . $home . '#home&gm_err=link'); exit; }
  q('DELETE FROM auth_tokens WHERE token=?', [hash('sha256', $t)]);
  if ($type === 'signup' || $type === 'recovery') q('UPDATE users SET confirmed_at=COALESCE(confirmed_at, ?) WHERE id=?', [now_db(), $row['user_id']]);
  $u = q1('SELECT * FROM users WHERE id=?', [$row['user_id']]);
  if (!$u) { header('Location: ' . $home); exit; }
  grant_listed_admin($u);
  $tok = new_session($u['id']);
  header('Location: ' . $home . '#gm_auth=' . $tok . '&type=' . $type);
  exit;
}

/* ---------- загрузка фото и PDF ---------- */
function handle_upload(): void {
  $u = need_user();
  $path = trim((string)($_POST['path'] ?? ''), '/');
  if (!preg_match('~^[A-Za-z0-9][A-Za-z0-9._/-]{0,250}$~', $path) || strpos($path, '..') !== false || strpos($path, '//') !== false) fail('Invalid key', 400);
  $parts = explode('/', $path);
  if ($parts[0] === 'avatars') { if (($parts[1] ?? '') !== $u['id'] || count($parts) < 3) fail('new row violates row-level security policy', 403, '42501'); }
  elseif (!is_staff()) fail('new row violates row-level security policy', 403, '42501');
  $f = $_FILES['file'] ?? null;
  if (!$f || $f['error'] !== UPLOAD_ERR_OK) fail('upload failed (' . ($f['error'] ?? 'no file') . '): файл слишком большой или не дошёл', 400);
  if ($f['size'] > 20 * 1048576) fail('The object exceeded the maximum allowed size', 413);
  $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
  $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
  $okExt = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'pdf' => 'application/pdf'];
  if (!isset($okExt[$ext]) || $okExt[$ext] !== $mime) fail('mime type ' . $mime . ' is not supported', 415);
  $dst = media_dir() . '/' . $path;
  if (is_file($dst) && ($_POST['upsert'] ?? '') !== '1') fail('The resource already exists', 409, 'Duplicate');
  if (!is_dir(dirname($dst)) && !@mkdir(dirname($dst), 0755, true)) fail('storage not writable', 500);
  if (!move_uploaded_file($f['tmp_name'], $dst)) fail('storage not writable', 500);
  @chmod($dst, 0644);
  out(['path' => $path, 'Key' => 'media/' . $path, 'publicUrl' => media_url($path)]);
}

/* ---------- проверка для скрипта Google Диска (google/teacher-reports.gs) ----------
   Загружать отчёты может только учитель, которого администратор отметил «Мұғалім».
   Папка выбирается по ФИО профиля; если такое же ФИО у другого учителя — отказ. */
function handle_drive_me(): void {
  $b = body(); $u = session_user((string)($b['token'] ?? ''));
  if (!$u) { echo json_encode(['ok' => false, 'error' => 'auth']); exit; }
  $p = q1('SELECT full_name, role FROM profiles WHERE id=?', [$u['id']]) ?: ['full_name' => '', 'role' => null];
  $key = fio_key((string)$p['full_name']); $dup = false;
  if ($p['role'] === 'teacher' && $key !== '') {
    foreach (q("SELECT id, full_name FROM profiles WHERE role='teacher' AND id<>?", [$u['id']])->fetchAll() as $o) if (fio_key((string)$o['full_name']) === $key) { $dup = true; break; }
  }
  // администратор сайта видит все папки учителей и может загрузить файл в любую (проверка, помощь учителю)
  $perms = json_decode((string)qv('SELECT r.perms FROM staff s JOIN roles r ON r.id=s.role_id WHERE s.user_id=?', [$u['id']]), true) ?: [];
  echo json_encode(['ok' => true, 'id' => $u['id'], 'email' => $u['email'], 'full_name' => (string)$p['full_name'], 'fio_key' => $key,
    'teacher' => $p['role'] === 'teacher', 'dup' => $dup, 'admin' => in_array('users', $perms, true)], JSON_UNESCAPED_UNICODE);
  exit;
}
