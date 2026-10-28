/* Директорға хат / Письмо директору (#director)
   Личная страница директора: фото, обращение, часы приёма и форма письма.
   Письмо получает код DR-XXXX-XXXX → по нему автор видит ответ директора и может дописать.
   Если автор вошёл на сайт и не выбрал «анонимно», письма видны ему в блоке «Менің хаттарым» без кода.
   Читать письма может только роль с правом «director» («Басқару панелі» → «Директорға хаттар»).
   База: MySQL на ps.kz, сервер — api/inc/rpc.php */
(window.GMPlugins = window.GMPlugins || []).push(function (A) {
  "use strict";

  var sb = A.sb, st = A.st, t = A.t, esc = A.esc, ic = A.ic, DATA = A.DATA;
  var pick = A.pick;

  /* ---------- строки ---------- */
  var S = {
    drT: ["Директорға хат", "Письмо директору", "Write to the principal"],
    drEye: ["Директордың жеке беті", "Личная страница директора", "Principal's page"],
    drLead: ["Ұсыныс, сұрақ, шағым немесе алғыс — хатыңызды тікелей директор оқиды. Хатты тек директор көреді, сайт әкімшісі де, басқа қызметкерлер де оқи алмайды.",
      "Предложение, вопрос, жалоба или благодарность — ваше письмо читает лично директор. Его видит только директор: ни администратор сайта, ни другие сотрудники прочитать его не могут.",
      "Your letter is read by the principal personally."],
    drWrite: ["Хат жазу", "Написать письмо", "Write a letter"],
    drHaveCode: ["Менде код бар", "У меня есть код", "I have a code"],
    drEdit: ["Бетті өңдеу", "Редактировать страницу", "Edit page"],
    drEditHint: ["Аты-жөні, лауазымы, санаттары, өтілі, өмірбаяны және суреті өзгереді. «Сақтау» басқанда бірден сайтқа шығады.", "Можно изменить ФИО, должность, категории, стаж, биографию и фото. После «Сақтау» изменения сразу появятся на сайте.", "Edit name, role, ranks, biography and photo."],
    drBioT: ["Директор туралы", "О директоре", "About the principal"],
    drMine: ["Менің хаттарым", "Мои письма", "My letters"],
    drHours: ["Қабылдау уақыты", "Приём граждан", "Office hours"],
    drSoon: ["нақтыланады", "уточняется", "to be confirmed"],
    drFormT: ["Директорға хат жазу", "Написать письмо директору", "Write to the principal"],
    drWho: ["Сіз кімсіз?", "Кто вы?", "Who are you?"],
    drR_parent: ["Ата-ана", "Родитель", "Parent"], drR_student: ["Оқушы", "Ученик", "Student"], drR_teacher: ["Мұғалім", "Учитель", "Teacher"],
    drR_graduate: ["Түлек", "Выпускник", "Graduate"], drR_other: ["Басқа", "Другое", "Other"],
    drTopic: ["Хат тақырыбы", "Тема обращения", "Topic"],
    drTp_question: ["Сұрақ", "Вопрос", "Question"], drTp_suggestion: ["Ұсыныс", "Предложение", "Suggestion"], drTp_complaint: ["Шағым", "Жалоба", "Complaint"],
    drTp_thanks: ["Алғыс", "Благодарность", "Thanks"], drTp_other: ["Басқа", "Другое", "Other"],
    drSubj: ["Қысқаша тақырып (міндетті емес)", "Кратко, о чём письмо (необязательно)", "Subject (optional)"],
    drBody: ["Хат мәтіні", "Текст письма", "Message"],
    drBodyPh: ["Жағдайды толық жазыңыз: не болды, қашан, қандай көмек күтесіз", "Опишите подробно: что произошло, когда, какой помощи вы ждёте", "Describe in detail"],
    drName: ["Аты-жөніңіз", "Ваше имя", "Your name"],
    drGrade: ["Сынып (бар болса)", "Класс (если есть)", "Grade (if any)"], drGradePh: ["мысалы, 7Ә", "например, 7Б", "e.g. 7B"],
    drContact: ["Байланыс: телефон немесе пошта (міндетті емес)", "Телефон или почта для связи (необязательно)", "Phone or email (optional)"],
    drContactPh: ["+7 7__ ___ __ __ немесе пошта", "+7 7__ ___ __ __ или почта", "+7… or email"],
    drAnon: ["Жасырын жіберу (атым мен байланысым көрсетілмесін)", "Отправить анонимно (без имени и контактов)", "Send anonymously"],
    drAnonNote: ["Жасырын хатқа директор жауабын тек код арқылы көре аласыз.", "Ответ на анонимное письмо можно увидеть только по коду.", "Anonymous replies are visible only with the code."],
    drOnly: ["Хатты тек директор оқиды", "Письмо читает только директор", "Only the principal reads it"],
    drSend: ["Жіберу", "Отправить", "Send"],
    drSentT: ["Хатыңыз директорға жіберілді!", "Письмо отправлено директору!", "Your letter was sent!"],
    drYourCode: ["Хатыңыздың коды", "Код вашего письма", "Your letter code"],
    drCodeNote: ["Кодты сақтаңыз немесе экранды суретке түсіріңіз. Осы код арқылы директордың жауабын көресіз және хатқа толықтыру жаза аласыз.",
      "Сохраните код или сфотографируйте экран. По нему вы увидите ответ директора и сможете дописать письмо.",
      "Save the code — you'll see the principal's reply with it."],
    drCodeMine: ["Сіз сайтқа кірдіңіз — хат «Менің хаттарым» бөлімінде де көрінеді.", "Вы вошли на сайт — письмо также появится в блоке «Мои письма».", "You're signed in — the letter also appears in My letters."],
    drCheckNow: ["Хатты ашу", "Открыть письмо", "Open letter"], drNewOne: ["Тағы хат жазу", "Написать ещё", "Write another"],
    drNextT: ["Хат қалай қаралады", "Как рассматривается письмо", "What happens next"],
    drN1: ["Хат бірден директорға түседі.", "Письмо сразу попадает к директору.", "The letter goes straight to the principal."],
    drN2: ["Директор оқып, әдетте {time} ішінде жауап береді.", "Директор читает и обычно отвечает в течение {time}.", "The principal usually replies within {time}."],
    drN3: ["Жауапты код арқылы немесе «Менің хаттарым» бөлімінен көресіз.", "Ответ вы увидите по коду или в блоке «Мои письма».", "See the reply with your code or in My letters."],
    drN4: ["Қажет болса, директор сізбен көрсетілген байланыс арқылы хабарласады.", "Если нужно, директор свяжется с вами по указанному контакту.", "If needed, the principal will contact you."],
    drAnswerIn: ["3 жұмыс күні", "3 рабочих дней", "3 working days"],
    drUrgT: ["Шұғыл мәселе болса", "Если вопрос срочный", "If it's urgent"],
    drUrgD: ["Хат жазбай, қабылдау бөліміне қоңырау шалыңыз:", "Не ждите ответа на письмо — позвоните в приёмную:", "Call the reception:"],
    drCodeT: ["Жауапты код бойынша көру", "Посмотреть ответ по коду", "Check the reply with a code"],
    drCodeL: ["Хат коды", "Код письма", "Letter code"], drOpen: ["Ашу", "Открыть", "Open"],
    drNotFound: ["Мұндай код табылмады. Дұрыс жазылғанын тексеріңіз.", "Код не найден. Проверьте, правильно ли он введён.", "Code not found."],
    drExit: ["Жабу", "Закрыть", "Close"],
    drYou: ["Сіз", "Вы", "You"], drDir: ["Директор", "Директор", "Principal"],
    drNoReply: ["Директор әлі жауап бермеді. Кейінірек қайта кіріңіз.", "Директор ещё не ответил. Загляните позже.", "No reply yet. Check back later."],
    drAdd: ["Хатқа толықтыру", "Дописать к письму", "Add to the letter"],
    drMineNone: ["Сізде әлі хат жоқ.", "У вас пока нет писем.", "No letters yet."],
    drMineHint: ["Сайтқа кіріп, жасырын емес жіберілген хаттар осында көрінеді.", "Здесь видны письма, отправленные не анонимно, когда вы вошли на сайт.", "Letters you sent while signed in."],
    drNewReply: ["Жаңа жауап", "Новый ответ", "New reply"],
    drst_new: ["Жіберілді", "Отправлено", "Sent"], drst_in_progress: ["Қаралуда", "Рассматривается", "In progress"], drst_closed: ["Жабылды", "Закрыто", "Closed"],
    e_drShort: ["Хатты сәл толығырақ жазыңыз (кемінде 10 таңба).", "Напишите чуть подробнее (не меньше 10 символов).", "Please write at least 10 characters."],
    e_drRate: ["Сіз жақында хат жібердіңіз. Біраз уақыттан кейін қайталаңыз.", "Вы недавно уже писали. Попробуйте чуть позже.", "You wrote recently. Try later."],
    e_drFast: ["Тым жылдам жіберілді. Бірнеше секундтан кейін қайта басыңыз.", "Отправлено слишком быстро. Нажмите ещё раз через пару секунд.", "Too fast. Try again in a few seconds."],
    e_drDown: ["Қазір жіберу мүмкін болмады. Кейінірек қайталаңыз немесе қабылдау бөліміне қоңырау шалыңыз.", "Сейчас не получилось отправить. Попробуйте позже или позвоните в приёмную.", "Couldn't send right now."],
    navDir: ["Директорға хат", "Письмо директору", "Write to the principal"],
    f_dirHours: ["Директордың қабылдау уақыты", "Часы приёма директора", "Principal's office hours"],
    /* панель директора */
    d_dir: ["Директорға жаңа хаттар", "Новые письма директору", "New letters"],
    p_dir: ["Директорға хаттар", "Письма директору", "Letters"],
    perm_director: ["Директорға хаттарды оқу (тек директор)", "Письма директору (только директор)", "Letters to the principal"],
    da_hint: ["Хатты тек «director» құқығы бар рөл көреді. Автор жауапты код арқылы немесе өз кабинетінен көреді — оған хабарлама жіберілмейді. Байланыс көрсетілсе, қажет кезде өзіңіз хабарласыңыз.",
      "Письма видит только роль с правом «director». Автор видит ответ по коду или в своём блоке «Мои письма» — уведомление ему не приходит. Если указан контакт, при необходимости свяжитесь сами.",
      "Only the director role can see letters."],
    da_new: ["Жаңа", "Новые", "New"], da_in_progress: ["Қаралуда", "В работе", "In progress"], da_closed: ["Жабылған", "Закрытые", "Closed"], da_spam: ["Спам", "Спам", "Spam"],
    da_none: ["Бұл бөлімде хат жоқ", "В этом разделе писем нет", "No letters here"],
    da_read: ["Оқылды", "Прочитано", "Mark read"], da_take: ["Қарауға алу", "Взять в работу", "Take"], da_close: ["Жабу", "Закрыть", "Close"],
    da_reopen: ["Қайта ашу", "Открыть снова", "Reopen"], da_spamB: ["Спам", "Спам", "Spam"],
    da_reply: ["Жауап беру", "Ответить", "Reply"], da_replyPh: ["Жауабыңызды жазыңыз — автор оны код арқылы көреді", "Напишите ответ — автор увидит его по коду", "Write a reply"],
    da_author: ["Автор", "Автор", "Author"], da_anon: ["Жасырын", "Анонимно", "Anonymous"], da_contact: ["Байланыс", "Контакт", "Contact"],
    da_signed: ["сайттағы аккаунттан", "с аккаунта на сайте", "signed in"],
    da_noDB: ["Сервермен байланыс болмады. Бетті жаңартып көріңіз.", "Нет связи с сервером сайта. Обновите страницу.", "Server unavailable."],
    da_noRight: ["Бұл бөлімді тек «Директор» рөлі көреді.", "Этот раздел видит только роль «Директор».", "Only the director role can see this."]
  };
  for (var k in S) A.T[k] = S[k];
  if (A.PERMS.indexOf("director") < 0) A.PERMS.push("director");
  A.PARENT.director = null;
  A.TITLES.director = function () { return t("drT") };
  A.IC.inbox = '<path d="M4 13l2.5-7h11L20 13v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 13h4.5l1 2h5l1-2H20"/>';
  A.IC.clock = '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>';
  A.IC.send = '<path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>';
  A.IC.lockd = '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>';

  /* ---------- состояние ---------- */
  var D = { start: 0, sentCode: "", sentMine: false, code: "", thread: null, busy: false, mine: null, mineLoading: false, openId: null,
    adm: null, admStatus: "new", admLoading: false, noDB: false, sure: null };
  function isDir() { return (st.perms || []).indexOf("director") >= 0 }
  function c(o) { return (o && (o[st.lang] || o.ru || o.kk)) || "" }
  function fmt(ts) { var d = new Date(ts); if (isNaN(d)) return ""; var p = function (n) { return (n < 10 ? "0" : "") + n }; return A.fmtDate(d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate())) + ", " + p(d.getHours()) + ":" + p(d.getMinutes()) }
  function tel(n) { return "tel:" + String(n).replace(/[^\d+]/g, "") }
  function errKey(e) { var m = ((e && e.message) || "") + " " + ((e && e.code) || ""); return /rate/i.test(m) ? "e_drRate" : /too_fast/i.test(m) ? "e_drFast" : /too_short/i.test(m) ? "e_drShort" : "e_drDown" }
  function setMsg(id, key) { var m = document.getElementById(id); if (!m) return; m.hidden = false; m.className = "formmsg err"; m.textContent = t(key) }
  function director() {
    var staff = DATA.staff || [];
    return staff.filter(function (x) { return x.group === "admin" && /директор|principal/i.test(pick(x.role) || "") && !/орынбасар|заместит|deputy/i.test(pick(x.role) || "") })[0] ||
      staff.filter(function (x) { return x.group === "admin" })[0] || null
  }
  function ava(d) {
    var ini = d ? (d.name || "?").split(/\s+/).slice(0, 2).map(function (w) { return w[0] || "" }).join("") : "";
    return '<span class="drava">' + (d && d.img ? '<img src="' + esc(d.img) + '" alt="">' : esc(ini) || ic("user")) + '</span>'
  }

  /* ---------- страница ---------- */
  function hero() {
    var d = director(), s = DATA.settings || {}, msg = c(s.dirText), B = "assets/brand/";
    var quote = (msg || "").split(/\n+/).filter(Boolean).map(function (x) { return '<p>' + esc(x) + '</p>' }).join("");
    var bio = ((d && c(d.bio)) || "").split(/\n+/).map(function (x) { return x.trim() }).filter(Boolean);
    var ini = d ? (d.name || "?").split(/\s+/).slice(0, 2).map(function (w) { return w[0] || "" }).join("") : "";
    var chips = [];
    if (d && d.rank && d.rank !== "none") chips.push('<li>' + ic("cap") + esc(t("rk_" + d.rank)) + '</li>');
    if (d && d.mrank && d.mrank !== "none") chips.push('<li>' + ic("star") + esc(t("mr_" + d.mrank)) + '</li>');
    if (d && d.exp) chips.push('<li>' + ic("clock") + esc(A.f(t("msExp"), { n: d.exp })) + '</li>');
    return '<section class="drx"><img class="drx-bar" src="' + B + 'phor.webp" alt="" aria-hidden="true"><div class="container">' +
      '<nav class="crumbs" aria-label="breadcrumb"><a href="#home">' + esc(t("home")) + '</a><span>/</span><span class="cur">' + esc(t("drT")) + '</span></nav>' +
      '<div class="drx-grid"><aside class="drx-side"><div class="drx-portrait"><img class="drx-orn" src="' + B + 'pvert.webp" alt="" aria-hidden="true">' +
      '<div class="drx-photo">' + (d && d.img ? '<img src="' + esc(d.img) + '" alt="' + esc(d.name) + '">' : '<span>' + esc(ini) + '</span>') + '</div>' +
      '<div class="drx-plate"><img src="' + B + 'logo.webp" alt="" aria-hidden="true"><span>' + esc(t("name")) + '</span></div></div>' +
      '<div class="drx-cta"><a class="btn btn-primary btn-lg" href="#director.write">' + ic("send") + esc(t("drWrite")) + '</a>' +
      (st.user ? '<a class="btn btn-outline btn-lg" href="#director.mine">' + ic("inbox") + esc(t("drMine")) + mineBadge() + '</a>' : '') +
      '<a class="btn btn-soft btn-lg" href="#director.code">' + esc(t("drHaveCode")) + '</a>' +
      '<p class="drx-priv">' + ic("lockd") + '<span>' + esc(t("drLead")) + '</span></p></div></aside>' +
      '<div class="drx-main">' + (d && A.can("about") ? '<button type="button" class="btn btn-soft drx-edit" data-edit="staff" data-id="' + esc(d.id) + '" data-drqp="1" title="' + esc(t("drEditHint")) + '">' + ic("edit") + esc(t("drEdit")) + '</button>' : '') + '<span class="drx-eye">' + esc(t("drEye")) + '</span><h1>' + esc(d ? d.name : t("drDir")) + '</h1>' +
      '<span class="drx-role">' + esc(d ? pick(d.role) : "") + '</span>' +
      '<img class="drx-div" src="' + B + 'divider.webp" alt="" aria-hidden="true">' +
      (chips.length ? '<ul class="drx-chips">' + chips.join("") + '</ul>' : '') +
      (bio.length ? '<div class="drx-bio">' + bio.map(function (x, i) { return '<p' + (i ? '' : ' class="lead1"') + '>' + esc(x) + '</p>' }).join("") + '</div>' : '') +
      (quote ? '<blockquote class="drx-quote">' + quote + '</blockquote>' : '') +
      '</div></div></div></section>'
  }
  function mineBadge() { var n = D.mine ? D.mine.filter(function (x) { return x.unread }).length : 0; return n ? ' <i class="abadge">' + n + '</i>' : '' }
  function radios(name, list, pre, cur) {
    return list.map(function (v) { return '<label class="hlradio"><input type="radio" name="' + name + '" value="' + v + '"' + (v === cur ? " checked" : "") + '><span>' + esc(t(pre + v)) + '</span></label>' }).join("")
  }
  function form() {
    if (D.sentCode) return sentPanel();
    D.start = Date.now(); var dis = sb ? "" : " disabled", p = st.profile || {}, um = (st.user && st.user.user_metadata) || {};
    var role = p.role || um.role; role = ["parent", "student", "teacher"].indexOf(role) >= 0 ? role : "parent";
    var nm = p.full_name || um.full_name || "", gr = p.grade || "", ph = p.phone || (st.user && st.user.email) || "";
    return '<div class="panel hlform" id="write"><h3>' + esc(t("drFormT")) + '</h3>' + (sb ? "" : '<p class="formmsg err">' + esc(t("e_drDown")) + '</p>') +
      '<form class="form" id="drForm" novalidate>' +
      '<fieldset class="hlwho"' + dis + '><legend>' + esc(t("drWho")) + '</legend>' + radios("dr-role", ["parent", "student", "teacher", "graduate", "other"], "drR_", role) + '</fieldset>' +
      '<fieldset class="hlwho"' + dis + '><legend>' + esc(t("drTopic")) + '</legend>' + radios("dr-topic", ["question", "suggestion", "complaint", "thanks", "other"], "drTp_", "question") + '</fieldset>' +
      '<label>' + esc(t("drSubj")) + '<input id="dr-subj" maxlength="120" autocomplete="off"' + dis + '></label>' +
      '<label>' + esc(t("drBody")) + '<textarea id="dr-body" maxlength="4000" rows="7" placeholder="' + esc(t("drBodyPh")) + '"' + dis + '></textarea><small class="cnt" id="dr-cnt">0 / 4000</small></label>' +
      '<div id="dr-ident"><div class="row2"><label>' + esc(t("drName")) + '<input id="dr-name" maxlength="80" autocomplete="name" value="' + esc(nm) + '"' + dis + '></label>' +
      '<label>' + esc(t("drGrade")) + '<input id="dr-grade" maxlength="12" autocomplete="off" placeholder="' + esc(t("drGradePh")) + '" value="' + esc(gr) + '"' + dis + '></label></div>' +
      '<label>' + esc(t("drContact")) + '<input id="dr-contact" maxlength="150" autocomplete="tel" placeholder="' + esc(t("drContactPh")) + '" value="' + esc(ph) + '"' + dis + '></label></div>' +
      '<label class="hlcheck"><input type="checkbox" id="dr-anon"' + dis + '><span>' + esc(t("drAnon")) + '</span></label>' +
      '<p class="hint drnote" id="dr-anon-note" hidden>' + esc(t("drAnonNote")) + '</p>' +
      '<label class="hp" aria-hidden="true">Website<input id="dr-website" tabindex="-1" autocomplete="off"></label>' +
      '<p class="formmsg" id="drmsg" hidden></p><div class="hlsend"><span class="hint">' + ic("lockd") + esc(t("drOnly")) + '</span><button class="btn btn-primary btn-lg" type="submit"' + dis + '>' + ic("send") + esc(t("drSend")) + '</button></div></form></div>'
  }
  function sentPanel() {
    return '<div class="panel hlform hlsent" id="write"><span class="hlok">' + ic("send") + '</span><h3>' + esc(t("drSentT")) + '</h3><p class="hlcode-l">' + esc(t("drYourCode")) + '</p>' +
      '<div class="hlcode"><span class="tnum">' + esc(D.sentCode) + '</span><button class="copy" data-copy="' + esc(D.sentCode) + '">' + esc(t("copy")) + '</button></div>' +
      '<p class="hlcodenote">' + esc(t("drCodeNote")) + (D.sentMine ? ' ' + esc(t("drCodeMine")) : '') + '</p>' +
      '<div class="btns" style="justify-content:center"><button class="btn btn-primary" data-dr="opensent">' + esc(t("drCheckNow")) + '</button><button class="btn btn-soft" data-dr="new">' + esc(t("drNewOne")) + '</button></div></div>'
  }
  function side() {
    var phone = (DATA.settings || {}).phone;
    return '<aside class="hlside"><div class="panel"><h3>' + esc(t("drNextT")) + '</h3><ol class="hlsteps">' +
      [t("drN1"), A.f(t("drN2"), { time: t("drAnswerIn") }), t("drN3"), t("drN4")].map(function (s) { return '<li>' + esc(s) + '</li>' }).join("") + '</ol></div>' +
      (phone ? '<div class="panel hlwit"><h3>' + ic("phone") + esc(t("drUrgT")) + '</h3><p>' + esc(t("drUrgD")) + '</p><p><a class="hltel tnum" href="' + tel(phone) + '">' + esc(phone) + '</a></p></div>' : '') + '</aside>'
  }
  function bubbles(msgs, mineSide) {
    return '<div class="hlthread">' + msgs.map(function (m) {
      var me = m.author === mineSide;
      return '<div class="hlbub ' + (me ? "me" : "them") + (m.author === "director" ? " drbub" : "") + '"><small>' + esc(m.author === "director" ? t("drDir") : mineSide === "author" ? t("drYou") : t("da_author")) + ' · ' + esc(fmt(m.created_at)) + '</small><p>' + esc(m.body) + '</p></div>'
    }).join("") + '</div>'
  }
  function threadView(th, formId, extra) {
    var msgs = [{ author: "author", body: th.body, created_at: th.created_at }].concat(th.messages || []);
    var any = msgs.some(function (m) { return m.author === "director" });
    return '<div class="drtopic"><span class="chip">' + esc(t("drTp_" + th.topic)) + '</span>' + (th.subject ? '<b>' + esc(th.subject) + '</b>' : '') + '</div>' +
      bubbles(msgs, "author") + (any ? "" : '<p class="hint" style="text-align:left">' + esc(t("drNoReply")) + '</p>') +
      '<form class="form" id="' + formId + '"' + (extra || "") + ' novalidate><label>' + esc(t("drAdd")) + '<textarea maxlength="3000" rows="3"></textarea></label><p class="formmsg" hidden></p><div class="acts"><button class="btn btn-primary" type="submit">' + esc(t("drSend")) + '</button></div></form>'
  }
  function codeBox() {
    var body;
    if (D.thread) {
      body = '<div class="hlthread-h"><span class="chip hls-' + esc(D.thread.status) + '">' + esc(t("drst_" + D.thread.status)) + '</span><button class="btn btn-soft" data-dr="exit">' + esc(t("drExit")) + '</button></div>' + threadView(D.thread, "drReply");
    } else {
      body = '<form class="form hlcodeform" id="drCode" novalidate><label>' + esc(t("drCodeL")) + '<input id="dr-code" maxlength="20" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="DR-XXXX-XXXX"' + (sb ? "" : " disabled") + '></label><button class="btn btn-primary" type="submit"' + (sb ? "" : " disabled") + '>' + esc(t("drOpen")) + '</button></form><p class="formmsg" id="drcmsg" hidden></p>';
    }
    return '<section class="panel hlcodebox" id="code"><h3>' + esc(t("drCodeT")) + '</h3>' + body + '</section>'
  }
  function mineBox() {
    if (!st.user || !sb) return "";
    if (D.mine === null) { loadMine(); return '<section class="panel hlcodebox" id="mine"><h3>' + esc(t("drMine")) + '</h3><p class="hint">' + esc(t("loading")) + '</p></section>' }
    var list = D.mine;
    return '<section class="panel hlcodebox" id="mine"><h3>' + esc(t("drMine")) + '</h3><p class="hint" style="text-align:left;margin:0 0 12px">' + esc(t("drMineHint")) + '</p>' +
      (list.length ? '<div class="drmine">' + list.map(function (x) {
        var open = D.openId === x.id, last = (x.messages || []).slice(-1)[0];
        return '<article class="drletter' + (open ? " open" : "") + (x.unread ? " unread" : "") + '"><button class="drl-h" data-drmine="' + x.id + '" aria-expanded="' + open + '">' +
          '<span class="chip hls-' + esc(x.status) + '">' + esc(t("drst_" + x.status)) + '</span><b>' + esc(x.subject || t("drTp_" + x.topic)) + '</b>' +
          (x.unread ? '<span class="drnew">' + esc(t("drNewReply")) + '</span>' : '') + '<small>' + esc(fmt(last ? last.created_at : x.created_at)) + '</small></button>' +
          (open ? '<div class="drl-b">' + threadView(x, "drMineReply", ' data-id="' + x.id + '"') + '</div>' : '') + '</article>'
      }).join("") + '</div>' : '<div class="empty"><b>' + esc(t("drMineNone")) + '</b></div>') + '</section>'
  }
  function bioBox() {
    var d = director(), bio = d && c(d.bio);
    if (!bio) return "";
    var paras = bio.split(/\n+/).map(function (x) { return x.trim() }).filter(Boolean);
    return '<section class="panel drbio"><h2 class="h2">' + esc(t("drBioT")) + '</h2>' + paras.map(function (x) { return '<p>' + esc(x) + '</p>' }).join("") + '</section>'
  }
  function pageDirector() {
    return hero() + '<div class="container page hlpage drpage"><section class="hlgrid">' + form() + side() + '</section>' + mineBox() + codeBox() + '</div>'
  }
  A.PAGES.director = pageDirector;

  window.GMDir = {
    badge: function () { return D.adm ? D.adm.filter(function (r) { return r.dir_unread && r.status !== "spam" }).length : 0 },
    adminTab: adminTab,
    preload: function () { if (isDir() && !D.adm) loadAdm() },
    isDir: isDir
  };

  /* прокрутка к #director.write / .code / .mine */
  function scrollSec() { if (st.route.page !== "director" || !st.route.arg) return; setTimeout(function () { var el = document.getElementById(st.route.arg); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); var f = el && el.querySelector("textarea,input[type=text],input:not([type])"); if (f && st.route.arg === "code") f.focus({ preventScroll: true }) }, 30) }
  window.addEventListener("hashchange", scrollSec);
  setTimeout(scrollSec, 400);

  /* ---------- автор ---------- */
  function submit(form) {
    var g = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : "" };
    var body = g("dr-body"); if (body.length < 10) { setMsg("drmsg", "e_drShort"); return }
    if (D.busy) return; D.busy = true; var b = form.querySelector("button[type=submit]"); b.disabled = true;
    var rv = function (n) { return (form.querySelector("input[name=" + n + "]:checked") || {}).value }, anon = document.getElementById("dr-anon").checked;
    sb.rpc("dir_submit", { p_role: rv("dr-role") || "other", p_topic: rv("dr-topic") || "question", p_subject: g("dr-subj"), p_body: body, p_name: g("dr-name"), p_grade: g("dr-grade"),
      p_contact: g("dr-contact"), p_anon: anon, p_hp: g("dr-website"), p_elapsed: Math.round((Date.now() - D.start) / 1000) })
      .then(function (r) {
        D.busy = false; b.disabled = false;
        if (r.error || !r.data) { setMsg("drmsg", errKey(r.error)); return }
        D.sentCode = r.data; D.sentMine = !!st.user && !anon; if (D.sentMine) D.mine = null;
        A.render(true); var w = document.getElementById("write"); if (w) w.scrollIntoView({ block: "center" })
      }, function () { D.busy = false; b.disabled = false; setMsg("drmsg", "e_drDown") })
  }
  function openCode(code) {
    code = String(code || "").trim().toUpperCase(); if (!code) return;
    sb.rpc("dir_thread", { p_code: code }).then(function (r) {
      if (r.error) { setMsg("drcmsg", errKey(r.error)); return }
      if (!r.data) { setMsg("drcmsg", "drNotFound"); return }
      D.code = code; D.thread = r.data; A.render(true); var el = document.getElementById("code"); if (el) el.scrollIntoView({ block: "start" })
    })
  }
  function loadMine() {
    if (!sb || !st.user || D.mineLoading) return; D.mineLoading = true;
    sb.rpc("dir_my_letters").then(function (r) { D.mineLoading = false; D.mine = r.error ? [] : (r.data || []); if (st.route.page === "director") A.render(true) })
  }
  function authorReply(form, code, id) {
    var ta = form.querySelector("textarea"), v = ta.value.trim(), m = form.querySelector(".formmsg"); if (!v || D.busy) return; D.busy = true;
    sb.rpc("dir_author_reply", { p_code: code || "", p_id: id || null, p_body: v }).then(function (r) {
      D.busy = false;
      if (r.error) { if (m) { m.hidden = false; m.className = "formmsg err"; m.textContent = t(errKey(r.error)) } return }
      if (code) openCode(code); else { D.mine = null; loadMine() }
    })
  }

  /* ---------- панель директора ---------- */
  function loadAdm() {
    if (!sb || D.admLoading || !isDir()) return; D.admLoading = true;
    sb.from("dir_letters").select("*").order("last_activity", { ascending: false }).limit(300).then(function (r) {
      if (r.error) { D.admLoading = false; D.noDB = /dir_letters|relation|schema cache|PGRST205|42P01/i.test((r.error.message || "") + r.error.code); D.adm = []; A.render(true); return }
      var rows = r.data || [], ids = rows.map(function (x) { return x.id });
      if (!ids.length) { D.admLoading = false; D.adm = rows; A.render(true); return }
      sb.from("dir_messages").select("*").in("letter_id", ids).order("created_at").then(function (m) {
        D.admLoading = false; var by = {}; (m.data || []).forEach(function (x) { (by[x.letter_id] = by[x.letter_id] || []).push(x) });
        rows.forEach(function (x) { x.msgs = by[x.id] || [] }); D.adm = rows; A.render(true)
      })
    })
  }
  function upd(id, patch) {
    sb.from("dir_letters").update(patch).eq("id", id).then(function (r) {
      if (r.error) { A.toast(t("e_generic")); return }
      D.adm.forEach(function (x) { if (String(x.id) === String(id)) for (var k in patch) x[k] = patch[k] }); A.render(true)
    })
  }
  function adminTab() {
    if (!isDir()) return '<div class="panel"><p class="hint">' + esc(t("da_noRight")) + '</p></div>';
    if (!D.adm) { loadAdm(); return '<div class="panel"><p class="hint">' + esc(t("loading")) + '</p></div>' }
    if (D.noDB) return '<div class="panel"><p class="formmsg err">' + esc(t("da_noDB")) + '</p></div>';
    var SS = ["new", "in_progress", "closed", "spam"], cnt = {}; SS.forEach(function (s) { cnt[s] = D.adm.filter(function (x) { return x.status === s }).length });
    var list = D.adm.filter(function (x) { return x.status === D.admStatus });
    return '<div class="panel"><h3>' + esc(t("p_dir")) + '</h3><p class="hint" style="text-align:left;margin:0 0 14px">' + esc(t("da_hint")) + '</p><div class="pills" style="display:inline-flex;margin-bottom:16px;flex-wrap:wrap">' +
      SS.map(function (s) { return '<button data-drst="' + s + '" aria-pressed="' + (D.admStatus === s) + '">' + esc(t("da_" + s)) + ' <span class="cntb">' + cnt[s] + '</span></button>' }).join("") + '</div>' +
      (list.length ? '<div class="hladm">' + list.map(card).join("") + '</div>' : '<div class="empty"><b>' + esc(t("da_none")) + '</b></div>') + '</div>'
  }
  function card(x) {
    var who = x.anonymous ? t("da_anon") : (x.name || "—");
    var meta = [t("drR_" + x.author_role), t("drTp_" + x.topic)];
    var msgs = [{ author: "author", body: x.body, created_at: x.created_at }].concat((x.msgs || []).map(function (m) { return { author: m.author, body: m.body, created_at: m.created_at } }));
    var acts = (x.dir_unread ? '<button class="btn btn-soft" data-drset="' + x.id + '" data-v="read">' + esc(t("da_read")) + '</button>' : '') +
      (x.status === "new" ? '<button class="btn btn-soft" data-drset="' + x.id + '" data-v="in_progress">' + esc(t("da_take")) + '</button>' : '') +
      (x.status !== "closed" ? '<button class="btn btn-soft" data-drset="' + x.id + '" data-v="closed">' + esc(t("da_close")) + '</button>' : '<button class="btn btn-soft" data-drset="' + x.id + '" data-v="in_progress">' + esc(t("da_reopen")) + '</button>') +
      (x.status !== "spam" ? '<button class="btn btn-soft" data-drset="' + x.id + '" data-v="spam">' + esc(t("da_spamB")) + '</button>' : '') +
      '<button class="btn btn-danger" data-drdel="' + x.id + '">' + esc(D.sure === x.id ? t("sure") : t("del")) + '</button>';
    return '<article class="fbcard mod hlcard drcard' + (x.dir_unread ? " unread" : "") + '"><div class="fbhead"><div style="min-width:0"><b>' + esc(who) + (x.dir_unread ? ' <i class="hldot" aria-label="new"></i>' : '') + '</b><span>#' + x.id + ' · ' + esc(fmt(x.created_at)) + '</span></div></div>' +
      '<div class="hlmeta">' + meta.map(function (m) { return '<span class="chip">' + esc(m) + '</span>' }).join("") + (x.grade ? '<span class="chip">' + esc(x.grade) + '</span>' : '') + (x.user_id ? '<span class="chip">' + esc(t("da_signed")) + '</span>' : '') + '</div>' +
      (x.subject ? '<p class="drsubj">' + esc(x.subject) + '</p>' : '') +
      (x.contact ? '<p class="hltalk">' + ic("phone") + '<b>' + esc(t("da_contact")) + ':</b> ' + esc(x.contact) + '</p>' : '') +
      bubbles(msgs, "director") +
      (x.status !== "spam" ? '<form class="form hlstaff" data-drrep="' + x.id + '" novalidate><textarea maxlength="3000" rows="2" placeholder="' + esc(t("da_replyPh")) + '"></textarea><div class="acts"><button class="btn btn-primary" type="submit">' + esc(t("da_reply")) + '</button></div></form>' : '') +
      '<div class="acts" style="display:flex;gap:8px;flex-wrap:wrap">' + acts + '</div></article>'
  }

  /* ---------- события ---------- */
  /* «Бетті өңдеу»: the app opens its usual staff editor; we mark it so «Сақтау» publishes at once */
  document.addEventListener("click", function (e) {
    if (!e.target.closest("[data-drqp]")) return;
    setTimeout(function () {
      var f = document.getElementById("edform"); if (!f) return; f.dataset.qp = "1";
      if (!f.querySelector(".drx-edhint")) f.insertAdjacentHTML("afterbegin", '<p class="hint drx-edhint">' + esc(t("drEditHint")) + '</p>');
      var ta = f.querySelectorAll("textarea[id^=fe-bio-]"); [].forEach.call(ta, function (x) { x.rows = 10 })
    }, 0)
  });
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-dr],[data-drst],[data-drset],[data-drdel],[data-drmine]"); if (!el) return; var d = el.dataset;
    if (d.dr === "new") { D.sentCode = ""; A.render(true); return }
    if (d.dr === "opensent") { var cd = D.sentCode; D.sentCode = ""; openCode(cd); return }
    if (d.dr === "exit") { D.thread = null; D.code = ""; A.render(true); return }
    if (d.drmine) { var id = +d.drmine; D.openId = D.openId === id ? null : id;
      if (D.openId) (D.mine || []).forEach(function (x) { if (x.id === id && x.unread) { x.unread = false; sb.rpc("dir_my_seen", { p_id: id }) } });
      A.render(true); return }
    if (d.drst) { D.admStatus = d.drst; A.render(true); return }
    if (d.drset) { var p = d.v === "read" ? { dir_unread: false } : { status: d.v, dir_unread: false }; upd(d.drset, p); return }
    if (d.drdel) { var did = +d.drdel; if (D.sure !== did) { D.sure = did; A.render(true); return } D.sure = null;
      sb.from("dir_letters").delete().eq("id", did).then(function (r) { if (r.error) { A.toast(t("e_generic")); return } D.adm = D.adm.filter(function (x) { return x.id !== did }); A.render(true) }); return }
  });
  document.addEventListener("submit", function (e) {
    var f = e.target, stop = function () { e.preventDefault(); e.stopPropagation() };
    if (f.id === "drForm") { stop(); if (sb) submit(f) }
    else if (f.id === "drCode") { stop(); if (sb) openCode(document.getElementById("dr-code").value) }
    else if (f.id === "drReply") { stop(); if (sb) authorReply(f, D.code, null) }
    else if (f.id === "drMineReply") { stop(); if (sb) authorReply(f, "", +f.dataset.id) }
    else if (f.dataset && f.dataset.drrep) { stop(); var ta = f.querySelector("textarea"), v = ta.value.trim(), id = +f.dataset.drrep; if (!v) return; var b = f.querySelector("button"); b.disabled = true;
      sb.rpc("dir_reply", { p_id: id, p_body: v }).then(function (r) { b.disabled = false; if (r.error) { A.toast(t("e_generic")); return } D.adm = null; loadAdm() }) }
  }, true);
  document.addEventListener("input", function (e) { if (e.target.id === "dr-body") { var c2 = document.getElementById("dr-cnt"); if (c2) c2.textContent = e.target.value.length + " / 4000" } });
  document.addEventListener("change", function (e) {
    if (e.target.id === "dr-anon") { var on = e.target.checked, w = document.getElementById("dr-ident"), n = document.getElementById("dr-anon-note"); if (w) w.hidden = on; if (n) n.hidden = !on }
  });

  A.onUser(function (u) { D.adm = null; D.noDB = false; D.mine = null; D.openId = null; if (u) setTimeout(function () { if (isDir()) loadAdm() }, 600) });
});
