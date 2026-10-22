/**
 * Ғани Мұратбаев атындағы гимназия — мұғалімдердің есептері мен жетістіктері (Google Drive)
 * Отчёты учителей за четверти и достижения → Google Диск, автоматически по папкам.
 *
 * Структура папок:  <оқу жылы> / <әдістемелік бірлестік> / <мұғалімнің аты-жөні> / 1 ТОҚСАН … 4 ТОҚСАН, ЖЕТІСТІКТЕР
 *
 * Установка (один раз, под аккаунтом-ВЛАДЕЛЬЦЕМ папки «2025-2026») — подробно в google/README.md:
 *   1. script.google.com → «Новый проект» → вставить этот файл целиком → Сохранить.
 *   2. Выбрать функцию setupNewYear → «Выполнить» → разрешить доступ.
 *      Создаст папку «2026-2027» рядом с «2025-2026» (та же структура) и таблицу «Тапсыру журналы».
 *   3. «Развернуть» → «Новое развертывание» → тип «Веб-приложение»:
 *      Выполнять как: «Я»;  У кого есть доступ: «Все».  Скопировать ссылку …/exec.
 *   4. На сайте: Әкімші панелі → Баптаулар → «Google Drive скрипті» → вставить ссылку → Сақтау → Жариялау.
 */

// ---------- настройки ----------
var CONFIG = {
  SUPABASE_URL: 'https://nrtfzmaxpeqqzfmrlnro.supabase.co',
  SUPABASE_KEY: 'sb_publishable_GzWeyuE9sOaot5H1IiEJTA_Gs6AQ83m',   // публичный ключ (как в config.js)
  FIRST_YEAR_FOLDER_ID: '1E0AiU9ZZK1sgaGWv3LQCD0ng7O6T_1Kj',        // папка «2025-2026» — образец структуры
  MAX_MB: 25
};
var CATS = { q1: '1 ТОҚСАН', q2: '2 ТОҚСАН', q3: '3 ТОҚСАН', q4: '4 ТОҚСАН', ach: 'ЖЕТІСТІКТЕР' };
var CAT_ORDER = ['q1', 'q2', 'q3', 'q4', 'ach'];

// ---------- учебный год ----------
function schoolYearName_(d) {
  d = d || new Date();
  var tz = 'Asia/Qyzylorda', y = +Utilities.formatDate(d, tz, 'yyyy'), m = +Utilities.formatDate(d, tz, 'M');
  return m >= 8 ? y + '-' + (y + 1) : (y - 1) + '-' + y;   // с августа — уже новый учебный год
}
function props_() { return PropertiesService.getScriptProperties(); }
function yearFolder_() {
  var id = props_().getProperty('YEAR_ID');
  if (!id) throw new Error('Сначала запустите setupNewYear');
  return DriveApp.getFolderById(id);
}
function child_(parent, name, create) {
  var it = parent.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  return create ? parent.createFolder(name) : null;
}
function isTeacherFolder_(f) { return f.getFoldersByName(CATS.q1).hasNext() || f.getFoldersByName(CATS.ach).hasNext(); }
function ensureCats_(teacherFolder) { CAT_ORDER.forEach(function (k) { child_(teacherFolder, CATS[k], true); }); }

/**
 * Создать папку текущего учебного года (например «2026-2027») рядом с прошлогодней,
 * скопировав методобъединения и папки учителей (с подпапками 1–4 ТОҚСАН и ЖЕТІСТІКТЕР),
 * и таблицу «Тапсыру журналы». Можно запускать повторно: уже созданное не дублируется.
 * Если Google пишет «превышено время выполнения» — просто запустите ещё раз, продолжит с места остановки.
 */
function setupNewYear() {
  var started = Date.now(), p = props_();
  var src = DriveApp.getFolderById(p.getProperty('YEAR_ID') || CONFIG.FIRST_YEAR_FOLDER_ID);
  var name = schoolYearName_();
  var parents = src.getParents(), parent = parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
  var dst = src.getName() === name ? src : child_(parent, name, true);
  var depts = src.getFolders(), made = 0;
  while (depts.hasNext()) {
    var d = depts.next(), nd = child_(dst, d.getName(), true), ts = d.getFolders();
    while (ts.hasNext()) {
      var tf = ts.next();
      if (!isTeacherFolder_(tf)) { child_(nd, tf.getName(), true); continue; }   // напр. «… бірлестігі туралы»
      ensureCats_(child_(nd, tf.getName(), true)); made++;
      if (Date.now() - started > 5 * 60 * 1000) { Logger.log('Не успел за 5 минут — запустите setupNewYear ещё раз (продолжит). Учителей: ' + made); return; }
    }
  }
  p.setProperty('YEAR_ID', dst.getId()); p.setProperty('YEAR_NAME', name);
  log_();   // создаст журнал
  CacheService.getScriptCache().remove('tree');
  Logger.log('Готово: «' + name + '» (' + dst.getUrl() + '), учителей: ' + made);
}

// ---------- журнал сдачи ----------
function log_(row) {
  var p = props_(), id = p.getProperty('LOG_ID'), ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss || p.getProperty('LOG_YEAR') !== p.getProperty('YEAR_NAME')) {
    ss = SpreadsheetApp.create('Тапсыру журналы ' + p.getProperty('YEAR_NAME'));
    DriveApp.getFileById(ss.getId()).moveTo(yearFolder_());
    var sh = ss.getSheets()[0];
    sh.appendRow(['Күні', 'Мұғалім', 'Бірлестік', 'Бөлім', 'Файл', 'Сілтеме', 'Сайттағы пошта']);
    sh.setFrozenRows(1); sh.getRange(1, 1, 1, 7).setFontWeight('bold');
    p.setProperty('LOG_ID', ss.getId()); p.setProperty('LOG_YEAR', p.getProperty('YEAR_NAME'));
  }
  if (row) ss.getSheets()[0].appendRow(row);
  return ss;
}

// ---------- проверка, что запрос от учителя сайта ----------
function verify_(token) {
  if (!token) throw new Error('auth');
  var cache = CacheService.getScriptCache(), key = 'u_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token));
  var hit = cache.get(key); if (hit) return JSON.parse(hit);
  var h = { apikey: CONFIG.SUPABASE_KEY, Authorization: 'Bearer ' + token };
  var r = UrlFetchApp.fetch(CONFIG.SUPABASE_URL + '/auth/v1/user', { headers: h, muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('auth');
  var u = JSON.parse(r.getContentText());
  var pr = JSON.parse(UrlFetchApp.fetch(CONFIG.SUPABASE_URL + '/rest/v1/profiles?select=full_name,role&id=eq.' + u.id, { headers: h, muteHttpExceptions: true }).getContentText() || '[]');
  var staff = JSON.parse(UrlFetchApp.fetch(CONFIG.SUPABASE_URL + '/rest/v1/staff?select=role_id&user_id=eq.' + u.id, { headers: h, muteHttpExceptions: true }).getContentText() || '[]');
  var role = (pr[0] && pr[0].role) || (u.user_metadata && u.user_metadata.role);
  if (role !== 'teacher' && !(Array.isArray(staff) && staff.length)) throw new Error('notTeacher');
  var me = { id: u.id, email: u.email };
  cache.put(key, JSON.stringify(me), 600);
  return me;
}

// ---------- веб-приложение ----------
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function tree_() {
  var cache = CacheService.getScriptCache(), c = cache.get('tree'); if (c) return JSON.parse(c);
  var y = yearFolder_(), depts = [], it = y.getFolders();
  while (it.hasNext()) {
    var d = it.next(), ts = [], ti = d.getFolders();
    while (ti.hasNext()) { var tf = ti.next(); if (isTeacherFolder_(tf)) ts.push(tf.getName()); }
    if (ts.length) depts.push({ name: d.getName(), teachers: ts.sort() });
  }
  depts.sort(function (a, b) { return a.name.localeCompare(b.name); });
  var t = { year: props_().getProperty('YEAR_NAME'), depts: depts };
  cache.put('tree', JSON.stringify(t), 600);
  return t;
}
function teacherFolder_(dept, teacher, create) {
  var d = child_(yearFolder_(), dept, false); if (!d) throw new Error('noDept');
  var f = child_(d, teacher, create); if (!f) throw new Error('noTeacher');
  if (create) { ensureCats_(f); CacheService.getScriptCache().remove('tree'); }
  return f;
}
function mine_(dept, teacher) {
  var f = teacherFolder_(dept, teacher, false), res = {};
  CAT_ORDER.forEach(function (k) {
    var cf = child_(f, CATS[k], true), files = [], it = cf.getFiles();
    while (it.hasNext()) { var x = it.next(); files.push({ name: x.getName(), url: x.getUrl(), date: x.getDateCreated().toISOString() }); }
    files.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    res[k] = files;
  });
  return { year: props_().getProperty('YEAR_NAME'), folder: f.getUrl(), cats: res };
}
function doGet() {   // проверка, что скрипт работает (без данных)
  return out_({ ok: true, year: props_().getProperty('YEAR_NAME') || null });
}
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var b = JSON.parse(e.postData.contents), me = verify_(b.token);
    if (b.action === 'tree') return out_({ ok: true, tree: tree_() });
    if (b.action === 'mine') return out_({ ok: true, mine: mine_(b.dept, b.teacher) });
    if (b.action === 'addTeacher') {
      var name = String(b.teacher || '').trim().replace(/\s+/g, ' ').toUpperCase();
      if (name.length < 5) throw new Error('badName');
      lock.waitLock(20000); teacherFolder_(b.dept, name, true); lock.releaseLock();
      return out_({ ok: true, teacher: name });
    }
    if (b.action === 'upload') {
      if (!CATS[b.cat]) throw new Error('badCat');
      var bytes = Utilities.base64Decode(b.data);
      if (bytes.length > CONFIG.MAX_MB * 1048576) throw new Error('tooBig');
      lock.waitLock(20000);
      var tf = teacherFolder_(b.dept, b.teacher, false), cf = child_(tf, CATS[b.cat], true);
      lock.releaseLock();
      var file = cf.createFile(Utilities.newBlob(bytes, b.mime || 'application/octet-stream', String(b.name || 'file').slice(0, 180)));
      try { log_([new Date(), b.teacher, b.dept, CATS[b.cat], file.getName(), file.getUrl(), me.email]); } catch (x) {}
      return out_({ ok: true, url: file.getUrl(), name: file.getName() });
    }
    throw new Error('badAction');
  } catch (err) { try { lock.releaseLock(); } catch (x) {} return out_({ ok: false, error: String(err.message || err) }); }
}
