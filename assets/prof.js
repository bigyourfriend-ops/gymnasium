/* Мамандықтар әлемі — профориентация (#prof)
   Вкладки: тест (#prof.test), профессии (#prof.catalog), ЕНТ-навигатор (#prof.ent),
   карьерный паспорт (#prof.passport), статистика для школы (#prof.stats).
   Данные: assets/prof-data.js. База: MySQL на ps.kz, сервер — api/inc/rpc.php */
(window.GMPlugins = window.GMPlugins || []).push(function (A) {
  "use strict";
  var PD = window.PROF_DATA; if (!PD) return;
  var sb = A.sb, st = A.st, t = A.t, esc = A.esc, ic = A.ic, f = A.f;
  var TYPES = "RIASEC".split("");
  var PROJECT_ID = "pmvkvfii2463";            // проект «Мамандықтар әлемі» в разделе «Жобалар»
  var TABS = ["test", "catalog", "ent", "passport", "stats"];

  var S = {
    prT: ["Мамандықтар әлемі", "Мир профессий", "World of professions"],
    prLead: ["10–11 сынып оқушыларына арналған кәсіптік бағдар: өз бейіміңді анықта, мамандықтармен таныс және ҰБТ-ға қандай пәндерді таңдау керегін біл.",
      "Профориентация для 10–11 классов: узнай свои склонности, познакомься с профессиями и пойми, какие предметы выбрать на ЕНТ.", "Career guidance for grades 10–11."],
    prTab_test: ["Тест", "Тест", "Test"], prTab_catalog: ["Мамандықтар", "Профессии", "Professions"], prTab_ent: ["ҰБТ-навигатор", "ЕНТ-навигатор", "UNT navigator"],
    prTab_passport: ["Менің паспортым", "Мой паспорт", "My passport"], prTab_stats: ["Статистика", "Статистика", "Statistics"],
    prStart: ["Тестті бастау", "Начать тест", "Start the test"], prOpenTools: ["Ашу", "Открыть", "Open"],
    prTestT: ["Кәсіби бейімділік тесті", "Тест профессиональных склонностей", "Career interest test"],
    prTestD: ["36 тұжырым, 7–10 минут. Әрқайсысына шынайы жауап бер: «дұрыс» не «бұрыс» жауап жоқ. Нәтижеде сенің типің, лайық мамандықтар және ҰБТ пәндері шығады.",
      "36 утверждений, 7–10 минут. Отвечай честно — правильных и неправильных ответов нет. В результате — твой тип, подходящие профессии и предметы ЕНТ.", "36 statements, 7–10 minutes."],
    prGrade: ["Сыныбың", "Твой класс", "Your grade"], prGradeOther: ["Басқа", "Другое", "Other"],
    prQ: ["Сұрақ {a} / {b}", "Вопрос {a} из {b}", "Question {a} / {b}"],
    prA2: ["Иә, дәл мен туралы", "Да, это про меня", "Yes, that's me"], prA1: ["Кейде", "Иногда", "Sometimes"], prA0: ["Жоқ", "Нет", "No"],
    prKeys: ["Пернетақтамен: 1 — иә, 2 — кейде, 3 — жоқ", "С клавиатуры: 1 — да, 2 — иногда, 3 — нет", "Keys: 1 yes, 2 sometimes, 3 no"],
    prBack: ["Артқа", "Назад", "Back"], prRestart: ["Қайта тапсыру", "Пройти заново", "Retake"],
    prResT: ["Сенің нәтижең", "Твой результат", "Your result"], prYourCode: ["Сенің кодың", "Твой код", "Your code"],
    prMatch: ["Саған лайық мамандықтар", "Тебе подходят профессии", "Professions for you"],
    prPairsRec: ["ҰБТ-да таңдауға болатын пәндер", "Какие предметы выбрать на ЕНТ", "UNT subjects to consider"],
    prSaved: ["Нәтиже сақталды — «Менің паспортым» бөлімінде көре аласың.", "Результат сохранён — он есть во вкладке «Мой паспорт».", "Saved to your passport."],
    prSaveLogin: ["Нәтижені сақтау үшін сайтқа кір — сонда ол «Менің паспортымда» тұрады.", "Чтобы сохранить результат в «Мой паспорт», войди на сайт.", "Sign in to keep your result."],
    prNote: ["Тест — бағыт қана, үкім емес. Нәтижені ата-анаңмен, сынып жетекшімен немесе психологпен талқыла.", "Тест — подсказка, а не приговор. Обсуди результат с родителями, классным руководителем или психологом.", "The test is a hint, not a verdict."],
    prSearch: ["Мамандықты іздеу", "Поиск профессии", "Search professions"], prAllTypes: ["Барлығы", "Все", "All"],
    prDigital: ["Цифрлық және болашақ мамандықтары", "Цифровые и профессии будущего", "Digital & future"],
    prFuture: ["Болашақ", "Будущее", "Future"], prEntPair: ["ҰБТ пәндері", "Предметы ЕНТ", "UNT subjects"], prGroup: ["Білім беру бағдарламасы", "Группа программ", "Programme group"],
    prFav: ["Таңдаулыларға қосу", "В избранное", "Add to favourites"], prUnfav: ["Таңдаулылардан алу", "Убрать из избранного", "Remove"],
    prNone: ["Ештеңе табылмады", "Ничего не найдено", "Nothing found"], prMatchPct: ["{n}% сәйкес", "Совпадение {n}%", "{n}% match"],
    prEntT: ["ҰБТ-навигатор", "ЕНТ-навигатор", "UNT navigator"],
    prEntD: ["Бейіндік пәндердің жұбын таңда — қандай мамандықтарға (білім беру бағдарламаларының топтарына) түсе алатыныңды көресің.",
      "Выбери пару профильных предметов — увидишь, на какие специальности (группы образовательных программ) с ней можно поступать.", "Pick a pair of subjects."],
    prEntGroups: ["Түсуге болатын бағыттар", "Куда можно поступать", "Programme groups"], prEntProfs: ["Осы пәндермен мамандықтар", "Профессии с этими предметами", "Professions"],
    prEntUni: ["ЖОО мен гранттарды univision.kz сайтынан қара", "Вузы и гранты — на univision.kz", "Universities on univision.kz"],
    prEntSrc: ["Дереккөз: univision.kz (2026). Түсу алдында ережені testcenter.kz және ҒЖБМ сайтынан тексер.", "Источник: univision.kz (2026). Перед поступлением сверь правила на testcenter.kz и сайте МНВО.", "Source: univision.kz (2026)."],
    prPassT: ["Менің кәсіби паспортым", "Мой карьерный паспорт", "My career passport"],
    prPassD: ["Тест нәтижелерің мен таңдаған мамандықтарың осында сақталады. 11-сыныпта қайта тапсырып, өзгерісті көр.", "Здесь хранятся результаты тестов и выбранные профессии. В 11 классе пройди тест снова и сравни.", "Your results and favourites."],
    prPassLogin: ["Паспорт тек сайтқа кірген оқушыда сақталады. Қазір нәтиже тек осы құрылғыда тұр.", "Паспорт сохраняется, когда ты вошёл на сайт. Сейчас результат хранится только на этом устройстве.", "Sign in to keep your passport."],
    prSignIn: ["Кіру", "Войти", "Sign in"], prHistory: ["Тест тарихы", "История тестов", "History"], prNoRes: ["Әлі тест тапсырмадың.", "Ты ещё не проходил тест.", "No results yet."],
    prFavs: ["Таңдаулы мамандықтар", "Избранные профессии", "Favourite professions"], prNoFavs: ["«Мамандықтар» бөлімінде жұлдызшаны басып, мамандықты таңдаулыларға қос.", "Отмечай профессии звёздочкой во вкладке «Профессии».", "Star professions in the catalog."],
    prStatsT: ["Мектеп статистикасы", "Статистика школы", "School statistics"],
    prStatsD: ["Оқушылардың соңғы тест нәтижелері бойынша: қандай бағыттарға бейім. Тек психолог, директор және әкімшіге көрінеді.", "По последним результатам учеников: к каким направлениям они склонны. Видят только психолог, директор и администратор.", "Visible to staff only."],
    prTotal: ["Барлық нәтиже: {n}", "Всего результатов: {n}", "Results: {n}"], prByGrade: ["Сыныптар бойынша", "По классам", "By grade"],
    prTopType: ["Басым тип", "Ведущий тип", "Leading type"], prNoDB: ["Сервермен байланыс болмады. Бетті жаңартып көріңіз.", "Нет связи с сервером сайта. Обновите страницу.", "Server unavailable."],
    prVideos: ["Мамандар туралы видео мен материалдар", "Видео и материалы о профессиях", "Videos and materials"],
    prToolsT: ["Кәсіптік бағдар құралдары", "Инструменты профориентации", "Career tools"],
    prTool_test: ["7–10 минутта өз типіңді анықта", "Узнай свой тип за 7–10 минут", ""], prTool_catalog: ["{n} мамандық, ішінде цифрлық бағыттар", "{n} профессий, в том числе цифровые", ""],
    prTool_ent: ["14 пән жұбы және қай мамандыққа түсуге болады", "14 пар предметов и куда с ними поступать", ""], prTool_passport: ["Нәтижелерің мен таңдаулыларың", "Твои результаты и избранное", ""]
  };
  for (var k in S) A.T[k] = S[k];
  A.PARENT.prof = null;
  A.TITLES.prof = function () { return t("prT") };
  A.IC.compass = '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>';
  A.IC.layers = '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>';
  A.IC.route = '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>';
  A.IC.idcard = '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.6-1.5 1.8-2.3 3.2-2.3s2.6.8 3.2 2.3M14 10h4M14 13h3"/>';
  A.IC.bars = '<path d="M5 20V10M12 20V4M19 20v-7"/>';
  A.IC.starf = '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="currentColor"/>';
  A.IC.star0 = '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>';

  /* ---------- состояние ---------- */
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch (e) { return d } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } }
  var P = { idx: -1, ans: [], grade: lsGet("gm-prof-grade", ""), last: lsGet("gm-prof-last", null), favs: lsGet("gm-prof-favs", []),
    q: "", fType: "all", fDig: false, pair: "mi", history: null, hLoading: false, saveMsg: "", stats: null, sLoading: false, noDB: false, favSynced: false };
  function L(o) { return st.lang === "ru" ? o.ru : o.kk }
  function pname(p) { return st.lang === "ru" ? p[6] : p[5] }
  function pdesc(p) { return st.lang === "ru" ? p[8] : p[7] }
  function isStaff() { var p = st.perms || []; return p.indexOf("help") >= 0 || p.indexOf("director") >= 0 || p.indexOf("users") >= 0 }
  function tabs() { return TABS.filter(function (x) { return x !== "stats" || isStaff() }) }
  function curTab() { var a = st.route.arg; return tabs().indexOf(a) >= 0 ? a : "test" }
  function fmtD(ts) { var d = new Date(ts); if (isNaN(d)) return ""; var p = function (n) { return (n < 10 ? "0" : "") + n }; return A.fmtDate(d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate())) }

  /* ---------- расчёт ---------- */
  function compute(ans) {
    var sc = {}; TYPES.forEach(function (x) { sc[x] = 0 });
    PD.questions.forEach(function (q, i) { sc[q[0]] += ans[i] || 0 });
    var pct = {}; TYPES.forEach(function (x) { pct[x] = Math.round(sc[x] / 12 * 100) });
    var code = TYPES.slice().sort(function (a, b) { return pct[b] - pct[a] }).slice(0, 3).join("");
    return { pct: pct, code: code }
  }
  function matchPct(p, pct) { var ty = p[1].split(""); return Math.round(ty.length > 1 ? pct[ty[0]] * 0.6 + pct[ty[1]] * 0.4 : pct[ty[0]]) }
  function topProfs(pct, n) { return PD.profs.map(function (p) { return [p, matchPct(p, pct)] }).sort(function (a, b) { return b[1] - a[1] }).slice(0, n) }
  function topPairs(list) { var c = {}; list.forEach(function (x) { c[x[0][2]] = (c[x[0][2]] || 0) + x[1] }); return Object.keys(c).sort(function (a, b) { return c[b] - c[a] }).slice(0, 3) }

  /* ---------- общие куски ---------- */
  function hero() {
    var tb = tabs(), cur = curTab();
    return '<section class="pfhero"><div class="container"><nav class="crumbs" aria-label="breadcrumb"><a href="#home">' + esc(t("home")) + '</a><span>/</span><a href="#projects">' + esc(t("navProj")) + '</a><span>/</span><span class="cur">' + esc(t("prT")) + '</span></nav>' +
      '<div class="pfhero-in"><span class="pfbadge">' + ic("compass") + '</span><div><h1>' + esc(t("prT")) + '</h1><p>' + esc(t("prLead")) + '</p></div></div>' +
      '<nav class="pftabs" aria-label="' + esc(t("prT")) + '">' + tb.map(function (x) { return '<a href="#prof.' + x + '"' + (x === cur ? ' aria-current="page"' : '') + '>' + ic({ test: "compass", catalog: "layers", ent: "route", passport: "idcard", stats: "bars" }[x]) + '<span>' + esc(t("prTab_" + x)) + '</span></a>' }).join("") + '</nav></div></section>'
  }
  function typeBars(pct, big) {
    var order = TYPES.slice().sort(function (a, b) { return pct[b] - pct[a] });
    return '<div class="pfbars' + (big ? " big" : "") + '">' + order.map(function (x) { var ty = PD.types[x];
      return '<div class="pfbar"><span class="pfbar-l"><b style="color:' + ty.color + '">' + x + '</b> ' + esc(L(ty)) + '</span><span class="pfbar-t"><i style="width:' + pct[x] + '%;background:' + ty.color + '"></i></span><span class="pfbar-n tnum">' + pct[x] + '%</span></div>' }).join("") + '</div>'
  }
  function pairChip(id) { var pr = PD.pairs[id]; return '<a class="pfpair' + (pr.digital ? " dig" : "") + '" href="#prof.ent" data-pfpair="' + id + '">' + esc(L(pr)) + '</a>' }
  function profCard(p, pct) {
    var fav = P.favs.indexOf(p[0]) >= 0, m = pct ? matchPct(p, pct) : null;
    return '<article class="pfcard' + (p[4] ? " dig" : "") + '"><div class="pfcard-h"><div class="pftypes">' + p[1].split("").map(function (x) { return '<span style="background:' + PD.types[x].color + '" title="' + esc(L(PD.types[x])) + '">' + x + '</span>' }).join("") + '</div>' +
      (p[4] ? '<span class="pffut">' + esc(t("prFuture")) + '</span>' : '') +
      '<button type="button" class="pffav' + (fav ? " on" : "") + '" data-pffav="' + p[0] + '" aria-pressed="' + fav + '" title="' + esc(t(fav ? "prUnfav" : "prFav")) + '">' + ic(fav ? "starf" : "star0") + '</button></div>' +
      '<h3>' + esc(pname(p)) + '</h3><p>' + esc(pdesc(p)) + '</p>' +
      '<dl><dt>' + esc(t("prEntPair")) + '</dt><dd>' + pairChip(p[2]) + '</dd><dt>' + esc(t("prGroup")) + '</dt><dd>' + esc(p[3]) + ' · ' + esc(groupName(p[2], p[3])) + '</dd></dl>' +
      (m !== null ? '<span class="pfm" style="--m:' + m + '%">' + esc(f(t("prMatchPct"), { n: m })) + '</span>' : '') + '</article>'
  }
  function groupName(pair, code) { var g = (PD.pairs[pair].groups || []).filter(function (x) { return x[0] === code })[0]; return g ? (st.lang === "ru" ? g[2] : g[1]) : "" }

  /* ---------- тест ---------- */
  function tabTest() {
    var Q = PD.questions;
    if (P.idx < 0) {
      if (P.last) return resultView(P.last, true);
      return '<div class="pfintro panel"><span class="pfbig">' + ic("compass") + '</span><h2>' + esc(t("prTestT")) + '</h2><p>' + esc(t("prTestD")) + '</p>' +
        '<label class="pfgrade">' + esc(t("prGrade")) + '<select id="pf-grade">' + ["", "9", "10", "11", "other"].map(function (g) { return '<option value="' + g + '"' + (g === P.grade ? " selected" : "") + '>' + (g === "" ? "—" : g === "other" ? esc(t("prGradeOther")) : g) + '</option>' }).join("") + '</select></label>' +
        '<button class="btn btn-primary btn-lg" data-pf="start">' + esc(t("prStart")) + ' →</button>' +
        '<div class="pftypes6">' + TYPES.map(function (x) { var ty = PD.types[x]; return '<div><b style="background:' + ty.color + '">' + x + '</b><span>' + esc(L(ty)) + '</span></div>' }).join("") + '</div></div>'
    }
    var q = Q[P.idx], n = Q.length, prog = Math.round(P.idx / n * 100);
    return '<div class="pfq panel"><div class="pfq-top"><span class="tnum">' + esc(f(t("prQ"), { a: P.idx + 1, b: n })) + '</span><span class="pfprog"><i style="width:' + prog + '%"></i></span></div>' +
      '<h2 class="pfq-text">' + esc(st.lang === "ru" ? q[2] : q[1]) + '</h2>' +
      '<div class="pfans">' + [[2, "prA2"], [1, "prA1"], [0, "prA0"]].map(function (a) { return '<button type="button" class="pfa' + (P.ans[P.idx] === a[0] ? " on" : "") + '" data-pfans="' + a[0] + '">' + esc(t(a[1])) + '</button>' }).join("") + '</div>' +
      '<div class="pfq-foot">' + (P.idx > 0 ? '<button type="button" class="btn btn-soft" data-pf="back">← ' + esc(t("prBack")) + '</button>' : '<span></span>') + '<span class="hint pfkeys">' + esc(t("prKeys")) + '</span></div></div>'
  }
  function resultView(r, again) {
    var tp = topProfs(r.pct, 8), pairs = topPairs(tp), lead = PD.types[r.code[0]];
    return '<div class="pfres"><div class="panel pfres-h"><div><span class="eyebrow">' + esc(t("prResT")) + (r.at ? ' · ' + esc(fmtD(r.at)) : '') + '</span>' +
      '<div class="pfcode"><span>' + esc(t("prYourCode")) + '</span>' + r.code.split("").map(function (x) { return '<b style="background:' + PD.types[x].color + '">' + x + '</b>' }).join("") + '</div>' +
      '<h2>' + esc(r.code.split("").map(function (x) { return L(PD.types[x]) }).join(" · ")) + '</h2>' +
      '<p class="pflead">' + esc(st.lang === "ru" ? lead.dru : lead.dkk) + '</p>' + typeBars(r.pct, true) +
      (P.saveMsg ? '<p class="pfsaved">' + esc(t(P.saveMsg)) + (P.saveMsg === "prSaveLogin" ? ' <a href="#profile">' + esc(t("prSignIn")) + '</a>' : '') + '</p>' : '') +
      '<div class="btns"><button class="btn btn-soft" data-pf="restart">↻ ' + esc(t("prRestart")) + '</button><a class="btn btn-outline" href="#prof.passport">' + ic("idcard") + esc(t("prTab_passport")) + '</a></div></div></div>' +
      '<aside class="panel pfres-pairs"><h3>' + esc(t("prPairsRec")) + '</h3>' + pairs.map(function (id) { return pairChip(id) }).join("") + '<p class="hint" style="text-align:left">' + esc(t("prNote")) + '</p></aside></div>' +
      '<h2 class="h2">' + esc(t("prMatch")) + '</h2><div class="pfgrid">' + tp.map(function (x) { return profCard(x[0], r.pct) }).join("") + '</div></div>'
  }

  /* ---------- каталог ---------- */
  function tabCatalog() {
    var q = P.q.trim().toLowerCase(), r = P.last && P.last.pct;
    var list = PD.profs.filter(function (p) {
      if (P.fType !== "all" && p[1].indexOf(P.fType) < 0) return false;
      if (P.fDig && !p[4]) return false;
      return !q || (p[5] + " " + p[6] + " " + p[7] + " " + p[8]).toLowerCase().indexOf(q) >= 0
    });
    if (r) list.sort(function (a, b) { return matchPct(b, r) - matchPct(a, r) });
    return '<div class="pftools"><div class="tsearch"><span class="ts-ico">' + ic("search") + '</span><input id="pf-q" type="search" autocomplete="off" value="' + esc(P.q) + '" placeholder="' + esc(t("prSearch")) + '"></div>' +
      '<div class="pills pftypef"><button data-pft="all" aria-pressed="' + (P.fType === "all") + '">' + esc(t("prAllTypes")) + '</button>' + TYPES.map(function (x) { return '<button data-pft="' + x + '" aria-pressed="' + (P.fType === x) + '"><b style="color:' + PD.types[x].color + '">' + x + '</b> ' + esc(L(PD.types[x])) + '</button>' }).join("") + '</div>' +
      '<label class="pfdig"><input type="checkbox" id="pf-dig"' + (P.fDig ? " checked" : "") + '><span>' + ic("layers") + esc(t("prDigital")) + '</span></label></div>' +
      '<div class="pfgrid" id="pfcat">' + (list.length ? list.map(function (p) { return profCard(p, r) }).join("") : '<div class="empty"><b>' + esc(t("prNone")) + '</b></div>') + '</div>'
  }

  /* ---------- ЕНТ ---------- */
  function tabEnt() {
    var ids = Object.keys(PD.pairs), pr = PD.pairs[P.pair] || PD.pairs.mi;
    var profs = PD.profs.filter(function (p) { return p[2] === P.pair });
    return '<div class="panel pfent-h"><h2>' + esc(t("prEntT")) + '</h2><p>' + esc(t("prEntD")) + '</p></div>' +
      '<div class="pfent"><nav class="pfpairs" aria-label="' + esc(t("prEntT")) + '">' + ids.map(function (id) { var x = PD.pairs[id];
        return '<button type="button" data-pfpair="' + id + '" aria-pressed="' + (id === P.pair) + '"' + (x.digital ? ' class="dig"' : '') + '>' + esc(L(x)) + '<small>' + x.groups.length + '</small></button>' }).join("") + '</nav>' +
      '<section class="panel pfent-b"><h3>' + esc(L(pr)) + '</h3><h4>' + esc(t("prEntGroups")) + '</h4><ul class="pfgroups">' + pr.groups.map(function (g) { return '<li><b class="tnum">' + esc(g[0]) + '</b><span>' + esc(st.lang === "ru" ? g[2] : g[1]) + '</span></li>' }).join("") + '</ul>' +
      (profs.length ? '<h4>' + esc(t("prEntProfs")) + '</h4><div class="pfmini">' + profs.map(function (p) { return '<span' + (p[4] ? ' class="dig"' : '') + '>' + esc(pname(p)) + '</span>' }).join("") + '</div>' : '') +
      '<a class="btn btn-outline" href="' + esc(pr.url) + '" target="_blank" rel="noopener">' + ic("link") + esc(t("prEntUni")) + '</a><p class="hint pfsrc">' + esc(t("prEntSrc")) + '</p></section></div>'
  }

  /* ---------- паспорт ---------- */
  function tabPassport() {
    var hist = st.user ? (P.history || []) : (P.last ? [P.last] : []);
    if (st.user && P.history === null) loadHistory();
    var favs = PD.profs.filter(function (p) { return P.favs.indexOf(p[0]) >= 0 });
    return '<div class="panel pfpass-h"><span class="pfbig">' + ic("idcard") + '</span><div><h2>' + esc(t("prPassT")) + '</h2><p>' + esc(t("prPassD")) + '</p>' +
      (st.user ? '' : '<p class="pfsaved warn">' + esc(t("prPassLogin")) + ' <a href="#profile">' + esc(t("prSignIn")) + '</a></p>') + '</div></div>' +
      '<h2 class="h2">' + esc(t("prHistory")) + '</h2>' +
      (hist.length ? '<div class="pfhist">' + hist.map(function (r) { return '<article class="panel"><div class="pfhist-h"><div class="pfcode sm">' + r.code.split("").map(function (x) { return '<b style="background:' + PD.types[x].color + '">' + x + '</b>' }).join("") + '</div><span>' + esc(fmtD(r.at)) + (r.grade && r.grade !== "other" ? ' · ' + esc(f(t("grade"), { n: r.grade })) : '') + '</span></div>' + typeBars(r.pct) + '</article>' }).join("") + '</div>'
        : '<div class="empty"><b>' + esc(t("prNoRes")) + '</b><p style="margin-top:10px"><a class="btn btn-primary" href="#prof.test">' + esc(t("prStart")) + '</a></p></div>') +
      '<h2 class="h2">' + esc(t("prFavs")) + '</h2>' + (favs.length ? '<div class="pfgrid">' + favs.map(function (p) { return profCard(p, P.last && P.last.pct) }).join("") + '</div>' : '<div class="empty"><b>' + esc(t("prNoFavs")) + '</b></div>')
  }

  /* ---------- статистика ---------- */
  function tabStats() {
    if (!isStaff()) return '';
    if (P.noDB) return '<div class="panel"><p class="formmsg err">' + esc(t("prNoDB")) + '</p></div>';
    if (!P.stats) { loadStats(); return '<div class="panel"><p class="hint">' + esc(t("loading")) + '</p></div>' }
    var s = P.stats, tot = s.total || 0, by = s.by_type || {}, pct = {}; TYPES.forEach(function (x) { pct[x] = tot ? Math.round((by[x] || 0) / tot * 100) : 0 });
    return '<div class="panel"><h2>' + esc(t("prStatsT")) + '</h2><p class="hint" style="text-align:left;margin:0 0 14px">' + esc(t("prStatsD")) + '</p><p><b>' + esc(f(t("prTotal"), { n: tot })) + '</b></p>' + typeBars(pct, true) + '</div>' +
      ((s.by_grade || []).length ? '<div class="panel"><h3>' + esc(t("prByGrade")) + '</h3><div class="pfstab"><table><thead><tr><th>' + esc(t("prGrade")) + '</th><th>N</th>' + TYPES.map(function (x) { return '<th style="color:' + PD.types[x].color + '">' + x + '</th>' }).join("") + '</tr></thead><tbody>' +
        s.by_grade.map(function (g) { return '<tr><td>' + esc(g.grade === "other" ? t("prGradeOther") : g.grade || "—") + '</td><td class="tnum">' + g.n + '</td>' + TYPES.map(function (x) { var v = g[x] || 0; return '<td class="tnum"' + (v && v === Math.max.apply(null, TYPES.map(function (y) { return g[y] || 0 })) ? ' style="font-weight:800;color:' + PD.types[x].color + '"' : '') + '>' + v + '</td>' }).join("") + '</tr>' }).join("") +
        '</tbody></table></div><p class="hint" style="text-align:left">' + TYPES.map(function (x) { return x + ' — ' + L(PD.types[x]) }).join(" · ") + '</p></div>' : '')
  }

  function pageProf() {
    var tab = curTab(), body = { test: tabTest, catalog: tabCatalog, ent: tabEnt, passport: tabPassport, stats: tabStats }[tab]();
    return hero() + '<div class="container page pfpage">' + body + '</div>'
  }
  A.PAGES.prof = pageProf;

  /* ---------- блок на странице проекта «Мамандықтар әлемі» ---------- */
  var origProject = A.PAGES.project;
  A.PAGES.project = function () {
    var html = origProject.apply(this, arguments), p = (A.DATA.projects || []).filter(function (x) { return x.id === st.route.arg })[0];
    if (!p || !(p.id === PROJECT_ID || /мамандықтар|профессий/i.test((p.title && (p.title.kk + " " + p.title.ru)) || ""))) return html;
    var tools = '<section class="pftools-b"><h2 class="h2">' + esc(t("prToolsT")) + '</h2><div class="pftiles">' + ["test", "catalog", "ent", "passport"].map(function (x) {
      return '<a class="pftile pt-' + x + '" href="#prof.' + x + '"><span class="pftile-i">' + ic({ test: "compass", catalog: "layers", ent: "route", passport: "idcard" }[x]) + '</span><b>' + esc(t("prTab_" + x)) + '</b><small>' + esc(f(t("prTool_" + x), { n: PD.profs.length })) + '</small></a>' }).join("") + '</div>' +
      '<h2 class="h2" style="margin-top:28px">' + esc(t("prVideos")) + '</h2></section>';
    var mark = '<div class="toolbar ptools">', i = html.indexOf(mark);
    return i < 0 ? html : html.slice(0, i) + tools + html.slice(i)
  };

  /* ---------- база ---------- */
  function saveResult(r) {
    P.saveMsg = st.user ? "" : "prSaveLogin";
    if (!sb) return;
    sb.rpc("prof_save", { p_grade: r.grade || "", p_code: r.code, p_scores: r.pct }).then(function (x) {
      if (x.error) { P.noDB = /prof_|function|schema cache|PGRST2|42883/i.test((x.error.message || "") + x.error.code); return }
      if (st.user) { P.saveMsg = "prSaved"; P.history = null; P.stats = null; if (st.route.page === "prof") A.render(true) }
    })
  }
  function loadHistory() {
    if (!sb || !st.user || P.hLoading) return; P.hLoading = true;
    sb.from("prof_results").select("created_at,grade,code,scores").eq("user_id", st.user.id).order("created_at", { ascending: false }).limit(20).then(function (r) {
      P.hLoading = false; P.history = r.error ? [] : (r.data || []).map(function (x) { return { at: x.created_at, grade: x.grade, code: x.code, pct: x.scores } });
      if (st.route.page === "prof") A.render(true)
    })
  }
  function syncFavs(push) {
    if (!sb || !st.user) return;
    if (push) { sb.from("prof_favs").upsert({ user_id: st.user.id, favs: P.favs, updated_at: new Date().toISOString() }).then(function () { }); return }
    sb.from("prof_favs").select("favs").eq("user_id", st.user.id).maybeSingle().then(function (r) {
      if (r.error || !r.data) { if (P.favs.length) syncFavs(true); return }
      var merged = P.favs.slice(); (r.data.favs || []).forEach(function (x) { if (merged.indexOf(x) < 0) merged.push(x) });
      var changed = merged.length !== (r.data.favs || []).length; P.favs = merged; lsSet("gm-prof-favs", merged); if (changed) syncFavs(true);
      if (st.route.page === "prof") A.render(true)
    })
  }
  function loadStats() {
    if (!sb || P.sLoading) return; P.sLoading = true;
    sb.rpc("prof_stats").then(function (r) {
      P.sLoading = false; if (r.error) { P.noDB = true; P.stats = { total: 0 } } else P.stats = r.data || { total: 0 };
      if (st.route.page === "prof") A.render(true)
    })
  }

  /* ---------- события ---------- */
  function answer(v) {
    P.ans[P.idx] = v;
    if (P.idx < PD.questions.length - 1) { P.idx++; A.render(true); return }
    var r = compute(P.ans); r.at = new Date().toISOString(); r.grade = P.grade;
    P.last = r; lsSet("gm-prof-last", r); P.idx = -1; P.ans = []; saveResult(r); A.render(true);
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-pf],[data-pfans],[data-pft],[data-pffav],[data-pfpair]"); if (!el) return; var d = el.dataset;
    if (d.pf === "start") { var g = document.getElementById("pf-grade"); P.grade = g ? g.value : ""; lsSet("gm-prof-grade", P.grade); P.idx = 0; P.ans = []; P.saveMsg = ""; A.render(true); return }
    if (d.pf === "back") { if (P.idx > 0) P.idx--; A.render(true); return }
    if (d.pf === "restart") { P.last = null; lsSet("gm-prof-last", null); P.saveMsg = ""; P.idx = -1; if (st.route.arg !== "test") location.hash = "prof.test"; else A.render(true); return }
    if (d.pfans != null) { answer(+d.pfans); return }
    if (d.pft) { P.fType = d.pft; A.render(true); return }
    if (d.pffav) { e.preventDefault(); var i = P.favs.indexOf(d.pffav); if (i >= 0) P.favs.splice(i, 1); else P.favs.push(d.pffav); lsSet("gm-prof-favs", P.favs); syncFavs(true); A.render(true); return }
    if (d.pfpair) { P.pair = d.pfpair; if (el.tagName === "BUTTON") { e.preventDefault(); A.render(true) } return }
  });
  document.addEventListener("keydown", function (e) {
    if (st.route.page !== "prof" || curTab() !== "test" || P.idx < 0 || /input|textarea|select/i.test((e.target.tagName || ""))) return;
    var m = { "1": 2, "2": 1, "3": 0 }[e.key]; if (m != null) { e.preventDefault(); answer(m) }
    else if (e.key === "Backspace" && P.idx > 0) { e.preventDefault(); P.idx--; A.render(true) }
  });
  document.addEventListener("input", function (e) {
    if (e.target.id !== "pf-q") return; P.q = e.target.value;
    var r = P.last && P.last.pct, q = P.q.trim().toLowerCase(), box = document.getElementById("pfcat"); if (!box) return;
    var list = PD.profs.filter(function (p) { return (P.fType === "all" || p[1].indexOf(P.fType) >= 0) && (!P.fDig || p[4]) && (!q || (p[5] + " " + p[6] + " " + p[7] + " " + p[8]).toLowerCase().indexOf(q) >= 0) });
    if (r) list.sort(function (a, b) { return matchPct(b, r) - matchPct(a, r) });
    box.innerHTML = list.length ? list.map(function (p) { return profCard(p, r) }).join("") : '<div class="empty"><b>' + esc(t("prNone")) + '</b></div>'
  });
  document.addEventListener("change", function (e) { if (e.target.id === "pf-dig") { P.fDig = e.target.checked; A.render(true) } });

  A.onUser(function (u) { P.history = null; P.stats = null; P.noDB = false; if (u) syncFavs(false) });
});
