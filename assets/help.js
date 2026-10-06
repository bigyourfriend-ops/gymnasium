/* Маған көмек керек / Мне нужна помощь (#help)
   Анонимные обращения учеников о буллинге: форма → код → переписка с психологом по коду.
   Психолог (роль с правом «help») видит обращения в «Басқару панелі» → «Өтініштер».
   База: supabase/help.sql */
(window.GMPlugins = window.GMPlugins || []).push(function (A) {
  "use strict";

  /* ---------- ЧТО НУЖНО УТОЧНИТЬ У ШКОЛЫ (пустое поле → «уточняется») ---------- */
  var CONF = {
    psyName:  { kk: "", ru: "" },          // ФИО психолога
    psyRoom:  { kk: "", ru: "" },          // например «2-қабат, 14-кабинет» / «2 этаж, кабинет 14»
    psyHours: { kk: "", ru: "" },          // например «Дс–Жм, 9:00–15:00» / «Пн–Пт, 9:00–15:00»
    boxPlace: { kk: "", ru: "" },          // где висит ящик доверия
    answerIn: { kk: "1–2 оқу күні", ru: "1–2 учебных дней" },
    region:   "+7 707 378 75 94"           // Жамбылская обл., центр психологической поддержки несовершеннолетних — перепроверить
  };

  var sb = A.sb, st = A.st, t = A.t, esc = A.esc, ic = A.ic;
  var L = function () { return st.lang === "kk" ? 0 : st.lang === "ru" ? 1 : 2 };
  var c = function (o) { return o[st.lang] || o.ru || "" };

  /* ---------- строки ---------- */
  var S = {
    navHelp: ["Көмек", "Помощь", "Help"],
    helpT: ["Маған көмек керек", "Мне нужна помощь", "I need help"],
    helpLead: ["Егер сені біреу ренжітсе, мазақтаса немесе мектепте қорқынышты болса — сен жалғыз емессің. Жасырын жазуға болады: өзің қаламасаң, сенің кім екеніңді ешкім білмейді.",
      "Если тебя обижают, травят или тебе страшно в школе — ты не один. Можно написать анонимно: никто не узнает, кто ты, если ты сам этого не захочешь.",
      "If someone hurts or bullies you, or you feel scared at school — you are not alone. You can write anonymously."],
    hWrite: ["Өтініш жазу", "Написать обращение", "Write to us"],
    hHaveCode: ["Менде код бар", "У меня уже есть код", "I have a code"],
    hUrgT: ["Дәл қазір қауіп төніп тұрса — формаға жазба, қоңырау шал", "Если тебе угрожает опасность прямо сейчас — не пиши в форму, звони", "If you are in danger right now — call, don't write"],
    h112: ["Құтқару қызметі", "Экстренная служба", "Emergency"],
    h102: ["Полиция", "Полиция", "Police"],
    h111: ["Сенім телефоны: отбасы, балалар құқығы, буллинг. Тегін, тәулік бойы", "Телефон доверия: семья, права детей, буллинг. Бесплатно, круглосуточно", "Helpline: family, children's rights, bullying. Free, 24/7"],
    hWhatT: ["Буллинг деген не?", "Что такое буллинг?", "What is bullying?"],
    hW1: ["Үнемі ат қояды, мазақтайды, келеке етеді", "Постоянно обзывают, высмеивают, придумывают клички", "Name-calling, mocking, nicknames"],
    hW2: ["Итереді, ұрады, заттарыңды тартып алады не бүлдіреді", "Толкают, бьют, отбирают или портят вещи", "Pushing, hitting, taking or breaking things"],
    hW3: ["Әдейі ойынға алмайды, бүкіл сынып болып елемейді", "Специально не берут в игру, всем классом игнорируют", "Leaving you out on purpose, ignoring you"],
    hW4: ["Чатта жаман сөз жазады, рұқсатсыз фото не видео салады", "Пишут гадости в чатах, выкладывают фото или видео без разрешения", "Nasty messages, posting photos without permission"],
    hW5: ["Қорқытады немесе бір нәрсе істеуге мәжбүрлейді", "Угрожают или заставляют что-то делать", "Threats or forcing you to do things"],
    hWNote: ["Біреудің саған қарым-қатынасынан көңілің түссе — бұл жазуға жеткілікті себеп. Жағдай нашарлағанша күтпе.",
      "Если тебе плохо из-за того, как с тобой обращаются, — это уже повод написать. Не жди, пока станет хуже.",
      "If the way people treat you makes you feel bad — that's reason enough to write. Don't wait for it to get worse."],
    hFormT: ["Өтініш жазу", "Написать обращение", "Write to us"],
    hWho: ["Кім жазып отыр?", "Кто пишет?", "Who is writing?"],
    hWho_self: ["Мен өзім", "Я сам(а)", "Me"],
    hWho_witness: ["Басқа біреуді ренжіткенін көрдім", "Я видел(а), как обижают другого", "I saw someone else being hurt"],
    hBody: ["Не болды?", "Что случилось?", "What happened?"],
    hBodyPh: ["Өз сөзіңмен жаз: не болды, қай жерде, қашан", "Расскажи своими словами: что, где и когда произошло", "In your own words: what, where, when"],
    hPlace: ["Қай жерде?", "Где это происходит?", "Where?"],
    hPl_class: ["Сыныпта", "В классе", "In class"], hPl_corridor: ["Дәлізде", "В коридоре", "In the hallway"], hPl_canteen: ["Асханада", "В столовой", "In the canteen"],
    hPl_outside: ["Аулада немесе жолда", "Во дворе или по дороге", "Outside or on the way"], hPl_online: ["Интернетте, чатта", "В интернете, в чатах", "Online, in chats"], hPl_other: ["Басқа жерде", "Другое", "Other"],
    hFreq: ["Қанша уақыттан бері?", "Как давно?", "How long?"],
    hFr_once: ["Бір рет болды", "Один раз", "Once"], hFr_several: ["Бірнеше рет", "Несколько раз", "Several times"], hFr_long: ["Ұзақ уақыттан бері, үнемі", "Давно и постоянно", "For a long time"],
    hInv: ["Кім қатысады? (міндетті емес)", "Кто участвует? (необязательно)", "Who is involved? (optional)"],
    hGrade: ["Сыныбың (міндетті емес)", "Твой класс (необязательно)", "Your class (optional)"],
    hGradePh: ["мысалы, 7Б", "например, 7Б", "e.g. 7B"],
    hTalk: ["Психологпен жеке сөйлескім келеді", "Я хочу поговорить с психологом лично", "I want to talk to the psychologist in person"],
    hContact: ["Саған қалай хабарласуға болады?", "Как с тобой связаться?", "How can we reach you?"],
    hContactPh: ["Атың мен сыныбың, телефон немесе басқа тәсіл", "Имя и класс, телефон или другой способ", "Name and class, phone or another way"],
    hSend: ["Жіберу", "Отправить", "Send"],
    hOnly: ["Мұны тек мектеп психологы оқиды.", "Это прочитает только школьный психолог.", "Only the school psychologist will read this."],
    hSentT: ["Өтінішің жіберілді", "Обращение отправлено", "Sent"],
    hYourCode: ["Сенің кодың", "Твой код", "Your code"],
    hCodeNote: ["Кодты сақтап ал немесе экранды суретке түсір. Сол арқылы психологтың жауабын көресің. Кодты ешкімге көрсетпе.",
      "Сохрани код или сфотографируй экран. По нему ты увидишь ответ психолога. Никому не показывай этот код.",
      "Save this code or take a photo of the screen. You'll see the psychologist's reply with it. Don't show it to anyone."],
    hCheckNow: ["Жауапты тексеру", "Проверить ответ", "Check reply"],
    hNewOne: ["Тағы бір өтініш жазу", "Написать ещё одно", "Write another"],
    hNextT: ["Әрі қарай не болады?", "Что будет дальше?", "What happens next?"],
    hN1: ["Хатыңды тек мектеп психологы оқиды.", "Твоё сообщение прочитает только школьный психолог.", "Only the school psychologist reads it."],
    hN2: ["{time} ішінде жауап береді — оны кодың арқылы тексер.", "Ответ появится в течение {time} — проверь его по коду.", "You'll get a reply within {time} — check it with your code."],
    hN3: ["Атыңды айту-айтпауды өзің шешесің.", "Ты сам решаешь, называть ли своё имя.", "You decide whether to give your name."],
    hN4: ["Келісіміңсіз ешкім сені бүкіл сыныптың алдында «тексермейді».", "Без твоего согласия никто не будет «разбираться» при всём классе.", "Nobody will confront this in front of the class without your consent."],
    hWitT: ["Басқаны ренжітіп жатыр ма?", "Обижают не тебя?", "Someone else is being hurt?"],
    hWitD: ["Сен де жасырын жаза аласың. Көбінесе дәл куәгерлер буллингті тоқтатуға көмектеседі.", "Ты тоже можешь написать анонимно. Часто именно свидетели помогают остановить буллинг.", "You can write anonymously too. Witnesses often help stop bullying."],
    hCodeT: ["Жауапты тексеру", "Проверить ответ", "Check reply"],
    hCodeL: ["Сенің кодың", "Твой код", "Your code"],
    hOpen: ["Ашу", "Открыть", "Open"],
    hNotFound: ["Мұндай код табылмады. Дұрыс жазылғанын тексер.", "Такой код не найден. Проверь, правильно ли он написан.", "Code not found. Check that it's typed correctly."],
    hYourMsg: ["Сенің өтінішің", "Твоё обращение", "Your message"],
    hst_new: ["Жаңа — әлі оқылмады", "Новое — ещё не прочитано", "New — not read yet"],
    hst_in_progress: ["Психолог айналысып жатыр", "Психолог занимается", "In progress"],
    hst_closed: ["Жабылды", "Закрыто", "Closed"],
    hYou: ["Сен", "Ты", "You"], hPsy: ["Психолог", "Психолог", "Psychologist"],
    hNoReply: ["Әзірге жауап жоқ. Кейінірек қайта тексер.", "Пока ответа нет. Загляни позже.", "No reply yet. Check later."],
    hAdd: ["Толықтыру немесе жауап жазу", "Дописать или ответить", "Add or reply"],
    hExit: ["Шығу", "Выйти", "Close"],
    hOtherT: ["Басқа жолдар", "Другие способы", "Other ways"],
    hPsyT: ["Мектеп психологы", "Школьный психолог", "School psychologist"],
    hRoom: ["Кабинет", "Кабинет", "Room"], hHours: ["Қабылдау уақыты", "Часы приёма", "Hours"],
    hBoxT: ["Сенім жәшігі", "Ящик доверия", "Trust box"],
    hBoxD: ["Хатты қағазға жазып, атыңсыз салуға болады.", "Можно написать записку на бумаге и опустить без имени.", "Write a note on paper and drop it in, no name needed."],
    hRegT: ["Кәмелетке толмағандарға психологиялық қолдау орталығы (Жамбыл облысы)", "Центр психологической поддержки несовершеннолетних (Жамбылская обл.)", "Youth psychological support centre (Zhambyl region)"],
    hSoon: ["нақтыланады", "уточняется", "to be added"],
    hPrivT: ["Жасырындық туралы", "Об анонимности", "About anonymity"],
    hPriv: ["Біз атыңды сұрамаймыз және өтінішті құрылғыңмен байланыстырмаймыз: IP-адрес сақталмайды. Бірақ хатта сенің не басқа адамның өміріне қауіп туралы жазылса, мектеп сені қорғау үшін шара қолдануға міндетті.",
      "Мы не просим имя и не связываем обращение с твоим устройством: IP-адрес не сохраняется. Но если в сообщении есть угроза твоей жизни или жизни другого человека, школа обязана принять меры, чтобы тебя защитить.",
      "We don't ask your name or link your message to your device. But if there is a threat to someone's life, the school must act to protect you."],
    hParT: ["Ата-аналарға", "Родителям", "For parents"],
    hParD: ["Балаңызды қорлауы мүмкін екенін байқатын белгілер: мектепке барғысы келмейді немесе себепсіз ауырады; заттары жоғалады не бүлінеді; көңіл-күйі, ұйқысы, тәбеті өзгерді; телефонға қарағаннан кейін мазасызданады; достарынан алыстады. Мұндайда мектеп психологына хабарласыңыз немесе 111 нөміріне қоңырау шалыңыз.",
      "Признаки, что ребёнка могут травить: не хочет идти в школу или «болеет» без причины; пропадают или портятся вещи; изменились настроение, сон, аппетит; тревожится после того, как посмотрит в телефон; отдалился от друзей. В таком случае обратитесь к школьному психологу или позвоните по номеру 111.",
      "Signs your child may be bullied: avoids school, lost or damaged things, changes in mood, sleep or appetite, anxiety after using the phone, withdrawing from friends. Contact the school psychologist or call 111."],
    hHomeT: ["Сені ренжітіп жүр ме?", "Тебя обижают?", "Is someone hurting you?"],
    hHomeD: ["Мектеп психологына жасырын жазуға болады. Атыңды айтудың қажеті жоқ.", "Можно анонимно написать школьному психологу. Имя называть не нужно.", "You can write to the school psychologist anonymously."],
    e_hShort: ["Не болғанын сәл толығырақ жаз (кемінде 10 таңба).", "Опиши чуть подробнее, что случилось (не меньше 10 символов).", "Please write a bit more (at least 10 characters)."],
    e_hRate: ["Сен жақында жаздың. Біраз уақыттан кейін қайталап көр.", "Ты недавно уже писал(а). Попробуй чуть позже.", "You wrote recently. Please try a bit later."],
    e_hFast: ["Тым жылдам жіберілді. Бірнеше секундтан кейін қайта бас.", "Отправлено слишком быстро. Нажми ещё раз через пару секунд.", "Too fast. Press again in a few seconds."],
    e_hDown: ["Қазір жіберу мүмкін болмады. 111 нөміріне қоңырау шал немесе психологқа бар.", "Сейчас не получилось отправить. Позвони 111 или подойди к психологу.", "Couldn't send right now. Call 111 or go to the psychologist."],
    /* панель психолога */
    d_help: ["Жаңа өтініштер (буллинг)", "Новые обращения (буллинг)", "New bullying reports"],
    p_help: ["Өтініштер (буллинг)", "Обращения (буллинг)", "Bullying reports"],
    perm_help: ["Буллинг туралы өтініштерді оқу (психолог)", "Обращения о буллинге (психолог)", "Bullying reports (psychologist)"],
    ha_new: ["Жаңа", "Новые", "New"], ha_in_progress: ["Жұмыста", "В работе", "In progress"], ha_closed: ["Жабық", "Закрытые", "Closed"], ha_spam: ["Спам", "Спам", "Spam"],
    ha_take: ["Жұмысқа алу", "Взять в работу", "Take"], ha_close: ["Жабу", "Закрыть", "Close"], ha_reopen: ["Қайта ашу", "Открыть снова", "Reopen"],
    ha_spamB: ["Спам", "Спам", "Spam"], ha_read: ["Оқылды", "Прочитано", "Mark read"],
    ha_reply: ["Жауап беру", "Ответить", "Reply"],
    ha_replyPh: ["Оқушы бұл жауапты өз кодымен көреді", "Ученик увидит ответ по своему коду", "The student sees this with their code"],
    ha_talk: ["Жеке сөйлескісі келеді", "Хочет поговорить лично", "Wants to talk in person"],
    ha_student: ["Оқушы", "Ученик", "Student"],
    ha_inv: ["Кім қатысады", "Кто участвует", "Involved"], ha_grade: ["Сыныбы", "Класс", "Class"],
    ha_hint: ["Оқушыға тек өз кодымен кіргенде жауабыңыз көрінеді. Оған хабарлама жіберілмейді, сондықтан «жеке сөйлескісі келеді» белгісі бар өтініштерге көрсетілген тәсілмен өзіңіз хабарласыңыз.",
      "Ученик видит ответ, только когда сам откроет его по коду — уведомлений ему не приходит. Если стоит отметка «хочет поговорить лично», свяжитесь с ним указанным способом.",
      "Students see replies only when they open them with their code."],
    ha_noDB: ["Дерекқор әлі бапталмаған: supabase/help.sql файлын Supabase SQL Editor-да іске қосыңыз.", "База ещё не настроена: запустите файл supabase/help.sql в Supabase → SQL Editor.", "Database not set up: run supabase/help.sql in the Supabase SQL Editor."],
    ha_none: ["Бұл бөлімде өтініш жоқ", "В этом разделе обращений нет", "Nothing here"]
  };
  for (var k in S) A.T[k] = S[k];
  if (A.PERMS.indexOf("help") < 0) A.PERMS.push("help");
  A.PARENT.help = null;
  A.TITLES.help = function () { return t("helpT") };
  A.IC.shield = '<path d="M12 3l7 3v6c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/>';
  A.IC.heart = '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>';
  A.IC.alert = '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>';
  A.IC.box = '<path d="M4 8l8-4 8 4v9l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v9"/>';

  /* ---------- состояние ---------- */
  var H = { start: 0, sentCode: "", code: "", thread: null, busy: false, adm: null, admStatus: "new", admLoading: false, noDB: false, sure: null, msg: null };
  function fmt(ts) { var d = new Date(ts); if (isNaN(d)) return ""; var p = function (n) { return (n < 10 ? "0" : "") + n }; return A.fmtDate(d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate())) + ", " + p(d.getHours()) + ":" + p(d.getMinutes()) }
  function tel(n) { return "tel:" + String(n).replace(/[^\d+]/g, "") }
  function errKey(e) { var m = ((e && e.message) || "") + " " + ((e && e.code) || ""); return /rate/i.test(m) ? "e_hRate" : /too_fast/i.test(m) ? "e_hFast" : /too_short/i.test(m) ? "e_hShort" : "e_hDown" }
  function setMsg(id, key, ok) { var m = document.getElementById(id); if (!m) return; m.hidden = false; m.className = "formmsg " + (ok ? "ok" : "err"); m.textContent = t(key) }

  /* ---------- страница ---------- */
  function hero() {
    return '<section class="hlhero"><div class="container"><nav class="crumbs" aria-label="breadcrumb"><a href="#home">' + esc(t("home")) + '</a><span>/</span><span class="cur">' + esc(t("helpT")) + '</span></nav>' +
      '<div class="hlhero-in"><span class="hlbadge">' + ic("shield") + '</span><div><h1>' + esc(t("helpT")) + '</h1><p>' + esc(t("helpLead")) + '</p>' +
      '<div class="btns"><a class="btn btn-primary btn-lg" href="#help.write">' + ic("msg") + esc(t("hWrite")) + '</a><a class="btn btn-outline btn-lg" href="#help.code">' + esc(t("hHaveCode")) + '</a></div></div></div></div></section>'
  }
  function urgent() {
    var ph = [["112", "h112"], ["102", "h102"], ["111", "h111"]];
    return '<section class="hlurg" aria-labelledby="hlurgT"><div class="hlurg-h">' + ic("alert") + '<h2 id="hlurgT">' + esc(t("hUrgT")) + '</h2></div><div class="hlphones">' +
      ph.map(function (p) { return '<a class="hlphone" href="' + tel(p[0]) + '"><b class="tnum">' + p[0] + '</b><span>' + esc(t(p[1])) + '</span></a>' }).join("") + '</div></section>'
  }
  function what() {
    return '<section><h2 class="h2">' + esc(t("hWhatT")) + '</h2><ul class="hlwhat">' + ["hW1", "hW2", "hW3", "hW4", "hW5"].map(function (k) { return '<li>' + esc(t(k)) + '</li>' }).join("") + '</ul><p class="hlnote">' + ic("heart") + '<span>' + esc(t("hWNote")) + '</span></p></section>'
  }
  function opt(id, list, pre) { return '<select id="' + id + '">' + list.map(function (v) { return '<option value="' + v + '">' + esc(t(pre + v)) + '</option>' }).join("") + '</select>' }
  function form() {
    if (H.sentCode) return sentPanel();
    H.start = Date.now(); var dis = sb ? "" : " disabled";
    return '<div class="panel hlform" id="write"><h3>' + esc(t("hFormT")) + '</h3>' + (sb ? "" : '<p class="formmsg err">' + esc(t("e_hDown")) + '</p>') +
      '<form class="form" id="hlForm" novalidate><fieldset class="hlwho"' + dis + '><legend>' + esc(t("hWho")) + '</legend>' +
      ["self", "witness"].map(function (v, i) { return '<label class="hlradio"><input type="radio" name="hl-who" value="' + v + '"' + (i ? "" : " checked") + '><span>' + esc(t("hWho_" + v)) + '</span></label>' }).join("") + '</fieldset>' +
      '<label>' + esc(t("hBody")) + '<textarea id="hl-body" maxlength="3000" rows="6" placeholder="' + esc(t("hBodyPh")) + '"' + dis + '></textarea><small class="cnt" id="hl-cnt">0 / 3000</small></label>' +
      '<div class="row2"><label>' + esc(t("hPlace")) + opt("hl-place", ["class", "corridor", "canteen", "outside", "online", "other"], "hPl_") + '</label><label>' + esc(t("hFreq")) + opt("hl-freq", ["once", "several", "long"], "hFr_") + '</label></div>' +
      '<div class="row2"><label>' + esc(t("hInv")) + '<input id="hl-inv" maxlength="300" autocomplete="off"' + dis + '></label><label>' + esc(t("hGrade")) + '<input id="hl-grade" maxlength="12" autocomplete="off" placeholder="' + esc(t("hGradePh")) + '"' + dis + '></label></div>' +
      '<label class="hlcheck"><input type="checkbox" id="hl-talk"' + dis + '><span>' + esc(t("hTalk")) + '</span></label>' +
      '<label id="hl-contact-w" hidden>' + esc(t("hContact")) + '<input id="hl-contact" maxlength="150" autocomplete="off" placeholder="' + esc(t("hContactPh")) + '"></label>' +
      '<label class="hp" aria-hidden="true">Website<input id="hl-website" tabindex="-1" autocomplete="off"></label>' +
      '<p class="formmsg" id="hlmsg" hidden></p><div class="hlsend"><span class="hint">' + ic("shield") + esc(t("hOnly")) + '</span><button class="btn btn-primary btn-lg" type="submit"' + dis + '>' + esc(t("hSend")) + '</button></div></form></div>'
  }
  function sentPanel() {
    return '<div class="panel hlform hlsent" id="write"><span class="hlok">' + ic("shield") + '</span><h3>' + esc(t("hSentT")) + '</h3><p class="hlcode-l">' + esc(t("hYourCode")) + '</p>' +
      '<div class="hlcode"><span class="tnum">' + esc(H.sentCode) + '</span><button class="copy" data-copy="' + esc(H.sentCode) + '">' + esc(t("copy")) + '</button></div>' +
      '<p class="hlcodenote">' + esc(t("hCodeNote")) + '</p><div class="btns" style="justify-content:center"><button class="btn btn-primary" data-hl="opensent">' + esc(t("hCheckNow")) + '</button><button class="btn btn-soft" data-hl="new">' + esc(t("hNewOne")) + '</button></div></div>'
  }
  function next() {
    return '<aside class="hlside"><div class="panel"><h3>' + esc(t("hNextT")) + '</h3><ol class="hlsteps">' +
      [t("hN1"), A.f(t("hN2"), { time: c(CONF.answerIn) }), t("hN3"), t("hN4")].map(function (s) { return '<li>' + esc(s) + '</li>' }).join("") + '</ol></div>' +
      '<div class="panel hlwit"><h3>' + ic("users") + esc(t("hWitT")) + '</h3><p>' + esc(t("hWitD")) + '</p></div></aside>'
  }
  function codeBox() {
    var body;
    if (H.thread) {
      var th = H.thread, msgs = [{ author: "student", body: th.body, created_at: th.created_at }].concat(th.messages || []);
      var anyStaff = msgs.some(function (m) { return m.author === "staff" });
      body = '<div class="hlthread-h"><span class="chip hls-' + esc(th.status) + '">' + esc(t("hst_" + th.status)) + '</span><button class="btn btn-soft" data-hl="exit">' + esc(t("hExit")) + '</button></div>' +
        '<div class="hlthread">' + msgs.map(function (m) { var me = m.author === "student"; return '<div class="hlbub ' + (me ? "me" : "them") + '"><small>' + esc(me ? t("hYou") : t("hPsy")) + ' · ' + esc(fmt(m.created_at)) + '</small><p>' + esc(m.body) + '</p></div>' }).join("") + '</div>' +
        (anyStaff ? "" : '<p class="hint" style="text-align:left">' + esc(t("hNoReply")) + '</p>') +
        '<form class="form" id="hlReply" novalidate><label>' + esc(t("hAdd")) + '<textarea id="hl-rep" maxlength="2000" rows="3"></textarea></label><p class="formmsg" id="hlrmsg" hidden></p><div class="acts"><button class="btn btn-primary" type="submit">' + esc(t("hSend")) + '</button></div></form>';
    } else {
      body = '<form class="form hlcodeform" id="hlCode" novalidate><label>' + esc(t("hCodeL")) + '<input id="hl-code" maxlength="20" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="GM-XXXX-XXXX"' + (sb ? "" : " disabled") + '></label><button class="btn btn-primary" type="submit"' + (sb ? "" : " disabled") + '>' + esc(t("hOpen")) + '</button></form><p class="formmsg" id="hlcmsg" hidden></p>';
    }
    return '<section class="panel hlcodebox" id="code"><h3>' + esc(t("hCodeT")) + '</h3>' + body + '</section>'
  }
  function val(o) { var v = c(o); return v ? esc(v) : '<i class="hlsoon">' + esc(t("hSoon")) + '</i>' }
  function other() {
    return '<section><h2 class="h2">' + esc(t("hOtherT")) + '</h2><div class="grid3 hlother">' +
      '<div class="panel"><span class="hlico">' + ic("user") + '</span><h3>' + esc(t("hPsyT")) + '</h3><p><b>' + val(CONF.psyName) + '</b></p><p>' + esc(t("hRoom")) + ': ' + val(CONF.psyRoom) + '</p><p>' + esc(t("hHours")) + ': ' + val(CONF.psyHours) + '</p></div>' +
      '<div class="panel"><span class="hlico">' + ic("box") + '</span><h3>' + esc(t("hBoxT")) + '</h3><p>' + esc(t("hBoxD")) + '</p><p>' + ic("pin").replace("<svg", '<svg width="14" height="14"') + ' ' + val(CONF.boxPlace) + '</p></div>' +
      '<div class="panel"><span class="hlico">' + ic("phone") + '</span><h3>' + esc(t("hRegT")) + '</h3><p><a class="hltel tnum" href="' + tel(CONF.region) + '">' + esc(CONF.region) + '</a></p><p><a class="hltel tnum" href="tel:111">111</a> — ' + esc(t("h111")) + '</p></div>' +
      '</div></section>'
  }
  function priv() {
    return '<section class="hlpriv"><div class="panel"><h3>' + ic("shield") + esc(t("hPrivT")) + '</h3><p>' + esc(t("hPriv")) + '</p></div>' +
      '<details class="panel hlpar"><summary>' + esc(t("hParT")) + '</summary><p>' + esc(t("hParD")) + '</p></details></section>'
  }
  function pageHelp() {
    return hero() + '<div class="container page hlpage">' + urgent() + what() +
      '<section class="hlgrid">' + form() + next() + '</section>' + codeBox() + other() + priv() + '</div>'
  }
  A.PAGES.help = pageHelp;

  /* блок на главной (вызывается из app.js) */
  window.GMHelp = {
    home: function () {
      return '<section class="section" style="padding-block:8px 40px"><div class="container"><a class="hlhome" href="#help"><span class="hlbadge">' + ic("shield") + '</span><div><h3>' + esc(t("hHomeT")) + '</h3><p>' + esc(t("hHomeD")) + '</p></div><span class="btn btn-primary">' + esc(t("hWrite")) + '</span></a></div></section>'
    },
    badge: function () { return H.adm ? H.adm.filter(function (r) { return r.staff_unread && r.status !== "spam" }).length : 0 },
    adminTab: adminTab,
    preload: function () { if (A.can("help") && !H.adm) loadAdm() }
  };

  /* прокрутка к #help.write / #help.code */
  function scrollSec() { if (st.route.page !== "help" || !st.route.arg) return; setTimeout(function () { var el = document.getElementById(st.route.arg); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); var f = el && el.querySelector("textarea,input:not([type=radio])"); if (f && st.route.arg === "code") f.focus({ preventScroll: true }) }, 30) }
  window.addEventListener("hashchange", scrollSec);
  setTimeout(scrollSec, 400);

  /* ---------- отправка ---------- */
  function submit(form) {
    var g = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : "" };
    var body = g("hl-body"); if (body.length < 10) { setMsg("hlmsg", "e_hShort"); return }
    if (H.busy) return; H.busy = true; var b = form.querySelector("button[type=submit]"); b.disabled = true;
    var who = (form.querySelector("input[name=hl-who]:checked") || {}).value || "self", talk = document.getElementById("hl-talk").checked;
    sb.rpc("help_submit", { p_who: who, p_place: g("hl-place"), p_freq: g("hl-freq"), p_body: body, p_involved: g("hl-inv"), p_grade: g("hl-grade"), p_talk: talk, p_contact: talk ? g("hl-contact") : "", p_hp: g("hl-website"), p_elapsed: Math.round((Date.now() - H.start) / 1000) })
      .then(function (r) {
        H.busy = false; b.disabled = false;
        if (r.error || !r.data) { setMsg("hlmsg", errKey(r.error)); return }
        H.sentCode = r.data; A.render(true); var w = document.getElementById("write"); if (w) w.scrollIntoView({ block: "center" })
      }, function () { H.busy = false; b.disabled = false; setMsg("hlmsg", "e_hDown") })
  }
  function openCode(code) {
    code = String(code || "").trim().toUpperCase(); if (!code) return;
    sb.rpc("help_thread", { p_code: code }).then(function (r) {
      if (r.error) { setMsg("hlcmsg", errKey(r.error)); return }
      if (!r.data) { setMsg("hlcmsg", "hNotFound"); return }
      H.code = code; H.thread = r.data; A.render(true); var el = document.getElementById("code"); if (el) el.scrollIntoView({ block: "start" })
    })
  }
  function studentReply(form) {
    var ta = document.getElementById("hl-rep"), v = ta.value.trim(); if (!v || H.busy) return; H.busy = true;
    sb.rpc("help_student_reply", { p_code: H.code, p_body: v }).then(function (r) {
      H.busy = false; if (r.error) { setMsg("hlrmsg", errKey(r.error)); return }
      openCode(H.code)
    })
  }

  /* ---------- панель психолога ---------- */
  function loadAdm() {
    if (!sb || H.admLoading || !A.can("help")) return; H.admLoading = true;
    sb.from("help_reports").select("*").order("last_activity", { ascending: false }).limit(300).then(function (r) {
      if (r.error) { H.admLoading = false; H.noDB = /help_reports|relation|schema cache|PGRST205|42P01/i.test((r.error.message || "") + r.error.code); H.adm = []; A.render(true); return }
      var rows = r.data || [], ids = rows.map(function (x) { return x.id });
      if (!ids.length) { H.admLoading = false; H.adm = rows; A.render(true); return }
      sb.from("help_messages").select("*").in("report_id", ids).order("created_at").then(function (m) {
        H.admLoading = false; var by = {}; (m.data || []).forEach(function (x) { (by[x.report_id] = by[x.report_id] || []).push(x) });
        rows.forEach(function (x) { x.msgs = by[x.id] || [] }); H.adm = rows; A.render(true)
      })
    })
  }
  function upd(id, patch) {
    sb.from("help_reports").update(patch).eq("id", id).then(function (r) {
      if (r.error) { A.toast(t("e_generic")); return }
      H.adm.forEach(function (x) { if (String(x.id) === String(id)) for (var k in patch) x[k] = patch[k] }); A.render(true)
    })
  }
  function adminTab() {
    if (!H.adm) { loadAdm(); return '<div class="panel"><p class="hint">' + esc(t("loading")) + '</p></div>' }
    if (H.noDB) return '<div class="panel"><p class="formmsg err">' + esc(t("ha_noDB")) + '</p></div>';
    var SS = ["new", "in_progress", "closed", "spam"], cnt = {}; SS.forEach(function (s) { cnt[s] = H.adm.filter(function (x) { return x.status === s }).length });
    var list = H.adm.filter(function (x) { return x.status === H.admStatus });
    return '<div class="panel"><h3>' + esc(t("p_help")) + '</h3><p class="hint" style="text-align:left;margin:0 0 14px">' + esc(t("ha_hint")) + '</p><div class="pills" style="display:inline-flex;margin-bottom:16px">' +
      SS.map(function (s) { return '<button data-hlst="' + s + '" aria-pressed="' + (H.admStatus === s) + '">' + esc(t("ha_" + s)) + ' <span class="cntb">' + cnt[s] + '</span></button>' }).join("") + '</div>' +
      (list.length ? '<div class="hladm">' + list.map(card).join("") + '</div>' : '<div class="empty"><b>' + esc(t("ha_none")) + '</b></div>') + '</div>'
  }
  function card(x) {
    var meta = [t("hWho_" + x.who), t("hPl_" + x.place), t("hFr_" + x.freq)];
    var msgs = [{ author: "student", body: x.body, created_at: x.created_at }].concat(x.msgs || []);
    var acts = (x.staff_unread ? '<button class="btn btn-soft" data-hlset="' + x.id + '" data-v="read">' + esc(t("ha_read")) + '</button>' : '') +
      (x.status === "new" ? '<button class="btn btn-soft" data-hlset="' + x.id + '" data-v="in_progress">' + esc(t("ha_take")) + '</button>' : '') +
      (x.status !== "closed" ? '<button class="btn btn-soft" data-hlset="' + x.id + '" data-v="closed">' + esc(t("ha_close")) + '</button>' : '<button class="btn btn-soft" data-hlset="' + x.id + '" data-v="in_progress">' + esc(t("ha_reopen")) + '</button>') +
      (x.status !== "spam" ? '<button class="btn btn-soft" data-hlset="' + x.id + '" data-v="spam">' + esc(t("ha_spamB")) + '</button>' : '') +
      '<button class="btn btn-danger" data-hldel="' + x.id + '">' + esc(H.sure === x.id ? t("sure") : t("del")) + '</button>';
    return '<article class="fbcard mod hlcard' + (x.staff_unread ? " unread" : "") + '"><div class="fbhead"><div style="min-width:0"><b>#' + x.id + (x.staff_unread ? ' <i class="hldot" aria-label="new"></i>' : '') + '</b><span>' + esc(fmt(x.created_at)) + '</span></div></div>' +
      '<div class="hlmeta">' + meta.map(function (m) { return '<span class="chip">' + esc(m) + '</span>' }).join("") + (x.grade ? '<span class="chip">' + esc(t("ha_grade")) + ': ' + esc(x.grade) + '</span>' : '') + '</div>' +
      (x.involved ? '<p class="hlinv"><b>' + esc(t("ha_inv")) + ':</b> ' + esc(x.involved) + '</p>' : '') +
      (x.wants_talk ? '<p class="hltalk">' + ic("user") + '<b>' + esc(t("ha_talk")) + '</b>' + (x.contact ? ': ' + esc(x.contact) : '') + '</p>' : '') +
      '<div class="hlthread">' + msgs.map(function (m) { var me = m.author === "staff"; return '<div class="hlbub ' + (me ? "me" : "them") + '"><small>' + esc(me ? t("hPsy") : t("ha_student")) + ' · ' + esc(fmt(m.created_at)) + '</small><p>' + esc(m.body) + '</p></div>' }).join("") + '</div>' +
      (x.status !== "spam" ? '<form class="form hlstaff" data-hlrep="' + x.id + '" novalidate><textarea maxlength="2000" rows="2" placeholder="' + esc(t("ha_replyPh")) + '"></textarea><div class="acts"><button class="btn btn-primary" type="submit">' + esc(t("ha_reply")) + '</button></div></form>' : '') +
      '<div class="acts" style="display:flex;gap:8px;flex-wrap:wrap">' + acts + '</div></article>'
  }

  /* ---------- события ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-hl],[data-hlst],[data-hlset],[data-hldel]"); if (!el) return; var d = el.dataset;
    if (d.hl === "new") { H.sentCode = ""; A.render(true); return }
    if (d.hl === "opensent") { var cd = H.sentCode; H.sentCode = ""; openCode(cd); return }
    if (d.hl === "exit") { H.thread = null; H.code = ""; A.render(true); return }
    if (d.hlst) { H.admStatus = d.hlst; A.render(true); return }
    if (d.hlset) { var p = d.v === "read" ? { staff_unread: false } : { status: d.v, staff_unread: false }; upd(d.hlset, p); return }
    if (d.hldel) { var id = +d.hldel; if (H.sure !== id) { H.sure = id; A.render(true); return } H.sure = null;
      sb.from("help_reports").delete().eq("id", id).then(function (r) { if (r.error) { A.toast(t("e_generic")); return } H.adm = H.adm.filter(function (x) { return x.id !== id }); A.render(true) }); return }
  });
  document.addEventListener("submit", function (e) {
    var f = e.target;
    if (f.id === "hlForm") { e.preventDefault(); e.stopPropagation(); if (sb) submit(f) }
    else if (f.id === "hlCode") { e.preventDefault(); e.stopPropagation(); if (sb) openCode(document.getElementById("hl-code").value) }
    else if (f.id === "hlReply") { e.preventDefault(); e.stopPropagation(); if (sb) studentReply(f) }
    else if (f.dataset && f.dataset.hlrep) { e.preventDefault(); e.stopPropagation(); var ta = f.querySelector("textarea"), v = ta.value.trim(), id = +f.dataset.hlrep; if (!v) return; var b = f.querySelector("button"); b.disabled = true;
      sb.rpc("help_staff_reply", { p_id: id, p_body: v }).then(function (r) { b.disabled = false; if (r.error) { A.toast(t("e_generic")); return } H.adm = null; loadAdm() }) }
  }, true);
  document.addEventListener("input", function (e) { if (e.target.id === "hl-body") { var c2 = document.getElementById("hl-cnt"); if (c2) c2.textContent = e.target.value.length + " / 3000" } });
  document.addEventListener("change", function (e) { if (e.target.id === "hl-talk") { var w = document.getElementById("hl-contact-w"); if (w) w.hidden = !e.target.checked } });

  A.onUser(function (u) { H.adm = null; H.noDB = false; if (u) setTimeout(function () { if (A.can("help")) loadAdm() }, 600) });
});
