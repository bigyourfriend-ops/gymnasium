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
 *   5. Выбрать функцию setupFast → «Выполнить» → разрешить доступ: включит быструю работу (снимок папок, обновление раз в час).
 *
 * Кто может загружать: только пользователь сайта, которого администратор отметил «Мұғалім».
 * Папка выбирается сама — по ФИО в профиле сайта (регистр, порядок слов, ё/е и казахские буквы не важны).
 * Если ФИО не совпало ни с одной папкой — загрузка закрыта, пока администратор не исправит ФИО на сайте.
 * Администратор сайта видит сводку по всем учителям и может открыть любую папку и загрузить в неё файл.
 */

// ---------- настройки ----------
var CONFIG = {
  SITE_API: 'https://gmonline.kz/api/',                                // сервер сайта на ps.kz
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
  clear_('snap'); clear_('snapjob'); scheduleMore_();   // снимок папок нового года — в фоне
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
// Сайт отвечает: вошёл ли человек, отметил ли его администратор «Мұғалім», его ФИО и нет ли второго учителя с таким же ФИО.
function verify_(token) {
  if (!token) throw new Error('auth');
  var cache = CacheService.getScriptCache(), key = 'v_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token));
  var hit = cache.get(key); if (hit) return JSON.parse(hit);
  var r = UrlFetchApp.fetch(CONFIG.SITE_API + '?a=drive_me', { method: 'post', contentType: 'application/json', payload: JSON.stringify({ token: token }), muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('auth');
  var u = JSON.parse(r.getContentText() || '{}');
  if (!u.ok) throw new Error('auth');
  if (!u.teacher && !u.admin) throw new Error('notTeacher');
  var me = { id: u.id, email: u.email, name: u.full_name, key: fioKey_(u.full_name), teacher: !!u.teacher, dup: !!u.dup, admin: !!u.admin };
  cache.put(key, JSON.stringify(me), 300);
  return me;
}
// ФИО → ключ для сравнения (как на сайте): верхний регистр, ё→е, казахские буквы → русские, слова по алфавиту
function fioKey_(s) {
  var map = { 'Ё': 'Е', 'Ә': 'А', 'І': 'И', 'Ң': 'Н', 'Ғ': 'Г', 'Ү': 'У', 'Ұ': 'У', 'Қ': 'К', 'Ө': 'О', 'Һ': 'Х', 'Й': 'И' };
  s = String(s || '').toUpperCase().replace(/[ЁӘІҢҒҮҰҚӨҺЙ]/g, function (c) { return map[c]; });
  return s.split(/[^A-ZА-Я]+/).filter(String).sort().join(' ');
}
// ---------- снимок папок: хранится в скрипте, поэтому сайт получает его сразу ----------
// Снимок = список папок учителей года (методобъединение, ФИО, id папок) и число файлов в каждой подпапке.
// Обновляется: после каждой загрузки с сайта (сразу), раз в час в фоне (setupFast) и по кнопке «Жаңарту» на сайте.
var SNAP_CHUNK = 4000;
function store_(name, obj) {
  var p = props_(), s = JSON.stringify(obj), n = Math.ceil(s.length / SNAP_CHUNK), old = +(p.getProperty(name + '_n') || 0), all = {};
  for (var i = 0; i < n; i++) all[name + '_' + i] = s.slice(i * SNAP_CHUNK, (i + 1) * SNAP_CHUNK);
  all[name + '_n'] = String(n);
  p.setProperties(all);
  for (var j = n; j < old; j++) p.deleteProperty(name + '_' + j);
  try { CacheService.getScriptCache().put(name, s, 21600); } catch (x) {}
}
function load_(name) {
  var c = CacheService.getScriptCache().get(name); if (c) return JSON.parse(c);
  var p = props_(), n = +(p.getProperty(name + '_n') || 0); if (!n) return null;
  var all = p.getProperties(), s = '';
  for (var i = 0; i < n; i++) s += all[name + '_' + i] || '';
  try { var o = JSON.parse(s); try { CacheService.getScriptCache().put(name, s, 21600); } catch (x) {} return o; } catch (e) { return null; }
}
function folderUrl_(id) { return 'https://drive.google.com/drive/folders/' + id; }
// Обход идёт частями (по методобъединениям): если Google не успевает за отведённое время,
// прогресс сохраняется и продолжается фоновым запуском через минуту. Пока идёт обход, сайт работает со старым снимком.
function buildSnap_(budgetMs) {
  var t0 = Date.now(), budget = budgetMs || 240000, year = props_().getProperty('YEAR_NAME');
  var job = load_('snapjob');
  if (!job || job.year !== year) {
    var y = yearFolder_(), it = y.getFolders(), depts = [];
    while (it.hasNext()) { var d = it.next(); depts.push({ id: d.getId(), name: d.getName() }); }
    job = { year: year, depts: depts, di: 0, items: [] };
  }
  for (; job.di < job.depts.length; job.di++) {
    if (Date.now() - t0 > budget) { store_('snapjob', job); return null; }   // не успели — продолжим позже
    var dep = job.depts[job.di], ti = DriveApp.getFolderById(dep.id).getFolders();
    while (ti.hasNext()) {
      var tf = ti.next(), c = {}, n = {}, any = false, tn = tf.getName();
      CAT_ORDER.forEach(function (k) {
        var cf = child_(tf, CATS[k], false), m = 0;
        if (cf) { any = true; c[k] = cf.getId(); var fi = cf.getFiles(); while (fi.hasNext()) { fi.next(); m++; } }
        n[k] = m;
      });
      if (any) job.items.push({ dept: dep.name, teacher: tn, key: fioKey_(tn), f: tf.getId(), c: c, n: n });   // папка без подпапок — не учитель
    }
  }
  job.items.sort(function (a, b) { return a.dept.localeCompare(b.dept) || a.teacher.localeCompare(b.teacher); });
  var s = { year: year, at: new Date().toISOString(), depts: job.depts, items: job.items };
  store_('snap', s);
  clear_('snapjob');
  return s;
}
function clear_(name) {
  var p = props_(), n = +(p.getProperty(name + '_n') || 0);
  for (var i = 0; i < n; i++) p.deleteProperty(name + '_' + i);
  p.deleteProperty(name + '_n');
  CacheService.getScriptCache().remove(name);
}
// продолжить обход через минуту (одноразовый фоновый запуск)
function scheduleMore_() {
  try {
    ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'rebuildMore') ScriptApp.deleteTrigger(t); });
    ScriptApp.newTrigger('rebuildMore').timeBased().after(60 * 1000).create();
  } catch (e) { Logger.log('Не удалось запланировать продолжение: ' + e); }
}
function snap_() {
  var s = load_('snap');
  if (s && s.year === props_().getProperty('YEAR_NAME')) return s;
  if (!load_('snapjob')) scheduleMore_();   // снимка ещё нет — начать в фоне, а сайту ответить «готовится»
  throw new Error('building');
}
/** Запустить один раз (выбрать setupFast → «Выполнить» → разрешить доступ): включит фоновое обновление
    снимка папок раз в час и построит первый снимок. После этого сайт открывает отчёты за 1–3 секунды. */
function setupFast() {
  ScriptApp.getProjectTriggers().forEach(function (t) { var h = t.getHandlerFunction(); if (h === 'rebuild' || h === 'rebuildMore') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('rebuild').timeBased().everyHours(1).create();
  clear_('snapjob');
  var s = buildSnap_(240000);
  if (s) Logger.log('Готово: папок учителей — ' + s.items.length + '. Фоновое обновление — раз в час.');
  else { scheduleMore_(); Logger.log('Папок много — первый снимок достроится в фоне за несколько минут. Ничего больше делать не нужно.'); }
}
function rebuild() { clear_('snapjob'); rebuildMore(); }
function rebuildMore() {
  var lock = LockService.getScriptLock(); if (!lock.tryLock(1000)) return;
  try { if (!buildSnap_(240000)) scheduleMore_(); } finally { lock.releaseLock(); }
}

// ---------- веб-приложение ----------
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
// папка учителя по ФИО из профиля
function myFolder_(me) {
  if (!me.teacher) throw new Error('notTeacher');
  if (me.dup) throw new Error('dupName');
  if (!me.key) throw new Error('noMatch');
  var hit = snap_().items.filter(function (x) { return x.key === me.key; })[0];
  if (!hit) throw new Error('noMatch');
  return hit;
}
// какая папка: администратор может выбрать любую (dept + teacher), остальные — только свою
function target_(me, b) {
  if (me.admin && b.dept && b.teacher) {
    var hit = snap_().items.filter(function (x) { return x.dept === b.dept && x.teacher === b.teacher; })[0];
    if (!hit) throw new Error('noTeacher');
    return hit;
  }
  return myFolder_(me);
}
function catFolder_(item, k) {
  if (item.c && item.c[k]) { try { return DriveApp.getFolderById(item.c[k]); } catch (e) {} }
  return child_(DriveApp.getFolderById(item.f), CATS[k], true);
}
function mine_(item) {
  var res = {};
  CAT_ORDER.forEach(function (k) {
    var files = [], it = catFolder_(item, k).getFiles();
    while (it.hasNext()) { var x = it.next(); files.push({ name: x.getName(), url: x.getUrl(), date: x.getDateCreated().toISOString() }); }
    files.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    res[k] = files;
  });
  return { year: props_().getProperty('YEAR_NAME'), dept: item.dept, teacher: item.teacher, folder: folderUrl_(item.f), cats: res };
}
// сводка для администратора: все учителя года и сколько файлов в каждой подпапке
// «Жаңарту» не ждёт обхода: запускает его в фоне и сразу отдаёт текущий снимок
function overview_(refresh) {
  var building = false;
  if (refresh) { clear_('snapjob'); scheduleMore_(); building = true; }
  var s = snap_();
  var depts = (s.depts || []).map(function (d) { return d.name; });
  s.items.forEach(function (x) { if (depts.indexOf(x.dept) < 0) depts.push(x.dept); });
  depts.sort(function (a, b) { return a.localeCompare(b); });
  return { year: s.year, at: s.at, building: building, depts: depts, items: s.items.map(function (x) { return { dept: x.dept, teacher: x.teacher, key: x.key, folder: folderUrl_(x.f), n: x.n }; }) };
}

// ---------- правка папок учителей с сайта (только администратор) ----------
// addTeacher — новая папка учителя с подпапками; renameTeacher — исправить ФИО в названии; moveTeacher — в другое методобъединение
function cleanName_(x) { return String(x || '').trim().replace(/\s+/g, ' ').toUpperCase(); }
function deptFolder_(s, name) {
  var d = (s.depts || []).filter(function (x) { return x.name === name; })[0];
  if (d) { try { return DriveApp.getFolderById(d.id); } catch (e) {} }
  var f = child_(yearFolder_(), name, false); if (!f) throw new Error('noDept');
  return f;
}
function editFolders_(b) {
  var s = snap_(), it, nn, nk;
  if (b.action === 'addTeacher') {
    nn = cleanName_(b.name); nk = fioKey_(nn);
    if (nk.split(' ').length < 2) throw new Error('badName');
    if (s.items.some(function (x) { return x.key === nk; })) throw new Error('exists');
    var tf = child_(deptFolder_(s, b.dept), nn, true), c = {}, n = {};
    CAT_ORDER.forEach(function (k) { c[k] = child_(tf, CATS[k], true).getId(); n[k] = 0; });
    s.items.push({ dept: b.dept, teacher: nn, key: nk, f: tf.getId(), c: c, n: n });
  } else {
    it = s.items.filter(function (x) { return x.dept === b.dept && x.teacher === b.teacher; })[0];
    if (!it) throw new Error('noTeacher');
    var f = DriveApp.getFolderById(it.f);
    if (b.action === 'renameTeacher') {
      nn = cleanName_(b.name); nk = fioKey_(nn);
      if (nk.split(' ').length < 2) throw new Error('badName');
      if (s.items.some(function (x) { return x.key === nk && x.f !== it.f; })) throw new Error('exists');
      f.setName(nn); it.teacher = nn; it.key = nk;
    } else if (b.action === 'moveTeacher') {
      if (b.toDept === it.dept) return;
      f.moveTo(deptFolder_(s, b.toDept)); it.dept = b.toDept;
    }
  }
  s.items.sort(function (a, b) { return a.dept.localeCompare(b.dept) || a.teacher.localeCompare(b.teacher); });
  store_('snap', s);
}
function doGet() {   // проверка, что скрипт работает (без данных)
  return out_({ ok: true, year: props_().getProperty('YEAR_NAME') || null });
}
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var b = JSON.parse(e.postData.contents), me = verify_(b.token);
    if (b.action === 'overview') { if (!me.admin) throw new Error('notAdmin'); return out_({ ok: true, overview: overview_(!!b.refresh) }); }
    if (/^(addTeacher|renameTeacher|moveTeacher)$/.test(b.action)) {
      if (!me.admin) throw new Error('notAdmin');
      if (!lock.tryLock(30000)) throw new Error('busy');
      try { editFolders_(b); } finally { lock.releaseLock(); }
      return out_({ ok: true, overview: overview_(false) });
    }
    var my = target_(me, b);
    if (b.action === 'mine') return out_({ ok: true, mine: mine_(my) });
    if (b.action === 'upload') {
      if (!CATS[b.cat]) throw new Error('badCat');
      var bytes = Utilities.base64Decode(b.data);
      if (bytes.length > CONFIG.MAX_MB * 1048576) throw new Error('tooBig');
      var file = catFolder_(my, b.cat).createFile(Utilities.newBlob(bytes, b.mime || 'application/octet-stream', String(b.name || 'file').slice(0, 180)));
      try { log_([new Date(), my.teacher, my.dept, CATS[b.cat], file.getName(), file.getUrl(), me.email]); } catch (x) {}
      // сразу поправить число файлов в снимке
      if (lock.tryLock(15000)) {
        try { var s = load_('snap'); if (s) { s.items.forEach(function (x) { if (x.f === my.f) x.n[b.cat] = (x.n[b.cat] || 0) + 1; }); store_('snap', s); } }
        catch (x) {} finally { lock.releaseLock(); }
      }
      return out_({ ok: true, url: file.getUrl(), name: file.getName() });
    }
    throw new Error('badAction');
  } catch (err) { try { lock.releaseLock(); } catch (x) {} return out_({ ok: false, error: String(err.message || err) }); }
}
