/* GMTest — тесты по предметам и темам, статистика усвоения.
   Подключается до app.js: регистрирует страницы #tests, #test.<id>, #testres.<id>, #testedit.<id>, #teststat.<id>.
   Правильные ответы ученик не получает: проверка идёт в базе (функции gt_start / gt_submit). */
(window.GMPlugins = window.GMPlugins || []).push(function (A) {
"use strict";
var sb = A.sb, st = A.st, t = A.t, f = A.f, esc = A.esc, ic = A.ic;

/* ------------------------------------------------------------ strings */
var S = {
 navGT:["GMTest","GMTest","GMTest"],
 pd_gt:["Пәндер мен тақырыптар бойынша онлайн тесттер. Мұғалім тест құрастырады, оқушы тапсырады, нәтиже тақырыптар бойынша бірден шығады.","Онлайн-тесты по предметам и темам. Учитель составляет тест, ученик проходит, результат сразу виден по каждой теме.","Online tests by subject and topic. Teachers build tests, students take them, and results are broken down by topic."],
 gtMine:["Менің тесттерім","Мои тесты","My tests"], gtAnalytics:["Талдау","Аналитика","Analytics"], gtForMe:["Тапсыру","Пройти тест","Take a test"],
 gtNew:["Жаңа тест","Новый тест","New test"], gtNewTitle:["Жаңа тест","Новый тест","New test"],
 gtNoTests:["Әзірге сізге арналған тест жоқ","Пока нет тестов для вас","No tests for you yet"],
 gtNoMine:["Сізде әлі тест жоқ. «Жаңа тест» батырмасын басыңыз.","У вас пока нет тестов. Нажмите «Новый тест».","You have no tests yet. Press “New test”."],
 gtSetGrade:["Өз сыныбыңыздың тесттерін көру үшін профильде сыныбыңызды көрсетіңіз.","Укажите класс в профиле, чтобы видеть тесты своего класса.","Add your class in your profile to see tests for your class."],
 gtGradeN:["{n}-сынып","{n} класс","Grade {n}"], gtAllGrades:["Барлық сыныптар","Все классы","All grades"],
 gtQn:["{n} сұрақ","{n} вопр.","{n} questions"], gtMin:["{n} мин","{n} мин","{n} min"], gtNoLimit:["Уақыт шектеусіз","Без ограничения времени","No time limit"],
 gtStart:["Бастау","Начать","Start"], gtContinue:["Жалғастыру","Продолжить","Continue"], gtRetake:["Қайта тапсыру","Пройти ещё раз","Retake"], gtResult:["Нәтиже","Результат","Result"],
 gtAttempts:["Талпыныс: {a} / {b}","Попыток: {a} из {b}","Attempts: {a} of {b}"], gtYourRes:["Нәтижеңіз: {p}%","Ваш результат: {p}%","Your result: {p}%"],
 gtClosed:["Тест жабық","Тест закрыт","Test closed"],
 st_draft:["Жоба","Черновик","Draft"], st_published:["Жарияланған","Опубликован","Published"], st_closed:["Жабық","Закрыт","Closed"],
 gtEdit:["Өңдеу","Изменить","Edit"], gtStats:["Статистика","Статистика","Statistics"], gtPreview:["Алдын ала қарау","Предпросмотр","Preview"], gtLink:["Сілтеме","Ссылка","Link"], gtLinkCopied:["Сілтеме көшірілді","Ссылка скопирована","Link copied"],
 gtPassed:["{n} тапсырды","прошли: {n}","{n} took it"], gtBy:["Авторы: {n}","Автор: {n}","By {n}"],
 gtBack:["Тесттерге оралу","К списку тестов","Back to tests"],
 /* editor */
 gtSettings:["Тест параметрлері","Параметры теста","Test settings"], gtTitleF:["Тест атауы","Название теста","Test title"], gtSubjF:["Пән","Предмет","Subject"], gtGradeF:["Сынып (параллель)","Класс (параллель)","Grade"],
 gtTimeF:["Уақыты, мин (бос — шектеусіз)","Время, мин (пусто — без ограничения)","Time, min (empty — no limit)"], gtTriesF:["Талпыныс саны","Число попыток","Attempts allowed"],
 gtShowAns:["Тапсырғаннан кейін оқушыға дұрыс жауаптарды көрсету","Показывать ученику верные ответы после сдачи","Show correct answers to students after submitting"],
 gtShuffle:["Сұрақтар мен жауап нұсқаларын араластыру","Перемешивать вопросы и варианты ответов","Shuffle questions and answer options"],
 gtDescrF:["Оқушыға нұсқаулық (міндетті емес)","Инструкция для учеников (необязательно)","Instructions for students (optional)"], gtStatusF:["Күйі","Статус","Status"],
 gtSaved:["Сақталды","Сохранено","Saved"],
 gtPubErr:["Жариялау мүмкін емес: әр сұрақта кемінде 2 нұсқа және 1 дұрыс жауап болуы керек.","Нельзя опубликовать: в каждом вопросе нужно минимум 2 варианта и 1 верный ответ.","Can't publish: every question needs at least 2 options and 1 correct answer."],
 gtPubEmpty:["Жариялау үшін кемінде бір сұрақ қосыңыз.","Чтобы опубликовать, добавьте хотя бы один вопрос.","Add at least one question to publish."],
 gtTopics:["Тақырыптар","Темы","Topics"], gtTopicsHint:["Тестті тақырыптарға бөліңіз: статистика әр тақырып бойынша есептеледі.","Разбейте тест на темы — статистика считается по каждой теме.","Split the test into topics — statistics are calculated per topic."],
 gtTopicPh:["Жаңа тақырып, мысалы: Жасуша құрылысы","Новая тема, например: Строение клетки","New topic, e.g. Cell structure"], gtAddTopic:["Тақырып қосу","Добавить тему","Add topic"],
 gtNoTopic:["Тақырыпсыз","Без темы","No topic"], gtTopicDelWarn:["Сұрақтар «Тақырыпсыз» болып қалады","Вопросы останутся «Без темы»","Questions will move to “No topic”"],
 gtQuestions:["Сұрақтар","Вопросы","Questions"], gtAddQ:["Сұрақ қосу","Добавить вопрос","Add question"], gtImport:["Мәтіннен импорттау","Импорт из текста","Import from text"],
 gtNoQ:["Әзірге сұрақ жоқ. Сұрақтарды бір-бірлеп қосыңыз немесе мәтіннен импорттаңыз.","Вопросов пока нет. Добавьте их по одному или импортируйте из текста.","No questions yet. Add them one by one or import from text."],
 gtNoCorrect:["Дұрыс жауап белгіленбеген","Не отмечен верный ответ","No correct answer marked"],
 gtPts:["{n} балл","{n} балл.","{n} pt"], k_single:["Бір жауап","Один ответ","Single answer"], k_multi:["Бірнеше жауап","Несколько ответов","Multiple answers"],
 gtQEdit:["Сұрақ","Вопрос","Question"], gtTopicF:["Тақырып","Тема","Topic"], gtKindF:["Жауап түрі","Тип ответа","Answer type"], gtBodyF:["Сұрақ мәтіні","Текст вопроса","Question text"],
 gtImgF:["Сурет (міндетті емес)","Картинка (необязательно)","Image (optional)"], gtOptsF:["Жауап нұсқалары: дұрысын белгілеңіз","Варианты ответа — отметьте верные","Answer options — tick the correct ones"],
 gtOptPh:["Нұсқа","Вариант","Option"], gtAddOpt:["+ нұсқа","+ вариант","+ option"], gtPtsF:["Балл","Баллы","Points"], gtRmImg:["Суретті алып тастау","Убрать картинку","Remove image"],
 gtQErrBody:["Сұрақ мәтінін жазыңыз","Напишите текст вопроса","Write the question text"], gtQErrOpts:["Кемінде 2 нұсқа керек","Нужно минимум 2 варианта","At least 2 options are needed"],
 gtQErrOk:["Дұрыс жауапты белгілеңіз","Отметьте верный ответ","Mark the correct answer"], gtQErrSingle:["«Бір жауап» түрінде тек бір дұрыс нұсқа болады","В типе «Один ответ» может быть только один верный вариант","“Single answer” allows only one correct option"],
 gtDelTest:["Тестті жою","Удалить тест","Delete test"], gtDelTestWarn:["Тест, барлық сұрақтар мен нәтижелер біржола жойылады. Тағы бір рет басыңыз.","Тест, все вопросы и результаты учеников удалятся навсегда. Нажмите ещё раз, чтобы подтвердить.","The test, its questions and all results will be deleted forever. Press again to confirm."],
 gtImpHelp:["Әр сұрақ «?» немесе нөмірден басталады. Дұрыс нұсқа «+», қате нұсқа «-». Тақырып «#». Бос жолдар ескерілмейді.","Каждый вопрос начинается с «?» или номера. Верный вариант — «+», неверный — «-». Тема — «#». Пустые строки не важны.","Each question starts with “?” or a number. Correct option “+”, wrong option “-”. Topic “#”. Blank lines are ignored."],
 gtImpAlt:["«а) нұсқа *» түрі де жарайды: жұлдызша дұрыс жауапты білдіреді.","Можно и так: «а) вариант *» — звёздочка означает верный ответ.","Also works: “a) option *” — the asterisk marks the correct answer."],
 gtImpFound:["Табылды: {q} сұрақ, {t} тақырып","Найдено: {q} вопр., {t} тем","Found: {q} questions, {t} topics"], gtImpBad:["{n} сұрақ өткізіледі: дұрыс жауап не нұсқалар жоқ","{n} вопр. пропущено: нет верного ответа или вариантов","{n} skipped: no correct answer or options"],
 gtImpDo:["Тестке қосу","Добавить в тест","Add to test"], gtImpDone:["{n} сұрақ қосылды","Добавлено вопросов: {n}","{n} questions added"],
 /* taking */
 gtAnswered:["Жауап берілді: {a} / {b}","Отвечено: {a} из {b}","Answered: {a} of {b}"], gtQof:["{a}-сұрақ / {b}","Вопрос {a} из {b}","Question {a} of {b}"],
 gtMultiHint:["Барлық дұрыс жауапты белгілеңіз","Отметьте все верные ответы","Select all correct answers"], gtFinish:["Тестті аяқтау","Завершить тест","Finish test"],
 gtFinishQ:["Тестті аяқтайсыз ба?","Завершить тест?","Finish the test?"], gtUnanswered:["{n} сұраққа жауап берілмеген.","Без ответа осталось вопросов: {n}.","{n} questions are unanswered."],
 gtFinishNote:["Аяқтағаннан кейін жауапты өзгерту мүмкін емес.","После завершения ответы изменить нельзя.","You can't change answers after finishing."], gtKeep:["Жалғастыру","Вернуться к тесту","Keep going"],
 gtTimeUp:["Уақыт бітті. Жауаптар жіберілді.","Время вышло. Ответы отправлены.","Time is up. Your answers were submitted."], gtSending:["Жіберілуде…","Отправка…","Sending…"],
 gtPreviewNote:["Алдын ала қарау: нәтиже сақталмайды және статистикаға кірмейді.","Предпросмотр: результат не сохраняется и не попадает в статистику.","Preview: the result is not saved and doesn't count in statistics."],
 e_no_attempts:["Талпыныстар таусылды","Попытки закончились","No attempts left"], e_not_available:["Тест жабық немесе әлі жарияланбаған","Тест закрыт или ещё не опубликован","The test is closed or not published yet"],
 gtNeedLogin:["Тест тапсыру үшін кіріңіз немесе тіркеліңіз.","Войдите или зарегистрируйтесь, чтобы проходить тесты.","Sign in or create an account to take tests."],
 gtNoQs:["Бұл тестте әлі сұрақ жоқ","В этом тесте пока нет вопросов","This test has no questions yet"],
 /* result */
 gtScore:["{a} / {b} балл","{a} из {b} баллов","{a} of {b} points"], gtByTopic:["Тақырыптар бойынша","По темам","By topic"],
 gtRepeat:["Қайталау керек","Нужно повторить","Needs review"], gtReview:["Жауаптарды талдау","Разбор ответов","Answer review"],
 gtHidden:["Мұғалім дұрыс жауаптарды жасырды.","Учитель скрыл верные ответы.","The teacher has hidden the correct answers."],
 gtYourAns:["сіздің жауабыңыз","ваш ответ","your answer"], gtNoAns:["Жауап берілмеген","Нет ответа","No answer"], gtDur:["{n} мин","{n} мин","{n} min"],
 /* stats */
 gtStudents:["Оқушылар","Ученики","Students"], gtAvg:["Орташа нәтиже","Средний результат","Average result"], gtWeakest:["Ең әлсіз тақырып","Самая слабая тема","Weakest topic"],
 gtTook:["Тапсырғандар","Прошли тест","Took the test"], gtNoStats:["Әзірге ешкім тапсырмаған","Пока никто не прошёл тест","Nobody has taken the test yet"],
 gtTopicMastery:["Тақырыптарды меңгеру","Усвоение по темам","Mastery by topic"], gtTopicMasteryHint:["Ең әлсіз тақырыптар жоғарыда. Пайыз — жиналған баллдың ең көп мүмкін баллға қатынасы.","Самые слабые темы — вверху. Процент — доля набранных баллов от максимума.","Weakest topics first. Percentage = points scored out of the maximum."],
 gtQStats:["Сұрақтар: ең қиындары жоғарыда","Вопросы: самые трудные — вверху","Questions: hardest first"], gtCorrectPct:["{p}% дұрыс","{p}% верно","{p}% correct"],
 gtPicked:["{n} оқушы таңдады","выбрали: {n}","picked by {n}"], gtName:["Аты-жөні","ФИО","Name"], gtCls:["Сынып","Класс","Class"], gtDate:["Күні","Дата","Date"],
 gtAllowRetake:["Қайта тапсыруға рұқсат","Разрешить пересдачу","Allow retake"], gtRetakeWarn:["Бұл нәтиже өшіріледі. Тағы басыңыз.","Этот результат удалится. Нажмите ещё раз.","This result will be deleted. Press again."],
 gtCsv:["Excel-ге жүктеу (CSV)","Скачать для Excel (CSV)","Download for Excel (CSV)"], gtFirstOnly:["Әр оқушының бірінші аяқталған талпынысы есептеледі.","Учитывается первая завершённая попытка каждого ученика.","Each student's first completed attempt is counted."],
 gtInProgress:["Қазір тапсырып жатыр: {n}","Сейчас проходят: {n}","In progress: {n}"],
 /* analytics */
 gtAnHint:["Сіздің тесттеріңіз бойынша оқушылардың нәтижесі. Ең нашар меңгерілгендері жоғарыда.","Результаты учеников по вашим тестам. Хуже всего усвоенное — вверху.","Student results across your tests. Least mastered first."],
 gtAnHintAll:["Барлық мұғалімдердің тесттері бойынша нәтиже. Ең нашар меңгерілгендері жоғарыда.","Результаты по тестам всех учителей. Хуже всего усвоенное — вверху.","Results across all teachers' tests. Least mastered first."],
 gtBySubject:["Пәндер бойынша меңгеру","Усвоение по предметам","Mastery by subject"], gtWeakTopics:["Ең нашар меңгерілген тақырыптар","Хуже всего усвоенные темы","Least mastered topics"],
 gtAllSubj:["Барлық пәндер","Все предметы","All subjects"], gtAllCls:["Барлық сыныптар","Все классы","All classes"], gtNoData:["Әзірге нәтиже жоқ: тесттеріңізді әлі ешкім тапсырмаған.","Пока нет данных: ваши тесты ещё никто не прошёл.","No data yet: nobody has taken your tests."],
 gtStudN:["{n} оқушы","{n} уч.","{n} students"], gtTopicsOf:["«{s}» тақырыптары","Темы предмета «{s}»","Topics in {s}"],
 perm_tests:["GMTest: өз тесттерін жасау және нәтижелерін көру","GMTest: создавать свои тесты и видеть их результаты","GMTest: create own tests and see their results"],
 perm_tests_all:["GMTest: барлық мұғалімдердің тесттері мен статистикасы (завуч)","GMTest: тесты и статистика всех учителей (завуч)","GMTest: all teachers' tests and statistics"]
};
for (var k in S) A.T[k] = S[k];

A.IC.check = '<path d="M5 12.5l4.5 4.5L19 7.5"/>';
A.IC.xmark = '<path d="M6 6l12 12M18 6L6 18"/>';
A.IC.chart = '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>';
A.IC.up = '<path d="M12 19V5M5 12l7-7 7 7"/>';
A.IC.down = '<path d="M12 5v14M5 12l7 7 7-7"/>';
A.IC.upload = '<path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4"/>';
A.PERMS.push("tests", "tests_all");

/* ------------------------------------------------------------ state & helpers */
var G;
function reset() { if (G && G.timer) clearInterval(G.timer); G = { avail: null, mine: null, take: null, result: {}, edit: null, stat: null, ov: null, tab: null, ovSubj: "all", ovCls: "all", statCls: "all", sure: null, busy: {} } }
reset();
A.onUser(function (u) { var id = u && u.id; if (id !== G.uid) { reset(); G.uid = id } });

function isT() { return A.can("tests") || A.can("tests_all") }
function isMgr(test) { return !!test && (A.can("tests_all") || (A.can("tests") && st.user && test.author_id === st.user.id)) }
function pct(p, m) { return m > 0 ? Math.round(p / m * 100) : 0 }
function band(p) { return p < 50 ? "lo" : p < 75 ? "mid" : "hi" }
function day(ts) { return ts ? A.fmtDate(String(ts).slice(0, 10)) : "" }
function rerender(page) { if (!page || st.route.page === page) { if (st.route.page === "testedit") keepDraft(); A.render(true) } }
function keepDraft() { var E = G.edit, fm = document.getElementById("gt-set"); if (!E || !fm) return; var v = function (x) { var el = document.getElementById(x); return el.type === "checkbox" ? el.checked : el.value };
  E.draft = { title: v("gs-title"), subject: v("gs-subj"), grade: v("gs-grade"), time_limit: v("gs-time"), max_attempts: v("gs-tries"), show_answers: v("gs-show"), shuffle: v("gs-shuf"), descr: v("gs-descr"), status: v("gs-status") } }
function errKey(e) { var m = (e && (e.message || e.msg)) || ""; if (/no_attempts/.test(m)) return "e_no_attempts"; if (/not_available/.test(m)) return "e_not_available"; return "e_generic" }
function gi(n) { return ic(n).replace('stroke-width="1.9"', 'stroke-width="2.2" width="16" height="16"') }
function loading() { return '<div class="panel"><p class="hint">' + esc(t("loading")) + '</p></div>' }
function bar(label, p, sub, extra) {
  return '<div class="gt-bar gt-' + band(p) + '"><div class="gt-bl"><span>' + label + '</span><b class="tnum">' + p + '%</b></div><i><s style="width:' + Math.max(p, 1) + '%"></s></i>' + (sub ? '<small>' + sub + '</small>' : '') + (extra || '') + '</div>' }
function clsSort(a, b) { var x = parseInt(a, 10) || 99, y = parseInt(b, 10) || 99; return x !== y ? x - y : String(a).localeCompare(String(b), "kk") }
function myGrade() { var g = st.profile && st.profile.grade; return g ? parseInt(g, 10) || null : null }
function nl(s) { return esc(s).replace(/\n/g, "<br>") }
function shell(inner, title, crumb) { return A.banner("navGT", title ? null : "pd_gt", crumb || "", title || "") + '<div class="container page gt">' + inner + '</div>' }
function backLink() { return '<a class="gt-back" href="#tests">' + gi("left") + esc(t("gtBack")) + '</a>' }
function crumbT() { return '<a href="#tests">' + esc(t("navGT")) + '</a><span>/</span>' }
function seeded(seed) { var h = 1779033703; for (var i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19 }
  return function () { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296 } }
function shuffle(arr, rnd) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x } return a }
// Canonical question order: by topic order, then by position inside the topic; questions without a topic go last.
function orderQs(qs, topics) { var ti = {}; (topics || []).forEach(function (x, i) { if (x.id) ti[x.id] = i });
  var key = function (q) { return q.topic_id && ti[q.topic_id] !== undefined ? ti[q.topic_id] : 1e6 };
  return qs.map(function (q, i) { return { q: q, i: i } }).sort(function (a, b) { return key(a.q) - key(b.q) || (a.q.pos != null && b.q.pos != null ? a.q.pos - b.q.pos : 0) || a.i - b.i }).map(function (x) { return x.q }) }
function needLogin() {
  return shell('<div class="panel" style="max-width:520px;margin:0 auto;text-align:center">' + A.emblem("em72") + '<p style="margin:14px 0 18px;color:var(--muted)">' + esc(t("gtNeedLogin")) + '</p><div class="btns" style="justify-content:center"><button class="btn btn-primary btn-lg" data-auth="login">' + esc(t("signIn")) + '</button><button class="btn btn-outline btn-lg" data-auth="register">' + esc(t("signUp")) + '</button></div></div>') }
function guard() { if (!sb) return shell('<div class="empty"><b>' + esc(t("noAuth")) + '</b></div>'); if (!st.user) return needLogin(); return null }
function statusChip(s) { return '<span class="chip gt-st-' + s + '">' + esc(t("st_" + s)) + '</span>' }

/* ------------------------------------------------------------ #tests */
function pageTests() {
  var g = guard(); if (g) return g;
  if (G.take && (G.take.error || G.take.preview)) G.take = null;
  var tabs = isT() ? [["mine", "gtMine", "edit"], ["an", "gtAnalytics", "chart"], ["take", "gtForMe", "flask"]] : null;
  if (tabs && !tabs.some(function (x) { return x[0] === G.tab })) G.tab = "mine";
  var tab = tabs ? G.tab : "take";
  var head = tabs ? '<div class="pills gt-tabs" role="tablist">' + tabs.map(function (x) { return '<button data-g="tab" data-a="' + x[0] + '" aria-pressed="' + (tab === x[0]) + '">' + gi(x[2]) + esc(t(x[1])) + '</button>' }).join("") + '</div>' : '';
  var body = tab === "mine" ? mineList() : tab === "an" ? analytics() : takeList();
  return shell(head + body) }

function loadAvail() { if (G.busy.avail) return; G.busy.avail = 1;
  sb.rpc("gt_available").then(function (r) { G.busy.avail = 0; G.avail = r.error ? [] : (r.data || []); rerender("tests") }) }
function takeList() {
  if (G.avail === null) { loadAvail(); return loading() }
  var mg = myGrade(), list = G.avail.filter(function (x) { return isT() || !mg || !x.grade || x.grade === mg });
  var hint = (!mg && !isT()) ? '<p class="gt-note">' + esc(t("gtSetGrade")) + ' <a href="#profile">' + esc(t("cabinet")) + ' →</a></p>' : '';
  if (!list.length) return hint + '<div class="empty"><b>' + esc(t("gtNoTests")) + '</b></div>';
  return hint + '<div class="gt-cards">' + list.map(function (x) {
    var last = x.last, p = last ? pct(+last.score, +last.max) : null, left = x.max_attempts - x.used, open = x.status === "published";
    var meta = [x.grade ? f(t("gtGradeN"), { n: x.grade }) : t("gtAllGrades"), f(t("gtQn"), { n: x.q_count }), x.time_limit ? f(t("gtMin"), { n: x.time_limit }) : t("gtNoLimit")];
    var btns = '';
    if (x.open_attempt && open) btns += '<a class="btn btn-primary" href="#test.' + x.id + '">' + esc(t("gtContinue")) + '</a>';
    else if (open && left > 0 && x.q_count > 0) btns += '<a class="btn btn-primary" href="#test.' + x.id + '">' + esc(t(x.used ? "gtRetake" : "gtStart")) + '</a>';
    if (last) btns += '<a class="btn btn-soft" href="#testres.' + last.id + '">' + esc(t("gtResult")) + '</a>';
    return '<article class="gt-card"><div class="gt-ch"><span class="chip">' + esc(x.subject) + '</span>' + (open ? '' : statusChip(x.status)) + (p !== null ? '<span class="gt-score gt-' + band(p) + '">' + p + '%</span>' : '') + '</div>' +
      '<h3>' + esc(x.title) + '</h3><p class="gt-meta">' + esc(meta.join(" · ")) + '</p>' +
      (x.topics && x.topics.length ? '<div class="tags">' + x.topics.map(function (s) { return '<span>' + esc(s) + '</span>' }).join("") + '</div>' : '') +
      (x.descr ? '<p class="gt-descr">' + nl(x.descr) + '</p>' : '') +
      '<div class="gt-cf"><small>' + esc(x.used ? f(t("gtAttempts"), { a: x.used, b: x.max_attempts }) : (x.author ? f(t("gtBy"), { n: x.author }) : "")) + '</small><div class="gt-btns">' + btns + '</div></div></article>' }).join("") + '</div>' }

function loadMine() { if (G.busy.mine) return; G.busy.mine = 1;
  sb.from("gt_tests").select("id,title,subject,grade,status,time_limit,max_attempts,author_id,author_name,updated_at,gt_questions(count),gt_attempts(count)").order("updated_at", { ascending: false }).then(function (r) {
    G.busy.mine = 0; var all = r.error ? [] : (r.data || []);
    G.mine = all.filter(function (x) { return A.can("tests_all") || x.author_id === st.user.id }); rerender("tests") }) }
function cnt(x, k) { var v = x[k]; return v && v[0] ? v[0].count : 0 }
function mineList() {
  if (G.mine === null) { loadMine(); return loading() }
  var top = '<div class="toolbar"><p class="gt-note" style="margin:0">' + esc(t("gtTopicsHint")) + '</p><button class="btn btn-primary" data-g="new"' + (G.busy.create ? " disabled" : "") + '>' + gi("plus") + esc(t("gtNew")) + '</button></div>';
  if (!G.mine.length) return top + '<div class="empty"><b>' + esc(t("gtNoMine")) + '</b></div>';
  return top + '<div class="gt-list">' + G.mine.map(function (x) {
    var mine = x.author_id === st.user.id;
    return '<div class="gt-row"><div class="gt-rmain"><div class="gt-ch">' + statusChip(x.status) + '<span class="chip">' + esc(x.subject) + '</span></div><b>' + esc(x.title) + '</b><span>' +
      esc([x.grade ? f(t("gtGradeN"), { n: x.grade }) : t("gtAllGrades"), f(t("gtQn"), { n: cnt(x, "gt_questions") }), f(t("gtPassed"), { n: cnt(x, "gt_attempts") })].concat(mine || !x.author_name ? [] : [f(t("gtBy"), { n: x.author_name })]).join(" · ")) + '</span></div>' +
      '<div class="gt-btns"><a class="btn btn-soft" href="#testedit.' + x.id + '">' + gi("edit") + esc(t("gtEdit")) + '</a><a class="btn btn-soft" href="#teststat.' + x.id + '">' + gi("chart") + esc(t("gtStats")) + '</a>' +
      (x.status === "published" ? '<button class="btn btn-soft" data-g="copy" data-a="' + x.id + '">' + gi("link") + esc(t("gtLink")) + '</button>' : '') + '</div></div>' }).join("") + '</div>' }

function createTest() {
  if (G.busy.create) return; G.busy.create = 1; rerender("tests");
  var subj = (A.allSubjects()[0]) || "—";
  sb.from("gt_tests").insert({ title: t("gtNewTitle"), subject: subj, status: "draft" }).select("id").single().then(function (r) {
    G.busy.create = 0; if (r.error) { A.toast(t("e_generic")); rerender("tests"); return }
    G.mine = null; location.hash = "testedit." + r.data.id }) }

/* ------------------------------------------------------------ analytics (#tests, tab "an") */
function loadOv() { if (G.busy.ov) return; G.busy.ov = 1;
  sb.rpc("gt_overview").then(function (r) { G.busy.ov = 0; G.ov = r.error ? [] : (r.data || []); rerender("tests") }) }
function analytics() {
  if (G.ov === null) { loadOv(); return loading() }
  var rows = G.ov, hint = '<p class="gt-note">' + esc(t(A.can("tests_all") ? "gtAnHintAll" : "gtAnHint")) + '</p>';
  if (!rows.length) return hint + '<div class="empty"><b>' + esc(t("gtNoData")) + '</b></div>';
  var subjects = [], classes = [];
  rows.forEach(function (r) { if (subjects.indexOf(r.subject) < 0) subjects.push(r.subject); if (r.cls && classes.indexOf(r.cls) < 0) classes.push(r.cls) });
  subjects.sort(function (a, b) { return a.localeCompare(b, "kk") }); classes.sort(clsSort);
  if (G.ovSubj !== "all" && subjects.indexOf(G.ovSubj) < 0) G.ovSubj = "all";
  if (G.ovCls !== "all" && classes.indexOf(G.ovCls) < 0) G.ovCls = "all";
  var fr = rows.filter(function (r) { return G.ovCls === "all" || r.cls === G.ovCls });
  var filt = '<div class="gt-filters"><div class="pills">' + ["all"].concat(subjects).map(function (s) { return '<button data-g="ovsubj" data-a="' + esc(s) + '" aria-pressed="' + (G.ovSubj === s) + '">' + esc(s === "all" ? t("gtAllSubj") : s) + '</button>' }).join("") + '</div>' +
    (classes.length ? '<label class="gt-sel">' + esc(t("gtCls")) + '<select data-gsel="ovcls"><option value="all">' + esc(t("gtAllCls")) + '</option>' + classes.map(function (c) { return '<option' + (G.ovCls === c ? " selected" : "") + '>' + esc(c) + '</option>' }).join("") + '</select></label>' : '') + '</div>';
  // by subject
  var bySubj = {};
  fr.forEach(function (r) { var s = bySubj[r.subject] = bySubj[r.subject] || { p: 0, m: 0, st: {} }; s.p += +r.pts; s.m += +r.mx; s.st[r.test_id + r.cls] = Math.max(s.st[r.test_id + r.cls] || 0, +r.students) });
  var subjList = Object.keys(bySubj).map(function (s) { var o = bySubj[s], n = 0; for (var k in o.st) n += o.st[k]; return { s: s, p: pct(o.p, o.m), n: n } }).sort(function (a, b) { return a.p - b.p });
  // topics
  var byTopic = {};
  fr.filter(function (r) { return G.ovSubj === "all" || r.subject === G.ovSubj }).forEach(function (r) {
    var key = r.test_id + "|" + (r.topic_id || ""), o = byTopic[key] = byTopic[key] || { title: r.topic_title || t("gtNoTopic"), subj: r.subject, test: r.test_title, tid: r.test_id, p: 0, m: 0, n: 0 };
    o.p += +r.pts; o.m += +r.mx; o.n += +r.students });
  var topics = Object.keys(byTopic).map(function (k) { var o = byTopic[k]; o.pc = pct(o.p, o.m); return o }).sort(function (a, b) { return a.pc - b.pc });
  var left = G.ovSubj === "all" ? '<div class="panel"><h3>' + esc(t("gtBySubject")) + '</h3>' + (subjList.length ? subjList.map(function (s) { return '<button class="gt-barbtn" data-g="ovsubj" data-a="' + esc(s.s) + '">' + bar(esc(s.s), s.p, esc(f(t("gtStudN"), { n: s.n }))) + '</button>' }).join("") : '<p class="hint">—</p>') + '</div>' : '';
  var shown = G.ovSubj === "all" ? topics.slice(0, 12) : topics;
  var right = '<div class="panel"><h3>' + esc(G.ovSubj === "all" ? t("gtWeakTopics") : f(t("gtTopicsOf"), { s: G.ovSubj })) + '</h3>' + (shown.length ? shown.map(function (o) {
    return '<a class="gt-barbtn" href="#teststat.' + o.tid + '">' + bar(esc(o.title), o.pc, esc((G.ovSubj === "all" ? o.subj + " · " : "") + o.test + " · " + f(t("gtStudN"), { n: o.n }))) + '</a>' }).join("") : '<p class="hint">—</p>') + '</div>';
  return hint + filt + '<div class="gt-an' + (left ? '' : ' one') + '">' + left + right + '</div>' }

/* ------------------------------------------------------------ #test.<id> — taking a test */
function pageTake() {
  var g = guard(); if (g) return g;
  var id = st.route.arg, T0 = G.take;
  if (!T0 || T0.testId !== id) { startTake(id); return shell(loading()) }
  if (T0.error) return shell(backLink() + '<div class="empty"><b>' + esc(t(T0.error)) + '</b></div>');
  var d = T0.data, qs = T0.order, n = qs.length;
  if (!n) return shell(backLink() + '<div class="empty"><b>' + esc(t("gtNoQs")) + '</b></div>', d.test.title, crumbT());
  var head = '<div class="gt-takehead">' + backLink() + '<div class="gt-ch"><span class="chip">' + esc(d.test.subject) + '</span>' + (d.test.grade ? '<span class="chip">' + esc(f(t("gtGradeN"), { n: d.test.grade })) + '</span>' : '') + '</div>' +
    (d.test.descr ? '<p class="gt-descr">' + nl(d.test.descr) + '</p>' : '') + (T0.preview ? '<p class="gt-note gt-warn">' + esc(t("gtPreviewNote")) + '</p>' : '') + '</div>';
  var sticky = '<div class="gt-sticky"><div><b id="gt-prog">' + esc(f(t("gtAnswered"), { a: answeredCount(), b: n })) + '</b><i class="gt-pbar"><s id="gt-pbar" style="width:' + pct(answeredCount(), n) + '%"></s></i></div>' +
    (T0.deadline ? '<span class="gt-timer" id="gt-timer">' + gi("clock") + '<span>' + fmtLeft(T0.deadline - Date.now()) + '</span></span>' : '') + '</div>';
  var topicName = {}; d.topics.forEach(function (x) { topicName[x.id] = x.title });
  var body = qs.map(function (q, i) {
    var ch = T0.answers[q.id] || [], multi = q.kind === "multi";
    return '<section class="gt-q" id="gq-' + q.id + '"><div class="gt-qh"><span>' + esc(f(t("gtQof"), { a: i + 1, b: n })) + '</span>' + (topicName[q.topic_id] ? '<span class="tags"><span>' + esc(topicName[q.topic_id]) + '</span></span>' : '') + '</div>' +
      '<div class="gt-qb">' + nl(q.body) + '</div>' + (q.image ? '<img class="gt-qimg" src="' + esc(q.image) + '" alt="" loading="lazy">' : '') +
      (multi ? '<p class="gt-mh">' + esc(t("gtMultiHint")) + '</p>' : '') +
      '<div class="gt-opts">' + q.opts.map(function (o) {
        var on = ch.indexOf(o.id) >= 0;
        return '<label class="gt-opt' + (on ? ' on' : '') + '"><input type="' + (multi ? "checkbox" : "radio") + '" name="gq_' + q.id + '" value="' + esc(o.id) + '" data-gq="' + q.id + '"' + (on ? " checked" : "") + '><span>' + nl(o.t) + '</span></label>' }).join("") + '</div></section>' }).join("");
  var foot = '<div class="gt-finish"><button class="btn btn-primary btn-lg" data-g="finish"' + (T0.sending ? " disabled" : "") + '>' + esc(T0.sending ? t("gtSending") : t("gtFinish")) + '</button></div>';
  ensureTimer();
  return shell(head + sticky + body + foot, d.test.title, crumbT()) }

function answeredCount() { var T0 = G.take, c = 0; if (!T0) return 0; T0.order.forEach(function (q) { if ((T0.answers[q.id] || []).length) c++ }); return c }
function fmtLeft(ms) { if (ms < 0) ms = 0; var s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (x < 10 ? "0" : "") + x }
function lsKey(aid) { return "gt-ans-" + aid }

function prepare(data, preview, seed) {
  var rnd = seeded(seed), qs = orderQs(data.questions, data.topics).map(function (q) { return { id: q.id, topic_id: q.topic_id, kind: q.kind, body: q.body, image: q.image, points: q.points, opts: data.test.shuffle ? shuffle(q.options, rnd) : q.options.slice(), correct: q.correct } });
  if (data.test.shuffle) qs = shuffle(qs, rnd);
  var answers = data.attempt.answers || {};
  try { var ls = JSON.parse(localStorage.getItem(lsKey(data.attempt.id)) || "null"); if (ls && typeof ls === "object") answers = ls } catch (e) {}
  var deadline = null;
  if (data.test.time_limit) { var off = Date.now() - Date.parse(data.attempt.now); deadline = Date.parse(data.attempt.started_at) + data.test.time_limit * 60000 + off }
  return { testId: data.test.id, attemptId: data.attempt.id, data: data, order: qs, answers: answers, deadline: deadline, preview: preview } }

function startTake(id) {
  if (G.busy["start" + id]) return; G.busy["start" + id] = 1;
  if (G.take && G.take.timer) clearInterval(G.take.timer);
  var done = function (take) { G.busy["start" + id] = 0; G.take = take; rerender("test") };
  var asStudent = function () {
    sb.rpc("gt_start", { p_test: id }).then(function (r) {
      if (r.error) { done({ testId: id, error: errKey(r.error) }); G.avail = null; return }
      G.avail = null; done(prepare(r.data, false, r.data.attempt.id)) }) };
  if (!isT()) { asStudent(); return }
  // teacher: preview own tests without saving, take other tests as a student
  sb.from("gt_tests").select("*").eq("id", id).maybeSingle().then(function (r) {
    var tst = r.data; if (!tst || !isMgr(tst)) { asStudent(); return }
    Promise.all([sb.from("gt_topics").select("id,title").eq("test_id", id).order("pos"), sb.from("gt_questions").select("*").eq("test_id", id).order("pos")]).then(function (x) {
      var qs = (x[1].data || []).filter(function (q) { return q.correct && q.correct.length });
      var data = { test: tst, topics: x[0].data || [], questions: qs, attempt: { id: "preview-" + id, started_at: new Date().toISOString(), now: new Date().toISOString(), answers: {} } };
      try { localStorage.removeItem(lsKey(data.attempt.id)) } catch (e) {}
      done(prepare(data, true, String(Math.random()))) }) }) }

function ensureTimer() {
  var T0 = G.take; if (!T0 || !T0.deadline || T0.timer) return;
  T0.timer = setInterval(function () {
    if (G.take !== T0 || st.route.page !== "test") { clearInterval(T0.timer); T0.timer = null; return }
    var left = T0.deadline - Date.now(), el = document.getElementById("gt-timer");
    if (el) { el.querySelector("span").textContent = fmtLeft(left); el.classList.toggle("warn", left < 60000) }
    if (left <= 0) { clearInterval(T0.timer); T0.timer = null; A.toast(t("gtTimeUp")); submitTake() } }, 1000) }

var saveTimer = 0;
function onAnswer(input) {
  var T0 = G.take; if (!T0 || T0.sending) return;
  var qid = input.dataset.gq, box = document.getElementById("gq-" + qid);
  var vals = [].slice.call(box.querySelectorAll("input:checked")).map(function (x) { return x.value });
  T0.answers[qid] = vals;
  [].forEach.call(box.querySelectorAll(".gt-opt"), function (l) { l.classList.toggle("on", l.querySelector("input").checked) });
  var a = answeredCount(), n = T0.order.length, p = document.getElementById("gt-prog"), b = document.getElementById("gt-pbar");
  if (p) p.textContent = f(t("gtAnswered"), { a: a, b: n }); if (b) b.style.width = pct(a, n) + "%";
  try { localStorage.setItem(lsKey(T0.attemptId), JSON.stringify(T0.answers)) } catch (e) {}
  if (!T0.preview) { clearTimeout(saveTimer); saveTimer = setTimeout(function () { sb.rpc("gt_save", { p_attempt: T0.attemptId, p_answers: T0.answers }) }, 1500) } }

function askFinish() {
  var T0 = G.take; if (!T0) return; var un = T0.order.length - answeredCount();
  A.openLayer('<h3>' + esc(t("gtFinishQ")) + '</h3>' + (un ? '<p class="gt-note gt-warn" style="margin-top:12px">' + esc(f(t("gtUnanswered"), { n: un })) + '</p>' : '') +
    '<p class="hint" style="text-align:left">' + esc(t("gtFinishNote")) + '</p><div class="acts" style="border:0;padding:14px 0 0;justify-content:flex-end"><button class="btn btn-soft" data-close="1">' + esc(t("gtKeep")) + '</button><button class="btn btn-primary" data-g="dofinish">' + esc(t("gtFinish")) + '</button></div>') }

function gradeLocal(T0) {
  var top = {}, qs = [], tot = 0, max = 0;
  T0.order.forEach(function (q) {
    var ch = (T0.answers[q.id] || []).filter(function (v, i, a) { return a.indexOf(v) === i && q.opts.some(function (o) { return o.id === v }) }), p;
    if (q.kind === "single") p = ch.length === 1 && q.correct.indexOf(ch[0]) >= 0 ? q.points : 0;
    else { var hit = ch.filter(function (c) { return q.correct.indexOf(c) >= 0 }).length; p = Math.round(Math.max(0, (hit - (ch.length - hit)) / q.correct.length) * q.points * 100) / 100 }
    var k = q.topic_id || "", o = top[k] = top[k] || { id: q.topic_id, pts: 0, max: 0 }; o.pts += p; o.max += q.points; tot += p; max += q.points;
    qs.push({ id: q.id, topic_id: q.topic_id, kind: q.kind, body: q.body, image: q.image, options: q.opts, correct: q.correct, chosen: ch, pts: p, max: q.points }) });
  var names = {}; T0.data.topics.forEach(function (x) { names[x.id] = x.title });
  return { preview: true, attempt: { id: "preview", score: tot, max: max, finished_at: new Date().toISOString() }, test: { id: T0.testId, title: T0.data.test.title, subject: T0.data.test.subject, show_answers: true, max_attempts: 0, used: 0, status: "draft" },
    topics: Object.keys(top).map(function (k) { var o = top[k]; o.title = names[o.id] || null; return o }), questions: qs } }

function submitTake() {
  var T0 = G.take; if (!T0 || T0.sending) return; A.closeLayer();
  if (T0.timer) { clearInterval(T0.timer); T0.timer = null }
  if (T0.preview) { G.result.preview = gradeLocal(T0); G.take = null; location.hash = "testres.preview"; return }
  T0.sending = true; clearTimeout(saveTimer); rerender("test");
  sb.rpc("gt_submit", { p_attempt: T0.attemptId, p_answers: T0.answers }).then(function (r) {
    if (r.error) { T0.sending = false; A.toast(t("e_generic")); rerender("test"); return }
    try { localStorage.removeItem(lsKey(T0.attemptId)) } catch (e) {}
    G.result[T0.attemptId] = r.data; G.take = null; G.avail = null; G.ov = null; location.hash = "testres." + T0.attemptId }) }

/* ------------------------------------------------------------ #testres.<attempt> */
function pageResult() {
  var g = guard(); if (g) return g;
  var id = st.route.arg, R = G.result[id];
  if (!R) {
    if (id === "preview") { location.hash = "tests"; return "" }
    if (!G.busy["res" + id]) { G.busy["res" + id] = 1; sb.rpc("gt_result", { p_attempt: id }).then(function (r) { G.busy["res" + id] = 0; G.result[id] = r.error ? { error: errKey(r.error) } : r.data; rerender("testres") }) }
    return shell(loading()) }
  if (R.error) return shell(backLink() + '<div class="empty"><b>' + esc(t(R.error)) + '</b></div>');
  var a = R.attempt, p = pct(+a.score, +a.max), tp = (R.topics || []).map(function (x) { return { title: x.title || t("gtNoTopic"), p: pct(+x.pts, +x.max), pts: +x.pts, max: +x.max } }).sort(function (x, y) { return x.p - y.p });
  var dur = a.started_at && a.finished_at ? Math.max(1, Math.round((Date.parse(a.finished_at) - Date.parse(a.started_at)) / 60000)) : 0;
  var canRetake = !R.preview && R.mine && R.test.status === "published" && R.test.used < R.test.max_attempts;
  var who = !R.preview && !R.mine && a.name ? '<p class="gt-meta">' + esc([a.name, a.grade].filter(Boolean).join(" · ")) + '</p>' : '';
  var top = '<div class="panel gt-res"><div class="gt-ring gt-' + band(p) + '" style="--p:' + p + '"><b class="tnum">' + p + '%</b></div><div><span class="chip">' + esc(R.test.subject) + '</span><h2>' + esc(R.test.title) + '</h2>' + who +
    '<p class="gt-meta">' + esc([f(t("gtScore"), { a: +(+a.score).toFixed(2), b: +a.max }), day(a.finished_at), dur ? f(t("gtDur"), { n: dur }) : ""].filter(Boolean).join(" · ")) + '</p>' +
    (R.preview ? '<p class="gt-note gt-warn">' + esc(t("gtPreviewNote")) + '</p>' : '') +
    '<div class="gt-btns">' + (R.preview ? '<a class="btn btn-soft" href="#testedit.' + R.test.id + '">' + esc(t("gtEdit")) + '</a><button class="btn btn-soft" data-g="again" data-a="' + R.test.id + '">' + esc(t("gtPreview")) + '</button>' : (canRetake ? '<a class="btn btn-primary" href="#test.' + R.test.id + '">' + esc(t("gtRetake")) + '</a>' : '')) + '</div></div></div>';
  var topics = tp.length ? '<div class="panel"><h3>' + esc(t("gtByTopic")) + '</h3>' + tp.map(function (x) { return bar(esc(x.title), x.p, esc(f(t("gtScore"), { a: +x.pts.toFixed(2), b: x.max })), x.p < 50 ? '<em class="gt-flag">' + esc(t("gtRepeat")) + '</em>' : '') }).join("") + '</div>' : '';
  var review = '';
  if (R.questions) {
    var names = {}; (R.topics || []).forEach(function (x) { if (x.id) names[x.id] = x.title });
    review = '<div class="panel"><h3>' + esc(t("gtReview")) + '</h3>' + orderQs(R.questions, R.topics).map(function (q, i) {
      var ok = +q.pts >= +q.max, part = !ok && +q.pts > 0, ch = q.chosen || [];
      return '<div class="gt-rq ' + (ok ? "ok" : part ? "part" : "bad") + '"><div class="gt-qh"><span>' + gi(ok ? "check" : "xmark") + esc(f(t("gtQof"), { a: i + 1, b: R.questions.length })) + '</span><span class="tnum">' + (+(+q.pts).toFixed(2)) + ' / ' + q.max + '</span></div><div class="gt-qb">' + nl(q.body) + '</div>' +
        (q.image ? '<img class="gt-qimg" src="' + esc(q.image) + '" alt="" loading="lazy">' : '') +
        '<ul class="gt-ro">' + q.options.map(function (o) { var c = q.correct.indexOf(o.id) >= 0, s = ch.indexOf(o.id) >= 0;
          return '<li class="' + (c ? "c" : "") + (s ? " s" : "") + '">' + gi(c ? "check" : s ? "xmark" : "") + '<span>' + nl(o.t) + (s ? ' <small>(' + esc(t("gtYourAns")) + ')</small>' : '') + '</span></li>' }).join("") + '</ul>' +
        (!ch.length ? '<p class="gt-mh">' + esc(t("gtNoAns")) + '</p>' : '') + '</div>' }).join("") + '</div>' }
  else review = '<p class="gt-note">' + esc(t("gtHidden")) + '</p>';
  return shell(backLink() + top + topics + review, t("gtResult"), crumbT()) }

/* ------------------------------------------------------------ #testedit.<id> */
function loadEdit(id) {
  if (G.busy["ed" + id]) return; G.busy["ed" + id] = 1;
  Promise.all([sb.from("gt_tests").select("*").eq("id", id).maybeSingle(), sb.from("gt_topics").select("*").eq("test_id", id).order("pos"), sb.from("gt_questions").select("*").eq("test_id", id).order("pos")]).then(function (r) {
    G.busy["ed" + id] = 0;
    G.edit = r[0].data ? { id: id, test: r[0].data, topics: r[1].data || [], qs: r[2].data || [] } : { id: id, error: "noAccess" }; rerender("testedit") }) }
function reloadEdit() { var id = G.edit && G.edit.id; G.edit = null; G.mine = null; G.stat = null; if (id) loadEdit(id) }

function pageEdit() {
  var g = guard(); if (g) return g;
  if (!isT()) return shell('<div class="empty"><b>' + esc(t("noAccess")) + '</b></div>');
  var id = st.route.arg, E = G.edit;
  if (!E || E.id !== id) { G.edit = null; loadEdit(id); return shell(loading()) }
  if (E.error) return shell(backLink() + '<div class="empty"><b>' + esc(t(E.error)) + '</b></div>');
  var T0 = E.draft ? Object.assign({}, E.test, E.draft) : E.test, subj = A.allSubjects();
  var opt = function (v, cur, label) { return '<option value="' + v + '"' + (String(v) === String(cur == null ? "" : cur) ? " selected" : "") + '>' + esc(label) + '</option>' };
  var head = '<div class="gt-edhead">' + backLink() + '<div class="gt-btns">' + statusChip(T0.status) + '<button class="btn btn-soft" data-g="again" data-a="' + id + '">' + gi("play") + esc(t("gtPreview")) + '</button><a class="btn btn-soft" href="#teststat.' + id + '">' + gi("chart") + esc(t("gtStats")) + '</a>' +
    (T0.status === "published" ? '<button class="btn btn-soft" data-g="copy" data-a="' + id + '">' + gi("link") + esc(t("gtLink")) + '</button>' : '') + '</div></div>';
  var set = '<div class="panel"><h3>' + esc(t("gtSettings")) + '</h3><form class="form gt-form" id="gt-set" novalidate>' +
    '<label>' + esc(t("gtTitleF")) + '<input id="gs-title" value="' + esc(T0.title) + '" maxlength="160" required></label>' +
    '<div class="row2"><label>' + esc(t("gtSubjF")) + '<input id="gs-subj" list="gs-subjects" value="' + esc(T0.subject) + '" maxlength="80" required><datalist id="gs-subjects">' + subj.map(function (s) { return '<option value="' + esc(s) + '">' }).join("") + '</datalist></label>' +
    '<label>' + esc(t("gtGradeF")) + '<select id="gs-grade">' + opt("", T0.grade, t("gtAllGrades")) + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (n) { return opt(n, T0.grade, f(t("gtGradeN"), { n: n })) }).join("") + '</select></label></div>' +
    '<div class="row2"><label>' + esc(t("gtTimeF")) + '<input id="gs-time" type="number" min="1" max="240" inputmode="numeric" value="' + (T0.time_limit || "") + '"></label>' +
    '<label>' + esc(t("gtTriesF")) + '<select id="gs-tries">' + [1, 2, 3, 4, 5, 10].map(function (n) { return opt(n, T0.max_attempts, String(n)) }).join("") + '</select></label></div>' +
    '<label class="gt-check"><input type="checkbox" id="gs-show"' + (T0.show_answers ? " checked" : "") + '><span>' + esc(t("gtShowAns")) + '</span></label>' +
    '<label class="gt-check"><input type="checkbox" id="gs-shuf"' + (T0.shuffle ? " checked" : "") + '><span>' + esc(t("gtShuffle")) + '</span></label>' +
    '<label>' + esc(t("gtDescrF")) + '<textarea id="gs-descr" maxlength="1000" rows="2">' + esc(T0.descr || "") + '</textarea></label>' +
    '<div class="gt-formfoot"><label class="gt-sel">' + esc(t("gtStatusF")) + '<select id="gs-status">' + ["draft", "published", "closed"].map(function (s) { return opt(s, T0.status, t("st_" + s)) }).join("") + '</select></label>' +
    '<p class="formmsg" id="gs-msg" hidden></p><button class="btn btn-primary" type="submit"' + (G.busy.set ? " disabled" : "") + '>' + esc(t("ok")) + '</button></div></form></div>';
  var qn = {}; E.qs.forEach(function (q) { var k = q.topic_id || ""; qn[k] = (qn[k] || 0) + 1 });
  var topics = '<div class="panel"><h3>' + esc(t("gtTopics")) + '</h3><p class="gt-note" style="margin-top:-6px">' + esc(t("gtTopicsHint")) + '</p><div class="gt-topics">' + E.topics.map(function (tp, i) {
    var sure = G.sure === "tp" + tp.id;
    return '<div class="gt-topic"><span class="gt-num">' + (i + 1) + '</span><input data-gtopic="' + tp.id + '" value="' + esc(tp.title) + '" maxlength="160" aria-label="' + esc(t("gtTopicF")) + '"><small>' + esc(f(t("gtQn"), { n: qn[tp.id] || 0 })) + '</small>' +
      '<button class="gt-ib" data-g="mvtopic" data-a="' + tp.id + '" data-b="-1"' + (i ? '' : ' disabled') + ' aria-label="↑">' + gi("up") + '</button><button class="gt-ib" data-g="mvtopic" data-a="' + tp.id + '" data-b="1"' + (i < E.topics.length - 1 ? '' : ' disabled') + ' aria-label="↓">' + gi("down") + '</button>' +
      '<button class="gt-ib del' + (sure ? ' sure' : '') + '" data-g="deltopic" data-a="' + tp.id + '" title="' + esc(sure ? t("gtTopicDelWarn") : t("del")) + '">' + (sure ? '?' : gi("trash")) + '</button></div>' }).join("") + '</div>' +
    '<form class="gt-addtopic" id="gt-addtopic"><input id="gt-newtopic" maxlength="160" placeholder="' + esc(t("gtTopicPh")) + '"><button class="btn btn-soft" type="submit">' + gi("plus") + esc(t("gtAddTopic")) + '</button></form></div>';
  var groups = E.topics.map(function (tp) { return { id: tp.id, title: tp.title } }); groups.push({ id: null, title: t("gtNoTopic") });
  var qno = 0, qhtml = groups.map(function (gr) {
    var list = E.qs.filter(function (q) { return (q.topic_id || null) === gr.id }).sort(function (a, b) { return a.pos - b.pos }); if (!list.length && gr.id === null) return '';
    return '<div class="gt-qgroup"><div class="gt-qgh"><h4>' + esc(gr.title) + '</h4><button class="addbtn" data-g="addq" data-a="' + (gr.id || "") + '">' + gi("plus") + esc(t("gtAddQ")) + '</button></div>' +
      (list.length ? list.map(function (q) { qno++; return qCard(q, qno) }).join("") : '<p class="hint" style="text-align:left;margin:0 0 6px">—</p>') + '</div>' }).join("");
  var questions = '<div class="panel"><div class="toolbar" style="margin-bottom:14px"><h3 style="margin:0">' + esc(t("gtQuestions")) + ' <span class="chip">' + E.qs.length + '</span></h3><div class="gt-btns"><button class="btn btn-soft" data-g="import">' + gi("upload") + esc(t("gtImport")) + '</button><button class="btn btn-primary" data-g="addq" data-a="">' + gi("plus") + esc(t("gtAddQ")) + '</button></div></div>' +
    (E.qs.length ? qhtml : '<div class="empty"><b>' + esc(t("gtNoQ")) + '</b></div>' + (E.topics.length ? qhtml : '')) + '</div>';
  var sureDel = G.sure === "test" + id;
  var danger = '<div class="gt-danger"><button class="btn btn-danger" data-g="deltest" data-a="' + id + '">' + gi("trash") + esc(sureDel ? t("sure") : t("gtDelTest")) + '</button>' + (sureDel ? '<span class="hint" style="margin:0">' + esc(t("gtDelTestWarn")) + '</span>' : '') + '</div>';
  return shell(head + set + topics + questions + danger, T0.title, crumbT()) }

function qCard(q, n) {
  var sure = G.sure === "q" + q.id, bad = !q.correct || !q.correct.length || q.options.length < 2;
  return '<div class="gt-qc' + (bad ? ' bad' : '') + '"><div class="gt-qh"><span><b>' + n + '.</b> ' + esc(t("k_" + q.kind)) + ' · ' + esc(f(t("gtPts"), { n: q.points })) + '</span><span class="gt-btns">' +
    '<button class="gt-ib" data-g="mvq" data-a="' + q.id + '" data-b="-1" aria-label="↑">' + gi("up") + '</button><button class="gt-ib" data-g="mvq" data-a="' + q.id + '" data-b="1" aria-label="↓">' + gi("down") + '</button>' +
    '<button class="gt-ib" data-g="editq" data-a="' + q.id + '" aria-label="' + esc(t("edit")) + '">' + gi("edit") + '</button><button class="gt-ib del' + (sure ? ' sure' : '') + '" data-g="delq" data-a="' + q.id + '" aria-label="' + esc(t("del")) + '">' + (sure ? '?' : gi("trash")) + '</button></span></div>' +
    '<div class="gt-qb">' + nl(q.body) + '</div>' + (q.image ? '<img class="gt-qimg sm" src="' + esc(q.image) + '" alt="" loading="lazy">' : '') +
    '<ul class="gt-ro">' + q.options.map(function (o) { var c = q.correct.indexOf(o.id) >= 0; return '<li class="' + (c ? "c" : "") + '">' + gi(c ? "check" : "") + '<span>' + nl(o.t) + '</span></li>' }).join("") + '</ul>' +
    (bad ? '<p class="gt-mh err">' + esc(t("gtNoCorrect")) + '</p>' : '') + '</div>' }

function saveSettings() {
  var E = G.edit; if (!E || G.busy.set) return;
  var v = function (x) { return document.getElementById(x).value.trim() }, msg = document.getElementById("gs-msg");
  var row = { title: v("gs-title") || t("gtNewTitle"), subject: v("gs-subj") || "—", grade: v("gs-grade") ? +v("gs-grade") : null, time_limit: v("gs-time") ? Math.min(240, Math.max(1, parseInt(v("gs-time"), 10) || 0)) || null : null,
    max_attempts: +v("gs-tries") || 1, show_answers: document.getElementById("gs-show").checked, shuffle: document.getElementById("gs-shuf").checked, descr: v("gs-descr") || null, status: v("gs-status") };
  var show = function (k, ok) { msg.hidden = false; msg.className = "formmsg " + (ok ? "ok" : "err"); msg.textContent = t(k) };
  if (row.status === "published") {
    if (!E.qs.length) { show("gtPubEmpty"); return }
    if (E.qs.some(function (q) { return !q.correct.length || q.options.length < 2 })) { show("gtPubErr"); return } }
  G.busy.set = 1;
  sb.from("gt_tests").update(row).eq("id", E.id).select("*").single().then(function (r) {
    G.busy.set = 0; if (r.error) { show("e_generic"); return }
    E.test = r.data; E.draft = null; G.mine = null; G.avail = null; A.toast(t("gtSaved")); rerender("testedit") }) }

function addTopic() {
  var E = G.edit, inp = document.getElementById("gt-newtopic"), title = inp && inp.value.trim(); if (!E || !title) return;
  var pos = E.topics.reduce(function (m, x) { return Math.max(m, x.pos) }, -1) + 1;
  sb.from("gt_topics").insert({ test_id: E.id, title: title, pos: pos }).select("*").single().then(function (r) {
    if (r.error) { A.toast(t("e_generic")); return } E.topics.push(r.data); rerender("testedit");
    var n = document.getElementById("gt-newtopic"); if (n) n.focus() }) }
function renameTopic(input) {
  var E = G.edit, id = input.dataset.gtopic, title = input.value.trim(), tp = E && E.topics.filter(function (x) { return x.id === id })[0]; if (!tp) return;
  if (!title) { input.value = tp.title; return } if (title === tp.title) return;
  sb.from("gt_topics").update({ title: title }).eq("id", id).then(function (r) { if (r.error) { A.toast(t("e_generic")); input.value = tp.title; return } tp.title = title; A.toast(t("gtSaved")) }) }
function delTopic(id) {
  if (G.sure !== "tp" + id) { G.sure = "tp" + id; rerender("testedit"); return } G.sure = null;
  sb.from("gt_topics").delete().eq("id", id).then(function (r) { if (r.error) { A.toast(t("e_generic")); return } reloadEdit() }) }
// Swap two items in an ordered list; only the two changed rows are saved (all rows only if positions collide).
function swapIn(table, list, a, b) {
  var ia = list.indexOf(a), ib = list.indexOf(b), dirty = [a, b];
  if (a.pos === b.pos) { list.forEach(function (x, k) { x.pos = k }); dirty = list.slice() }
  var p = a.pos; a.pos = b.pos; b.pos = p; list[ia] = b; list[ib] = a; rerender("testedit");
  Promise.all(dirty.map(function (x) { return sb.from(table).update({ pos: x.pos }).eq("id", x.id) })).then(function (rs) { if (rs.some(function (r) { return r.error })) { A.toast(t("e_generic")); reloadEdit() } }) }
function swapPos(table, list, id, dir) {
  var i = list.map(function (x) { return x.id }).indexOf(id), j = i + dir; if (i < 0 || j < 0 || j >= list.length) return;
  swapIn(table, list, list[i], list[j]) }
function moveQ(id, dir) {
  // move within its topic group
  var E = G.edit, q = E.qs.filter(function (x) { return x.id === id })[0]; if (!q) return;
  var group = E.qs.filter(function (x) { return (x.topic_id || null) === (q.topic_id || null) }), other = group[group.indexOf(q) + dir]; if (!other) return;
  swapIn("gt_questions", E.qs, q, other) }
function delQ(id) {
  if (G.sure !== "q" + id) { G.sure = "q" + id; rerender("testedit"); return } G.sure = null;
  sb.from("gt_questions").delete().eq("id", id).then(function (r) { if (r.error) { A.toast(t("e_generic")); return } G.edit.qs = G.edit.qs.filter(function (x) { return x.id !== id }); G.mine = null; rerender("testedit") }) }
function delTest(id) {
  if (G.sure !== "test" + id) { G.sure = "test" + id; rerender("testedit"); return } G.sure = null;
  sb.from("gt_tests").delete().eq("id", id).then(function (r) { if (r.error) { A.toast(t("e_generic")); return } G.edit = null; G.mine = null; G.avail = null; G.ov = null; location.hash = "tests" }) }

/* question editor modal */
var LET = "abcdefghij", qImg = null;
function optRow(o, kind, checked) {
  return '<div class="gt-optrow"><label class="gt-okbox" title="✓"><input type="' + (kind === "multi" ? "checkbox" : "radio") + '" name="gqo-ok" data-gqok="' + o.id + '"' + (checked ? " checked" : "") + '><span>' + gi("check") + '</span></label>' +
    '<input class="gt-otext" data-gqot="' + o.id + '" value="' + esc(o.t || "") + '" maxlength="500" placeholder="' + esc(t("gtOptPh")) + '"><button type="button" class="gt-ib del" data-g="rmopt" aria-label="' + esc(t("del")) + '">' + gi("xmark") + '</button></div>' }
function openQ(id, topicId) {
  var E = G.edit, q = id ? E.qs.filter(function (x) { return x.id === id })[0] : null;
  q = q || { id: "", topic_id: topicId || null, kind: "single", body: "", image: null, options: [{ id: "a", t: "" }, { id: "b", t: "" }, { id: "c", t: "" }, { id: "d", t: "" }], correct: [], points: 1 };
  qImg = q.image || null;
  A.openLayer('<h3>' + esc(t("gtQEdit")) + '</h3><form class="form gt-form" id="gt-qform" data-id="' + esc(q.id) + '" novalidate>' +
    '<div class="row2"><label>' + esc(t("gtTopicF")) + '<select id="gq-topic"><option value="">' + esc(t("gtNoTopic")) + '</option>' + E.topics.map(function (tp) { return '<option value="' + tp.id + '"' + (tp.id === q.topic_id ? " selected" : "") + '>' + esc(tp.title) + '</option>' }).join("") + '</select></label>' +
    '<label>' + esc(t("gtKindF")) + '<select id="gq-kind" data-gqkind="1"><option value="single"' + (q.kind === "single" ? " selected" : "") + '>' + esc(t("k_single")) + '</option><option value="multi"' + (q.kind === "multi" ? " selected" : "") + '>' + esc(t("k_multi")) + '</option></select></label></div>' +
    '<label>' + esc(t("gtBodyF")) + '<textarea id="gq-body" rows="3" maxlength="3000" required>' + esc(q.body) + '</textarea></label>' +
    '<div class="gt-lab">' + esc(t("gtImgF")) + '<div class="gt-imgrow"><label class="addbtn" style="cursor:pointer">' + gi("image") + esc(t("changePhoto")) + '<input type="file" accept="image/*" class="sr" data-gqimg="1"></label><span id="gq-imgprev">' + imgPrev() + '</span></div></div>' +
    '<div class="gt-lab">' + esc(t("gtOptsF")) + '<div id="gq-opts">' + q.options.map(function (o) { return optRow(o, q.kind, q.correct.indexOf(o.id) >= 0) }).join("") + '</div><button type="button" class="addbtn" data-g="addopt" style="align-self:flex-start">' + esc(t("gtAddOpt")) + '</button></div>' +
    '<label style="max-width:160px">' + esc(t("gtPtsF")) + '<select id="gq-pts">' + [1, 2, 3, 4, 5].map(function (n) { return '<option' + (n === q.points ? " selected" : "") + '>' + n + '</option>' }).join("") + '</select></label>' +
    '<p class="formmsg" id="gq-msg" hidden></p><div class="acts"><button type="button" class="btn btn-soft" data-close="1">' + esc(t("cancel")) + '</button><button class="btn btn-primary" type="submit">' + esc(t("ok")) + '</button></div></form>');
  setTimeout(function () { var b = document.getElementById("gq-body"); if (b && !q.body) b.focus() }, 30) }
function imgPrev() { return qImg ? '<img class="gt-qimg sm" src="' + esc(qImg) + '" alt=""><button type="button" class="gt-ib del" data-g="rmimg" aria-label="' + esc(t("gtRmImg")) + '">' + gi("xmark") + '</button>' : '' }
function addOpt() {
  var box = document.getElementById("gq-opts"), used = [].map.call(box.querySelectorAll("[data-gqot]"), function (x) { return x.dataset.gqot });
  if (used.length >= 10) return; var id = LET.split("").filter(function (c) { return used.indexOf(c) < 0 })[0];
  box.insertAdjacentHTML("beforeend", optRow({ id: id, t: "" }, document.getElementById("gq-kind").value, false)); box.lastElementChild.querySelector(".gt-otext").focus() }
function setKind(kind) { [].forEach.call(document.querySelectorAll("[data-gqok]"), function (x) { x.type = kind === "multi" ? "checkbox" : "radio" }) }
function saveQ(form) {
  var E = G.edit, id = form.dataset.id, msg = document.getElementById("gq-msg");
  var err = function (k) { msg.hidden = false; msg.className = "formmsg err"; msg.textContent = t(k) };
  var kind = document.getElementById("gq-kind").value, body = document.getElementById("gq-body").value.trim(), opts = [], correct = [];
  [].forEach.call(document.querySelectorAll("#gq-opts .gt-optrow"), function (r) { var tx = r.querySelector(".gt-otext").value.trim(), oid = r.querySelector(".gt-otext").dataset.gqot;
    if (!tx) return; opts.push({ id: oid, t: tx }); if (r.querySelector("[data-gqok]").checked) correct.push(oid) });
  if (!body) { err("gtQErrBody"); return } if (opts.length < 2) { err("gtQErrOpts"); return } if (!correct.length) { err("gtQErrOk"); return }
  if (kind === "single" && correct.length > 1) { err("gtQErrSingle"); return }
  var row = { topic_id: document.getElementById("gq-topic").value || null, kind: kind, body: body, image: qImg, options: opts, correct: correct, points: +document.getElementById("gq-pts").value || 1 };
  var btn = form.querySelector('button[type="submit"]'); btn.disabled = true;
  var req = id ? sb.from("gt_questions").update(row).eq("id", id).select("*").single()
    : sb.from("gt_questions").insert(Object.assign({ test_id: E.id, pos: E.qs.reduce(function (m, x) { return Math.max(m, x.pos) }, -1) + 1 }, row)).select("*").single();
  req.then(function (r) {
    btn.disabled = false; if (r.error) { err("e_generic"); return }
    if (id) E.qs = E.qs.map(function (x) { return x.id === id ? r.data : x }); else E.qs.push(r.data);
    G.mine = null; A.closeLayer(); rerender("testedit") }) }

/* import from text */
function parseImport(txt) {
  var topics = [], qs = [], cur = null, topic = null, m;
  txt.split(/\r?\n/).forEach(function (raw) {
    var l = raw.trim(); if (!l) return;
    if (/^#/.test(l)) { topic = l.replace(/^#+\s*/, "").trim() || null; if (topic && topics.indexOf(topic) < 0) topics.push(topic); cur = null; return }
    if (cur && (m = /^([+*\-–—])\s*(.+)$/.exec(l))) { cur.opts.push({ t: m[2].trim(), ok: m[1] === "+" || m[1] === "*" }); return }
    if (cur && (m = /^([A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі])[)\.]\s+(.+)$/.exec(l))) {
      var tx = m[2].trim(), ok = false; if (/\*\s*$/.test(tx)) { ok = true; tx = tx.replace(/\s*\*\s*$/, "") } if (/^\*\s*/.test(tx)) { ok = true; tx = tx.replace(/^\*\s*/, "") }
      cur.opts.push({ t: tx, ok: ok }); return }
    if ((m = /^(?:\?|\d+\s*[.)])\s*(.+)$/.exec(l))) { cur = { body: m[1].trim(), opts: [], topic: topic }; qs.push(cur); return }
    if (cur && !cur.opts.length) { cur.body += "\n" + l; return }
    cur = { body: l, opts: [], topic: topic }; qs.push(cur) });
  var ok = qs.filter(function (q) { return q.opts.length >= 2 && q.opts.length <= 10 && q.opts.some(function (o) { return o.ok }) && q.body.length <= 3000 });
  return { topics: topics, qs: ok, bad: qs.length - ok.length } }
var IMP_SAMPLE = ["# Жасуша", "? Жасушаның энергия станциясы қай органоид?", "+ Митохондрия", "- Рибосома", "- Ядро", "", "# Ұлпалар", "2. Өсімдік ұлпаларын таңдаңыз", "а) Жабын ұлпасы *", "б) Сүйек ұлпасы", "в) Өткізгіш ұлпа *"].join("\n");
var IMP_SAMPLE_RU = ["# Клетка", "? Какой органоид — энергетическая станция клетки?", "+ Митохондрия", "- Рибосома", "- Ядро", "", "# Ткани", "2. Выберите ткани растений", "а) Покровная *", "б) Костная", "в) Проводящая *"].join("\n");
function openImport() {
  A.openLayer('<h3>' + esc(t("gtImport")) + '</h3><p class="gt-note" style="margin-top:10px">' + esc(t("gtImpHelp")) + ' ' + esc(t("gtImpAlt")) + '</p>' +
    '<form class="form gt-form" id="gt-impform"><textarea id="gt-imp" rows="12" placeholder="' + esc(st.lang === "kk" ? IMP_SAMPLE : IMP_SAMPLE_RU) + '"></textarea><p class="gt-note" id="gt-impstat">' + esc(f(t("gtImpFound"), { q: 0, t: 0 })) + '</p>' +
    '<div class="acts"><button type="button" class="btn btn-soft" data-close="1">' + esc(t("cancel")) + '</button><button class="btn btn-primary" type="submit" id="gt-impbtn" disabled>' + esc(t("gtImpDo")) + '</button></div></form>');
  setTimeout(function () { var x = document.getElementById("gt-imp"); if (x) x.focus() }, 30) }
function impPreview() {
  var P = parseImport(document.getElementById("gt-imp").value), s = document.getElementById("gt-impstat");
  s.textContent = f(t("gtImpFound"), { q: P.qs.length, t: P.topics.length }) + (P.bad ? " · " + f(t("gtImpBad"), { n: P.bad }) : "");
  document.getElementById("gt-impbtn").disabled = !P.qs.length }
function doImport() {
  var E = G.edit, P = parseImport(document.getElementById("gt-imp").value); if (!E || !P.qs.length) return;
  var btn = document.getElementById("gt-impbtn"); btn.disabled = true; btn.textContent = t("gtSending");
  var have = {}; E.topics.forEach(function (tp) { have[tp.title.toLowerCase()] = tp.id });
  var need = P.topics.filter(function (s) { return !have[s.toLowerCase()] }), pos0 = E.topics.reduce(function (m, x) { return Math.max(m, x.pos) }, -1) + 1;
  var mk = need.length ? sb.from("gt_topics").insert(need.map(function (s, i) { return { test_id: E.id, title: s.slice(0, 160), pos: pos0 + i } })).select("*") : Promise.resolve({ data: [] });
  mk.then(function (r) {
    if (r.error) throw r.error; (r.data || []).forEach(function (tp) { have[tp.title.toLowerCase()] = tp.id });
    var qpos = E.qs.reduce(function (m, x) { return Math.max(m, x.pos) }, -1) + 1;
    var rows = P.qs.map(function (q, i) { var opts = q.opts.map(function (o, k) { return { id: LET[k], t: o.t.slice(0, 500) } }), correct = q.opts.map(function (o, k) { return o.ok ? LET[k] : null }).filter(Boolean);
      return { test_id: E.id, topic_id: q.topic ? have[q.topic.toLowerCase()] || null : null, pos: qpos + i, kind: correct.length > 1 ? "multi" : "single", body: q.body, options: opts, correct: correct, points: 1 } });
    return sb.from("gt_questions").insert(rows) }).then(function (r) {
    if (r && r.error) throw r.error; A.closeLayer(); A.toast(f(t("gtImpDone"), { n: P.qs.length })); reloadEdit() }).catch(function () { btn.disabled = false; btn.textContent = t("gtImpDo"); A.toast(t("e_generic")) }) }

/* ------------------------------------------------------------ #teststat.<id> */
function loadStat(id) {
  if (G.busy["st" + id]) return; G.busy["st" + id] = 1;
  Promise.all([sb.from("gt_tests").select("*").eq("id", id).maybeSingle(), sb.from("gt_topics").select("*").eq("test_id", id).order("pos"), sb.from("gt_questions").select("*").eq("test_id", id).order("pos"), sb.rpc("gt_stats", { p_test: id })]).then(function (r) {
    G.busy["st" + id] = 0;
    G.stat = r[0].data && !r[3].error ? { id: id, test: r[0].data, topics: r[1].data || [], qs: r[2].data || [], d: r[3].data } : { id: id, error: "noAccess" }; rerender("teststat") }) }
function statCalc() {
  var S0 = G.stat, att = S0.d.attempts.filter(function (a) { return G.statCls === "all" || (a.grade || "") === G.statCls }), ids = {};
  att.forEach(function (a) { ids[a.id] = a; a.top = {} });
  var top = {}, qst = {};
  S0.d.answers.forEach(function (x) { var a = ids[x[0]]; if (!a) return; var tk = x[2] || "", p = +x[3], m = +x[4];
    var o = top[tk] = top[tk] || { p: 0, m: 0 }; o.p += p; o.m += m;
    var at = a.top[tk] = a.top[tk] || { p: 0, m: 0 }; at.p += p; at.m += m;
    var q = qst[x[1]] = qst[x[1]] || { p: 0, m: 0, n: 0, pick: {} }; q.p += p; q.m += m; q.n++; (x[5] || []).forEach(function (c) { q.pick[c] = (q.pick[c] || 0) + 1 }) });
  return { att: att, top: top, qst: qst } }
function pageStat() {
  var g = guard(); if (g) return g;
  if (!isT()) return shell('<div class="empty"><b>' + esc(t("noAccess")) + '</b></div>');
  var id = st.route.arg, S0 = G.stat;
  if (!S0 || S0.id !== id) { G.stat = null; loadStat(id); return shell(loading()) }
  if (S0.error) return shell(backLink() + '<div class="empty"><b>' + esc(t(S0.error)) + '</b></div>');
  var classes = []; S0.d.attempts.forEach(function (a) { var c = a.grade || ""; if (c && classes.indexOf(c) < 0) classes.push(c) }); classes.sort(clsSort);
  if (G.statCls !== "all" && classes.indexOf(G.statCls) < 0) G.statCls = "all";
  var C = statCalc(), n = C.att.length;
  var head = '<div class="gt-edhead">' + backLink() + '<div class="gt-btns">' + statusChip(S0.test.status) + '<a class="btn btn-soft" href="#testedit.' + id + '">' + gi("edit") + esc(t("gtEdit")) + '</a>' + (n ? '<button class="btn btn-soft" data-g="csv">' + gi("file") + esc(t("gtCsv")) + '</button>' : '') + '</div></div>' +
    '<p class="gt-meta gt-ch"><span class="chip">' + esc(S0.test.subject) + '</span> ' + esc([S0.test.grade ? f(t("gtGradeN"), { n: S0.test.grade }) : t("gtAllGrades"), f(t("gtQn"), { n: S0.qs.length })].join(" · ")) + '</p>';
  if (!S0.d.attempts.length) return shell(head + '<div class="empty"><b>' + esc(t("gtNoStats")) + '</b>' + (S0.d.in_progress ? '<p>' + esc(f(t("gtInProgress"), { n: S0.d.in_progress })) + '</p>' : '') + '</div>', S0.test.title, crumbT());
  var filt = classes.length > 1 ? '<div class="pills">' + ["all"].concat(classes).map(function (c) { return '<button data-g="statcls" data-a="' + esc(c) + '" aria-pressed="' + (G.statCls === c) + '">' + esc(c === "all" ? t("gtAllCls") : c) + '</button>' }).join("") + '</div>' : '';
  var avg = n ? Math.round(C.att.reduce(function (s, a) { return s + pct(+a.score, +a.max) }, 0) / n) : 0;
  var tnames = {}; S0.topics.forEach(function (x) { tnames[x.id] = x.title });
  var tl = Object.keys(C.top).map(function (k) { return { k: k, title: k ? tnames[k] || "?" : t("gtNoTopic"), p: pct(C.top[k].p, C.top[k].m) } }).sort(function (a, b) { return a.p - b.p });
  var tiles = '<div class="tiles"><div class="tile"><span class="ico">' + ic("users") + '</span><b class="tnum">' + n + '</b><span>' + esc(t("gtTook")) + '</span></div>' +
    '<div class="tile"><span class="ico">' + ic("chart") + '</span><b class="tnum gt-c-' + band(avg) + '">' + avg + '%</b><span>' + esc(t("gtAvg")) + '</span></div>' +
    '<div class="tile gt-wide"><span class="ico">' + ic("flask") + '</span><b class="gt-tt">' + esc(tl.length ? tl[0].title : "—") + (tl.length ? ' <span class="gt-c-' + band(tl[0].p) + '">' + tl[0].p + '%</span>' : '') + '</b><span>' + esc(t("gtWeakest")) + '</span></div></div>';
  var topicsP = '<div class="panel"><h3>' + esc(t("gtTopicMastery")) + '</h3><p class="gt-note" style="margin-top:-6px">' + esc(t("gtTopicMasteryHint")) + '</p>' + (tl.length ? tl.map(function (x) { return bar(esc(x.title), x.p, '', x.p < 50 ? '<em class="gt-flag">' + esc(t("gtRepeat")) + '</em>' : '') }).join("") : '<p class="hint">—</p>') + '</div>';
  var qn = {}; orderQs(S0.qs, S0.topics).forEach(function (q, i) { qn[q.id] = i + 1 });
  var ql = S0.qs.filter(function (q) { return C.qst[q.id] }).map(function (q) { var s = C.qst[q.id]; return { q: q, s: s, p: pct(s.p, s.m) } }).sort(function (a, b) { return a.p - b.p });
  var qP = '<div class="panel"><h3>' + esc(t("gtQStats")) + '</h3>' + ql.map(function (x) {
    var q = x.q, s = x.s;
    return '<details class="gt-qs"><summary>' + bar('<b>' + qn[q.id] + '.</b> ' + esc(q.body.length > 140 ? q.body.slice(0, 140) + "…" : q.body), x.p, esc((q.topic_id && tnames[q.topic_id] ? tnames[q.topic_id] + " · " : "") + f(t("gtCorrectPct"), { p: x.p }))) + '</summary>' +
      '<ul class="gt-ro">' + q.options.map(function (o) { var c = q.correct.indexOf(o.id) >= 0, k = s.pick[o.id] || 0;
        return '<li class="' + (c ? "c" : "") + '">' + gi(c ? "check" : "") + '<span>' + nl(o.t) + '</span><small class="gt-pick">' + esc(f(t("gtPicked"), { n: k })) + ' · ' + pct(k, s.n) + '%</small></li>' }).join("") + '</ul></details>' }).join("") + '</div>';
  var cols = S0.topics.map(function (x) { return { k: x.id, title: x.title } }); if (C.top[""]) cols.push({ k: "", title: t("gtNoTopic") });
  var stud = '<div class="panel"><h3>' + esc(t("gtStudents")) + '</h3><p class="gt-note" style="margin-top:-6px">' + esc(t("gtFirstOnly")) + (S0.d.total_attempts > S0.d.attempts.length ? ' (' + S0.d.total_attempts + ')' : '') + '</p><div class="gt-tablewrap"><table class="gt-table"><thead><tr><th>' + esc(t("gtName")) + '</th><th>' + esc(t("gtCls")) + '</th><th>%</th>' +
    cols.map(function (c) { return '<th title="' + esc(c.title) + '">' + esc(c.title.length > 18 ? c.title.slice(0, 17) + "…" : c.title) + '</th>' }).join("") + '<th>' + esc(t("gtDate")) + '</th><th></th></tr></thead><tbody>' +
    C.att.map(function (a) { var p = pct(+a.score, +a.max), sure = G.sure === "att" + a.id;
      return '<tr><td><a href="#testres.' + a.id + '">' + esc(a.name || "—") + '</a></td><td>' + esc(a.grade || "—") + '</td><td class="tnum gt-c-' + band(p) + '"><b>' + p + '</b></td>' +
        cols.map(function (c) { var o = a.top[c.k]; if (!o || !o.m) return '<td>—</td>'; var q = pct(o.p, o.m); return '<td class="tnum gt-c-' + band(q) + '">' + q + '</td>' }).join("") +
        '<td class="tnum">' + esc(day(a.finished_at)) + '</td><td><button class="gt-ib del' + (sure ? ' sure' : '') + '" data-g="delatt" data-a="' + a.id + '" title="' + esc(sure ? t("gtRetakeWarn") : t("gtAllowRetake")) + '">' + (sure ? '?' : gi("trash")) + '</button></td></tr>' }).join("") + '</tbody></table></div>' +
    (S0.d.in_progress ? '<p class="hint" style="text-align:left">' + esc(f(t("gtInProgress"), { n: S0.d.in_progress })) + '</p>' : '') + '</div>';
  return shell(head + filt + tiles + topicsP + qP + stud, S0.test.title, crumbT()) }
function delAttempt(id) {
  if (G.sure !== "att" + id) { G.sure = "att" + id; rerender("teststat"); return } G.sure = null;
  sb.from("gt_attempts").delete().eq("id", id).then(function (r) { if (r.error) { A.toast(t("e_generic")); return } var sid = G.stat.id; G.stat = null; G.ov = null; loadStat(sid) }) }
function csv() {
  var S0 = G.stat, C = statCalc(), cols = S0.topics.map(function (x) { return { k: x.id, title: x.title } }); if (C.top[""]) cols.push({ k: "", title: t("gtNoTopic") });
  var q = function (v) { v = String(v == null ? "" : v); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v };
  var lines = [[t("gtName"), t("gtCls"), "%", "score", "max"].concat(cols.map(function (c) { return c.title + " %" })).concat([t("gtDate")]).map(q).join(";")];
  C.att.forEach(function (a) { lines.push([a.name, a.grade, pct(+a.score, +a.max), +a.score, +a.max].concat(cols.map(function (c) { var o = a.top[c.k]; return o && o.m ? pct(o.p, o.m) : "" })).concat([String(a.finished_at || "").slice(0, 10)]).map(q).join(";")) });
  var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }), url = URL.createObjectURL(blob), el = document.createElement("a");
  el.href = url; el.download = (S0.test.title || "test").replace(/[\\/:*?"<>|]+/g, " ").trim() + ".csv"; document.body.appendChild(el); el.click(); el.remove(); setTimeout(function () { URL.revokeObjectURL(url) }, 2000) }

/* ------------------------------------------------------------ registration */
A.PAGES.tests = pageTests; A.PAGES.test = pageTake; A.PAGES.testres = pageResult; A.PAGES.testedit = pageEdit; A.PAGES.teststat = pageStat;
["tests", "test", "testres", "testedit", "teststat"].forEach(function (p) { A.PARENT[p] = "navEdu" });
A.TITLES.tests = function () { return t("navGT") };
A.TITLES.test = function () { return G.take && G.take.data ? G.take.data.test.title : t("navGT") };
A.TITLES.testres = function () { return t("gtResult") + " · " + t("navGT") };
A.TITLES.testedit = function () { return G.edit && G.edit.test ? G.edit.test.title : t("navGT") };
A.TITLES.teststat = function () { return t("gtStats") + " · " + t("navGT") };

document.addEventListener("click", function (e) {
  var el = e.target.closest("[data-g]"); if (!el) return; var d = el.dataset, a = d.a;
  switch (d.g) {
    case "tab": G.tab = a; G.sure = null; A.render(true); break;
    case "new": createTest(); break;
    case "copy": var url = location.origin + location.pathname + "#test." + a;
      try { navigator.clipboard.writeText(url).then(function () { A.toast(t("gtLinkCopied")) }, function () { prompt("", url) }) } catch (x) { prompt("", url) } break;
    case "ovsubj": G.ovSubj = G.ovSubj === a ? "all" : a; A.render(true); break;
    case "statcls": G.statCls = a; A.render(true); break;
    case "finish": askFinish(); break;
    case "dofinish": submitTake(); break;
    case "again": G.take = null; if (st.route.page === "test" && st.route.arg === a) A.render(); else location.hash = "test." + a; break;
    case "addtopic": addTopic(); break;
    case "deltopic": delTopic(a); break;
    case "mvtopic": swapPos("gt_topics", G.edit.topics, a, +d.b); break;
    case "addq": openQ(null, a || null); break;
    case "editq": openQ(a); break;
    case "delq": delQ(a); break;
    case "mvq": moveQ(a, +d.b); break;
    case "deltest": delTest(a); break;
    case "addopt": addOpt(); break;
    case "rmopt": var rows = document.querySelectorAll("#gq-opts .gt-optrow"); if (rows.length > 2) el.closest(".gt-optrow").remove(); break;
    case "rmimg": qImg = null; document.getElementById("gq-imgprev").innerHTML = ""; break;
    case "import": openImport(); break;
    case "delatt": delAttempt(a); break;
    case "csv": csv(); break;
  }
});
document.addEventListener("change", function (e) {
  var el = e.target, d = el.dataset || {};
  if (d.gq) { onAnswer(el); return }
  if (d.gtopic) { renameTopic(el); return }
  if (d.gqkind) { setKind(el.value); return }
  if (d.gsel === "ovcls") { G.ovCls = el.value; A.render(true); return }
  if (d.gqimg) { var fl = el.files[0], pv = document.getElementById("gq-imgprev"); if (!fl) return; pv.textContent = t("uploading");
    A.shrink(fl, 1200).then(A.uploadImg).then(function (src) { if (!src) { pv.textContent = t("upErr"); return } qImg = src; pv.innerHTML = imgPrev() }); return }
});
document.addEventListener("input", function (e) { if (e.target.id === "gt-imp") impPreview() });
document.addEventListener("submit", function (e) {
  var id = e.target.id; if (!/^gt-/.test(id)) return; e.preventDefault();
  if (id === "gt-set") saveSettings(); else if (id === "gt-addtopic") addTopic(); else if (id === "gt-qform") saveQ(e.target); else if (id === "gt-impform") doImport();
});
// warn before leaving a running test
window.addEventListener("beforeunload", function (e) { if (G.take && !G.take.preview && !G.take.error && st.route.page === "test" && !G.take.sending) { e.preventDefault(); e.returnValue = "" } });
});
