<?php
/* Таблицы MySQL. Повторный запуск безопасен (CREATE TABLE IF NOT EXISTS). */
if (!defined('GM')) { http_response_code(403); exit; }

function schema_sql(): array {
  $t = ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';
  return [
    // учётные записи (пароли — bcrypt, как в Supabase; старые хэши подходят без изменений)
    "CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) NOT NULL PRIMARY KEY,
      email VARCHAR(190) NOT NULL,
      pass VARCHAR(255) NOT NULL,
      confirmed_at DATETIME(6) NULL,
      meta LONGTEXT NULL,
      created_at DATETIME(6) NOT NULL,
      last_sign_in DATETIME(6) NULL,
      UNIQUE KEY users_email (email)
    )$t",
    "CREATE TABLE IF NOT EXISTS sessions (
      token CHAR(64) NOT NULL PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      created_at DATETIME(6) NOT NULL,
      expires_at DATETIME NOT NULL,
      KEY sessions_user (user_id)
    )$t",
    // одноразовые ссылки: подтверждение почты и восстановление пароля
    "CREATE TABLE IF NOT EXISTS auth_tokens (
      token CHAR(64) NOT NULL PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      kind VARCHAR(16) NOT NULL,
      expires_at DATETIME NOT NULL,
      KEY auth_tokens_user (user_id)
    )$t",
    "CREATE TABLE IF NOT EXISTS roles (
      id VARCHAR(32) NOT NULL PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      perms TEXT NOT NULL,
      is_system TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME(6) NOT NULL
    )$t",
    "CREATE TABLE IF NOT EXISTS staff (
      user_id CHAR(36) NOT NULL PRIMARY KEY,
      role_id VARCHAR(32) NOT NULL,
      created_at DATETIME(6) NOT NULL,
      KEY staff_role (role_id)
    )$t",
    "CREATE TABLE IF NOT EXISTS site_content (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      data LONGTEXT NOT NULL,
      updated_at DATETIME(6) NOT NULL,
      updated_by CHAR(36) NULL
    )$t",
    // role: student / parent / teacher — ставит только администратор («Мұғалім» = подтверждённый учитель)
    "CREATE TABLE IF NOT EXISTS profiles (
      id CHAR(36) NOT NULL PRIMARY KEY,
      email VARCHAR(190) NULL,
      full_name VARCHAR(100) NULL,
      role VARCHAR(16) NULL,
      grade VARCHAR(12) NULL,
      phone VARCHAR(30) NULL,
      avatar_url TEXT NULL,
      created_at DATETIME(6) NOT NULL
    )$t",
    "CREATE TABLE IF NOT EXISTS admin_emails (email VARCHAR(190) NOT NULL PRIMARY KEY)$t",
    "CREATE TABLE IF NOT EXISTS feedback (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      created_at DATETIME(6) NOT NULL,
      name VARCHAR(60) NULL,
      author_role VARCHAR(16) NOT NULL DEFAULT 'other',
      kind VARCHAR(16) NOT NULL DEFAULT 'review',
      rating TINYINT NULL,
      body TEXT NOT NULL,
      contact VARCHAR(100) NULL,
      public_ok TINYINT(1) NOT NULL DEFAULT 1,
      status VARCHAR(12) NOT NULL DEFAULT 'pending',
      reply TEXT NULL,
      ip_hash CHAR(64) NULL,
      KEY feedback_ip_time (ip_hash, created_at),
      KEY feedback_status (status, created_at)
    )$t",
    "CREATE TABLE IF NOT EXISTS feedback_badwords (word VARCHAR(60) NOT NULL PRIMARY KEY)$t",
    "CREATE TABLE IF NOT EXISTS rate_log (
      ip_hash CHAR(64) NOT NULL,
      kind VARCHAR(20) NOT NULL,
      created_at DATETIME(6) NOT NULL,
      KEY rate_main (ip_hash, kind, created_at),
      KEY rate_time (created_at)
    )$t",
    "CREATE TABLE IF NOT EXISTS help_reports (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      created_at DATETIME(6) NOT NULL,
      code_hash CHAR(64) NOT NULL,
      who VARCHAR(10) NOT NULL DEFAULT 'self',
      place VARCHAR(10) NOT NULL DEFAULT 'other',
      freq VARCHAR(10) NOT NULL DEFAULT 'once',
      body TEXT NOT NULL,
      involved VARCHAR(300) NULL,
      grade VARCHAR(12) NULL,
      wants_talk TINYINT(1) NOT NULL DEFAULT 0,
      contact VARCHAR(150) NULL,
      status VARCHAR(12) NOT NULL DEFAULT 'new',
      staff_unread TINYINT(1) NOT NULL DEFAULT 1,
      last_activity DATETIME(6) NOT NULL,
      UNIQUE KEY help_code (code_hash)
    )$t",
    "CREATE TABLE IF NOT EXISTS help_messages (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      report_id BIGINT NOT NULL,
      created_at DATETIME(6) NOT NULL,
      author VARCHAR(10) NOT NULL,
      body TEXT NOT NULL,
      staff_id CHAR(36) NULL,
      KEY help_msg_report (report_id)
    )$t",
    "CREATE TABLE IF NOT EXISTS dir_letters (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      created_at DATETIME(6) NOT NULL,
      code_hash CHAR(64) NOT NULL,
      user_id CHAR(36) NULL,
      author_role VARCHAR(10) NOT NULL DEFAULT 'other',
      topic VARCHAR(12) NOT NULL DEFAULT 'question',
      subject VARCHAR(120) NULL,
      body TEXT NOT NULL,
      name VARCHAR(80) NULL,
      grade VARCHAR(12) NULL,
      contact VARCHAR(150) NULL,
      anonymous TINYINT(1) NOT NULL DEFAULT 0,
      status VARCHAR(12) NOT NULL DEFAULT 'new',
      dir_unread TINYINT(1) NOT NULL DEFAULT 1,
      author_unread TINYINT(1) NOT NULL DEFAULT 0,
      last_activity DATETIME(6) NOT NULL,
      UNIQUE KEY dir_code (code_hash),
      KEY dir_user (user_id)
    )$t",
    "CREATE TABLE IF NOT EXISTS dir_messages (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      letter_id BIGINT NOT NULL,
      created_at DATETIME(6) NOT NULL,
      author VARCHAR(10) NOT NULL,
      body TEXT NOT NULL,
      staff_id CHAR(36) NULL,
      KEY dir_msg_letter (letter_id)
    )$t",
    "CREATE TABLE IF NOT EXISTS prof_results (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      created_at DATETIME(6) NOT NULL,
      user_id CHAR(36) NULL,
      grade VARCHAR(12) NULL,
      code CHAR(3) NOT NULL,
      scores TEXT NOT NULL,
      KEY prof_user (user_id)
    )$t",
    "CREATE TABLE IF NOT EXISTS prof_favs (
      user_id CHAR(36) NOT NULL PRIMARY KEY,
      favs TEXT NOT NULL,
      updated_at DATETIME(6) NOT NULL
    )$t",
  ];
}

/* те же таблицы для SQLite (только для проверки на компьютере разработчика) */
function schema_sqlite(): array {
  return array_map(function ($s) {
    $s = preg_replace('/\) ENGINE=.*$/s', ')', $s);
    $s = str_replace('BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT', $s);
    $s = preg_replace('/,\s*UNIQUE KEY \w+ (\([^)]*\))/', ', UNIQUE $1', $s);
    $s = preg_replace('/,\s*KEY \w+ \([^)]*\)/', '', $s);
    return $s;
  }, schema_sql());
}
function schema_install(): void {
  foreach (is_sqlite() ? schema_sqlite() : schema_sql() as $s) db()->exec($s);
  schema_seed();
}

/* начальные роли и стоп-слова (если таблицы пустые) */
function schema_seed(): void {
  $now = now_db();
  $roles = [
    ['admin', 'Әкімші / Администратор', ['news', 'events', 'gallery', 'schedule', 'about', 'life', 'docs', 'settings', 'projects', 'feedback', 'users'], 1],
    ['secretary', 'Хатшы / Секретарь', ['news', 'events', 'gallery', 'schedule', 'about', 'life', 'docs', 'settings', 'projects', 'feedback'], 0],
    ['teacher', 'Мұғалім / Учитель', ['news', 'events', 'gallery'], 0],
    ['director', 'Директор', ['feedback', 'help', 'director'], 0],
    ['psychologist', 'Психолог', ['help'], 0],
  ];
  foreach ($roles as $r) q(sql_insert_ignore('roles', ['id', 'name', 'perms', 'is_system', 'created_at']), [$r[0], $r[1], json_encode($r[2]), $r[3], $now]);
  $w = ['хуй', 'хуе', 'хуё', 'пизд', 'ебат', 'ебан', 'ебал', 'ёбан', 'бля', 'сука', 'мудак', 'мудил', 'пидор', 'пидар', 'гандон', 'залуп', 'шлюх', 'чмо', 'дебил', 'урод',
    'шешеңді', 'шешеңнің', 'атаңның', 'қотақ', 'сігейін', 'ақымақ', 'малғұн', 'fuck', 'shit', 'bitch', 'casino', 'казино', 'ставки', 'crypto'];
  foreach ($w as $x) q(sql_insert_ignore('feedback_badwords', ['word']), [$x]);
}
