(function(){
"use strict";
var DATA=JSON.parse(JSON.stringify(window.DEFAULT_DATA||{}));
var CFG=window.SITE_CONFIG||{},sb=null;
try{if(CFG.supabaseUrl&&CFG.supabaseAnonKey&&window.supabase&&CFG.supabaseUrl.indexOf("YOUR_")<0)sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:"implicit"}})}catch(e){sb=null}
var TZ="Asia/Qyzylorda", LI={kk:0,ru:1,en:2}, LANGS=["kk","ru","en"];

/* ------------------------------------------------------------ i18n */
var T={
 navSchool:["Мектеп","Школа","School"], navEdu:["Білім беру","Образование","Education"], navLife:["Мектеп тынысы","Жизнь школы","School life"],
 navNews:["Жаңалықтар","Новости","News"], navContacts:["Байланыс","Контакты","Contacts"],
 navAbout:["Гимназия туралы","О гимназии","About us"], navAdmin:["Әкімшілік","Администрация","Administration"], navTeachers:["Педагогтар құрамы","Педагогический состав","Teaching staff"],
 navBase:["Материалдық-техникалық база","Материально-техническая база","Facilities"], navDocs:["Құжаттар","Документы","Documents"],
 navProg:["Оқу бағдарламалары","Учебные программы","Programmes"], navSched:["Сабақ кестесі","Расписание уроков","Timetable"],
 navOlymp:["Олимпиадалар мен жетістіктер","Олимпиады и достижения","Olympiads & achievements"], navRes:["Электронды ресурстар","Электронные ресурсы","Online resources"],
 navEvents:["Іс-шаралар күнтізбесі","Календарь мероприятий","Events calendar"], navClubs:["Үйірмелер мен секциялар","Кружки и секции","Clubs & sports"],
 navGallery:["Фотогалерея","Фотогалерея","Photo gallery"], navAlumni:["Түлектер","Выпускники","Alumni"],
 home:["Басты бет","Главная","Home"], login:["Кіру","Войти","Sign in"], menu:["Мәзір","Меню","Menu"],
 name:["Ғани Мұратбаев атындағы гимназия","Гимназия имени Гани Муратбаева","Gani Muratbayev Gymnasium"],
 region:["Жамбыл облысы, Сарыкемер","Жамбылская область, Сарыкемер","Zhambyl region, Sarykemer"],
 heroBadge:["{y} оқу жылы","{y} учебный год","Academic year {y}"],
 heroA:["Болашақ ұрпақ үшін","Для будущего поколения","For the next generation:"], heroB:["сапалы білім мен тәрбие","качественное образование и воспитание","quality education and upbringing"],
 heroLead:["Ғани Мұратбаев атындағы гимназия ұлттық құндылықтар мен заманауи білімді ұштастырады. 1–11 сынып оқушылары мен ата-аналарға қажет ақпараттың бәрі осында.","Гимназия имени Гани Муратбаева сочетает национальные ценности и современное образование. Здесь всё, что нужно ученикам 1–11 классов и их родителям.","Gani Muratbayev Gymnasium combines national values with modern education. Everything students in grades 1–11 and their parents need is here."],
 btnNews:["Мектеп жаңалықтары","Новости школы","School news"], btnSched:["Сабақ кестесі","Расписание","Timetable"], kundelik:["Электронды журнал","Электронный журнал","E-journal"],
 emblem:["Гимназия эмблемасы","Эмблема гимназии","Gymnasium emblem"],
 nowT:["Қазір гимназияда","Сейчас в гимназии","Right now at school"], lesson:["{n}-сабақ","{n}-й урок","Lesson {n}"], brk:["Үзіліс","Перемена","Break"],
 next:["Келесі сабақ {t}","Следующий урок в {t}","Next lesson at {t}"], left:["аяқталуына {m} мин","до конца {m} мин","{m} min left"],
 before:["Сабақтың басталуы: {t}","Уроки начнутся в {t}","Lessons start at {t}"], after:["Бүгінгі сабақтар аяқталды","Уроки на сегодня закончились","Lessons are over for today"],
 weekend:["Демалыс күні","Выходной день","Day off"], bellsT:["Қоңырау кестесі","Расписание звонков","Bell schedule"],
 q1:["Сабақ кестесі","Расписание","Timetable"], q1d:["Сабақтар мен қоңыраулар","Уроки и звонки","Lessons and bells"],
 q2d:["Бағалар мен тапсырмалар","Оценки и задания","Grades and homework"],
 q3:["Қабылдау","Приём в гимназию","Admissions"], q3d:["Жиі қойылатын сұрақтар","Частые вопросы","Common questions"],
 q4:["Хабарландырулар","Объявления","Announcements"], q4d:["Маңызды ақпарат","Важная информация","Important notices"],
 dirT:["Білім беру бағыттары","Направления обучения","Areas of study"], dirE:["Гимназия","Гимназия","Gymnasium"],
 d1:["Бастауыш сынып","Начальная школа","Primary school"], d1d:["Сауат ашу, математика, дүниетану және тіл дағдылары.","Грамота, математика, познание мира и языковые навыки.","Literacy, maths, the world around us and languages."],
 d2:["Негізгі орта білім","Основное среднее образование","Lower secondary"], d2d:["Жаратылыстану, дәл және гуманитарлық ғылымдардың іргетасы.","Фундамент естественных, точных и гуманитарных наук.","Foundations in sciences, maths and humanities."],
 d3:["Жалпы орта білім","Общее среднее образование","Upper secondary"], d3d:["Бейіндік пәндер және ҰБТ-ға дайындық.","Профильные предметы и подготовка к ЕНТ.","Specialised subjects and national exam (UNT) preparation."],
 d4:["Үйірмелер мен секциялар","Кружки и секции","Clubs & sports"], d4d:["Спорт, шахмат, робототехника, домбыра және басқалар.","Спорт, шахматы, робототехника, домбра и другое.","Sports, chess, robotics, dombra and more."],
 d5:["Олимпиадалар","Олимпиады","Olympiads"], d5d:["Пәндік олимпиадалар мен байқаулардағы жетістіктер.","Достижения в предметных олимпиадах и конкурсах.","Results in subject olympiads and competitions."],
 d6:["Түлектер","Выпускники","Alumni"], d6d:["Гимназия түлектерінің жолы мен жетістіктері.","Путь и успехи выпускников гимназии.","Where our graduates go and what they achieve."],
 grades14:["1–4 сынып","1–4 классы","Grades 1–4"], grades59:["5–9 сынып","5–9 классы","Grades 5–9"], grades1011:["10–11 сынып","10–11 классы","Grades 10–11"], allGrades:["Барлық сыныптар","Все классы","All grades"],
 open:["Ашу","Открыть","Open"],
 statsT:["Гимназия сандарда","Гимназия в цифрах","The gymnasium in numbers"],
 newsE:["Гимназия өмірі","Жизнь гимназии","Gymnasium life"], newsT:["Соңғы жаңалықтар мен оқиғалар","Последние новости и события","Latest news and events"],
 allNews:["Барлық жаңалықтар","Все новости","All news"], upcoming:["Алдағы іс-шаралар","Ближайшие мероприятия","Upcoming events"], calendar:["Күнтізбе","Календарь","Calendar"],
 noEvents:["Жақын арада іс-шара жоқ","Ближайших мероприятий нет","No upcoming events"],
 partnersT:["Серіктестер","Партнёры","Partners"],
 all:["Барлығы","Все","All"], c_events:["Іс-шаралар","События","Events"], c_achieve:["Жетістіктер","Достижения","Achievements"], c_life:["Мектеп тынысы","Жизнь школы","School life"], c_ann:["Хабарландыру","Объявление","Notice"],
 sample:["Үлгі","Пример","Sample"], readMore:["Толығырақ","Подробнее","Read more"], toNews:["Барлық жаңалықтарға","Ко всем новостям","Back to news"],
 search:["Жаңалықтардан іздеу","Поиск по новостям","Search news"], noResults:["Ештеңе табылмады","Ничего не найдено","Nothing found"],
 pd_about:["Гимназияның тарихы, әкімшілігі, педагогтары және оқу базасы.","История, администрация, педагоги и учебная база гимназии.","History, administration, teachers and facilities."],
 pd_programs:["1–11 сыныптарға арналған оқу бағдарламалары Мемлекеттік жалпыға міндетті білім беру стандартына сай құрылған.","Учебные программы для 1–11 классов составлены по государственному общеобязательному стандарту образования.","Programmes for grades 1–11 follow the national compulsory education standard."],
 pd_schedule:["Сыныпты таңдаңыз: апталық кесте және қоңырау уақыттары.","Выберите класс: расписание на неделю и время звонков.","Pick a grade to see the weekly timetable and bell times."],
 pd_olympiad:["Оқушыларымыздың пәндік олимпиадалар мен байқаулардағы жетістіктері.","Достижения наших учеников в предметных олимпиадах и конкурсах.","Our students' results in subject olympiads and competitions."],
 pd_events:["Гимназияның алдағы және өткен іс-шаралары.","Предстоящие и прошедшие мероприятия гимназии.","Upcoming and past school events."],
 pd_clubs:["Сабақтан тыс уақытқа арналған үйірмелер мен спорт секциялары.","Кружки и спортивные секции во внеурочное время.","After-school clubs and sports sections."],
 pd_gallery:["Оқу жылдары бойынша фотоальбомдар.","Фотоальбомы по учебным годам.","Photo albums by academic year."],
 pd_alumni:["Гимназия түлектері: қайда оқиды, қандай жетістікке жетті.","Выпускники гимназии: где учатся и чего достигли.","Our graduates: where they study and what they've achieved."],
 pd_news:["Гимназия өміріндегі оқиғалар, жетістіктер мен хабарландырулар.","События, достижения и объявления гимназии.","Events, achievements and announcements."],
 pd_docs:["Нормативтік құжаттар мен пайдалы электронды ресурстар.","Нормативные документы и полезные электронные ресурсы.","Regulations and useful online resources."],
 pd_contacts:["Мекенжай, телефон, жұмыс уақыты және жиі қойылатын сұрақтар.","Адрес, телефон, часы работы и частые вопросы.","Address, phone, office hours and common questions."],
 historyT:["Гимназия тарихы","История гимназии","Our history"],
 about1:["Гимназия Ғани Мұратбаевтың (1902–1925) есімімен аталады. Ол қазақ жастар қозғалысының алғашқы ұйымдастырушыларының бірі болған.","Гимназия носит имя Гани Муратбаева (1902–1925), одного из первых организаторов казахского молодёжного движения.","The gymnasium is named after Gani Muratbayev (1902–1925), one of the first organisers of the Kazakh youth movement."],
 about2:["Бүгін гимназияда 1–11 сынып оқушылары мемлекеттік жалпыға міндетті білім беру стандарты бойынша оқиды. Біз білім сапасына, оқушының жеке дамуына және ұлттық құндылықтарды құрметтеуге ерекше мән береміз.","Сегодня в гимназии учатся ученики 1–11 классов по государственному общеобязательному стандарту образования. Мы уделяем особое внимание качеству знаний, личному развитию каждого ученика и уважению к национальным ценностям.","Today students in grades 1–11 study here under the national compulsory education standard. We focus on the quality of learning, each student's personal growth and respect for national values."],
 factsT:["Қысқаша","Коротко","At a glance"], f_addr:["Мекенжай","Адрес","Address"], f_lang:["Оқыту","Обучение","Grades"],
 adminT:["Әкімшілік","Администрация","Administration"], teachersT:["Педагогтар құрамы","Педагогический состав","Teaching staff"], baseT:["Материалдық-техникалық база","Материально-техническая база","Facilities"],
 emptyTeachers:["Педагогтар туралы ақпарат жақында қосылады","Информация о педагогах скоро появится","Teacher profiles are coming soon"],
 emptyAdd:["Өңдеу режимінде «Қосу» батырмасын басыңыз.","Нажмите «Добавить» в режиме редактирования.","Use “Add” in edit mode."],
 progT:["Оқыту деңгейлері бойынша бағдарламалар","Программы по уровням обучения","Programmes by level"],
 progSub:["Пәндер тізімін көру үшін бағдарламаны таңдаңыз.","Выберите программу, чтобы увидеть список предметов.","Choose a programme to see its subjects."],
 f_primary:["Бастауыш (1–4)","Начальная (1–4)","Primary (1–4)"], f_basic:["Негізгі (5–9)","Основная (5–9)","Lower secondary (5–9)"], f_senior:["Жалпы орта (10–11)","Старшая (10–11)","Upper secondary (10–11)"], f_extra:["Факультативтер","Факультативы","Electives"],
 viewSubj:["Пәндер тізімін көру","Посмотреть предметы","View subjects"], subjT:["Оқу жоспарының пәндері","Предметы учебного плана","Subjects in the curriculum"], close:["Жабу","Закрыть","Close"],
 m1:["БЖБ және ТЖБ","СОР и СОЧ","Summative assessment"], m1d:["Білім бөлім бойынша (БЖБ) және тоқсандық (ТЖБ) жиынтық бағалау арқылы өлшенеді.","Знания оцениваются суммативно за раздел (СОР) и за четверть (СОЧ).","Learning is assessed by unit and by term summative assessments."],
 m2:["ҰБТ-ға дайындық","Подготовка к ЕНТ","UNT preparation"], m2d:["10–11 сынып оқушыларына міндетті және бейіндік пәндер бойынша сынақ тестілеу өткізіледі.","Для 10–11 классов проводятся пробные тестирования по обязательным и профильным предметам.","Grades 10–11 sit practice tests in compulsory and specialised subjects."],
 m3:["МЖБС-ке сәйкестік","Соответствие ГОСО","National standard"], m3d:["Оқу жоспарлары мен сағат жүктемесі Оқу-ағарту министрлігінің стандартына сай.","Учебные планы и нагрузка соответствуют стандарту Министерства просвещения.","Curricula and hours follow the Ministry of Education standard."],
 grade:["{n}-сынып","{n} класс","Grade {n}"], today:["Бүгін","Сегодня","Today"],
 days:[["Дүйсенбі","Сейсенбі","Сәрсенбі","Бейсенбі","Жұма"],["Понедельник","Вторник","Среда","Четверг","Пятница"],["Monday","Tuesday","Wednesday","Thursday","Friday"]],
 wdShort:[["Дс","Сс","Ср","Бс","Жм","Сб","Жс"],["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],["Mo","Tu","We","Th","Fr","Sa","Su"]],
 schedNote:["Кесте үлгі ретінде толтырылған. Нақты кесте жақында жарияланады.","Расписание заполнено как пример. Актуальное расписание скоро будет опубликовано.","This timetable is a sample. The actual timetable will be published soon."],
 achT:["Жетістіктер","Достижения","Achievements"], emptyAch:["Жетістіктер тізімі жақында толықтырылады","Список достижений скоро пополнится","Achievements will be added soon"],
 olympText:["Гимназия оқушылары мектепішілік, аудандық, облыстық және республикалық пәндік олимпиадаларға қатысады. Дайындық «Пәндік олимпиадаға дайындық» үйірмесінде жүргізіледі.","Ученики гимназии участвуют в школьных, районных, областных и республиканских предметных олимпиадах. Подготовка идёт в кружке «Подготовка к предметным олимпиадам».","Our students take part in school, district, regional and national subject olympiads, with preparation in the olympiad club."],
 lv_district:["Аудандық","Районный","District"], lv_region:["Облыстық","Областной","Regional"], lv_republic:["Республикалық","Республиканский","National"], lv_intl:["Халықаралық","Международный","International"],
 eventsOn:["{d} іс-шаралары","Мероприятия {d}","Events on {d}"], upcomingAll:["Алдағы іс-шаралар","Предстоящие мероприятия","Upcoming events"], past:["Өткен іс-шаралар","Прошедшие мероприятия","Past events"],
 gradesL:["Сыныптар","Классы","Grades"],
 photosN:["{n} фото","{n} фото","{n} photos"], noPhotos:["Фото жақында қосылады","Фото скоро появятся","Photos coming soon"], toGallery:["Галереяға оралу","Назад в галерею","Back to gallery"], allYears:["Барлық жылдар","Все годы","All years"],
 emptyAlumni:["Түлектер туралы әңгімелер жақында жарияланады","Истории выпускников скоро появятся","Alumni stories are coming soon"], gradYear:["Бітірген жылы","Год выпуска","Class of"],
 docsT:["Нормативтік құжаттар","Нормативные документы","Regulations"], resT:["Электронды ресурстар","Электронные ресурсы","Online resources"],
 addr:["Жамбыл облысы, Байзақ ауданы, Сарыкемер ауылы, Қосы батыр көшесі, 47","Жамбылская обл., Байзакский р-н, с. Сарыкемер, ул. Косы батыра, 47","47 Kosy Batyr St, Sarykemer, Baizak district, Zhambyl region"],
 phoneL:["Қабылдау бөлмесі","Приёмная","School office"], emailL:["Email","Email","Email"], hoursL:["Жұмыс уақыты","Часы работы","Office hours"], postL:["Пошта индексі","Почтовый индекс","Postcode"], dirL:["Директор","Директор","Principal"],
 openIn:["Картадан ашу:","Открыть на карте:","Open in maps:"], faqT:["Жиі қойылатын сұрақтар","Частые вопросы","Frequently asked questions"], wa:["WhatsApp арқылы жазу","Написать в WhatsApp","Message on WhatsApp"],
 copy:["Көшіру","Копировать","Copy"], copied:["Көшірілді","Скопировано","Copied"], mapStreet:["Қосы батыр к.","ул. Косы батыра","Kosy Batyr St"], village:["Сарыкемер","Сарыкемер","Sarykemer"],
 fdesc:["Сапалы білім мен өнегелі тәрбие ордасы. Жамбыл облысы, Байзақ ауданы, Сарыкемер ауылы.","Качественное образование и достойное воспитание. Жамбылская область, Байзакский район, село Сарыкемер.","Quality education and upbringing. Sarykemer village, Baizak district, Zhambyl region."],
 quickL:["Жылдам сілтемелер","Быстрые ссылки","Quick links"], rights:["Барлық құқықтар қорғалған.","Все права защищены.","All rights reserved."],
 loginT:["Жеке кабинетке кіру","Вход в личный кабинет","Sign in"], loginSub:["Бағалар, үй тапсырмалары және сабақ кестесі BilimClass электронды журналында. Логин мен құпия сөзді сынып жетекшісі береді.","Оценки, домашние задания и расписание — в электронном журнале BilimClass. Логин и пароль выдаёт классный руководитель.","Grades, homework and timetables are in the BilimClass e-journal. Your class teacher provides the login."],
 optStudent:["Оқушы немесе ата-ана","Ученик или родитель","Student or parent"], optTeacher:["Мұғалім","Учитель","Teacher"], goKundelik:["BilimClass жүйесіне кіру","Войти в BilimClass","Sign in to BilimClass"],
 optAdmin:["Сайт әкімшісі","Администратор сайта","Site administrator"], enterEdit:["Сайтты өңдеу","Редактировать сайт","Edit the site"], adminNote:["Сайтты өңдеу тек гимназия әкімшілігіне қолжетімді.","Редактирование сайта доступно только администрации гимназии.","Editing is available to the school administration only."],
 edit:["Өңдеу","Редактировать","Edit"], done:["Аяқтау","Готово","Done"], save:["Жариялау","Опубликовать","Publish"], saving:["Жариялануда…","Публикую…","Publishing…"], discard:["Бас тарту","Отменить","Discard"],
 unsaved:["Жарияланбаған өзгеріс: {n}","Неопубликованных изменений: {n}","{n} unpublished changes"], nochg:["Өңдеу режимі","Режим редактирования","Edit mode"],
 add:["Қосу","Добавить","Add"], del:["Жою","Удалить","Delete"], sure:["Жою?","Удалить?","Delete?"], cancel:["Бас тарту","Отмена","Cancel"], ok:["Сақтау","Сохранить","Save"], settings:["Баптаулар","Настройки","Settings"],
 f_title:["Тақырыбы","Заголовок","Title"], f_text:["Мәтіні","Текст","Text"], f_date:["Күні","Дата","Date"], f_time:["Уақыты","Время","Time"], f_place:["Өтетін орны","Место","Place"], f_cat:["Санаты","Категория","Category"],
 f_img:["Сурет","Изображение","Image"], f_name:["Аты-жөні","ФИО","Full name"], f_role:["Лауазымы / пәні","Должность / предмет","Position / subject"], f_group:["Бөлім","Раздел","Section"],
 f_desc:["Сипаттамасы","Описание","Description"], f_when:["Уақыты","Когда","When"], f_grades:["Сыныптар","Классы","Grades"], f_year:["Жылы","Год","Year"], f_level:["Деңгейі","Уровень","Level"],
 f_url:["Сілтеме (https://…)","Ссылка (https://…)","Link (https://…)"], f_q:["Сұрақ","Вопрос","Question"], f_a:["Жауап","Ответ","Answer"], f_kind:["Түрі","Тип","Type"],
 f_phone:["Телефон","Телефон","Phone"], f_whatsapp:["WhatsApp нөмірі (тек цифрлар)","Номер WhatsApp (только цифры)","WhatsApp number (digits only)"], f_hours:["Жұмыс уақыты","Часы работы","Office hours"],
 f_acad:["Оқу жылы","Учебный год","Academic year"], f_stat:["Көрсеткіш","Показатель","Figure"], f_motto:["Ұран","Девиз","Motto"], f_director:["Директор","Директор","Principal"],
 addPhotos:["Фото қосу","Добавить фото","Add photos"], caption:["Сипаттама","Подпись","Caption"],
 g_admin:["Әкімшілік","Администрация","Administration"], g_teacher:["Педагог","Педагог","Teacher"], k_docs:["Құжат","Документ","Document"], k_res:["Ресурс","Ресурс","Resource"],
 needTitle:["Кемінде бір тілде толтырыңыз.","Заполните хотя бы на одном языке.","Fill it in at least one language."],
 readonly:["Бұл бетті өңдеуге рұқсатыңыз жоқ.","У вас нет прав на редактирование.","You don't have permission to edit this page."],
 conflict:["Бетті басқа біреу жаңартты, жаңа нұсқа ашылуда.","Страницу обновил кто-то другой, открываю новую версию.","Someone else updated the page; loading the new version."],
 err:["Жариялау мүмкін болмады. Кейінірек қайталаңыз.","Не удалось опубликовать. Попробуйте позже.","Couldn't publish. Try again later."], rate:["Тым жиі. Бір минуттан кейін қайталаңыз.","Слишком часто. Повторите через минуту.","Too often. Try again in a minute."],
 tooBig:["Бет тым үлкен. Кейбір фотоларды жойыңыз.","Страница слишком большая. Удалите часть фото.","The page is too large. Remove some photos."],
 statsNote:["Сандар үлгі ретінде көрсетілген.","Цифры указаны как пример.","Figures shown as a sample."]
};
var MON=[["қаңтар","ақпан","наурыз","сәуір","мамыр","маусым","шілде","тамыз","қыркүйек","қазан","қараша","желтоқсан"],["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"],["January","February","March","April","May","June","July","August","September","October","November","December"]];
var MONN=[["Қаңтар","Ақпан","Наурыз","Сәуір","Мамыр","Маусым","Шілде","Тамыз","Қыркүйек","Қазан","Қараша","Желтоқсан"],["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],null];
var MONS=[["қаң","ақп","нау","сәу","мам","мау","шіл","там","қыр","қаз","қар","жел"],["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]];
var WDL=[["Жексенбі","Дүйсенбі","Сейсенбі","Сәрсенбі","Бейсенбі","Жұма","Сенбі"],["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"],["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]];
MONN[2]=MON[2];

var SUBJ={kaz:["Қазақ тілі","Казахский язык","Kazakh language"],kazlit:["Қазақ әдебиеті","Казахская литература","Kazakh literature"],read:["Әдебиеттік оқу","Литературное чтение","Literary reading"],rus:["Орыс тілі мен әдебиеті","Русский язык и литература","Russian language & literature"],eng:["Ағылшын тілі","Английский язык","English"],math:["Математика","Математика","Mathematics"],alg:["Алгебра","Алгебра","Algebra"],geom:["Геометрия","Геометрия","Geometry"],inf:["Информатика","Информатика","Computer science"],digi:["Цифрлық сауаттылық","Цифровая грамотность","Digital literacy"],nat:["Жаратылыстану","Естествознание","Natural science"],world:["Дүниетану","Познание мира","Knowledge of the world"],histkz:["Қазақстан тарихы","История Казахстана","History of Kazakhstan"],histw:["Дүниежүзі тарихы","Всемирная история","World history"],bio:["Биология","Биология","Biology"],chem:["Химия","Химия","Chemistry"],phys:["Физика","Физика","Physics"],geo:["География","География","Geography"],pe:["Дене шынықтыру","Физическая культура","Physical education"],art:["Көркем еңбек","Художественный труд","Arts & crafts"],music:["Музыка","Музыка","Music"],law:["Құқық негіздері","Основы права","Fundamentals of law"],nvtp:["АӘТД","НВТП","Pre-military training"],graph:["Графика және жобалау","Графика и проектирование","Graphics & design"],selfk:["Өзін-өзі тану","Самопознание","Self-knowledge"]};

var PROG={
 primary:{g:"1–4",cls:"g1",subj:["kaz","read","rus","eng","math","world","nat","digi","art","music","pe","selfk"],
  sub:["Бастауыш мектеп","Начальная школа","Primary school"],title:["Бастауыш білім беру бағдарламасы","Программа начального образования","Primary education programme"],
  desc:["Сауат ашу, математикалық негіз, дүниетану және жаратылыстану. 3-сыныптан цифрлық сауаттылық.","Грамота, математическая база, познание мира и естествознание. С 3 класса — цифровая грамотность.","Literacy, maths foundations, the world around us and science. Digital literacy from grade 3."],
  out:["Оқушылар оқу, жазу, есептеу дағдыларын меңгеріп, 5-сыныпқа дайын болады.","Ученики осваивают чтение, письмо и счёт и готовы к переходу в 5 класс.","Students master reading, writing and arithmetic and are ready for grade 5."]},
 basic:{g:"5–9",cls:"g2",subj:["kaz","kazlit","rus","eng","math","alg","geom","inf","histkz","histw","bio","chem","phys","geo","art","music","pe"],
  sub:["Негізгі мектеп","Основная школа","Lower secondary"],title:["Негізгі орта білім беру бағдарламасы","Программа основного среднего образования","Lower secondary programme"],
  desc:["Алгебра, геометрия, физика, химия, биология, география және тарихты жүйелі меңгеру.","Системное изучение алгебры, геометрии, физики, химии, биологии, географии и истории.","Systematic study of algebra, geometry, physics, chemistry, biology, geography and history."],
  out:["9-сынып соңында негізгі орта білім туралы куәлік беріледі.","По окончании 9 класса выдаётся свидетельство об основном среднем образовании.","Grade 9 graduates receive the lower secondary certificate."]},
 senior:{g:"10–11",cls:"g3",subj:["kaz","kazlit","rus","eng","alg","geom","inf","histkz","histw","law","bio","chem","phys","geo","graph","nvtp","pe"],
  sub:["ЖМБ / ҚГБ","ЕМН / ОГН","STEM / Humanities"],title:["Жалпы орта білім және ҰБТ-ға дайындық","Общее среднее образование и подготовка к ЕНТ","Upper secondary and UNT preparation"],
  desc:["Жаратылыстану-математикалық және қоғамдық-гуманитарлық бағыттар, бейіндік пәндер.","Естественно-математическое и общественно-гуманитарное направления, профильные предметы.","Science-and-maths and humanities tracks with specialised subjects."],
  out:["Түлектер ҰБТ тапсырып, жоғары оқу орындарының гранттарына қатыса алады.","Выпускники сдают ЕНТ и участвуют в конкурсе на гранты вузов.","Graduates sit the UNT and compete for university grants."]},
 extra:{g:"1–11",cls:"g4",subj:[],
  sub:["Вариативтік компонент","Вариативный компонент","Elective component"],title:["Үйірмелер, факультативтер және олимпиада","Кружки, факультативы и олимпиады","Clubs, electives and olympiads"],
  desc:["Қосымша дамыту сабақтары, спорт секциялары, шахмат және өнер үйірмелері.","Дополнительные развивающие занятия, спортивные секции, шахматы и творческие кружки.","Extra enrichment classes, sports, chess and arts clubs."],
  out:["Дарынды оқушылар облыстық және республикалық байқауларға қатысады.","Одарённые ученики участвуют в областных и республиканских конкурсах.","Talented students compete at regional and national level."]}
};

/* ------------------------------------------------------------ icons & emblem */
var IC={play:'<path d="M8 5.5v13l10.5-6.5z"/>',pin:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
 phone:'<path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 12l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', login:'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
 cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v5"/>', mega:'<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 8a5 5 0 0 1 0 8"/>',
 trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 13.5a7 7 0 0 1 4 6.5"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
 file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
 link:'<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>', search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>', menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 build:'<path d="M3 21h18M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/>', star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 msg:'<path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5A8 8 0 1 1 21 12z"/>', insta:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
 tg:'<path d="M21 4L3 11l6 2 2 6 3-4 5 4z"/><path d="M9 13l9-6"/>', fb:'<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
 edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>', trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', plus:'<path d="M12 5v14M5 12h14"/>',
 chev:'<path d="M6 9l6 6 6-6"/>', left:'<path d="M15 6l-6 6 6 6"/>', right:'<path d="M9 6l6 6-6 6"/>',
 ball:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>', flask:'<path d="M9 3h6M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3"/>',
 bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>', gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'};
function ic(n){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[n]||"")+'</svg>'}
var emN=0;
var HORN="M20 21V11C20 4 14 1.5 9.5 3.5 5.5 5.3 6.2 11 10.5 11 13.7 11 13.8 6.8 11.5 6.8M20 11C20 4 26 1.5 30.5 3.5 34.5 5.3 33.8 11 29.5 11 26.3 11 26.2 6.8 28.5 6.8";
function emblem(cls){return '<img class="em '+(cls||"")+'" src="assets/logo.png" alt="'+esc(t("emblem"))+'" width="120" height="120" decoding="async">'}


var T2={
 cabinet:["Жеке кабинет","Личный кабинет","My account"], emailF:["Электрондық пошта","Электронная почта","Email"], passF:["Құпия сөз","Пароль","Password"],
 pass2F:["Құпия сөзді қайталаңыз","Повторите пароль","Repeat password"], fullName:["Аты-жөні","ФИО","Full name"], roleF:["Мен —","Я —","I am a"],
 r_student:["Оқушы","Ученик","Student"], r_parent:["Ата-ана","Родитель","Parent"], r_teacher:["Мұғалім","Учитель","Teacher"],
 signIn:["Кіру","Войти","Sign in"], signUp:["Тіркелу","Зарегистрироваться","Create account"],
 noAcc:["Аккаунтыңыз жоқ па?","Нет аккаунта?","No account yet?"], haveAcc:["Аккаунтыңыз бар ма?","Уже есть аккаунт?","Already have an account?"],
 forgot:["Құпия сөзді ұмыттыңыз ба?","Забыли пароль?","Forgot password?"], resetT:["Құпия сөзді қалпына келтіру","Восстановление пароля","Reset password"],
 resetSub:["Поштаңызды жазыңыз, біз қалпына келтіру сілтемесін жібереміз.","Укажите почту, и мы отправим ссылку для восстановления.","Enter your email and we'll send a reset link."],
 sendLink:["Сілтеме жіберу","Отправить ссылку","Send link"], linkSent:["Хат жіберілді. Поштаңызды тексеріңіз.","Письмо отправлено. Проверьте почту.","Email sent. Check your inbox."],
 regT:["Тіркелу","Регистрация","Create an account"], loginT2:["Жеке кабинетке кіру","Вход в личный кабинет","Sign in to your account"],
 regDone:["Тіркелу сәтті өтті. Поштаңызға келген хаттағы сілтеме арқылы аккаунтты растаңыз.","Готово. Подтвердите аккаунт по ссылке из письма, которое пришло на почту.","Done. Confirm your account with the link we emailed you."],
 newPassT:["Жаңа құпия сөз","Новый пароль","New password"], passSaved:["Құпия сөз жаңартылды","Пароль обновлён","Password updated"], back:["Артқа","Назад","Back"],
 or:["немесе","или","or"], viaBilim:["BilimClass арқылы кіру","Войти через BilimClass","Sign in with BilimClass"], bilimNote:["Бағалар мен үй тапсырмалары BilimClass жүйесінде","Оценки и домашние задания — в BilimClass","Grades and homework are in BilimClass"],
 signOut:["Шығу","Выйти","Sign out"], adminBadge:["Әкімші","Администратор","Administrator"], usersT:["Тіркелген пайдаланушылар","Зарегистрированные пользователи","Registered users"],
 noUsers:["Әзірге ешкім тіркелмеген","Пока никто не зарегистрировался","No one has registered yet"],
 noAuth:["Кіру жүйесі әлі қосылмаған. Сайт әкімшісі баптауды аяқтағаннан кейін жұмыс істейді.","Вход пока не подключён. Заработает, когда администратор завершит настройку.","Sign-in isn't connected yet. It will work once the administrator finishes setup."],
 e_cred:["Пошта немесе құпия сөз қате","Неверная почта или пароль","Wrong email or password"], e_confirm:["Алдымен поштаңызды растаңыз","Сначала подтвердите почту","Please confirm your email first"],
 e_exists:["Бұл поштамен тіркелген аккаунт бар","Аккаунт с этой почтой уже есть","An account with this email already exists"], e_short:["Құпия сөз кемінде 8 таңбадан тұруы керек","Пароль должен быть не короче 8 символов","Password must be at least 8 characters"],
 e_match:["Құпия сөздер сәйкес емес","Пароли не совпадают","Passwords don't match"], e_generic:["Қате орын алды. Қайталап көріңіз.","Произошла ошибка. Попробуйте ещё раз.","Something went wrong. Please try again."],
 e_rate:["Тым көп әрекет. Біраз күтіп, қайталаңыз.","Слишком много попыток. Подождите и повторите.","Too many attempts. Wait a bit and try again."],
 saved:["Сайт жаңартылды","Сайт обновлён","Site updated"], upErr:["Фото жүктелмеді","Не удалось загрузить фото","Couldn't upload the photo"], uploading:["Жүктелуде…","Загрузка…","Uploading…"]
};
for(var _k in T2)T[_k]=T2[_k];

var T3={
 p_me:["Профиль","Профиль","Profile"], p_sec:["Қауіпсіздік","Безопасность","Security"], p_dash:["Басқару панелі","Панель управления","Dashboard"], p_users:["Пайдаланушылар","Пользователи","Users"],
 memberSince:["Тіркелген күні","Дата регистрации","Member since"], gradeF:["Сынып (мысалы, 7А)","Класс (например, 7А)","Class (e.g. 7A)"], phoneF:["Телефон","Телефон","Phone"],
 changePhoto:["Суретті өзгерту","Сменить фото","Change photo"], profSaved:["Профиль сақталды","Профиль сохранён","Profile saved"],
 pwT:["Құпия сөзді өзгерту","Смена пароля","Change password"], signOutAll:["Барлық құрылғылардан шығу","Выйти на всех устройствах","Sign out on all devices"],
 needLogin:["Жеке кабинетті ашу үшін кіріңіз немесе тіркеліңіз.","Войдите или зарегистрируйтесь, чтобы открыть личный кабинет.","Sign in or create an account to open your profile."],
 pd_profile:["Жеке деректер, құпия сөз және сайт баптаулары.","Личные данные, пароль и настройки.","Your details, password and settings."],
 d_users:["Пайдаланушылар","Пользователи","Users"], d_posts:["Жаңалықтар","Новости","News posts"], d_events:["Алдағы іс-шаралар","Ближайшие мероприятия","Upcoming events"], d_photos:["Фотосуреттер","Фотографии","Photos"],
 lastPub:["Соңғы жариялау","Последняя публикация","Last published"], never:["Әлі жарияланбаған","Ещё не публиковалось","Not published yet"],
 qaT:["Жылдам әрекеттер","Быстрые действия","Quick actions"], qa_post:["Жаңалық қосу","Добавить новость","Add news"], qa_event:["Іс-шара қосу","Добавить мероприятие","Add event"],
 qa_sched:["Кестені өзгерту","Изменить расписание","Edit timetable"], qa_album:["Альбом қосу","Добавить альбом","Add album"],
 recentReg:["Жаңа тіркелгендер","Новые регистрации","New sign-ups"], usersSearch:["Аты немесе пошта бойынша іздеу","Поиск по имени или почте","Search by name or email"],
 makeAdmin:["Әкімші ету","Сделать админом","Make admin"], removeAdmin:["Құқықты алу","Снять права","Remove admin"], you:["Сіз","Вы","You"],
 adminChanged:["Құқықтар жаңартылды","Права обновлены","Permissions updated"], lastAdmin:["Соңғы әкімшіні алып тастауға болмайды","Нельзя снять последнего администратора","You can't remove the last administrator"],
 loading:["Жүктелуде…","Загрузка…","Loading…"], byRole:["Рөлдер бойынша","По ролям","By role"], admins:["Әкімшілер","Администраторы","Administrators"]
};
for(var _k3 in T3)T[_k3]=T3[_k3];

var T4={
 navFeedback:["Пікірлер мен ұсыныстар","Отзывы и предложения","Feedback"],
 pd_feedback:["Гимназия туралы пікіріңізді, ұсынысыңызды немесе алғысыңызды жазыңыз. Тіркелу қажет емес.","Оставьте отзыв, предложение или благодарность гимназии. Регистрация не нужна.","Share a review, an idea or a thank-you with the school. No account needed."],
 fbFormT:["Пікір немесе ұсыныс қалдыру","Оставить отзыв или предложение","Leave feedback or a suggestion"], fbListT:["Ата-аналар мен оқушылар пікірі","Отзывы родителей и учеников","What parents and students say"],
 fbName:["Атыңыз (міндетті емес)","Имя (необязательно)","Your name (optional)"], fbAnon:["Аноним","Аноним","Anonymous"],
 fbWho:["Сіз кімсіз?","Кто вы?","You are"], w_parent:["Ата-ана","Родитель","Parent"], w_student:["Оқушы","Ученик","Student"], w_graduate:["Түлек","Выпускник","Graduate"], w_other:["Басқа","Другое","Other"],
 fbKind:["Түрі","Тип","Type"], k_review:["Пікір","Отзыв","Review"], k_idea:["Ұсыныс","Предложение","Suggestion"], k_thanks:["Алғыс","Благодарность","Thank-you"], k_complaint:["Шағым","Жалоба","Complaint"],
 fbRating:["Бағаңыз","Ваша оценка","Your rating"], fbText:["Мәтін","Текст","Message"], fbTextPh:["Пікіріңізді немесе ұсынысыңызды жазыңыз (кемінде 15 таңба)","Напишите отзыв или предложение (не менее 15 символов)","Write your feedback or suggestion (at least 15 characters)"],
 fbContact:["Байланыс (міндетті емес)","Контакт (необязательно)","Contact (optional)"], fbContactPh:["Телефон немесе пошта: жауап алу үшін","Телефон или почта, чтобы получить ответ","Phone or email if you'd like a reply"],
 fbContactNote:["Байланыс деректерін тек гимназия әкімшілігі көреді.","Контакты видит только администрация гимназии.","Only the school administration sees your contact details."],
 fbPublic:["Пікірімді сайтта жариялауға келісемін","Согласен(на) на публикацию отзыва на сайте","I agree to have my feedback published on the site"],
 fbCheck:["Тексеру: {a} + {b} = ?","Проверка: {a} + {b} = ?","Check: {a} + {b} = ?"], fbSend:["Жіберу","Отправить","Send"],
 fbSent:["Рақмет! Пікіріңіз қабылданды. Модерациядан кейін жарияланады.","Спасибо! Отзыв принят и появится после проверки.","Thank you! Your feedback will appear after review."],
 fbSentPrivate:["Рақмет! Хабарламаңызды гимназия әкімшілігі оқиды.","Спасибо! Сообщение получит администрация гимназии.","Thank you! The school administration will read your message."],
 fbModNote:["Хабарламаңызды тек гимназия әкімшілігі оқиды, сайтта жарияланбайды.","Ваше сообщение прочитает только администрация гимназии, на сайте оно не публикуется.","Only the school administration reads your message; it is not published on the site."],
 e_fbShort:["Мәтін тым қысқа (кемінде 15 таңба)","Текст слишком короткий (минимум 15 символов)","The message is too short (15 characters minimum)"],
 e_fbCheck:["Тексеру жауабы қате","Неверный ответ на проверку","Wrong answer to the check"], e_fbFast:["Тым жылдам. Мәтінді қайта тексеріп, тағы жіберіңіз.","Слишком быстро. Проверьте текст и отправьте ещё раз.","Too fast. Review your text and send again."],
 e_fbRate:["Сіз жақында пікір жібердіңіз. Біраз уақыттан кейін қайталаңыз.","Вы недавно отправляли отзыв. Попробуйте позже.","You sent feedback recently. Please try again later."],
 fbNone:["Әзірге жарияланған пікір жоқ. Бірінші болып жазыңыз!","Пока нет опубликованных отзывов. Напишите первым!","No published feedback yet. Be the first!"],
 fbReply:["Гимназия жауабы","Ответ гимназии","School's reply"], fbAvg:["Орташа баға","Средняя оценка","Average rating"], fbCount:["{n} пікір","{n} отзывов","{n} reviews"], showMore:["Тағы көрсету","Показать ещё","Show more"],
 fbHomeCta:["Пікір қалдыру","Оставить отзыв","Leave feedback"], p_fb:["Пікірлер","Отзывы","Feedback"],
 s_pending:["Жаңа","Новые","New"], s_approved:["Жарияланған","Опубликованы","Published"], s_read:["Оқылған (жабық)","Прочитаны (закрытые)","Read (private)"], s_rejected:["Қабылданбаған","Отклонены","Rejected"], s_spam:["Спам","Спам","Spam"],
 approve:["Жариялау","Опубликовать","Publish"], markRead:["Оқылды","Прочитано","Mark read"], reject:["Қабылдамау","Отклонить","Reject"], saveReply:["Жауапты сақтау","Сохранить ответ","Save reply"],
 privateOnly:["Автор жариялауға келіспеген","Автор не разрешил публикацию","Author did not allow publishing"], d_fb:["Жаңа пікірлер","Новые отзывы","New feedback"], done2:["Бұл бөлімде хабарлама жоқ","В этом разделе сообщений нет","No messages here"]
};
for(var _k4 in T4)T[_k4]=T4[_k4];

var T5={stripT:["Мектеп өмірінен","Из жизни школы","School life"], allPhotos:["Барлық фото","Все фото","All photos"], stripAdd:["Фото қосу","Добавить фото","Add photos"],
 ph1:["Білім күні","День знаний","Knowledge Day"], ph2:["Сабақ үстінде","На уроке","In class"], ph3:["Спорт жарысы","Спортивные соревнования","Sports day"], ph4:["Кітапхана","Библиотека","Library"],
 ph5:["Мерекелік концерт","Праздничный концерт","Holiday concert"], ph6:["Наурыз мейрамы","Наурыз","Nauryz"], ph7:["Олимпиада","Олимпиада","Olympiad"], ph8:["Соңғы қоңырау","Последний звонок","Last Bell"]};
for(var _k5 in T5)T[_k5]=T5[_k5];

var T6={
 p_roles:["Рөлдер","Роли","Roles"], noRole:["Рөлсіз","Без роли","No role"], staffF:["Қызметкерлер","Сотрудники","Staff"],
 roleName:["Рөл атауы","Название роли","Role name"], newRole:["Жаңа рөл","Новая роль","New role"], permsT:["Рұқсаттар","Права","Permissions"],
 systemRole:["Жүйелік рөл: барлық құқық бар, өзгертуге болмайды","Системная роль: все права, изменить нельзя","System role: full access, can't be changed"],
 roleSaved:["Рөл сақталды","Роль сохранена","Role saved"], roleDeleted:["Рөл жойылды","Роль удалена","Role deleted"],
 roleHint:["Рөлді адамға «Пайдаланушылар» бөлімінде беріңіз. Рөлсіз адам сайтты өзгерте алмайды.","Назначить роль человеку можно в разделе «Пользователи». Без роли человек ничего не может менять на сайте.","Assign roles to people in the Users tab. People without a role can't change the site."],
 nothingToSave:["Жарияланатын өзгеріс жоқ","Нет изменений для публикации","Nothing to publish"], roleUsers:["{n} адам","{n} чел.","{n} people"],
 roleDelWarn:["Бұл рөлдегі адамдар рөлсіз қалады","Люди с этой ролью останутся без роли","People with this role will lose it"],
 perm_news:["Жаңалықтар мен хабарландырулар","Новости и объявления","News and announcements"],
 perm_events:["Іс-шаралар күнтізбесі","Календарь мероприятий","Events calendar"],
 perm_gallery:["Фотогалерея","Фотогалерея","Photo gallery"],
 perm_schedule:["Сабақ және қоңырау кестесі","Расписание уроков и звонков","Lesson and bell timetable"],
 perm_about:["Гимназия туралы: педагогтар, база, серіктестер, сұрақтар","О гимназии: педагоги, база, партнёры, вопросы","About: staff, facilities, partners, FAQ"],
 perm_life:["Үйірмелер, жетістіктер, түлектер","Кружки, достижения, выпускники","Clubs, achievements, alumni"],
 perm_docs:["Электронды ресурстар мен құжаттар","Электронные ресурсы и документы","Online resources and documents"],
 perm_settings:["Байланыс деректері және баптаулар","Контакты и настройки сайта","Contacts and site settings"],
 perm_feedback:["Пікірлерді модерациялау","Модерация отзывов","Feedback moderation"],
 perm_users:["Пайдаланушылар мен рөлдер (толық әкімші)","Пользователи и роли (полный администратор)","Users and roles (full admin)"]
};
for(var _k6 in T6)T[_k6]=T6[_k6];
var PERMS=["news","events","gallery","schedule","about","life","docs","settings","feedback","users"];
var COLPERM={posts:"news",events:"events",albums:"gallery",docs:"docs",staff:"about",facilities:"about",partners:"about",faq:"about",clubs:"life",achievements:"life",alumni:"life"};
var SECS={settings:["settings"],posts:["posts"],events:["events"],albums:["albums"],schedule:["classes","bells","bells2"],docs:["docs"],staff:["staff"],facilities:["facilities"],partners:["partners"],faq:["faq"],clubs:["clubs"],achievements:["achievements"],alumni:["alumni"]};
var SECPERM={settings:"settings",posts:"news",events:"events",albums:"gallery",schedule:"schedule",docs:"docs",staff:"about",facilities:"about",partners:"about",faq:"about",clubs:"life",achievements:"life",alumni:"life"};
PERMS.splice(PERMS.indexOf("docs")+1,0,"projects");
SECS.projects=["projects"];SECPERM.projects="projects";COLPERM.projects="projects";
function regProj(id){var c="pi_"+id;SECS[c]=[c];SECPERM[c]="p_"+id;COLPERM[c]="p_"+id;if(typeof SCHEMA!=="undefined")SCHEMA[c]=SCHEMA.pitem;if(!Array.isArray(DATA[c]))DATA[c]=[]}
function can(p){return st.perms.indexOf(p)>=0||(/^p_/.test(p)&&st.perms.indexOf("projects")>=0)}
function canCol(col){return can(COLPERM[col])}
function secData(sec){var o={};SECS[sec].forEach(function(k){o[k]=DATA[k]});return o}
function snapshot(){st.base={};Object.keys(SECS).forEach(function(s){st.base[s]=JSON.stringify(secData(s))})}

var T7={
 adminPanel:["Басқару панелі","Панель управления","Admin panel"], adminShort:["Басқару","Управление","Admin"],
 pd_admin:["Сайтты басқару: мазмұн, пікірлер, пайдаланушылар және рөлдер.","Управление сайтом: содержимое, отзывы, пользователи и роли.","Manage the site: content, feedback, users and roles."],
 a_content:["Сайт мазмұны","Содержимое сайта","Site content"], noAccess:["Бұл бетке кіруге рұқсатыңыз жоқ. Рөл беру үшін әкімшіге жүгініңіз.","Нет доступа к этой странице. Обратитесь к администратору, чтобы получить роль.","You don't have access to this page. Ask the administrator for a role."],
 openEdit:["Өңдеу","Редактировать","Edit"], nItems:["{n} жазба","{n} записей","{n} items"], backSite:["Сайтқа оралу","Вернуться на сайт","Back to site"],
 a_contentHint:["Бөлімді ашыңыз: өңдеу режимі қосылады. Өзгерістерден кейін төмендегі «Жариялау» батырмасын басыңыз.","Откройте раздел — включится режим редактирования. После изменений нажмите «Опубликовать» внизу экрана.","Open a section to edit it. When you're done, press “Publish” at the bottom of the screen."],
 settingsHint:["Сақтағаннан кейін төмендегі «Жариялау» батырмасын басыңыз.","После сохранения нажмите «Опубликовать» внизу экрана.","After saving, press “Publish” at the bottom of the screen."], pubHint:["Барлық өзгеріс сайтта «Жариялау» батырмасын басқаннан кейін көрінеді.","Все изменения появляются на сайте после нажатия «Опубликовать».","Changes appear on the site after you press “Publish”."]
};
for(var _k7 in T7)T[_k7]=T7[_k7];

var T8={shift1:["1-ауысым","1 смена","Shift 1"], shift2:["2-ауысым","2 смена","Shift 2"],
 before2:["2-ауысымның басталуы: {t}","Вторая смена начнётся в {t}","Shift 2 starts at {t}"],
 bells2T:["Қоңырау кестесі — 2-ауысым","Расписание звонков — 2 смена","Bell schedule — shift 2"],
 bells1T:["Қоңырау кестесі — 1-ауысым","Расписание звонков — 1 смена","Bell schedule — shift 1"],
 addBell:["+ сабақ","+ урок","+ lesson"], rmBell:["− сабақ","− урок","− lesson"]};
for(var _k8 in T8)T[_k8]=T8[_k8];

var T9={f_logo:["Логотип","Логотип","Logo"],logoHint:["PNG мөлдір фонмен жақсы көрінеді. Сурет 400 px-ке дейін кішірейтіледі.","Лучше всего PNG с прозрачным фоном. Картинка уменьшится до 400 px.","PNG with a transparent background works best. Images are resized to 400 px."]};
for(var _k9 in T9)T[_k9]=T9[_k9];

var T10={clsTitle:["{c} сынып","{c} класс","Class {c}"], gradeL:["Параллель","Параллель","Grade"], letterL:["Әрпі","Буква","Letter"],
 roomL:["каб.","каб.","room"], gym:["спорт залы","спортзал","gym"], noLessons:["Сабақ жоқ","Уроков нет","No lessons"],
 ttLegend:["(к) — кеңейтілген, (т) — тереңдетілген, (у) — углублённый, (р) — расширенный.","(к) — кеңейтілген, (т) — тереңдетілген, (у) — углублённый, (р) — расширенный.","(к), (р) — extended course; (т), (у) — advanced course."],
 ttSource:["2026–2027 оқу жылының сабақ кестесі (директор бекіткен, 31.08.2026).","Расписание на 2026–2027 учебный год (утверждено директором 31.08.2026).","2026–2027 timetable (approved by the principal on 31.08.2026)."],
 addClass:["Сынып қосу","Добавить класс","Add class"], delClass:["Сыныпты жою","Удалить класс","Delete class"], shiftL:["Ауысым","Смена","Shift"],
 subjPh:["Пән","Предмет","Subject"], roomPh:["Каб.","Каб.","Room"], addLessonB:["+ сабақ","+ урок","+ lesson"], noClasses:["Кесте әлі жүктелмеген","Расписание ещё не загружено","No timetable yet"],
 pickClass:["Сыныпты таңдаңыз","Выберите класс","Choose a class"], nClasses:["{n} сынып","{n} классов","{n} classes"]};
for(var _k10 in T10)T[_k10]=T10[_k10];
var LETTERS="АӘБВГҒДЕЖЗИ";
function clsSort(a,b){var ga=parseInt(a,10),gb=parseInt(b,10);if(ga!==gb)return ga-gb;return LETTERS.indexOf(a.slice(-1))-LETTERS.indexOf(b.slice(-1))}
var T11={pickSubj:["— Пәнді таңдаңыз —","— Выберите предмет —","— Choose a subject —"],otherSubj:["＋ Басқа пән (жазу)…","＋ Другой предмет (ввести)…","＋ Other subject (type)…"],newSubjPh:["Жаңа пәннің атауы","Название нового предмета","New subject name"]};
for(var _k11 in T11)T[_k11]=T11[_k11];
function allSubjects(){var m={};Object.keys(DATA.classes||{}).forEach(function(k){DATA.classes[k].days.forEach(function(d){d.forEach(function(l){if(l.s)m[l.s]=1})})});(st.ttExtra||[]).forEach(function(s){m[s]=1});return Object.keys(m).sort(function(a,b){return a.localeCompare(b,"kk")})}
function subjSelect(di,idx,cur){var key=di+":"+idx;st.ttCustom=st.ttCustom||{};
 if(st.ttCustom[key])return '<input class="tts" data-tts="'+key+'" value="" placeholder="'+esc(t("newSubjPh"))+'">';
 var subs=allSubjects();return '<select class="tts" data-ttsel="'+key+'"><option value="">'+esc(t("pickSubj"))+'</option>'+subs.map(function(s){return '<option'+(s===cur?" selected":"")+'>'+esc(s)+'</option>'}).join("")+'<option value="__new__">'+esc(t("otherSubj"))+'</option></select>'}
function bellLabel(x,i){return x[2]!=null?x[2]:i+1}
function bellFor(shift,n){var arr=shift===2?(DATA.bells2||[]):DATA.bells;for(var i=0;i<arr.length;i++)if(bellLabel(arr[i],i)===n)return arr[i];return null}

var T12={navProj:["Жобалар","Проекты","Projects"],
 pd_proj:["Гимназияның цифрлық жобалары: газет, телеарна, бейнесабақтар және тағы басқа.","Цифровые проекты гимназии: газета, телеканал, видеоуроки и многое другое.","The gymnasium's digital projects: newspaper, TV channel, video lessons and more."],
 allProj:["Барлық жобалар","Все проекты","All projects"], projE:["Цифрлық жобалар","Цифровые проекты","Digital projects"],
 projNew:["Жобалардағы жаңа материалдар","Новое в проектах","New in projects"],
 pt_video:["Бейне","Видео","Video"],pt_paper:["Газет","Газета","Newspaper"],pt_blog:["Блог","Блог","Blog"],pt_articles:["Мақалалар","Статьи","Articles"],pt_tests:["Тесттер","Тесты","Tests"],pt_mixed:["Тәжірибе","Опыт","Practice"],
 pk_video:["Бейне (YouTube)","Видео (YouTube)","Video (YouTube)"],pk_issue:["Шығарылым (PDF)","Выпуск (PDF)","Issue (PDF)"],pk_post:["Жазба","Запись","Post"],pk_link:["Сілтеме / файл","Ссылка / файл","Link / file"],
 pk_videos:["Бейнелер","Видео","Videos"],pk_issues:["Шығарылымдар","Выпуски","Issues"],pk_posts:["Жазбалар","Записи","Posts"],pk_links:["Материалдар","Материалы","Materials"],
 allK:["Барлығы","Все","All"], pEmpty:["Материал әлі жоқ","Пока нет материалов","No materials yet"],
 pNoItems:["Бұл жобада әлі материал жоқ","В этом проекте пока нет материалов","No materials in this project yet"],
 pNoItemsEd:["«Қосу» батырмасын басып, алғашқы материалды жариялаңыз.","Нажмите «Добавить», чтобы опубликовать первый материал.","Press “Add” to publish the first material."],
 curatorL:["Жетекші","Руководитель","Curator"], readIssue:["Оқу","Читать","Read"], readMore:["Толығырақ","Подробнее","Read more"], openLink:["Ашу","Открыть","Open"],
 otherProj:["Басқа жобалар","Другие проекты","Other projects"], ytCh:["YouTube арнасы","YouTube-канал","YouTube channel"], projSite:["Жоба сілтемесі","Ссылка проекта","Project link"],
 perm_projects:["Жобалар (барлығы)","Проекты (все)","Projects (all)"],
 projCurators:["Жеке жобалар — тек өз жобасын өңдейді:","Отдельные проекты — редактирует только свой проект:","Individual projects — can edit only their own project:"],
 f_kind:["Түрі","Тип","Type"], f_curator:["Жетекші","Руководитель","Curator"], f_urlP:["Сілтеме (YouTube, PDF немесе сайт)","Ссылка (YouTube, PDF или сайт)","Link (YouTube, PDF or website)"],
 uploadPdf:["Немесе PDF файлын жүктеңіз (20 МБ дейін)","Или загрузите PDF-файл (до 20 МБ)","Or upload a PDF file (up to 20 MB)"],
 pdfBig:["Файл тым үлкен (20 МБ-тан артық)","Файл слишком большой (больше 20 МБ)","The file is too large (over 20 MB)"]};
for(var _k12 in T12)T[_k12]=T12[_k12];
/* ------------------------------------------------------------ helpers */
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
var st={cls:(function(){try{return localStorage.getItem("gm-cls")||""}catch(e){return""}})(),atab:"dash",perms:[],isAdmin:false,roleName:"",base:{},meta:null,roles:null,fb:null,fbAdmin:null,fbKind:"all",fbShow:6,fbStatus:"pending",fbA:0,fbB:0,fbStart:0,ptab:"me",uq:"",urole:"all",admin:null,profile:null,lang:(function(){var l=store("gm-lang");return LI[l]!==undefined?l:"kk"})(),route:{page:"home",arg:""},grade:"5",
 newsCat:"all",newsQ:"",newsPage:1,progF:"all",year:"all",cal:null,calSel:null,editing:false,canEdit:false,dirty:0,saving:false,sureId:null};
var art=null;
function t(k){var v=T[k];return v?v[LI[st.lang]]:k}
function f(s,o){return String(s).replace(/\{(\w+)\}/g,function(_,k){return o[k]})}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function pick(o){if(!o)return"";if(typeof o==="string")return o;return o[st.lang]||o.kk||o.ru||o.en||""}
function subj(k){return SUBJ[k]?SUBJ[k][LI[st.lang]]:"—"}
function pad(n){return(n<10?"0":"")+n}
function nowTZ(){var p={};new Intl.DateTimeFormat("en-GB",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",weekday:"short",hour12:false}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});
 var h=+p.hour%24;return{y:+p.year,m:+p.month,d:+p.day,h:h,mi:+p.minute,wd:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(p.weekday),min:h*60+(+p.minute)}}
function todayISO(){var n=nowTZ();return n.y+"-"+pad(n.m)+"-"+pad(n.d)}
function fmtDate(iso){if(!iso)return"";var p=iso.split("-"),d=+p[2],m=+p[1]-1,L=LI[st.lang];return L===2?MON[2][m]+" "+d+", "+p[0]:L===0?p[0]+" ж. "+d+" "+MON[0][m]:d+" "+MON[1][m]+" "+p[0]}
function toMin(s){var a=String(s).split(":");return(+a[0])*60+(+a[1]||0)}
function uid(p){return p+Date.now().toString(36)+Math.floor(Math.random()*1e3)}
function chipSample(o){return o&&o.sample?'<span class="chip sample">'+esc(t("sample"))+'</span>':''}
function lnk(route,html,cls){return '<a href="#'+route+'"'+(cls?' class="'+cls+'"':'')+'>'+html+'</a>'}
function ed(col,id){if(!st.editing||!canCol(col))return"";return '<div class="ed"><button data-edit="'+col+'" data-id="'+esc(id)+'" aria-label="'+esc(t("edit"))+'">'+ic("edit").replace('stroke-width="1.9"','stroke-width="2" width="15" height="15"')+'</button><button class="del" data-del="'+col+'" data-id="'+esc(id)+'" aria-label="'+esc(t("del"))+'">'+(st.sureId===col+id?'?':ic("trash").replace('stroke-width="1.9"','stroke-width="2" width="15" height="15"'))+'</button></div>'}
function addBtn(col,preset){if(!st.editing||!canCol(col))return"";return '<button class="addbtn" data-add="'+col+'"'+(preset?' data-preset="'+esc(JSON.stringify(preset))+'"':'')+'>'+ic("plus").replace('stroke-width="1.9"','stroke-width="2.4" width="15" height="15"')+esc(t("add"))+'</button>'}
function empty(key){return '<div class="empty"><b>'+esc(t(key))+'</b>'+(st.editing?esc(t("emptyAdd")):"")+'</div>'}

/* ------------------------------------------------------------ live lesson state */
function shiftState(b,n){for(var i=0;i<b.length;i++){var s=toMin(b[i][0]),e=toMin(b[i][1]);if(n.min>=s&&n.min<e)return{kind:"lesson",i:i,left:e-n.min,pct:Math.round((n.min-s)/(e-s)*100)};
  if(i+1<b.length&&n.min>=e&&n.min<toMin(b[i+1][0]))return{kind:"break",i:i+1}}
 if(b.length&&n.min<toMin(b[0][0]))return{kind:"before"};return{kind:"after"}}
function lessonState(){var n=nowTZ(),b1=DATA.bells,b2=DATA.bells2||[],r;
 if(n.wd===0||n.wd===6)return{kind:"weekend",n:n,shift:1,b:b1};
 r=shiftState(b1,n);if(r.kind!=="after"||!b2.length){r.n=n;r.shift=1;r.b=b1;return r}
 r=shiftState(b2,n);r.n=n;r.shift=2;r.b=b2;if(r.kind==="before")r.kind="before2";return r}
function nowHTML(){var s=lessonState(),n=s.n,b=s.b,head,sub="",bar="";
 if(s.kind==="lesson"){head=f(t("lesson"),{n:bellLabel(b[s.i],s.i)});sub=b[s.i][0]+"–"+b[s.i][1]+" · "+f(t("left"),{m:s.left});bar='<div class="pbar"><i style="width:'+s.pct+'%"></i></div>'}
 else if(s.kind==="break"){head=t("brk");sub=f(t("next"),{t:b[s.i][0]})}else if(s.kind==="before"){head=f(t("before"),{t:b[0][0]})}else if(s.kind==="before2"){head=f(t("before2"),{t:b[0][0]})}else if(s.kind==="after"){head=t("after")}else head=t("weekend");
 return '<div class="now-row"><div class="now-clock tnum">'+pad(n.h)+':'+pad(n.mi)+'</div><div class="now-date">'+esc(WDL[LI[st.lang]][n.wd])+'<br>'+esc(fmtDate(n.y+"-"+pad(n.m)+"-"+pad(n.d)))+'</div></div>'+
  '<div class="now-state">'+((DATA.bells2||[]).length&&s.kind!=="weekend"?'<span class="shiftchip s'+s.shift+'">'+esc(t("shift"+s.shift))+'</span>':'')+'<b>'+esc(head)+'</b><span>'+esc(sub||t("nowT"))+'</span>'+bar+'</div>'+
  '<div class="bells">'+b.map(function(x,i){return '<div class="'+(s.kind==="lesson"&&s.i===i?"on":"")+'"><b>'+bellLabel(x,i)+'</b><span class="tnum">'+x[0]+'</span></div>'}).join("")+'</div>'}

/* ------------------------------------------------------------ chrome */
var NAV=[
 {k:"navSchool",items:[["about","navAbout"],["about.admin","navAdmin"],["about.teachers","navTeachers"],["about.base","navBase"],["docs","navRes"]]},
 {k:"navEdu",items:[["schedule","navSched"],["olympiad","navOlymp"]]},
 {k:"navLife",items:[["events","navEvents"],["clubs","navClubs"],["gallery","navGallery"],["alumni","navAlumni"]]},
 {k:"navProj",proj:1,items:[]},{k:"navNews",href:"news"},{k:"navContacts",href:"contacts"}];
function syncNav(){NAV.forEach(function(g){if(g.proj)g.items=[["projects","allProj"]].concat((DATA.projects||[]).map(function(p){return["project."+p.id,"",pick(p.title)]}))})}
var PARENT={projects:null,project:null,admin:null,profile:null,feedback:"navLife",about:"navSchool",docs:"navSchool",programs:"navEdu",schedule:"navEdu",olympiad:"navEdu",events:"navLife",clubs:"navLife",gallery:"navLife",album:"navLife",alumni:"navLife",news:null,post:null,contacts:null};
function isOn(route){var p=route.split(".")[0];return st.route.page===p||(p==="gallery"&&st.route.page==="album")||(p==="news"&&st.route.page==="post")}
function topbar(){var s=DATA.settings;return '<div class="topbar"><div class="container"><div class="info"><span>'+ic("pin")+esc(t("region"))+'</span><span>'+ic("phone")+'<span class="tnum">'+esc(s.phone)+'</span></span><span class="opt">'+ic("mail")+esc(s.email)+'</span></div>'+
 '<div class="lang" role="group" aria-label="Language">'+LANGS.map(function(l){return '<button data-lang="'+l+'" aria-pressed="'+(st.lang===l)+'">'+["Қаз","Рус","Eng"][LI[l]]+'</button>'}).join("")+'</div></div></div>'}
function header(){
 var nav=NAV.map(function(g){ if(g.href)return '<div class="nav-item"><a class="nav-link'+(isOn(g.href)?" on":"")+'" href="#'+g.href+'">'+esc(t(g.k))+'</a></div>';
  var on=g.items.some(function(x){return isOn(x[0])});
  return '<div class="nav-item"><button class="nav-link'+(on?" on":"")+'" aria-haspopup="true">'+esc(t(g.k))+ic("chev")+'</button><div class="dropdown">'+g.items.map(function(x){return '<a href="#'+x[0]+'">'+esc(x[2]||t(x[1]))+'</a>'}).join("")+'</div></div>'}).join("");
 return '<header class="header"><div class="container"><a class="logo" href="#home">'+emblem()+'<span><b>'+esc(t("name"))+'</b><small>Ğani Muratbaev atyndağy gimnaziasy</small></span></a>'+
  '<nav class="nav" aria-label="Main">'+nav+'</nav><div class="hactions">'+(st.canEdit?'<a class="btn btn-outline hadm" href="#admin" title="'+esc(t("adminPanel"))+'">'+ic("star")+'<span>'+esc(t("adminShort"))+'</span></a>':'')+'<button class="btn btn-primary" data-open="'+(st.user?"account":"login")+'">'+(st.user?hava():ic("user"))+'<span>'+esc(st.user?t("cabinet"):t("login"))+'</span></button><button class="burger" data-open="drawer" aria-label="'+esc(t("menu"))+'">'+ic("menu")+'</button></div></div></header>'}
function footer(){var s=DATA.settings,y=nowTZ().y;
 return '<footer class="footer"><div class="container"><div class="fgrid"><div><div class="fbrand">'+emblem()+'<b>'+esc(t("name"))+'</b></div><p>'+esc(t("fdesc"))+'</p>'+social()+'</div>'+
  '<div><h5>'+esc(t("navSchool"))+'</h5><ul>'+NAV[0].items.map(function(x){return '<li>'+lnk(x[0],esc(t(x[1])))+'</li>'}).join("")+'</ul></div>'+
  '<div><h5>'+esc(t("navEdu"))+'</h5><ul>'+NAV[1].items.concat([["events","navEvents"],["news","navNews"]]).map(function(x){return '<li>'+lnk(x[0],esc(t(x[1])))+'</li>'}).join("")+'</ul></div>'+
  '<div><h5>'+esc(t("navContacts"))+'</h5><ul><li>'+ic("pin")+'<span>'+esc(t("addr"))+'</span></li><li>'+ic("phone")+'<span class="tnum">'+esc(s.phone)+'</span></li><li>'+ic("mail")+'<span style="overflow-wrap:anywhere">'+esc(s.email)+'</span></li><li>'+ic("clock")+'<span>'+esc(pick(s.hours))+'</span></li></ul></div></div>'+
  '<div class="fbottom"><span>© '+y+' '+esc(t("name"))+'. '+esc(t("rights"))+'</span><span>'+lnk("docs",esc(t("navRes")))+'</span></div></div></footer>'}
function social(){var s=DATA.settings,out="";
 if(s.instagram)out+='<a href="'+esc(s.instagram)+'" target="_blank" rel="noopener" aria-label="Instagram">'+ic("insta")+'</a>';
 if(s.telegram)out+='<a href="'+esc(s.telegram)+'" target="_blank" rel="noopener" aria-label="Telegram">'+ic("tg")+'</a>';
 if(s.facebook)out+='<a href="'+esc(s.facebook)+'" target="_blank" rel="noopener" aria-label="Facebook">'+ic("fb")+'</a>';
 if(s.whatsapp)out+='<a href="https://wa.me/'+esc(s.whatsapp.replace(/\D/g,""))+'" target="_blank" rel="noopener" aria-label="WhatsApp">'+ic("msg")+'</a>';
 return out?'<div class="social">'+out+'</div>':''}
function banner(titleKey,descKey,extraCrumb,titleText){var p=PARENT[st.route.page];
 var cr='<nav class="crumbs" aria-label="breadcrumb">'+lnk("home",esc(t("home")))+'<span>/</span>'+(p?'<span>'+esc(t(p))+'</span><span>/</span>':'')+(extraCrumb||'')+'<span class="cur">'+esc(titleText||t(titleKey))+'</span></nav>';
 return '<section class="banner"><div class="container">'+cr+'<h1>'+esc(titleText||t(titleKey))+'</h1>'+(descKey?'<p>'+esc(t(descKey))+'</p>':'')+'</div></section>'}

/* ------------------------------------------------------------ cards */
function catIcon(c){return{events:"cal",achieve:"trophy",life:"users",ann:"mega"}[c]||"book"}
function newsCard(p){return '<article class="ncard">'+ed("posts",p.id)+'<div class="thumb t-'+p.cat+'">'+(p.img?'<img src="'+p.img+'" alt="" loading="lazy">':'<div class="pat"></div><div class="big">'+ic(catIcon(p.cat))+'</div>')+'<span class="date">'+esc(fmtDate(p.date))+'</span></div>'+
 '<div class="body"><div class="meta"><span class="chip c-'+p.cat+'">'+esc(t("c_"+p.cat))+'</span>'+chipSample(p)+'</div><h3><a class="stretch" href="#post.'+esc(p.id)+'">'+esc(pick(p.title))+'</a></h3><p>'+esc(pick(p.text))+'</p></div></article>'}
function evRow(e){var p=e.date.split("-");return '<div class="ev" style="position:relative">'+ed("events",e.id)+'<div class="evd"><b>'+(+p[2])+'</b><span>'+esc(MONS[LI[st.lang]][+p[1]-1])+'</span></div><div><h4>'+esc(pick(e.title))+' '+chipSample(e)+'</h4><p>'+esc([e.time,pick(e.place)].filter(Boolean).join(" · "))+'</p></div></div>'}
function sortedPosts(){return DATA.posts.slice().sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:0})}
function upcomingEvents(){var td=todayISO();return DATA.events.filter(function(e){return e.date>=td}).sort(function(a,b){return a.date<b.date?-1:1})}

/* ------------------------------------------------------------ pages */
function pageHome(){var s=DATA.settings;
 var hero='<section class="hero"><canvas id="heroCanvas" aria-hidden="true"></canvas><div class="container"><div>'+
  '<h1>'+esc(t("heroA"))+'<br><span class="grad-text">'+esc(t("heroB"))+'</span></h1><p class="lead">'+esc(t("heroLead"))+'</p>'+
  '</div>'+
  '<div class="hero-card card"><div class="hc-top">'+emblem()+'<div><small>'+esc(t("emblem"))+'</small><b>'+esc(t("name"))+'</b></div></div><div id="now">'+nowHTML()+'</div></div></div></section>';
 var quick='<section class="section" style="padding-block:40px"><div class="container"><div class="quick">'+
  [["schedule","cal","q1","q1d"],["https://bilimclass.kz","book","kundelik","q2d"],["contacts.faq","cap","q3","q3d"],["news.ann","mega","q4","q4d"]].map(function(q){var ext=q[0].indexOf("http")===0;
   return '<a class="qcard" href="'+(ext?q[0]:"#"+q[0])+'"'+(ext?' target="_blank" rel="noopener"':'')+'><div class="ico">'+ic(q[1])+'</div><h4>'+esc(t(q[2]))+'</h4><p>'+esc(q[3]==="q2d"?"BilimClass · "+t(q[3]):t(q[3]))+'</p></a>'}).join("")+'</div></div></section>';
 var motto='<section class="section"><div class="container"><div class="quote">'+emblem()+'<div><blockquote>«'+esc(pick(s.motto))+'»</blockquote><cite>'+esc(t("name"))+'</cite></div></div></div></section>';
 var dirs=[["programs.primary","g1","grades14","d1","d1d"],["programs.basic","g2","grades59","d2","d2d"],["programs.senior","g3","grades1011","d3","d3d"],["clubs","g4","allGrades","d4","d4d"],["olympiad","g5","allGrades","d5","d5d"],["alumni","g6","navAlumni","d6","d6d"]];
 var dirsH='<section class="section alt"><div class="container"><div class="sec-head"><div><span class="eyebrow">'+esc(t("dirE"))+'</span><h2>'+esc(t("dirT"))+'</h2></div></div><div class="dirs">'+
  dirs.map(function(d){return '<a class="dir '+d[1]+'" href="#'+d[0]+'"><div><span class="tag">'+esc(t(d[2]))+'</span><h3>'+esc(t(d[3]))+'</h3><p>'+esc(t(d[4]))+'</p></div><span class="go">'+esc(t("open"))+ic("arrow").replace('<svg','<svg width="15" height="15"')+'</span></a>'}).join("")+'</div></div></section>';
 var stats='<section class="stats"><div class="container"><div class="sec-head" style="margin-bottom:26px"><h2 style="color:#fff">'+esc(t("statsT"))+'</h2>'+(st.editing?'<button class="addbtn" data-open="settings">'+esc(t("settings"))+'</button>':'<span class="chip" style="background:rgba(255,255,255,.12);color:#bbf7d0">'+esc(s.year)+'</span>')+'</div><div class="grid">'+
  s.stats.map(function(x){return '<div class="stat"><b class="tnum">'+esc(x.n)+'</b><span>'+esc(pick(x.l))+'</span></div>'}).join("")+'</div>'+(s.statsSample?'<p class="note">'+esc(t("statsNote"))+'</p>':'')+'</div></section>';
 var up=upcomingEvents().slice(0,4);
 var news='<section class="section"><div class="container"><div class="sec-head"><div><span class="eyebrow">'+esc(t("newsE"))+'</span><h2>'+esc(t("newsT"))+'</h2></div><a class="more" href="#news">'+esc(t("allNews"))+' →</a></div>'+
  '<div class="split"><div class="cards" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))">'+sortedPosts().slice(0,4).map(newsCard).join("")+'</div>'+
  '<aside class="panel"><h3>'+esc(t("upcoming"))+'</h3><div class="evlist">'+(up.length?up.map(evRow).join(""):'<p style="color:var(--muted)">'+esc(t("noEvents"))+'</p>')+'</div><div style="margin-top:14px"><a class="more" href="#events">'+esc(t("calendar"))+' →</a></div></aside></div></div></section>';
 var partners='<section class="section alt"><div class="container"><div class="sec-head"><h2>'+esc(t("partnersT"))+'</h2>'+addBtn("partners")+'</div><div class="partners">'+
  DATA.partners.map(function(p){var inner=ed("partners",p.id)+(p.img?'<img class="pjlogo" src="'+esc(p.img)+'" alt="" loading="lazy">':'<span class="ico">'+ic("build")+'</span>')+'<span>'+esc(pick(p.title))+'</span>';return p.url&&!st.editing?'<a class="partner" href="'+esc(p.url)+'" target="_blank" rel="noopener">'+inner+'</a>':'<div class="partner">'+inner+'</div>'}).join("")+'</div></div></section>';
 return photoStrip()+hero+news+homeProjects()+partners}

function pageAbout(){var s=DATA.settings,admin=DATA.staff.filter(function(x){return x.group==="admin"}),tea=DATA.staff.filter(function(x){return x.group==="teacher"});
 function person(p){var ini=(p.name||"?").split(/\s+/).slice(0,2).map(function(w){return w[0]||""}).join("");return '<div class="box person">'+ed("staff",p.id)+'<div class="ava">'+(p.img?'<img src="'+p.img+'" alt="">':esc(ini))+'</div><div><b>'+esc(p.name)+'</b><span>'+esc(pick(p.role))+'</span></div></div>'}
 return banner("navAbout","pd_about")+'<div class="container page">'+
  '<div class="subnav pills" style="align-self:flex-start">'+[["about","historyT"],["about.admin","adminT"],["about.teachers","teachersT"],["about.base","baseT"]].map(function(x){return '<a class="btn" style="padding:7px 14px;font-size:13px" href="#'+x[0]+'">'+esc(t(x[1]))+'</a>'}).join("")+'</div>'+
  '<section id="history" class="twocol"><div class="prose"><h2 class="h2">'+esc(t("historyT"))+'</h2><p>'+esc(t("about1"))+'</p><p>'+esc(t("about2"))+'</p></div>'+
   '<div class="panel"><div style="display:flex;gap:14px;align-items:center;margin-bottom:12px">'+emblem("em72")+'<h3 style="margin:0">'+esc(t("name"))+'</h3></div>'+
   '<div class="clist">'+crow("pin",t("f_addr"),t("addr"))+crow("cap",t("f_lang"),t("grades14").replace("1–4","1–11"))+crow("phone",t("phoneL"),s.phone)+'</div></div></section>'+
  '<section id="admin"><h2 class="h2">'+esc(t("adminT"))+' '+addBtn("staff",{group:"admin"})+'</h2><div class="grid3">'+admin.map(person).join("")+'</div></section>'+
  '<section id="teachers"><h2 class="h2">'+esc(t("teachersT"))+' '+addBtn("staff",{group:"teacher"})+'</h2>'+(tea.length?'<div class="grid3">'+tea.map(person).join("")+'</div>':empty("emptyTeachers"))+'</section>'+
  '<section id="base"><h2 class="h2">'+esc(t("baseT"))+' '+addBtn("facilities")+'</h2><div class="grid3">'+DATA.facilities.map(function(x,i){return '<div class="box">'+ed("facilities",x.id)+'<div class="ico">'+ic(["flask","gear","ball","book","star","users"][i%6])+'</div><h4>'+esc(pick(x.title))+' '+chipSample(x)+'</h4><p>'+esc(pick(x.desc))+'</p></div>'}).join("")+'</div></section></div>'}
function crow(icon,label,val,copy){return '<div class="crow"><span class="ico">'+ic(icon)+'</span><div><small>'+esc(label)+'</small><div class="v"><span class="tnum">'+esc(val)+'</span>'+(copy?'<button class="copy" data-copy="'+esc(copy)+'">'+esc(t("copy"))+'</button>':'')+'</div></div></div>'}

function pageNews(){
 var cats=["all","events","achieve","life","ann"],q=st.newsQ.trim().toLowerCase();
 var list=sortedPosts().filter(function(p){return(st.newsCat==="all"||p.cat===st.newsCat)&&(!q||(pick(p.title)+" "+pick(p.text)).toLowerCase().indexOf(q)>=0)});
 var per=9,pages=Math.max(1,Math.ceil(list.length/per));if(st.newsPage>pages)st.newsPage=pages;var slice=list.slice((st.newsPage-1)*per,st.newsPage*per);
 return banner("navNews","pd_news")+'<div class="container page"><div style="display:flex;flex-direction:column;gap:22px">'+
  '<div class="toolbar"><div class="pills" role="group">'+cats.map(function(c){return '<button data-ncat="'+c+'" aria-pressed="'+(st.newsCat===c)+'">'+esc(c==="all"?t("all"):t("c_"+c))+'</button>'}).join("")+'</div>'+
  '<label class="search">'+ic("search")+'<span class="sr">'+esc(t("search"))+'</span><input id="newsq" type="search" placeholder="'+esc(t("search"))+'" value="'+esc(st.newsQ)+'"></label></div>'+
  (st.editing?'<div>'+addBtn("posts",{date:todayISO(),cat:st.newsCat==="all"?"events":st.newsCat})+'</div>':'')+
  '<div id="newslist">'+newsList(slice,pages)+'</div></div></div>'}
function newsList(slice,pages){return(slice.length?'<div class="cards">'+slice.map(newsCard).join("")+'</div>':'<div class="empty"><b>'+esc(t("noResults"))+'</b></div>')+
 (pages>1?'<div class="pager">'+Array.apply(null,{length:pages}).map(function(_,i){return '<button data-npage="'+(i+1)+'" aria-current="'+(st.newsPage===i+1)+'">'+(i+1)+'</button>'}).join("")+'</div>':'')}
function pagePost(){var p=DATA.posts.filter(function(x){return x.id===st.route.arg})[0];if(!p){location.hash="news";return""}
 var others=sortedPosts().filter(function(x){return x.id!==p.id}).slice(0,3);
 return banner(null,null,lnk("news",esc(t("navNews")))+'<span>/</span>',pick(p.title))+'<div class="container page"><article class="article" style="position:relative">'+ed("posts",p.id)+
  '<div class="meta" style="display:flex;gap:8px;align-items:center;margin-bottom:18px;flex-wrap:wrap"><span class="chip c-'+p.cat+'">'+esc(t("c_"+p.cat))+'</span><span style="color:var(--muted);font-size:14px">'+esc(fmtDate(p.date))+'</span>'+chipSample(p)+'</div>'+
  (p.img?'<div class="cover"><img src="'+p.img+'" alt=""></div>':'')+'<div class="txt">'+esc(pick(p.text))+'</div><p style="margin-top:28px"><a class="more" href="#news">← '+esc(t("toNews"))+'</a></p></article>'+
  (others.length?'<section><h2 class="h2">'+esc(t("newsT"))+'</h2><div class="cards">'+others.map(newsCard).join("")+'</div></section>':'')+'</div>'}

function pagePrograms(){var keys=["primary","basic","senior","extra"],L=LI[st.lang];
 var cards=keys.filter(function(k){return st.progF==="all"||st.progF===k}).map(function(k){var p=PROG[k];
  var badges=k==="extra"?DATA.clubs.slice(0,3).map(function(c){return pick(c.title)}):p.subj.slice(0,4).map(subj);
  return '<article class="prog"><div class="top '+p.cls+'"><span class="tag">'+esc(t({primary:"grades14",basic:"grades59",senior:"grades1011",extra:"allGrades"}[k]))+'</span><span class="big">'+esc(p.g)+'</span><span class="sub">'+esc(p.sub[L])+'</span></div>'+
   '<div class="body"><h3>'+esc(p.title[L])+'</h3><p>'+esc(p.desc[L])+'</p><div class="tags">'+badges.map(function(b){return '<span>'+esc(b)+'</span>'}).join("")+'</div></div>'+
   '<div class="foot"><button class="btn btn-soft" data-prog="'+k+'">'+esc(t("viewSubj"))+' →</button></div></article>'}).join("");
 return banner("navProg","pd_programs")+'<div class="container page"><section style="display:flex;flex-direction:column;gap:24px"><div class="toolbar"><div><h2 class="h2" style="margin-bottom:4px">'+esc(t("progT"))+'</h2><p style="color:var(--muted)">'+esc(t("progSub"))+'</p></div>'+
  '<div class="pills">'+["all"].concat(keys).map(function(k){return '<button data-progf="'+k+'" aria-pressed="'+(st.progF===k)+'">'+esc(k==="all"?t("all"):t("f_"+k))+'</button>'}).join("")+'</div></div>'+
  '<div class="cards four">'+cards+'</div></section>'+
  '<section class="dark3">'+[["m1","file","linear-gradient(135deg,#14532d,#0b2e19)"],["m2","cap","linear-gradient(135deg,#0f172a,#020617)"],["m3","book","linear-gradient(135deg,#134e4a,#0f172a)"]].map(function(m){return '<div class="dcard" style="background:'+m[2]+'"><div class="ico">'+ic(m[1])+'</div><h4>'+esc(t(m[0]))+'</h4><p>'+esc(t(m[0]+"d"))+'</p></div>'}).join("")+'</section></div>'}

function pageSchedule(){var C=DATA.classes||{},names=Object.keys(C).sort(clsSort),ed=st.editing&&can("schedule"),L=LI[st.lang];
 if(!names.length&&!ed)return banner("navSched","pd_schedule")+'<div class="container page"><div class="empty"><b>'+esc(t("noClasses"))+'</b></div></div>';
 if(!C[st.cls]){st.cls=names[0]||""}
 var grades=[];names.forEach(function(n){var g=parseInt(n,10);if(grades.indexOf(g)<0)grades.push(g)});
 var g=parseInt(st.cls,10),letters=names.filter(function(n){return parseInt(n,10)===g});
 var picker='<div class="ttpick"><div class="ttrow"><span class="ttlab">'+esc(t("gradeL"))+'</span><div class="grades">'+grades.map(function(x){return '<button data-ttgrade="'+x+'" aria-pressed="'+(x===g)+'">'+x+'</button>'}).join("")+'</div></div>'+
  '<div class="ttrow"><span class="ttlab">'+esc(t("letterL"))+'</span><div class="grades">'+letters.map(function(n){return '<button data-ttcls="'+esc(n)+'" aria-pressed="'+(n===st.cls)+'">'+esc(n.slice(String(g).length))+'</button>'}).join("")+'</div></div></div>';
 var c=C[st.cls],s=lessonState(),ti=(s.n.wd>=1&&s.n.wd<=5)?s.n.wd-1:-1;
 var body='';
 if(c){var curN=(s.kind==="lesson"&&s.shift===c.shift)?bellLabel(s.b[s.i],s.i):null;
  body='<div class="tthead"><h2 class="h2" style="margin:0">'+esc(f(t("clsTitle"),{c:st.cls}))+'</h2><span class="shiftchip s'+c.shift+'">'+esc(t("shift"+c.shift))+'</span>'+
   (ed?'<label class="ttshift">'+esc(t("shiftL"))+' <select data-ttshift="1"><option value="1"'+(c.shift===1?" selected":"")+'>1</option><option value="2"'+(c.shift===2?" selected":"")+'>2</option></select></label><button class="btn btn-danger" data-ttdelcls="1" style="padding:6px 12px;font-size:12.5px">'+esc(st.sureId==="cls"+st.cls?t("sure"):t("delClass"))+'</button>':'')+'</div>'+
   '<div class="days">'+c.days.map(function(ls,di){var isT=di===ti;var sorted=ls.map(function(l,idx){return{l:l,idx:idx}}).sort(function(x,y){return x.l.n-y.l.n});
    return '<div class="day'+(isT?" today":"")+'"><h4>'+esc(T.days[L][di])+(isT?'<span class="chip">'+esc(t("today"))+'</span>':'')+'</h4>'+
     (sorted.length?'<ol>'+sorted.map(function(o){var l=o.l,bb=bellFor(c.shift,l.n),cur=isT&&curN===l.n;
      if(ed)return '<li class="tted"><span class="n">'+l.n+'</span><span><span class="t tnum">'+(bb?bb[0]+'–'+bb[1]:'')+'</span><span class="ttr2">'+subjSelect(di,o.idx,l.s)+'<button class="copy" data-ttdel="'+di+':'+o.idx+'" aria-label="'+esc(t("del"))+'">×</button></span></span></li>';
      return '<li class="'+(cur?"cur":"")+'"><span class="n">'+l.n+'</span><span><span class="t tnum">'+(bb?bb[0]+'–'+bb[1]:'')+'</span><span class="s">'+esc(l.s)+'</span></span></li>'}).join("")+'</ol>':'<p class="hint" style="text-align:left">'+esc(t("noLessons"))+'</p>')+
     (ed?'<button class="copy" data-ttadd="'+di+'" style="margin-top:8px">'+esc(t("addLessonB"))+'</button>':'')+'</div>'}).join("")+'</div>'+
   '<p class="hint" style="text-align:left;margin-top:12px">'+esc(t("ttLegend"))+'</p>'}
 var addForm=ed?'<form class="panel form ttaddform" id="ttAddForm" style="flex-direction:row;flex-wrap:wrap;align-items:end;gap:10px;margin:0"><b style="width:100%">'+esc(t("addClass"))+'</b><label>'+esc(t("gradeL"))+'<input id="tta-g" type="number" min="1" max="11" value="'+(g||1)+'" style="width:90px"></label><label>'+esc(t("letterL"))+'<select id="tta-l">'+LETTERS.split("").map(function(x){return '<option>'+x+'</option>'}).join("")+'</select></label><label>'+esc(t("shiftL"))+'<select id="tta-s"><option value="1">1</option><option value="2">2</option></select></label><button class="btn btn-primary" type="submit">'+esc(t("add"))+'</button></form>':'';
 return banner("navSched","pd_schedule")+'<div class="container page"><section style="display:flex;flex-direction:column;gap:18px">'+picker+body+addForm+'<p class="hint" style="text-align:left;margin:0">'+esc(t("ttSource"))+'</p></section>'+
  bellsSection(DATA.bells,"bell","bells1T")+bellsSection(DATA.bells2||[],"bell2","bells2T")+'</div>'}
function bellsSection(arr,key,title){var ed=st.editing&&can("schedule");if(!arr.length&&!ed)return"";
 return '<section><h2 class="h2">'+esc(t(title))+'</h2><div class="bellgrid">'+arr.map(function(b,i){return '<div>'+(ed?'<b>'+bellLabel(b,i)+'</b><input data-'+key+'="'+i+':0" value="'+b[0]+'" style="width:58px;border:1px solid var(--line);border-radius:6px;padding:2px 4px">–<input data-'+key+'="'+i+':1" value="'+b[1]+'" style="width:58px;border:1px solid var(--line);border-radius:6px;padding:2px 4px">':'<b>'+esc(f(t("lesson"),{n:bellLabel(b,i)}))+'</b><span class="tnum">'+b[0]+'–'+b[1]+'</span>')+'</div>'}).join("")+'</div>'+
 (ed&&key==="bell2"?'<div style="display:flex;gap:6px;margin-top:10px"><button class="copy" data-b2add="1">'+esc(t("addBell"))+'</button><button class="copy" data-b2rm="1"'+(arr.length?'':' disabled')+'>'+esc(t("rmBell"))+'</button></div>':'')+'</section>'}

function pageOlympiad(){var byYear={};DATA.achievements.forEach(function(a){(byYear[a.year]=byYear[a.year]||[]).push(a)});var years=Object.keys(byYear).sort().reverse();
 var lvCls={district:"c-life",region:"c-events",republic:"c-achieve",intl:"c-ann"};
 return banner("navOlymp","pd_olympiad")+'<div class="container page"><section class="twocol"><div class="prose"><h2 class="h2">'+esc(t("d5"))+'</h2><p>'+esc(t("olympText"))+'</p><p><a class="more" href="#clubs">'+esc(t("navClubs"))+' →</a></p></div>'+
  '<div class="panel"><h3>'+esc(t("c_achieve"))+' · '+esc(t("navNews"))+'</h3><div class="evlist">'+sortedPosts().filter(function(p){return p.cat==="achieve"}).slice(0,3).map(function(p){return '<div class="ev" style="grid-template-columns:1fr"><div><h4>'+lnk("post."+p.id,esc(pick(p.title)))+'</h4><p>'+esc(fmtDate(p.date))+'</p></div></div>'}).join("")+'</div></div></section>'+
  '<section><h2 class="h2">'+esc(t("achT"))+' '+addBtn("achievements",{year:DATA.settings.year,level:"district"})+'</h2>'+(years.length?years.map(function(y){return '<h3 style="font:800 16px var(--f-display);margin:18px 0 10px;color:var(--b800)">'+esc(y)+'</h3><div class="links">'+byYear[y].map(function(a){return '<div class="lnk">'+ed("achievements",a.id)+'<span class="ico">'+ic("trophy")+'</span><div style="min-width:0"><b>'+esc(pick(a.title))+'</b><span class="chip '+(lvCls[a.level]||"")+'">'+esc(t("lv_"+a.level))+'</span></div></div>'}).join("")+'</div>'}).join(""):empty("emptyAch"))+'</section></div>'}

function pageEvents(){var n=nowTZ();if(!st.cal)st.cal={y:n.y,m:n.m};var y=st.cal.y,m=st.cal.m,L=LI[st.lang];
 var first=new Date(Date.UTC(y,m-1,1)),startWd=(first.getUTCDay()+6)%7,dim=new Date(Date.UTC(y,m,0)).getUTCDate(),td=todayISO();
 var byDate={};DATA.events.forEach(function(e){(byDate[e.date]=byDate[e.date]||[]).push(e)});
 var cells=T.wdShort[L].map(function(w){return '<div class="wd">'+esc(w)+'</div>'}).join("");
 for(var i=0;i<startWd;i++)cells+='<div></div>';
 for(var d=1;d<=dim;d++){var iso=y+"-"+pad(m)+"-"+pad(d),cls="c"+(iso===td?" td":"")+(byDate[iso]?" has":"")+(st.calSel===iso?" sel":"");cells+='<button class="'+cls+'" data-day="'+iso+'" aria-label="'+esc(fmtDate(iso))+'">'+d+'</button>'}
 var sel=st.calSel&&byDate[st.calSel]?byDate[st.calSel]:null, up=upcomingEvents(), past=DATA.events.filter(function(e){return e.date<td}).sort(function(a,b){return a.date<b.date?1:-1});
 return banner("navEvents","pd_events")+'<div class="container page"><section class="split" style="grid-template-columns:minmax(0,1fr) minmax(0,1.3fr)"><div class="cal"><div class="calhead"><button data-calm="-1" aria-label="prev">'+ic("left")+'</button><b>'+esc(MONN[L][m-1]+" "+y)+'</b><button data-calm="1" aria-label="next">'+ic("right")+'</button></div><div class="calgrid">'+cells+'</div></div>'+
  '<div class="panel"><h3>'+esc(sel?f(t("eventsOn"),{d:fmtDate(st.calSel)}):t("upcomingAll"))+' '+addBtn("events",{date:st.calSel||td,time:"10:00"})+'</h3><div class="evlist">'+((sel||up).length?(sel||up).map(evRow).join(""):'<p style="color:var(--muted)">'+esc(t("noEvents"))+'</p>')+'</div></div></section>'+
  (past.length?'<section><h2 class="h2">'+esc(t("past"))+'</h2><div class="panel"><div class="evlist">'+past.slice(0,8).map(evRow).join("")+'</div></div></section>':'')+'</div>'}

function pageClubs(){return banner("navClubs","pd_clubs")+'<div class="container page"><section><h2 class="h2">'+esc(t("navClubs"))+' '+addBtn("clubs")+'</h2><div class="grid3">'+DATA.clubs.map(function(c,i){
  return '<div class="box">'+ed("clubs",c.id)+'<div class="ico">'+ic(["star","gear","ball","music"in IC?"music":"users","file","trophy"][i%6])+'</div><h4>'+esc(pick(c.title))+' '+chipSample(c)+'</h4><p>'+esc(pick(c.desc))+'</p>'+
  '<div class="tags" style="margin-top:12px"><span>'+esc(t("gradesL"))+': '+esc(c.grades)+'</span><span>'+esc(pick(c.when))+'</span></div></div>'}).join("")+'</div></section></div>'}

function pageGallery(){var years=[];DATA.albums.forEach(function(a){if(years.indexOf(a.year)<0)years.push(a.year)});years.sort().reverse();
 var list=DATA.albums.filter(function(a){return st.year==="all"||a.year===st.year});
 return banner("navGallery","pd_gallery")+'<div class="container page"><section style="display:flex;flex-direction:column;gap:22px"><div class="toolbar"><div class="pills">'+["all"].concat(years).map(function(y){return '<button data-year="'+esc(y)+'" aria-pressed="'+(st.year===y)+'">'+esc(y==="all"?t("allYears"):y)+'</button>'}).join("")+'</div>'+addBtn("albums",{year:DATA.settings.year})+'</div>'+
  '<div class="albums">'+list.map(function(a){var c=a.photos[0];return '<a class="album" href="#album.'+esc(a.id)+'">'+ed("albums",a.id)+'<div class="cover">'+(c?'<img src="'+c.src+'" alt="" loading="lazy">':'<div class="big">'+ic("image")+'</div>')+'</div><div class="info"><b>'+esc(pick(a.title))+'</b><span>'+esc(a.year)+' · '+esc(a.photos.length?f(t("photosN"),{n:a.photos.length}):t("noPhotos"))+'</span></div></a>'}).join("")+'</div></section></div>'}
function pageAlbum(){var a=DATA.albums.filter(function(x){return x.id===st.route.arg})[0];if(!a){location.hash="gallery";return""}
 return banner(null,null,lnk("gallery",esc(t("navGallery")))+'<span>/</span>',pick(a.title))+'<div class="container page"><section style="display:flex;flex-direction:column;gap:18px"><div class="toolbar"><span style="color:var(--muted)">'+esc(a.year)+' · '+esc(f(t("photosN"),{n:a.photos.length}))+'</span>'+
  ((st.editing&&can("gallery"))?'<label class="addbtn" style="cursor:pointer">'+ic("plus").replace('<svg','<svg width="15" height="15"')+esc(t("addPhotos"))+'<input type="file" accept="image/*" multiple data-upload="'+esc(a.id)+'" class="sr"></label>':'')+'</div>'+
  (a.photos.length?'<div class="photos">'+a.photos.map(function(p,i){return '<figure class="photo"><img src="'+p.src+'" alt="'+esc(pick(p.cap))+'" data-lb="'+esc(a.id)+':'+i+'" loading="lazy">'+(pick(p.cap)?'<figcaption>'+esc(pick(p.cap))+'</figcaption>':'')+((st.editing&&can("gallery"))?'<button class="copy x" data-delph="'+esc(a.id)+':'+i+'">'+esc(t("del"))+'</button>':'')+'</figure>'}).join("")+'</div>':empty("noPhotos"))+
  '<p><a class="more" href="#gallery">← '+esc(t("toGallery"))+'</a></p></section></div>'}

function pageAlumni(){return banner("navAlumni","pd_alumni")+'<div class="container page"><section><h2 class="h2">'+esc(t("navAlumni"))+' '+addBtn("alumni",{year:String(nowTZ().y)})+'</h2>'+
 (DATA.alumni.length?'<div class="grid3">'+DATA.alumni.map(function(a){return '<div class="box">'+ed("alumni",a.id)+'<div class="person" style="margin-bottom:10px"><div class="ava">'+esc((a.name||"?")[0])+'</div><div><b>'+esc(a.name)+'</b><span>'+esc(t("gradYear"))+' '+esc(a.year)+'</span></div></div><p>'+esc(pick(a.text))+'</p></div>'}).join("")+'</div>':empty("emptyAlumni"))+'</section></div>'}

function linkList(items,icon,col){return '<div class="links">'+items.map(function(d){var host="";try{host=new URL(d.url).hostname.replace(/^www\./,"")}catch(e){}
 var inner=ed(col,d.id)+'<span class="ico">'+ic(icon)+'</span><div style="min-width:0"><b>'+esc(pick(d.title))+'</b><span>'+esc(host)+'</span></div><span class="arr">'+ic("arrow").replace('<svg','<svg width="18" height="18"')+'</span>';
 return d.url&&!st.editing?'<a class="lnk" href="'+esc(d.url)+'" target="_blank" rel="noopener">'+inner+'</a>':'<div class="lnk">'+inner+'</div>'}).join("")+'</div>'}
function pageDocs(){return banner("navRes","pd_docs")+'<div class="container page">'+
 '<section id="res"><h2 class="h2">'+esc(t("resT"))+' '+addBtn("docs",{cat:"res"})+'</h2>'+linkList(DATA.docs.filter(function(d){return d.cat==="res"}),"link","docs")+'</section>'+
 '<section id="docs"><h2 class="h2">'+esc(t("docsT"))+' '+addBtn("docs",{cat:"docs"})+'</h2>'+linkList(DATA.docs.filter(function(d){return d.cat==="docs"}),"file","docs")+'</section></div>'}

function pageContacts(){var s=DATA.settings,dir=DATA.staff.filter(function(x){return x.group==="admin"})[0],q=encodeURIComponent("Сарыкемер, улица Косы батыра, 47");
 var map='<svg viewBox="0 0 520 280" role="img" aria-label="'+esc(t("addr"))+'"><rect width="520" height="280" fill="#ecfdf3"/><g stroke="#d1fae5" stroke-width="1">'+[40,95,150,205,260].map(function(y){return '<line x1="0" y1="'+y+'" x2="520" y2="'+y+'"/>'}).join("")+[60,140,220,300,380,460].map(function(x){return '<line x1="'+x+'" y1="0" x2="'+x+'" y2="280"/>'}).join("")+'</g>'+
  '<path d="M0 190 C120 176 200 200 300 168 S450 140 520 150" fill="none" stroke="#fff" stroke-width="14"/><path d="M250 0 C255 80 245 140 262 280" fill="none" stroke="#fff" stroke-width="9"/><path d="M0 84 C140 98 300 74 520 92" fill="none" stroke="#fff" stroke-width="6"/>'+
  '<text x="300" y="216" fill="#64748b" font-family="Inter,sans-serif" font-size="12">'+esc(t("mapStreet"))+'</text><text x="24" y="40" fill="#15803d" font-family="Montserrat,sans-serif" font-size="18" font-weight="800">'+esc(t("village"))+'</text>'+
  '<g transform="translate(262 158)"><circle r="26" fill="#22c55e" opacity=".2"/><path d="M0 8C-12-4-14-12-14-18A14 14 0 0 1 14-18C14-12 12-4 0 8Z" fill="#15803d" transform="translate(0 -6)"/><circle cy="-24" r="5" fill="#fff"/></g><text x="284" y="150" fill="#0f172a" font-family="Inter,sans-serif" font-size="14" font-weight="700">№ 47</text></svg>';
 return banner("navContacts","pd_contacts")+'<div class="container page"><section class="twocol"><div class="panel"><div class="clist">'+crow("pin",t("f_addr"),t("addr"),t("addr"))+crow("phone",t("phoneL"),s.phone,s.phone)+crow("mail",t("emailL"),s.email,s.email)+crow("clock",t("hoursL"),pick(s.hours))+
  (dir?crow("user",t("dirL"),dir.name):'')+crow("file",t("postL"),s.postcode)+'</div>'+(s.whatsapp?'<a class="btn btn-primary" style="margin-top:16px" href="https://wa.me/'+esc(s.whatsapp.replace(/\D/g,""))+'" target="_blank" rel="noopener">'+ic("msg")+esc(t("wa"))+'</a>':'')+social()+
  (st.editing&&can("settings")?'<div style="margin-top:14px"><button class="addbtn" data-open="settings">'+esc(t("settings"))+'</button></div>':'')+'</div>'+
  '<div class="ccol"><div class="map">'+map+'<div class="acts"><span style="color:var(--muted);font-size:13.5px">'+esc(t("openIn"))+'</span><a class="btn btn-outline" href="https://2gis.kz/search/'+q+'" target="_blank" rel="noopener">2GIS</a><a class="btn btn-outline" href="https://www.google.com/maps/search/?api=1&query='+q+'" target="_blank" rel="noopener">Google Maps</a><a class="btn btn-outline" href="https://yandex.kz/maps/?text='+q+'" target="_blank" rel="noopener">Яндекс</a></div></div><section id="feedback" class="cfb">'+fbForm()+'</section></div></section>'+
  '<section id="faq" class="faq"><h2 class="h2">'+esc(t("faqT"))+' '+addBtn("faq")+'</h2>'+DATA.faq.map(function(x){return '<details>'+ed("faq",x.id)+'<summary>'+esc(pick(x.q))+'</summary><p>'+esc(pick(x.a))+'</p></details>'}).join("")+'</section></div>'}


/* ------------------------------------------------------------ digital projects */
function projLogo(p){return p.img||p.logo||"assets/logo.png"}
function projItems(id){return (DATA["pi_"+id]||[]).slice().sort(function(a,b){return (a.date||"")<(b.date||"")?1:(a.date||"")>(b.date||"")?-1:0})}
function ytId(u){var m=/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/)([\w-]{11})/.exec(u||"");return m?m[1]:""}
function defKind(k){return{video:"video",paper:"issue",tests:"link"}[k]||"post"}
function ext(u){return u?' href="'+esc(u)+'" target="_blank" rel="noopener"':''}
function projCard(p){var n=(DATA["pi_"+p.id]||[]).length;
 return '<article class="pcard">'+ed("projects",p.id)+'<div class="pjlogo"><img src="'+esc(projLogo(p))+'" alt="" loading="lazy"></div><div class="pbody"><span class="chip">'+esc(t("pt_"+p.kind))+'</span>'+
  '<h3><a class="stretch" href="#project.'+esc(p.id)+'">'+esc(pick(p.title))+'</a></h3><p>'+esc(pick(p.desc))+'</p>'+
  '<div class="pfoot"><span>'+esc(n?f(t("nItems"),{n:n}):t("pEmpty"))+'</span><span class="go">'+esc(t("open"))+ic("arrow").replace('<svg','<svg width="15" height="15"')+'</span></div></div></article>'}
function itemCard(i,col,p,showProj){var title=esc(pick(i.title)),txt=pick(i.text),date=i.date?'<span class="pdate">'+esc(fmtDate(i.date))+'</span>':'',
  tag=showProj?'<a class="ptag" href="#project.'+esc(p.id)+'"><img src="'+esc(projLogo(p))+'" alt="">'+esc(pick(p.title))+'</a>':'',e=ed(col,i.id);
 if(i.kind==="video"){var y=ytId(i.url),th=y?"https://i.ytimg.com/vi/"+y+"/hqdefault.jpg":(i.img||projLogo(p));
  var media=y?'<button class="vthumb" data-yt="'+y+'" aria-label="'+title+'"><img src="'+esc(th)+'" alt="" loading="lazy"><span class="play">'+ic("play")+'</span></button>':'<a class="vthumb"'+ext(i.url)+'><img src="'+esc(th)+'" alt="" loading="lazy"><span class="play">'+ic("play")+'</span></a>';
  return '<article class="pitem">'+e+media+'<div class="pib">'+tag+date+'<h4>'+title+'</h4>'+(txt?'<p>'+esc(txt)+'</p>':'')+'</div></article>'}
 if(i.kind==="issue")return '<article class="pitem issue">'+e+'<a class="cover"'+ext(i.url)+'><img src="'+esc(i.img||projLogo(p))+'" alt="" loading="lazy"'+(i.img?'':' class="fallback"')+'></a><div class="pib">'+tag+date+'<h4>'+title+'</h4>'+(txt?'<p>'+esc(txt)+'</p>':'')+(i.url?'<a class="btn btn-soft pbtn"'+ext(i.url)+'>'+ic("book")+esc(t("readIssue"))+'</a>':'')+'</div></article>';
 if(i.kind==="link")return '<article class="pitem link">'+e+'<div class="pib"><span class="lico">'+ic(/\.pdf($|\?)/i.test(i.url||"")?"file":"link")+'</span>'+tag+date+'<h4>'+title+'</h4>'+(txt?'<p>'+esc(txt)+'</p>':'')+(i.url?'<a class="btn btn-soft pbtn"'+ext(i.url)+'>'+esc(t("openLink"))+' ↗</a>':'')+'</div></article>';
 return '<article class="pitem post">'+e+(i.img?'<div class="pimg"><img src="'+esc(i.img)+'" alt="" loading="lazy"></div>':'')+'<div class="pib">'+tag+date+'<h4>'+title+'</h4>'+(txt?'<p class="clamp">'+esc(txt)+'</p>':'')+'<button class="lnkbtn" data-pread="'+esc(col+"|"+i.id)+'">'+esc(t("readMore"))+' →</button></div></article>'}
function readHTML(i){var paras=(pick(i.text)||"").split(/\n+/).filter(Boolean).map(function(x){return '<p>'+esc(x)+'</p>'}).join("");
 return (i.img?'<img class="rimg" src="'+esc(i.img)+'" alt="">':'')+'<span class="pdate">'+esc(i.date?fmtDate(i.date):"")+'</span><h3>'+esc(pick(i.title))+'</h3><div class="rtext">'+paras+'</div>'+(i.url?'<p style="margin-top:14px"><a class="btn btn-soft"'+ext(i.url)+'>'+esc(t("openLink"))+' ↗</a></p>':'')}
function projLogos(cur){return '<div class="plogos">'+(DATA.projects||[]).filter(function(p){return p.id!==cur}).map(function(p){return '<a class="plogo-s" href="#project.'+esc(p.id)+'"><span class="pl"><img src="'+esc(projLogo(p))+'" alt="" loading="lazy"></span><span class="pn">'+esc(pick(p.title))+'</span></a>'}).join("")+'</div>'}
function pageProjects(){var P=DATA.projects||[];
 return banner("navProj","pd_proj")+'<div class="container page"><section><div class="toolbar" style="margin-bottom:18px"><span></span>'+addBtn("projects",{kind:"mixed"})+'</div><div class="grid3 pgrid">'+P.map(projCard).join("")+'</div></section></div>'}
function pageProject(){var p=(DATA.projects||[]).filter(function(x){return x.id===st.route.arg})[0];if(!p){location.hash="projects";return""}
 if(st.pkindFor!==p.id){st.pkindFor=p.id;st.pkind="all"}
 var col="pi_"+p.id,items=projItems(p.id),kinds=[];items.forEach(function(i){if(kinds.indexOf(i.kind)<0)kinds.push(i.kind)});
 var pf=kinds.indexOf(st.pkind)>=0?st.pkind:"all",list=items.filter(function(i){return pf==="all"||i.kind===pf});
 var link=p.url?'<a class="btn btn-outline"'+ext(p.url)+'>'+ic(/youtu/i.test(p.url)?"play":/instagram/i.test(p.url)?"insta":"link")+esc(/youtu/i.test(p.url)?t("ytCh"):/instagram/i.test(p.url)?"Instagram":t("projSite"))+'</a>':'';
 var head='<div class="phead">'+ed("projects",p.id)+'<div class="pjlogo big"><img src="'+esc(projLogo(p))+'" alt=""></div><div class="phtext"><span class="chip">'+esc(t("pt_"+p.kind))+'</span><p class="pdesc">'+esc(pick(p.desc))+'</p>'+
  (p.curator?'<p class="pcur">'+ic("user")+'<span>'+esc(t("curatorL"))+': <b>'+esc(p.curator)+'</b></span></p>':'')+(link?'<div class="pacts">'+link+'</div>':'')+'</div></div>';
 var tools='<div class="toolbar ptools">'+(kinds.length>1?'<div class="pills">'+["all"].concat(kinds).map(function(k){return '<button data-pkind="'+k+'" aria-pressed="'+(pf===k)+'">'+esc(t(k==="all"?"allK":"pk_"+k+"s"))+'</button>'}).join("")+'</div>':'<span></span>')+addBtn(col,{kind:defKind(p.kind),date:todayISO()})+'</div>';
 var body=list.length?'<div class="pitems'+(list.every(function(i){return i.kind==="issue"})?" issues":"")+'">'+list.map(function(i){return itemCard(i,col,p)}).join("")+'</div>':'<div class="empty"><b>'+esc(t("pNoItems"))+'</b>'+(st.editing&&can("p_"+p.id)?'<p style="margin-top:8px">'+esc(t("pNoItemsEd"))+'</p>':'')+'</div>';
 var crumb=lnk("projects",esc(t("navProj")))+'<span>/</span>';
 return banner(null,null,crumb,pick(p.title))+'<div class="container page"><section>'+head+tools+body+'</section><section><h2 class="h2">'+esc(t("otherProj"))+'</h2>'+projLogos(p.id)+'</section></div>'}
function homeProjects(){var P=DATA.projects||[];if(!P.length)return"";var all=[];
 P.forEach(function(p){projItems(p.id).forEach(function(i){all.push({i:i,p:p})})});all.sort(function(a,b){return (a.i.date||"")<(b.i.date||"")?1:-1});
 return '<section class="section"><div class="container"><div class="sec-head"><div><span class="eyebrow">'+esc(t("projE"))+'</span><h2>'+esc(t("navProj"))+'</h2></div><a class="btn btn-soft" href="#projects">'+esc(t("allProj"))+' →</a></div>'+projLogos()+
  (all.length?'<h3 class="psub">'+esc(t("projNew"))+'</h3><div class="pitems mix">'+all.slice(0,4).map(function(x){return itemCard(x.i,"pi_"+x.p.id,x.p,true)}).join("")+'</div>':'')+'</div></section>'}

var PAGES={projects:pageProjects,project:pageProject,admin:pageAdmin,profile:pageProfile,home:pageHome,about:pageAbout,news:pageNews,post:pagePost,schedule:pageSchedule,olympiad:pageOlympiad,events:pageEvents,clubs:pageClubs,gallery:pageGallery,album:pageAlbum,alumni:pageAlumni,docs:pageDocs,contacts:pageContacts};

/* ------------------------------------------------------------ render */
var app=document.getElementById("app"),layer=document.getElementById("layer");
function render(keepScroll){document.documentElement.lang=st.lang;syncNav();var y=window.scrollY;emN=0;
 var fn=PAGES[st.route.page]||pageHome;
 app.innerHTML=topbar()+header()+'<main id="main">'+fn()+'</main>'+footer()+editbar();
 document.title=(st.route.page==="home"?"":titleFor()+" · ")+t("name");
 if(keepScroll)window.scrollTo(0,y);startHero();startStrip()}
function titleFor(){var m={projects:"navProj",admin:"adminPanel",feedback:"navFeedback",profile:"cabinet",about:"navAbout",news:"navNews",programs:"navProg",schedule:"navSched",olympiad:"navOlymp",events:"navEvents",clubs:"navClubs",gallery:"navGallery",alumni:"navAlumni",docs:"navRes",contacts:"navContacts"}[st.route.page];
 if(m)return t(m);if(st.route.page==="project"){var pj=(DATA.projects||[]).filter(function(x){return x.id===st.route.arg})[0];return pj?pick(pj.title):""}if(st.route.page==="post"){var p=DATA.posts.filter(function(x){return x.id===st.route.arg})[0];return p?pick(p.title):""}
 if(st.route.page==="album"){var a=DATA.albums.filter(function(x){return x.id===st.route.arg})[0];return a?pick(a.title):""}return""}
function editbar(){if(!st.canEdit||!st.editing)return"";
 return '<div class="editbar"><span>'+esc(st.dirty?f(t("unsaved"),{n:st.dirty}):t("nochg"))+'</span>'+(can("settings")?'<button class="q" data-open="settings">'+esc(t("settings"))+'</button>':'')+'<button class="q" data-act="discard"'+(st.saving?" disabled":"")+'>'+esc(st.dirty?t("discard"):t("done"))+'</button><button class="save" data-act="save"'+(!st.dirty||st.saving?" disabled":"")+'>'+esc(st.saving?t("saving"):t("save"))+'</button></div>'}
function refreshBar(){var b=app.querySelector(".editbar"),h=editbar();if(b)b.outerHTML=h;else if(h)app.insertAdjacentHTML("beforeend",h)}
function toast(msg){var d=document.createElement("div");d.className="toast";d.setAttribute("role","status");d.textContent=msg;document.body.appendChild(d);setTimeout(function(){d.remove()},3200)}
function dirty(){st.dirty++}

/* routing: plain #token or #page.arg */
function parseHash(){var h=(location.hash||"").replace(/^#/,""),parts=h.split("."),page=parts[0]||"home",arg=parts.slice(1).join(".");if(page==="feedback"){page="contacts";arg="feedback"}
 if(!PAGES[page]){page="home";arg=""}
 if(page==="news"&&arg&&["events","achieve","life","ann"].indexOf(arg)>=0){st.newsCat=arg;st.newsPage=1;arg=""}
 if(page==="programs"&&PROG[arg]){st.progF=arg;arg=""}
 var prev=st.route.page+"."+st.route.arg;st.route={page:page,arg:arg};closeLayer();render();
 var sec=(page==="about"||page==="docs"||page==="contacts")&&arg?document.getElementById(arg):null;
 if(sec)sec.scrollIntoView();else if(prev!==page+"."+arg)window.scrollTo(0,0)}
window.addEventListener("hashchange",parseHash);

/* ------------------------------------------------------------ hero canvas */
var heroRAF=0;

/* ------------------------------------------------------------ photo strip (home, above hero) */
function latestPhotos(n){var out=[];for(var a=DATA.albums.length-1;a>=0&&out.length<n;a--){var al=DATA.albums[a];for(var i=al.photos.length-1;i>=0&&out.length<n;i--)out.push({aid:al.id,i:i,src:al.photos[i].src,cap:pick(al.photos[i].cap)||pick(al.title)})}return out}
function photoStrip(){var ph=latestPhotos(16),tiles;
 if(ph.length){tiles=ph.map(function(p){return '<button class="stile" data-lb="'+esc(p.aid)+':'+p.i+'" aria-label="'+esc(p.cap)+'"><img src="'+esc(p.src)+'" alt="" loading="lazy"><span>'+esc(p.cap)+'</span></button>'}).join("")}
 else{tiles=[["ph1","cal","g1"],["ph2","book","g2"],["ph3","ball","g4"],["ph4","book","g6"],["ph5","star","g5"],["ph6","users","g3"],["ph7","trophy","g2"],["ph8","bell","g1"]].map(function(x){return '<a class="stile ph '+x[2]+'" href="#gallery"><span class="big">'+ic(x[1])+'</span><span>'+esc(t(x[0]))+'<small>'+esc(t("noPhotos"))+'</small></span></a>'}).join("")}
 return '<section class="strip" aria-label="'+esc(t("stripT"))+'"><div class="strack" id="strack">'+tiles+tiles.replace(/class="stile/g,'tabindex="-1" aria-hidden="true" class="stile')+'</div><div class="shead"><span>'+ic("image")+esc(t("stripT"))+'</span><a href="#gallery">'+esc(st.editing?t("stripAdd"):t("allPhotos"))+' →</a></div></section>'}
var stripRAF=0;
function startStrip(){cancelAnimationFrame(stripRAF);var tr=document.getElementById("strack");if(!tr)return;
 if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 var paused=false,last=0,pos=tr.scrollLeft;
 ["pointerenter","focusin","touchstart"].forEach(function(ev){tr.addEventListener(ev,function(){paused=true},{passive:true})});
 ["pointerleave","focusout","touchend"].forEach(function(ev){tr.addEventListener(ev,function(){paused=false;pos=tr.scrollLeft;last=0},{passive:true})});
 function step(ts){if(document.getElementById("strack")!==tr)return;var half=tr.scrollWidth/2;
  if(!paused&&!document.hidden&&half>tr.clientWidth){var dt=last?Math.min(ts-last,64):16;pos+=dt*0.04;if(pos>=half)pos-=half;tr.scrollLeft=pos}else{pos=tr.scrollLeft;if(pos>=half)pos-=half}
  last=ts;stripRAF=requestAnimationFrame(step)}
 stripRAF=requestAnimationFrame(step)}
function startHero(){cancelAnimationFrame(heroRAF);var c=document.getElementById("heroCanvas");if(!c)return;var ctx=c.getContext("2d"),dpr=Math.min(window.devicePixelRatio||1,2),W,H,pts=[],mouse={x:-999,y:-999};
 var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
 function size(){var r=c.getBoundingClientRect();W=r.width;H=r.height;c.width=W*dpr;c.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);var n=Math.round(Math.min(70,W*H/16000));pts=[];for(var i=0;i<n;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:1.2+Math.random()*2.2})}
 size();c.parentNode.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top});c.parentNode.addEventListener("pointerleave",function(){mouse.x=-999});
 function frame(){ctx.clearRect(0,0,W,H);for(var i=0;i<pts.length;i++){var p=pts[i];if(!reduce){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
   var dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy);if(d<110){p.x+=dx/d*1.2;p.y+=dy/d*1.2}}
  for(var j=i+1;j<pts.length;j++){var q=pts[j],ex=p.x-q.x,ey=p.y-q.y,dd=ex*ex+ey*ey;if(dd<12000){ctx.strokeStyle="rgba(22,163,74,"+(0.16*(1-dd/12000))+")";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}}
  ctx.fillStyle=i%5===0?"rgba(132,204,22,.55)":"rgba(22,163,74,.35)";ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill()}
  if(!reduce&&document.getElementById("heroCanvas")===c&&!document.hidden)heroRAF=requestAnimationFrame(frame)}
 frame()}
document.addEventListener("visibilitychange",function(){if(!document.hidden&&st.route.page==="home")startHero()});
var rsz;window.addEventListener("resize",function(){clearTimeout(rsz);rsz=setTimeout(startHero,200)});

/* ------------------------------------------------------------ layer: drawer, login, modals, editor */
function closeLayer(){layer.innerHTML="";document.removeEventListener("keydown",escKey)}
function escKey(e){if(e.key==="Escape")closeLayer()}
function openLayer(html,drawer){layer.innerHTML=drawer?'<div class="overlay" data-close="1" style="padding:0"></div>'+html:'<div class="overlay" data-close="1"><div class="modal" role="dialog" aria-modal="true"><button class="xbtn" data-close="1" aria-label="'+esc(t("close"))+'">×</button>'+html+'</div></div>';
 document.addEventListener("keydown",escKey);var fcs=layer.querySelector("input,select,textarea,button:not(.xbtn),a");if(fcs)fcs.focus()}
function openDrawer(){openLayer('<aside class="drawer" role="dialog" aria-label="'+esc(t("menu"))+'"><div class="dh"><b>'+esc(t("menu"))+'</b><button class="xbtn" data-close="1">×</button></div><a href="#home">'+esc(t("home"))+'</a>'+
 NAV.map(function(g){return g.href?'<a href="#'+g.href+'">'+esc(t(g.k))+'</a>':'<details'+(g.items.some(function(x){return isOn(x[0])})?" open":"")+'><summary>'+esc(t(g.k))+'</summary>'+g.items.map(function(x){return '<a href="#'+x[0]+'">'+esc(x[2]||t(x[1]))+'</a>'}).join("")+'</details>'}).join("")+
 '<div style="margin-top:18px" class="lang" role="group">'+LANGS.map(function(l){return '<button data-lang="'+l+'" aria-pressed="'+(st.lang===l)+'" style="color:'+(st.lang===l?"#14532d":"#475569")+'">'+["Қаз","Рус","Eng"][LI[l]]+'</button>'}).join("")+'</div>'+
 '<button class="btn btn-primary" style="width:100%;margin-top:16px" data-open="'+(st.user?"account":"login")+'">'+esc(st.user?t("cabinet"):t("login"))+'</button></aside>',true)}
function msgBox(){return '<p class="formmsg" id="fmsg" hidden></p>'}
function showMsg(k,ok,extra){var m=document.getElementById("fmsg");if(!m)return;m.hidden=false;m.className="formmsg "+(ok?"ok":"err");m.textContent=t(k)+(extra?" ("+extra+")":"")}
function authErr(e){var s=(e&&e.message)||"";if(/invalid login/i.test(s))return["e_cred"];if(/not confirmed/i.test(s))return["e_confirm"];if(/already|exists/i.test(s))return["e_exists"];if(/rate|too many|security purposes/i.test(s))return["e_rate"];if(/password/i.test(s))return["e_short"];return["e_generic",s]}
function busy(form,on){var b=form.querySelector('button[type="submit"]');if(b){b.disabled=on;b.style.opacity=on?.6:1}}
function bilimBtn(){return '<div class="divider">'+esc(t("or"))+'</div><a class="btn btn-bilim" href="https://bilimclass.kz" target="_blank" rel="noopener"><span class="bmark">B</span>'+esc(t("viaBilim"))+'</a><p class="hint">'+esc(t("bilimNote"))+'</p>'}
function authHead(k){return '<div style="text-align:center">'+emblem()+'<h3 style="padding:0">'+esc(t(k))+'</h3></div>'}
function openLogin(){var dis=sb?'':' disabled';
 openLayer(authHead("loginT2")+(sb?'':'<p class="formmsg err">'+esc(t("noAuth"))+'</p>')+'<form class="form" id="authLogin" novalidate>'+
 '<label>'+esc(t("emailF"))+'<input id="au-email" type="email" autocomplete="email" required'+dis+'></label>'+
 '<label>'+esc(t("passF"))+'<input id="au-pass" type="password" autocomplete="current-password" required'+dis+'></label>'+
 '<div style="text-align:right;margin-top:-4px"><button type="button" class="linkish" data-auth="forgot">'+esc(t("forgot"))+'</button></div>'+msgBox()+
 '<button class="btn btn-primary btn-lg" type="submit" style="width:100%"'+dis+'>'+esc(t("signIn"))+'</button></form>'+
 '<p class="swap">'+esc(t("noAcc"))+' <button type="button" class="linkish" data-auth="register">'+esc(t("signUp"))+'</button></p>'+bilimBtn())}
function openRegister(){var dis=sb?'':' disabled';
 openLayer(authHead("regT")+(sb?'':'<p class="formmsg err">'+esc(t("noAuth"))+'</p>')+'<form class="form" id="authReg" novalidate>'+
 '<label>'+esc(t("fullName"))+'<input id="ar-name" autocomplete="name" required'+dis+'></label>'+
 '<label>'+esc(t("roleF"))+'<select id="ar-role"'+dis+'>'+["student","parent","teacher"].map(function(r){return '<option value="'+r+'">'+esc(t("r_"+r))+'</option>'}).join("")+'</select></label>'+
 '<label>'+esc(t("emailF"))+'<input id="ar-email" type="email" autocomplete="email" required'+dis+'></label>'+
 '<div class="row2"><label>'+esc(t("passF"))+'<input id="ar-pass" type="password" autocomplete="new-password" minlength="8" required'+dis+'></label><label>'+esc(t("pass2F"))+'<input id="ar-pass2" type="password" autocomplete="new-password" required'+dis+'></label></div>'+msgBox()+
 '<button class="btn btn-primary btn-lg" type="submit" style="width:100%"'+dis+'>'+esc(t("signUp"))+'</button></form>'+
 '<p class="swap">'+esc(t("haveAcc"))+' <button type="button" class="linkish" data-auth="login">'+esc(t("signIn"))+'</button></p>'+bilimBtn())}
function openForgot(){openLayer(authHead("resetT")+'<p class="hint" style="text-align:center">'+esc(t("resetSub"))+'</p><form class="form" id="authForgot" novalidate><label>'+esc(t("emailF"))+'<input id="af-email" type="email" autocomplete="email" required'+(sb?'':' disabled')+'></label>'+msgBox()+
 '<button class="btn btn-primary btn-lg" type="submit" style="width:100%"'+(sb?'':' disabled')+'>'+esc(t("sendLink"))+'</button></form><p class="swap"><button type="button" class="linkish" data-auth="login">← '+esc(t("back"))+'</button></p>')}
function openNewPass(){openLayer(authHead("newPassT")+'<form class="form" id="authNew" novalidate><label>'+esc(t("passF"))+'<input id="an-pass" type="password" autocomplete="new-password" required></label><label>'+esc(t("pass2F"))+'<input id="an-pass2" type="password" autocomplete="new-password" required></label>'+msgBox()+
 '<button class="btn btn-primary btn-lg" type="submit" style="width:100%">'+esc(t("ok"))+'</button></form>')}
function openAccount(){var u=st.user;if(!u){openLogin();return}var m=u.user_metadata||{};
 openLayer(authHead("cabinet")+'<div class="acct"><div class="ava">'+esc(((m.full_name||u.email||"?")[0]||"?").toUpperCase())+'</div><div style="min-width:0"><b>'+esc(m.full_name||u.email)+'</b><span>'+esc(u.email)+'</span>'+
 '<div class="tags" style="margin-top:6px">'+(m.role?'<span>'+esc(t("r_"+m.role))+'</span>':'')+(st.canEdit?'<span class="adm">'+esc(t("adminBadge"))+'</span>':'')+'</div></div></div>'+
 '<div class="login-opts">'+(st.canEdit?'<button class="lnk" data-act="edit" style="text-align:left;width:100%"><span class="ico">'+ic("edit")+'</span><div><b>'+esc(t("enterEdit"))+'</b><span>'+esc(t("optAdmin"))+'</span></div></button>'+
 '<button class="lnk" data-auth="users" style="text-align:left;width:100%"><span class="ico">'+ic("users")+'</span><div><b>'+esc(t("usersT"))+'</b></div></button>':'')+
 '<a class="lnk" href="https://bilimclass.kz" target="_blank" rel="noopener"><span class="ico">'+ic("book")+'</span><div><b>BilimClass</b><span>'+esc(t("bilimNote"))+'</span></div></a>'+
 '<button class="btn btn-soft" data-auth="signout" style="width:100%;margin-top:4px">'+esc(t("signOut"))+'</button></div>')}
function openUsers(){openLayer('<h3>'+esc(t("usersT"))+'</h3><div id="ulist" class="ulist"><p class="hint">…</p></div>');
 sb.from("profiles").select("full_name,email,role,created_at").order("created_at",{ascending:false}).limit(300).then(function(r){var el=document.getElementById("ulist");if(!el)return;
  if(r.error){el.innerHTML='<p class="formmsg err">'+esc(t("e_generic"))+'</p>';return}
  el.innerHTML=r.data.length?r.data.map(function(p){return '<div class="urow"><div style="min-width:0"><b>'+esc(p.full_name||"—")+'</b><span>'+esc(p.email||"")+'</span></div><div class="uside"><span class="chip">'+esc(p.role?t("r_"+p.role):"—")+'</span><small>'+esc(fmtDate(String(p.created_at).slice(0,10)))+'</small></div></div>'}).join(""):'<div class="empty"><b>'+esc(t("noUsers"))+'</b></div>'})}
function redirectURL(){return location.origin+location.pathname}
function submitAuth(form){var id=form.id,v=function(x){return document.getElementById(x).value.trim()};if(!sb)return;busy(form,true);
 var done=function(){busy(form,false)};
 if(id==="authLogin"){sb.auth.signInWithPassword({email:v("au-email"),password:document.getElementById("au-pass").value}).then(function(r){done();if(r.error){var e=authErr(r.error);showMsg(e[0],false,e[1]);return}closeLayer();location.hash="profile"})}
 else if(id==="authReg"){var p1=document.getElementById("ar-pass").value,p2=document.getElementById("ar-pass2").value;
  if(!v("ar-name")){showMsg("needTitle",false);done();return} if(p1.length<8){showMsg("e_short",false);done();return} if(p1!==p2){showMsg("e_match",false);done();return}
  sb.auth.signUp({email:v("ar-email"),password:p1,options:{data:{full_name:v("ar-name"),role:document.getElementById("ar-role").value},emailRedirectTo:redirectURL()}}).then(function(r){done();
   if(r.error){var e=authErr(r.error);showMsg(e[0],false,e[1]);return}
   if(r.data&&r.data.user&&r.data.user.identities&&r.data.user.identities.length===0){showMsg("e_exists",false);return}
   if(r.data&&r.data.session){closeLayer();return} form.querySelectorAll("input,select,button").forEach(function(x){x.disabled=true});showMsg("regDone",true)})}
 else if(id==="authForgot"){sb.auth.resetPasswordForEmail(v("af-email"),{redirectTo:redirectURL()}).then(function(r){done();if(r.error){var e=authErr(r.error);showMsg(e[0],false,e[1]);return}showMsg("linkSent",true)})}
 else if(id==="authNew"){var a=document.getElementById("an-pass").value;if(a.length<8){showMsg("e_short",false);done();return}if(a!==document.getElementById("an-pass2").value){showMsg("e_match",false);done();return}
  sb.auth.updateUser({password:a}).then(function(r){done();if(r.error){var e=authErr(r.error);showMsg(e[0],false,e[1]);return}closeLayer();toast(t("passSaved"));if(st.route.page==="profile"||st.route.page==="admin")render(true)})}}
function openProg(k){var p=PROG[k],L=LI[st.lang];var list=k==="extra"?DATA.clubs.map(function(c){return pick(c.title)}):p.subj.map(subj);
 openLayer('<span class="eyebrow">'+esc(p.sub[L])+' · '+esc(p.g)+'</span><h3>'+esc(p.title[L])+'</h3><p style="color:var(--muted);margin-top:10px;font-size:14px">'+esc(p.desc[L])+'</p>'+
 '<h4 style="margin-top:18px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8">'+esc(k==="extra"?t("navClubs"):t("subjT"))+'</h4><div class="subjlist">'+list.map(function(s){return '<div>'+esc(s)+'</div>'}).join("")+'</div>'+
 '<div class="callout">'+esc(p.out[L])+'</div><div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><a class="btn btn-primary" href="#'+(k==="extra"?"clubs":"schedule")+'">'+esc(k==="extra"?t("navClubs"):t("navSched"))+'</a><button class="btn btn-soft" data-close="1">'+esc(t("close"))+'</button></div>')}
function lightbox(aid,i){var a=DATA.albums.filter(function(x){return x.id===aid})[0];if(!a)return;var p=a.photos[i];
 layer.innerHTML='<div class="lightbox" data-close="1" role="dialog"><button class="xbtn" data-close="1" aria-label="×">×</button><img src="'+p.src+'" alt=""><p></p></div>';layer.querySelector("p").textContent=pick(p.cap);document.addEventListener("keydown",escKey)}

/* generic editor */
var CATS=["events","achieve","life","ann"];
var SCHEMA={
 posts:[["cat","select",CATS,"c_"],["date","date"],["title","ml"],["text","mlarea"],["img","image"]],
 events:[["date","date"],["time","text"],["title","ml"],["place","ml"]],
 staff:[["group","select",["admin","teacher"],"g_"],["name","text"],["role","ml"],["img","image"]],
 clubs:[["title","ml"],["desc","mlarea"],["when","ml"],["grades","text"]],
 facilities:[["title","ml"],["desc","mlarea"]],
 achievements:[["year","text"],["level","select",["district","region","republic","intl"],"lv_"],["title","ml"]],
 docs:[["cat","select",["docs","res"],"k_"],["title","ml"],["url","url"]],
 faq:[["q","ml"],["a","mlarea"]],
 albums:[["year","text"],["title","ml"]],
 alumni:[["name","text"],["year","text"],["text","mlarea"]],
 partners:[["title","ml"],["url","url"],["img","logo"]],
 projects:[["title","ml"],["desc","mlarea"],["kind","select",["video","paper","blog","articles","tests","mixed"],"pt_"],["curator","text"],["url","url"],["img","logo"]],
 pitem:[["kind","select",["video","issue","post","link"],"pk_"],["date","date"],["title","ml"],["text","mlarea"],["url","urlfile"],["img","image"]]};
var LBL={kind:"f_kind",curator:"f_curator",cat:"f_cat",date:"f_date",title:"f_title",text:"f_text",img:"f_img",time:"f_time",place:"f_place",group:"f_group",name:"f_name",role:"f_role",desc:"f_desc",when:"f_when",grades:"f_grades",level:"f_level",year:"f_year",url:"f_url",q:"f_q",a:"f_a"};
var edImg=null;
function field(name,type,val,opts,pref){var id="fe-"+name,lab=esc(t(LBL[name]||name));
 if(type==="ml"||type==="mlarea")return '<label>'+lab+'<div class="ml">'+LANGS.map(function(l){var v=val&&val[l]||"";return type==="ml"?'<input id="'+id+'-'+l+'" placeholder="'+["KZ","RU","EN"][LI[l]]+'" value="'+esc(v)+'">':'<textarea id="'+id+'-'+l+'" placeholder="'+["KZ","RU","EN"][LI[l]]+'">'+esc(v)+'</textarea>'}).join("")+'</div></label>';
 if(type==="select")return '<label>'+lab+'<select id="'+id+'">'+opts.map(function(o){return '<option value="'+o+'"'+(o===val?" selected":"")+'>'+esc(t(pref+o))+'</option>'}).join("")+'</select></label>';
 if(type==="image"||type==="logo")return '<label>'+(type==="logo"?esc(t("f_logo")):lab)+'<input id="'+id+'" type="file" accept="image/*" data-edimg="'+(type==="logo"?"logo":"1")+'"></label>'+(type==="logo"?'<small class="hint" style="text-align:left;margin:-6px 0 0">'+esc(t("logoHint"))+'</small>':'')+'<div id="edprev">'+(val?'<img class="prev" src="'+val+'" alt=""> <button type="button" class="copy" data-clearimg="1">'+esc(t("del"))+'</button>':'')+'</div>';
 if(type==="urlfile")return '<label>'+esc(t("f_urlP"))+'<input id="'+id+'" type="url" placeholder="https://" value="'+esc(val||"")+'"></label><label class="filepick">'+esc(t("uploadPdf"))+'<input type="file" accept="application/pdf,.pdf" data-edfile="'+id+'"><small class="hint" style="text-align:left;margin:4px 0 0"></small></label>';
 return '<label>'+lab+'<input id="'+id+'" type="'+(type==="date"?"date":type==="url"?"url":"text")+'" value="'+esc(val||"")+'"></label>'}
function openEditor(col,id,preset){var item=id?DATA[col].filter(function(x){return x.id===id})[0]:(preset||{});edImg=item&&item.img||null;
 openLayer('<h3>'+esc(t(id?"edit":"add"))+'</h3><form class="form" id="edform" data-col="'+col+'" data-id="'+esc(id||"")+'">'+SCHEMA[col].map(function(s){return field(s[0],s[1],item[s[0]],s[2],s[3])}).join("")+
 '<div class="acts"><button type="button" class="btn btn-soft" data-close="1">'+esc(t("cancel"))+'</button><button class="btn btn-primary" type="submit">'+esc(t("ok"))+'</button></div></form>')}
function saveEditor(form){var col=form.dataset.col,id=form.dataset.id,obj={},hasText=false;
 SCHEMA[col].forEach(function(s){var n=s[0],tp=s[1];
  if(tp==="ml"||tp==="mlarea"){var o={};LANGS.forEach(function(l){var v=document.getElementById("fe-"+n+"-"+l).value.trim();if(v)o[l]=v});obj[n]=o;if((n==="title"||n==="q")&&Object.keys(o).length)hasText=true}
  else if(tp==="image"||tp==="logo")obj[n]=edImg||"";else obj[n]=document.getElementById("fe-"+n).value.trim()});
 var needs=SCHEMA[col].some(function(s){return s[0]==="title"||s[0]==="q"});if(col==="staff"||col==="alumni")needs=false,hasText=!!obj.name;
 if((needs||col==="staff"||col==="alumni")&&!hasText){toast(t("needTitle"));return}
 if(id){var it=DATA[col].filter(function(x){return x.id===id})[0];Object.keys(obj).forEach(function(k){it[k]=obj[k]});delete it.sample}
 else{obj.id=uid(col[0]);if(col==="albums")obj.photos=[];DATA[col].push(obj)}
 if(col==="projects")DATA.projects.forEach(function(p){regProj(p.id)});
 dirty();closeLayer();render(true)}
function openSettings(){openLayer('<h3>'+esc(t("settings"))+'</h3>'+settingsForm(true))}
function settingsForm(modal){var s=DATA.settings;
 return '<form class="form" id="setform"><div class="row2"><label>'+esc(t("f_phone"))+'<input id="se-phone" value="'+esc(s.phone)+'"></label><label>Email<input id="se-email" value="'+esc(s.email)+'"></label></div>'+
 '<div class="row2"><label>'+esc(t("f_whatsapp"))+'<input id="se-whatsapp" inputmode="numeric" value="'+esc(s.whatsapp)+'"></label><label>'+esc(t("f_acad"))+'<input id="se-year" value="'+esc(s.year)+'"></label></div>'+
 '<div class="row2"><label>Instagram<input id="se-instagram" type="url" placeholder="https://instagram.com/…" value="'+esc(s.instagram)+'"></label><label>Telegram<input id="se-telegram" type="url" placeholder="https://t.me/…" value="'+esc(s.telegram)+'"></label></div>'+
 '<label>Facebook<input id="se-facebook" type="url" value="'+esc(s.facebook)+'"></label>'+
 '<label>'+esc(t("f_hours"))+'<div class="ml">'+LANGS.map(function(l){return '<input id="se-hours-'+l+'" value="'+esc(s.hours[l]||"")+'">'}).join("")+'</div></label>'+
 '<label>'+esc(t("f_motto"))+'<div class="ml">'+LANGS.map(function(l){return '<input id="se-motto-'+l+'" value="'+esc((s.motto||{})[l]||"")+'">'}).join("")+'</div></label>'+
 s.stats.map(function(x,i){return '<label>'+esc(t("f_stat"))+' '+(i+1)+'<div class="ml" style="grid-template-columns:90px repeat(3,minmax(0,1fr))"><input id="se-sn-'+i+'" value="'+esc(x.n)+'">'+LANGS.map(function(l){return '<input id="se-sl-'+i+'-'+l+'" value="'+esc(x.l[l]||"")+'">'}).join("")+'</div></label>'}).join("")+
 '<div class="acts">'+(modal?'<button type="button" class="btn btn-soft" data-close="1">'+esc(t("cancel"))+'</button>':'')+'<button class="btn btn-primary" type="submit">'+esc(t("ok"))+'</button></div></form>'}
function saveSettings(){var s=DATA.settings,g=function(id){return document.getElementById(id).value.trim()};
 ["phone","email","whatsapp","year","instagram","telegram","facebook"].forEach(function(k){s[k]=g("se-"+k)});
 LANGS.forEach(function(l){s.hours[l]=g("se-hours-"+l);s.motto=s.motto||{};s.motto[l]=g("se-motto-"+l)});
 s.stats.forEach(function(x,i){var nv=g("se-sn-"+i);if(nv!==x.n)s.statsSample=false;x.n=nv;LANGS.forEach(function(l){x.l[l]=g("se-sl-"+i+"-"+l)})});
 st.editing=true;dirty();closeLayer();render(true);toast(t("settingsHint"))}

function shrinkLogo(file,M){return new Promise(function(res){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var s=Math.min(1,M/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(im.width*s));c.height=Math.max(1,Math.round(im.height*s));c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/png"))};im.onerror=function(){res(null)};im.src=r.result};r.onerror=function(){res(null)};r.readAsDataURL(file)})}
function shrink(file,M){return new Promise(function(res){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var s=Math.min(1,M/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.8))};im.onerror=function(){res(null)};im.src=r.result};r.onerror=function(){res(null)};r.readAsDataURL(file)})}

/* ------------------------------------------------------------ events */
document.addEventListener("click",function(e){
 var el=e.target.closest("[data-yt],[data-pread],[data-pkind],[data-close],[data-lang],[data-open],[data-act],[data-ncat],[data-npage],[data-progf],[data-prog],[data-grade],[data-calm],[data-day],[data-year],[data-copy],[data-lb],[data-edit],[data-del],[data-add],[data-ttgrade],[data-ttcls],[data-ttadd],[data-ttdel],[data-ttdelcls],[data-unsample],[data-delph],[data-clearimg],[data-auth],[data-ptab],[data-qa],[data-b2add],[data-b2rm],[data-atab],[data-goedit],[data-roledel],[data-fbkind],[data-fbmore],[data-rate],[data-fbstatus],[data-fbset],[data-fbdel],[data-urole],a[href^='#']");
 if(!el)return;var d=el.dataset;
 if(d.yt){el.outerHTML='<div class="vframe"><iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(d.yt)+'?autoplay=1&rel=0" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';return}
 if(d.pkind){st.pkind=d.pkind;render(true);return}
 if(d.pread){var pq=d.pread.split("|"),pit=(DATA[pq[0]]||[]).filter(function(x){return x.id===pq[1]})[0];if(pit)openLayer('<div class="reader">'+readHTML(pit)+'</div>');return}
 if(d.close!==undefined){if(e.target===el||el.tagName==="BUTTON"){closeLayer()}return}
 if(el.tagName==="A"&&el.getAttribute("href").charAt(0)==="#"){if(el.getAttribute("href")==="#"+(location.hash.replace(/^#/,"")||"home")){e.preventDefault();parseHash()}return}
 if(d.lang){st.lang=d.lang;store("gm-lang",d.lang);closeLayer();render(true);return}
 if(d.open==="drawer"){openDrawer();return} if(d.open==="login"){openLogin();return} if(d.open==="account"){closeLayer();location.hash="profile";return}
 if(d.ptab){st.ptab=d.ptab;render(true);return}
 if(d.b2add){DATA.bells2=DATA.bells2||[];var lb=DATA.bells2[DATA.bells2.length-1],st0=lb?toMin(lb[1])+5:toMin(DATA.bells[DATA.bells.length-1][1])+10;var hm=function(m){return pad(Math.floor(m/60)%24)+":"+pad(m%60)};DATA.bells2.push([hm(st0),hm(st0+45),lb?(lb[2]!=null?lb[2]+1:DATA.bells2.length+1):0]);dirty();render(true);return}
 if(d.b2rm){DATA.bells2.pop();dirty();render(true);return}
 if(d.atab){st.atab=d.atab;render(true);window.scrollTo(0,0);return}
 if(d.goedit){st.editing=true;location.hash=d.goedit;return}
 if(d.roledel){e.preventDefault();if(st.sureId!=="role"+d.roledel){st.sureId="role"+d.roledel;render(true);return}st.sureId=null;sb.from("roles").delete().eq("id",d.roledel).then(function(r){if(r.error){toast(t("e_generic"));return}st.admin=null;toast(t("roleDeleted"));render(true)});return}
 if(d.fbkind){st.fbKind=d.fbkind;st.fbShow=6;render(true);return}
 if(d.fbmore){st.fbShow+=6;render(true);return}
 if(d.rate){var v=+d.rate,inp=document.getElementById("fb-rating");inp.value=(+inp.value===v)?0:v;document.querySelectorAll("[data-rate]").forEach(function(b){b.classList.toggle("on",+b.dataset.rate<=+inp.value)});return}
 if(d.fbstatus){st.fbStatus=d.fbstatus;render(true);return}
 if(d.fbset){var rep=document.getElementById("rep-"+d.fbset);fbUpdate(d.fbset,{status:d.st,reply:rep&&rep.value.trim()?rep.value.trim():null});return}
 if(d.fbdel){if(st.sureId!=="fb"+d.fbdel){st.sureId="fb"+d.fbdel;render(true);return}st.sureId=null;sb.from("feedback").delete().eq("id",d.fbdel).then(function(r){if(r.error){toast(t("e_generic"));return}st.fbAdmin=st.fbAdmin.filter(function(x){return String(x.id)!==d.fbdel});st.fb=null;render(true)});return}
 if(d.qa){quickAction(d.qa);return}
 if(d.urole){st.urole=d.urole;document.querySelectorAll("[data-urole]").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.urole===st.urole)});document.getElementById("ulistP").innerHTML=userRows();return}

 if(d.auth==="signoutall"&&sb){sb.auth.signOut({scope:"global"}).then(function(){location.hash="home"});return}
 if(d.auth){e.preventDefault();if(d.auth==="login")openLogin();else if(d.auth==="register")openRegister();else if(d.auth==="forgot")openForgot();else if(d.auth==="users")openUsers();else if(d.auth==="signout"&&sb){sb.auth.signOut().then(function(){closeLayer();if(st.route.page==="profile"||st.route.page==="admin")render(true)})}return} if(d.open==="settings"){if(can("settings"))openSettings();return}
 if(d.act==="edit"){if(!st.canEdit)return;st.editing=true;closeLayer();render(true);refreshBar();return}
 if(d.act==="discard"){if(st.dirty)location.reload();else{st.editing=false;render(true)}return}
 if(d.act==="save"){publish();return}
 if(d.ncat){st.newsCat=d.ncat;st.newsPage=1;render(true);return}
 if(d.npage){st.newsPage=+d.npage;render();document.getElementById("main").scrollIntoView();return}
 if(d.progf){st.progF=d.progf;render(true);return}
 if(d.prog){openProg(d.prog);return}
 if(d.ttgrade){var nm=Object.keys(DATA.classes).sort(clsSort).filter(function(n){return parseInt(n,10)===+d.ttgrade});if(nm.length){st.cls=nm[0];store("gm-cls",st.cls)}render(true);return}
 if(d.ttcls){st.cls=d.ttcls;store("gm-cls",st.cls);render(true);return}
 if(d.ttadd!==undefined){var dd=DATA.classes[st.cls].days[+d.ttadd],mx=dd.reduce(function(m,l){return Math.max(m,l.n)},-1),first=bellLabel((DATA.classes[st.cls].shift===2?DATA.bells2:DATA.bells)[0]||[0,0,1],0);dd.push({n:mx<0?first:mx+1,s:"",r:""});dirty();render(true);return}
 if(d.ttdel){var pq=d.ttdel.split(":");DATA.classes[st.cls].days[+pq[0]].splice(+pq[1],1);dirty();render(true);return}
 if(d.ttdelcls){if(st.sureId!=="cls"+st.cls){st.sureId="cls"+st.cls;render(true);return}st.sureId=null;delete DATA.classes[st.cls];st.cls="";dirty();render(true);return}
 if(d.calm){var m=st.cal.m+(+d.calm),y=st.cal.y;if(m<1){m=12;y--}if(m>12){m=1;y++}st.cal={y:y,m:m};st.calSel=null;render(true);return}
 if(d.day){st.calSel=st.calSel===d.day?null:d.day;render(true);return}
 if(d.year){st.year=d.year;render(true);return}
 if(d.copy!==undefined){e.preventDefault();var v=d.copy,done=function(){el.textContent=t("copied");setTimeout(function(){el.textContent=t("copy")},1500)};try{navigator.clipboard.writeText(v).then(done,function(){selText(el)})}catch(_){selText(el)}return}
 if(d.lb){var q=d.lb.split(":");lightbox(q[0],+q[1]);return}
 if(d.edit){e.preventDefault();openEditor(d.edit,d.id);return}
 if(d.del){e.preventDefault();var key=d.del+d.id;if(st.sureId!==key){st.sureId=key;render(true);return}DATA[d.del]=DATA[d.del].filter(function(x){return x.id!==d.id});st.sureId=null;dirty();if(st.route.arg===d.id)location.hash=d.del==="posts"?"news":d.del==="projects"?"projects":"gallery";render(true);return}
 if(d.add){e.preventDefault();openEditor(d.add,null,d.preset?JSON.parse(d.preset):null);return}
 
 
 
 if(d.delph){var r=d.delph.split(":"),al=DATA.albums.filter(function(x){return x.id===r[0]})[0];al.photos.splice(+r[1],1);dirty();render(true);return}
 if(d.clearimg){edImg=null;document.getElementById("edprev").innerHTML="";return}
});
function selText(el){var s=el.parentNode.querySelector("span");if(!s)return;var r=document.createRange();r.selectNodeContents(s);var sel=getSelection();sel.removeAllRanges();sel.addRange(r)}
document.addEventListener("input",function(e){if(e.target.id==="newsq"){st.newsQ=e.target.value;st.newsPage=1;var q=st.newsQ.trim().toLowerCase();
 var list=sortedPosts().filter(function(p){return(st.newsCat==="all"||p.cat===st.newsCat)&&(!q||(pick(p.title)+" "+pick(p.text)).toLowerCase().indexOf(q)>=0)});
 document.getElementById("newslist").innerHTML=newsList(list.slice(0,9),Math.max(1,Math.ceil(list.length/9)))}});
document.addEventListener("change",function(e){var d=e.target.dataset;
 
 if(d.ttsel){var px=d.ttsel.split(":"),lx=DATA.classes[st.cls].days[+px[0]][+px[1]];if(e.target.value==="__new__"){st.ttCustom=st.ttCustom||{};st.ttCustom[d.ttsel]=1;render(true);var inp=document.querySelector('[data-tts="'+d.ttsel+'"]');if(inp)inp.focus();return}lx.s=e.target.value;dirty();refreshBar();return}
 if(d.tts){var pp=d.tts.split(":"),ll=DATA.classes[st.cls].days[+pp[0]][+pp[1]],v=e.target.value.trim();if(v){ll.s=v;st.ttExtra=st.ttExtra||[];if(st.ttExtra.indexOf(v)<0)st.ttExtra.push(v)}if(st.ttCustom)delete st.ttCustom[d.tts];dirty();render(true);return}
 if(d.ttshift){DATA.classes[st.cls].shift=+e.target.value;dirty();render(true);return}
 if(d.bell){if(!/^[0-2]\d:[0-5]\d$/.test(e.target.value))return;var q=d.bell.split(":");DATA.bells[+q[0]][+q[1]]=e.target.value;dirty();refreshBar();return}
 if(d.bell2){if(!/^[0-2]\d:[0-5]\d$/.test(e.target.value))return;var q2=d.bell2.split(":");DATA.bells2[+q2[0]][+q2[1]]=e.target.value;dirty();refreshBar();return}
 if(d.edfile){var fl2=e.target.files[0];if(!fl2)return;var ui=document.getElementById(d.edfile),pv2=e.target.nextElementSibling;if(fl2.size>20*1048576){toast(t("pdfBig"));e.target.value="";return}if(!sb){pv2.textContent=t("upErr");return}
  pv2.textContent=t("uploading");var fpath="files/"+new Date().getFullYear()+"/"+uid("doc")+".pdf";
  sb.storage.from("media").upload(fpath,fl2,{contentType:"application/pdf",cacheControl:"31536000",upsert:false}).then(function(r){if(r.error)throw r.error;ui.value=sb.storage.from("media").getPublicUrl(fpath).data.publicUrl;pv2.textContent="✓ "+fl2.name}).catch(function(){pv2.textContent=t("upErr")});return}
 if(d.edimg){var fl=e.target.files[0];if(!fl)return;var pv=document.getElementById("edprev");pv.textContent=t("uploading");(d.edimg==="logo"?shrinkLogo(fl,400):shrink(fl,1400)).then(uploadImg).then(function(src){if(!src){pv.textContent=t("upErr");return}edImg=src;pv.innerHTML='<img class="prev" src="'+esc(src)+'" alt="">'});return}
 if(d.upload){var al=DATA.albums.filter(function(x){return x.id===d.upload})[0],files=[].slice.call(e.target.files||[]);
  toast(t("uploading"));Promise.all(files.map(function(fl){return shrink(fl,1600).then(uploadImg)})).then(function(srcs){var n=0;srcs.forEach(function(s){if(s){al.photos.push({src:s,cap:{}});n++}});if(n<srcs.length)toast(t("upErr"));if(n){delete al.sample;dirty();render(true)}})}});
document.addEventListener("submit",function(e){if(/^auth/.test(e.target.id)){e.preventDefault();e.stopPropagation();submitAuth(e.target)}else if(e.target.dataset&&e.target.dataset.roleform!==undefined){e.preventDefault();e.stopPropagation();saveRole(e.target)}else if(e.target.id==="ttAddForm"){e.preventDefault();e.stopPropagation();var gg=parseInt(document.getElementById("tta-g").value,10),lt=document.getElementById("tta-l").value,nm2=gg+lt;if(gg>=1&&gg<=11&&!DATA.classes[nm2]){DATA.classes[nm2]={shift:+document.getElementById("tta-s").value,days:[[],[],[],[],[]]};st.cls=nm2;dirty();render(true)}}else if(e.target.id==="fbForm"){e.preventDefault();e.stopPropagation();if(sb)submitFb(e.target)}else if(e.target.dataset&&e.target.dataset.fbreply){e.preventDefault();e.stopPropagation();var fid=e.target.dataset.fbreply;fbUpdate(fid,{reply:document.getElementById("rep-"+fid).value.trim()||null})}else if(e.target.id==="profForm"){e.preventDefault();e.stopPropagation();saveProfile(e.target)}},true);
document.addEventListener("input",function(e){if(e.target.id==="fb-text"){var c=document.getElementById("fb-cnt");if(c)c.textContent=e.target.value.length+" / 1500"}if(e.target.id==="uq"){st.uq=e.target.value;var l=document.getElementById("ulistP");if(l)l.innerHTML=userRows()}});
document.addEventListener("change",function(e){if(e.target.dataset&&e.target.dataset.setrole){var sel=e.target,uid=sel.dataset.setrole;sel.disabled=true;sb.rpc("set_role",{target:uid,role:sel.value||null}).then(function(r){sel.disabled=false;if(r.error){toast(/last/i.test(r.error.message)?t("lastAdmin"):t("e_generic"));st.admin=null;render(true);return}st.admin.staff[uid]=sel.value||undefined;if(!sel.value)delete st.admin.staff[uid];toast(t("adminChanged"))});return}
 if(e.target.dataset&&e.target.dataset.avatar){var f=e.target.files[0];if(f)uploadAvatar(f)}});
document.addEventListener("submit",function(e){e.preventDefault();if(e.target.id==="edform")saveEditor(e.target);if(e.target.id==="setform")saveSettings()});


/* ------------------------------------------------------------ profile page */
function uname(){var m=(st.user&&st.user.user_metadata)||{};return (st.profile&&st.profile.full_name)||m.full_name||(st.user&&st.user.email)||"?"}
function avatarURL(){return st.profile&&st.profile.avatar_url||""}
function hava(){var a=avatarURL();return '<span class="hava">'+(a?'<img src="'+esc(a)+'" alt="">':esc(uname().charAt(0).toUpperCase()))+'</span>'}
function pageProfile(){
 if(!sb)return banner("cabinet","pd_profile")+'<div class="container page"><div class="empty"><b>'+esc(t("noAuth"))+'</b></div></div>';
 if(!st.user)return banner("cabinet","pd_profile")+'<div class="container page"><div class="panel" style="max-width:520px;margin:0 auto;text-align:center">'+emblem("em72")+'<p style="margin:14px 0 18px;color:var(--muted)">'+esc(t("needLogin"))+'</p><div class="btns" style="justify-content:center"><button class="btn btn-primary btn-lg" data-auth="login">'+esc(t("signIn"))+'</button><button class="btn btn-outline btn-lg" data-auth="register">'+esc(t("signUp"))+'</button></div>'+bilimBtn()+'</div></div>';
 var tabs=[["me","p_me","user"],["security","p_sec","gear"]];
 if(!tabs.some(function(x){return x[0]===st.ptab}))st.ptab=tabs[0][0];
 var p=st.profile||{},u=st.user,m=u.user_metadata||{},role=p.role||m.role,a=avatarURL();
 var side='<aside class="pside"><div class="pava">'+(a?'<img src="'+esc(a)+'" alt="">':esc(uname().charAt(0).toUpperCase()))+'</div><b class="pname">'+esc(uname())+'</b><span class="pmail">'+esc(u.email)+'</span>'+
  '<div class="tags" style="justify-content:center;margin-top:8px">'+(role?'<span>'+esc(t("r_"+role))+'</span>':'')+(p.grade?'<span>'+esc(p.grade)+'</span>':'')+(st.roleName?'<span class="adm">'+esc(st.roleName)+'</span>':'')+'</div>'+
  '<small class="since">'+esc(t("memberSince"))+': '+esc(fmtDate(String(p.created_at||u.created_at||"").slice(0,10)))+'</small>'+
  '<nav class="ptabs">'+tabs.map(function(x){return '<button data-ptab="'+x[0]+'" aria-pressed="'+(st.ptab===x[0])+'">'+ic(x[2])+esc(t(x[1]))+'</button>'}).join("")+'</nav>'+
  (st.canEdit?'<a class="btn btn-primary" href="#admin" style="width:100%;margin-bottom:8px">'+ic("star")+esc(t("adminPanel"))+'</a>':'')+'<button class="btn btn-soft" data-auth="signout" style="width:100%">'+esc(t("signOut"))+'</button></aside>';
 var body={me:tabMe,security:tabSec,dash:tabDash,users:tabUsers,feedback:tabFb,roles:tabRoles}[st.ptab]();
 return banner("cabinet","pd_profile")+'<div class="container page"><div class="prof">'+side+'<section class="pmain">'+body+'</section></div></div>'}
function tabMe(){var p=st.profile||{},m=st.user.user_metadata||{},role=p.role||m.role||"student";
 return '<div class="panel"><h3>'+esc(t("p_me"))+'</h3><form class="form" id="profForm">'+
  '<div class="avrow"><div class="pava sm">'+(avatarURL()?'<img src="'+esc(avatarURL())+'" alt="">':esc(uname().charAt(0).toUpperCase()))+'</div><label class="addbtn" style="cursor:pointer">'+esc(t("changePhoto"))+'<input type="file" accept="image/*" class="sr" data-avatar="1"></label></div>'+
  '<label>'+esc(t("fullName"))+'<input id="pf-name" value="'+esc(p.full_name||m.full_name||"")+'" autocomplete="name"></label>'+
  '<div class="row2"><label>'+esc(t("roleF"))+'<select id="pf-role">'+["student","parent","teacher"].map(function(r){return '<option value="'+r+'"'+(r===role?" selected":"")+'>'+esc(t("r_"+r))+'</option>'}).join("")+'</select></label>'+
  '<label>'+esc(t("gradeF"))+'<input id="pf-grade" value="'+esc(p.grade||"")+'" maxlength="12"></label></div>'+
  '<div class="row2"><label>'+esc(t("emailF"))+'<input value="'+esc(st.user.email)+'" disabled></label><label>'+esc(t("phoneF"))+'<input id="pf-phone" type="tel" value="'+esc(p.phone||"")+'" autocomplete="tel"></label></div>'+
  msgBox()+'<div class="acts"><button class="btn btn-primary" type="submit">'+esc(t("ok"))+'</button></div></form></div>'}
function tabSec(){return '<div class="panel"><h3>'+esc(t("pwT"))+'</h3><form class="form" id="authNew" novalidate><div class="row2"><label>'+esc(t("newPassT"))+'<input id="an-pass" type="password" autocomplete="new-password"></label><label>'+esc(t("pass2F"))+'<input id="an-pass2" type="password" autocomplete="new-password"></label></div>'+msgBox()+
 '<div class="acts"><button class="btn btn-primary" type="submit">'+esc(t("ok"))+'</button></div></form></div>'+
 '<div class="panel"><h3>'+esc(t("signOutAll"))+'</h3><button class="btn btn-danger" data-auth="signoutall">'+esc(t("signOutAll"))+'</button></div>'}
function tabDash(){var A=st.admin;if(!A&&st.isAdmin){loadAdmin();return '<div class="panel"><p class="hint">'+esc(t("loading"))+'</p></div>'}
 A=A||{users:[],staff:{},roles:[]};
 var users=A.users,by={student:0,parent:0,teacher:0};users.forEach(function(u){if(by[u.role]!==undefined)by[u.role]++});
 var photos=DATA.albums.reduce(function(s,a){return s+a.photos.length},0),up=upcomingEvents().length;
 var who=st.meta&&st.meta.updated_by?(users.filter(function(u){return u.id===st.meta.updated_by})[0]||{}).full_name:"";
 var tl=[];if(can("feedback")){if(!st.fbAdmin)loadFbAdmin();tl.push(["msg",(st.fbAdmin||[]).filter(function(x){return x.status==="pending"}).length,"d_fb"])}
 if(st.isAdmin)tl.push(["users",users.length,"d_users"]);tl.push(["mega",DATA.posts.length,"d_posts"],["cal",up,"d_events"],["image",photos,"d_photos"]);
 var qa=[["post","mega","qa_post","news"],["event","cal","qa_event","events"],["album","image","qa_album","gallery"],["sched","cal","qa_sched","schedule"],["edit","edit","enterEdit",""],["settings","gear","settings","settings"]].filter(function(x){return !x[3]||can(x[3])});
 var out='<div class="tiles'+(tl.length>=5?' five':'')+'">'+tl.map(function(x){return '<div class="tile"><span class="ico">'+ic(x[0])+'</span><b class="tnum">'+x[1]+'</b><span>'+esc(t(x[2]))+'</span></div>'}).join("")+'</div>'+
  '<div class="panel"><h3>'+esc(t("qaT"))+'</h3><div class="qa">'+qa.map(function(x){return '<button class="lnk" data-qa="'+x[0]+'"><span class="ico">'+ic(x[1])+'</span><b>'+esc(t(x[2]))+'</b></button>'}).join("")+'</div>'+
  '<p class="hint" style="text-align:left;margin-top:14px">'+esc(t("lastPub"))+': '+esc(st.meta?fmtDate(String(st.meta.updated_at).slice(0,10))+(who?" · "+who:""):t("never"))+'</p></div>';
 if(!st.isAdmin)return out;
 var roleCount={};Object.keys(A.staff).forEach(function(uid){var r=A.staff[uid];roleCount[r]=(roleCount[r]||0)+1});
 return out+'<div class="twocol" style="gap:18px"><div class="panel"><h3>'+esc(t("recentReg"))+'</h3><div class="ulist" style="margin:0">'+(users.length?users.slice(0,5).map(function(u){return urow(u,false)}).join(""):'<p class="hint">'+esc(t("noUsers"))+'</p>')+'</div></div>'+
  '<div class="panel"><h3>'+esc(t("byRole"))+'</h3>'+["student","parent","teacher"].map(function(r){var n=by[r],pc=users.length?Math.round(n/users.length*100):0;return '<div class="rbar"><div><span>'+esc(t("r_"+r))+'</span><b class="tnum">'+n+'</b></div><i><s style="width:'+pc+'%"></s></i></div>'}).join("")+
  '<h3 style="margin-top:18px">'+esc(t("staffF"))+'</h3>'+A.roles.map(function(r){return '<div class="rbar"><div><span>'+esc(r.name)+'</span><b class="tnum">'+(roleCount[r.id]||0)+'</b></div></div>'}).join("")+'</div></div>'}
function roleOf(uid){var A=st.admin;var rid=A&&A.staff[uid];if(!rid)return null;return A.roles.filter(function(r){return r.id===rid})[0]||{id:rid,name:rid,perms:[]}}
function urow(u,withCtl){var rl=roleOf(u.id),me=u.id===st.user.id,A=st.admin;
 var ctl=withCtl?'<select class="rolesel" data-setrole="'+esc(u.id)+'"'+(me?' disabled title="'+esc(t("you"))+'"':'')+' aria-label="'+esc(t("p_roles"))+'"><option value="">'+esc(t("noRole"))+'</option>'+A.roles.map(function(r){return '<option value="'+esc(r.id)+'"'+(rl&&rl.id===r.id?" selected":"")+'>'+esc(r.name)+'</option>'}).join("")+'</select>':'';
 return '<div class="urow"><div class="person" style="min-width:0"><div class="ava" style="width:40px;height:40px;font-size:15px">'+(u.avatar_url?'<img src="'+esc(u.avatar_url)+'" alt="">':esc((u.full_name||u.email||"?").charAt(0).toUpperCase()))+'</div><div style="min-width:0"><b>'+esc(u.full_name||"—")+(me?' · '+esc(t("you")):'')+'</b><span>'+esc(u.email||"")+(u.grade?' · '+esc(u.grade):'')+'</span></div></div>'+
  '<div class="uside"><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">'+(u.role?'<span class="chip">'+esc(t("r_"+u.role))+'</span>':'')+(rl&&!withCtl?'<span class="chip sample">'+esc(rl.name)+'</span>':'')+'</div><small>'+esc(fmtDate(String(u.created_at).slice(0,10)))+'</small>'+ctl+'</div></div>'}
function tabUsers(){var A=st.admin;if(!A){loadAdmin();return '<div class="panel"><p class="hint">'+esc(t("loading"))+'</p></div>'}
 return '<div class="panel"><div class="toolbar" style="margin-bottom:14px"><h3 style="margin:0">'+esc(t("p_users"))+' <span class="chip">'+A.users.length+'</span></h3><label class="search">'+ic("search")+'<span class="sr">'+esc(t("usersSearch"))+'</span><input id="uq" type="search" placeholder="'+esc(t("usersSearch"))+'" value="'+esc(st.uq)+'"></label></div>'+
  '<div class="pills" style="margin-bottom:14px;align-self:flex-start;display:inline-flex">'+["all","staff","student","parent","teacher"].map(function(r){return '<button data-urole="'+r+'" aria-pressed="'+(st.urole===r)+'">'+esc(r==="all"?t("all"):r==="staff"?t("staffF"):t("r_"+r))+'</button>'}).join("")+'</div>'+
  '<div class="ulist" id="ulistP" style="margin:0">'+userRows()+'</div></div>'}
function userRows(){var A=st.admin,q=st.uq.trim().toLowerCase();var list=A.users.filter(function(u){
  if(st.urole==="staff"&&!A.staff[u.id])return false;if(st.urole!=="all"&&st.urole!=="staff"&&u.role!==st.urole)return false;
  return !q||((u.full_name||"")+" "+(u.email||"")).toLowerCase().indexOf(q)>=0});
 return list.length?list.map(function(u){return urow(u,true)}).join(""):'<div class="empty"><b>'+esc(t(A.users.length?"noResults":"noUsers"))+'</b></div>'}
var adminLoading=false;
function loadAdmin(){if(adminLoading||!sb||!st.isAdmin)return;adminLoading=true;
 Promise.all([sb.from("profiles").select("id,full_name,email,role,grade,avatar_url,created_at").order("created_at",{ascending:false}).limit(1000),sb.from("staff").select("user_id,role_id"),sb.from("roles").select("id,name,perms,is_system").order("created_at")]).then(function(r){adminLoading=false;
  var staff={};(r[1].data||[]).forEach(function(x){staff[x.user_id]=x.role_id});
  st.admin={users:(r[0].data||[]),staff:staff,roles:(r[2].data||[])};if(st.route.page==="profile"||st.route.page==="admin")render(true)})}
function tabRoles(){var A=st.admin;if(!A){loadAdmin();return '<div class="panel"><p class="hint">'+esc(t("loading"))+'</p></div>'}
 var cnt={};Object.keys(A.staff).forEach(function(k){cnt[A.staff[k]]=(cnt[A.staff[k]]||0)+1});
 function card(r,isNew){var sys=r.is_system;
  return '<form class="panel rolecard" data-roleform="'+esc(r.id||"")+'"><div class="toolbar" style="margin-bottom:12px">'+(sys?'<h3 style="margin:0">'+esc(r.name)+'</h3>':'<label style="flex:1;min-width:200px;font-size:12.5px;font-weight:700;color:#475569">'+esc(t("roleName"))+'<input class="rname" value="'+esc(r.name||"")+'" maxlength="60" required></label>')+
   (isNew?'':'<span class="chip">'+esc(f(t("roleUsers"),{n:cnt[r.id]||0}))+'</span>')+'</div>'+
   (sys?'<p class="hint" style="text-align:left">'+esc(t("systemRole"))+'</p>':'<div class="permgrid">'+PERMS.map(function(p){return '<label class="check"><input type="checkbox" value="'+p+'"'+(r.perms&&r.perms.indexOf(p)>=0?" checked":"")+'><span>'+esc(t("perm_"+p))+'</span></label>'}).join("")+'</div>'+
   '<p class="hint" style="text-align:left;margin:14px 0 8px">'+esc(t("projCurators"))+'</p><div class="permgrid">'+(DATA.projects||[]).map(function(pj){var v="p_"+pj.id;return '<label class="check"><input type="checkbox" value="'+v+'"'+(r.perms&&r.perms.indexOf(v)>=0?" checked":"")+'><span>'+esc(pick(pj.title))+'</span></label>'}).join("")+'</div>'+
   '<div class="acts" style="justify-content:flex-start;margin-top:12px"><button class="btn btn-primary" type="submit">'+esc(isNew?t("add"):t("ok"))+'</button>'+(isNew?'':'<button type="button" class="btn btn-danger" data-roledel="'+esc(r.id)+'">'+esc(st.sureId==="role"+r.id?t("sure"):t("del"))+'</button>'+(st.sureId==="role"+r.id?'<span class="hint" style="margin:0">'+esc(t("roleDelWarn"))+'</span>':''))+'</div>')+'</form>'}
 return '<p class="hint" style="text-align:left;margin:0">'+esc(t("roleHint"))+'</p>'+A.roles.map(function(r){return card(r,false)}).join("")+'<h3 style="font:800 17px var(--f-display);margin-top:6px">'+esc(t("newRole"))+'</h3>'+card({id:"",name:"",perms:["news","events","gallery"]},true)}
function saveRole(form){var id=form.dataset.roleform,name=form.querySelector(".rname").value.trim(),perms=[].slice.call(form.querySelectorAll('input[type=checkbox]:checked')).map(function(x){return x.value});
 if(!name){toast(t("needTitle"));return}busy(form,true);var row={id:id||("r"+Date.now().toString(36)),name:name,perms:perms};
 sb.from("roles").upsert(row).then(function(r){busy(form,false);if(r.error){toast(t("e_generic"));return}st.admin=null;toast(t("roleSaved"));render(true)})}

function loadProfile(){if(!sb||!st.user)return;sb.from("profiles").select("*").eq("id",st.user.id).maybeSingle().then(function(r){st.profile=r&&r.data||null;render(true)})}
function saveProfile(form){var g=function(x){return document.getElementById(x).value.trim()},row={full_name:g("pf-name"),role:document.getElementById("pf-role").value,grade:g("pf-grade"),phone:g("pf-phone")};
 if(!row.full_name){showMsg("needTitle",false);return}busy(form,true);
 sb.from("profiles").upsert(Object.assign({id:st.user.id,email:st.user.email},row)).then(function(r){
  if(r.error){busy(form,false);showMsg("e_generic",false,r.error.message);return}
  sb.auth.updateUser({data:{full_name:row.full_name,role:row.role}}).then(function(){busy(form,false);st.profile=Object.assign(st.profile||{},row);st.admin=null;toast(t("profSaved"));render(true)})})}
function uploadAvatar(file){shrink(file,400).then(function(src){return fetch(src)}).then(function(r){return r.blob()}).then(function(b){var path="avatars/"+st.user.id+"/avatar.jpg";
 return sb.storage.from("media").upload(path,b,{contentType:"image/jpeg",upsert:true,cacheControl:"60"}).then(function(r){if(r.error)throw r.error;var url=sb.storage.from("media").getPublicUrl(path).data.publicUrl+"?v="+Date.now();
  return sb.from("profiles").upsert({id:st.user.id,email:st.user.email,avatar_url:url}).then(function(r2){if(r2.error)throw r2.error;st.profile=Object.assign(st.profile||{},{avatar_url:url});st.admin=null;toast(t("profSaved"));render(true)})})}).catch(function(){toast(t("upErr"))})}
function quickAction(k){if(!st.canEdit)return;st.editing=true;var need={post:"news",event:"events",album:"gallery",sched:"schedule",settings:"settings"}[k];if(need&&!can(need))return;
 if(k==="post"){location.hash="news";setTimeout(function(){openEditor("posts",null,{date:todayISO(),cat:"events"})},60)}
 else if(k==="event"){location.hash="events";setTimeout(function(){openEditor("events",null,{date:todayISO(),time:"10:00"})},60)}
 else if(k==="album"){location.hash="gallery";setTimeout(function(){openEditor("albums",null,{year:DATA.settings.year})},60)}
 else if(k==="sched"){location.hash="schedule"}
 else if(k==="settings"){st.atab="settings";location.hash="admin";render(true)}
 else{location.hash="home"}}


/* ------------------------------------------------------------ admin page (#admin) */
function adminTabs(){var tb=[["dash","p_dash","star"],["content","a_content","book"]];if(can("feedback"))tb.push(["feedback","p_fb","msg"]);if(can("settings"))tb.push(["settings","settings","gear"]);if(st.isAdmin)tb.push(["users","p_users","users"],["roles","p_roles","user"]);return tb}
function pageAdmin(){
 if(!sb)return banner("adminPanel","pd_admin")+'<div class="container page"><div class="empty"><b>'+esc(t("noAuth"))+'</b></div></div>';
 if(!st.user)return pageProfile();
 if(!st.canEdit)return banner("adminPanel","pd_admin")+'<div class="container page"><div class="empty"><b>'+esc(t("noAccess"))+'</b><p style="margin-top:12px"><a class="btn btn-soft" href="#profile">'+esc(t("cabinet"))+'</a></p></div></div>';
 var tabs=adminTabs();if(!tabs.some(function(x){return x[0]===st.atab}))st.atab="dash";
 var side='<aside class="aside"><div class="ahead">'+emblem()+'<div><b>'+esc(t("adminPanel"))+'</b><span>'+esc(uname())+'</span></div></div>'+
  (st.roleName?'<span class="arole">'+esc(st.roleName)+'</span>':'')+
  '<nav class="anav">'+tabs.map(function(x){var badge=x[0]==="feedback"&&st.fbAdmin?st.fbAdmin.filter(function(f){return f.status==="pending"}).length:0;return '<button data-atab="'+x[0]+'" aria-pressed="'+(st.atab===x[0])+'">'+ic(x[2])+'<span>'+esc(t(x[1]))+'</span>'+(badge?'<i class="abadge">'+badge+'</i>':'')+'</button>'}).join("")+'</nav>'+
  '<div class="afoot"><a href="#home">'+ic("left")+esc(t("backSite"))+'</a><a href="#profile">'+ic("user")+esc(t("cabinet"))+'</a></div></aside>';
 var body={dash:tabDash,content:tabContent,feedback:tabFb,settings:tabSettings,users:tabUsers,roles:tabRoles}[st.atab]();
 var title=(tabs.filter(function(x){return x[0]===st.atab})[0]||tabs[0])[1];
 return '<div class="adminwrap"><div class="container"><div class="adm">'+side+'<section class="amain"><div class="atop"><div><span class="eyebrow">'+esc(t("adminPanel"))+'</span><h1>'+esc(t(title))+'</h1></div>'+(st.dirty?'<span class="chip sample">'+esc(f(t("unsaved"),{n:st.dirty}))+'</span>':'')+'</div>'+body+'</section></div></div></div>'}
function tabContent(){var photos=DATA.albums.reduce(function(s,a){return s+a.photos.length},0);
 var cards=[["news","mega","navNews","news",DATA.posts.length],["events","cal","navEvents","events",DATA.events.length],["gallery","image","navGallery","gallery",photos],
  ["schedule","cal","navSched","schedule",f(t("nClasses"),{n:Object.keys(DATA.classes).length})],["about","build","navAbout","about",DATA.staff.length+DATA.facilities.length],["about","users","navTeachers","about.teachers",DATA.staff.filter(function(x){return x.group==="teacher"}).length],
  ["life","star","navClubs","clubs",DATA.clubs.length],["life","trophy","navOlymp","olympiad",DATA.achievements.length],["life","cap","navAlumni","alumni",DATA.alumni.length],
  ["docs","link","navRes","docs",DATA.docs.length],["about","msg","faqT","contacts.faq",DATA.faq.length],["about","build","partnersT","home",DATA.partners.length],["projects","star","navProj","projects",DATA.projects.length]].filter(function(c){return can(c[0])});
 if(!can("projects"))DATA.projects.forEach(function(p){if(can("p_"+p.id))cards.push(["p_"+p.id,"star","","project."+p.id,(DATA["pi_"+p.id]||[]).length,pick(p.title)])});
 return '<p class="hint" style="text-align:left;margin:0 0 16px">'+esc(t("a_contentHint"))+'</p><div class="acards">'+cards.map(function(c){
  return '<div class="acard"><span class="ico">'+ic(c[1])+'</span><div style="min-width:0"><b>'+esc(c[5]||t(c[2]))+'</b><span>'+esc(typeof c[4]==="number"?f(t("nItems"),{n:c[4]}):c[4])+'</span></div><button class="btn btn-soft" data-goedit="'+c[3]+'">'+esc(t("openEdit"))+' →</button></div>'}).join("")+'</div>'}
function tabSettings(){return '<div class="panel">'+settingsForm(false)+'</div><p class="hint" style="text-align:left">'+esc(t("pubHint"))+'</p>'}
/* ------------------------------------------------------------ feedback */
function stars(n,cls){var s="";for(var i=1;i<=5;i++)s+='<span class="'+(i<=n?"on":"")+'">★</span>';return '<span class="stars '+(cls||"")+'" aria-label="'+n+'/5">'+s+'</span>'}
var fbLoading=false;
function loadFb(){if(!sb||fbLoading)return;fbLoading=true;sb.rpc("public_feedback").then(function(r){fbLoading=false;st.fb=r.error?[]:(r.data||[]);if(st.route.page==="feedback"||st.route.page==="home")render(true)})}
function fbCard(x){return '<article class="fbcard"><div class="fbhead"><div class="ava" style="width:40px;height:40px;font-size:15px">'+esc((x.name||t("fbAnon")).charAt(0).toUpperCase())+'</div><div style="min-width:0"><b>'+esc(x.name||t("fbAnon"))+'</b><span>'+esc(t("w_"+(x.author_role||"other")))+' · '+esc(fmtDate(String(x.created_at).slice(0,10)))+'</span></div>'+(x.rating?stars(x.rating):'')+'</div>'+
 '<span class="chip k-'+esc(x.kind)+'">'+esc(t("k_"+x.kind))+'</span><p>'+esc(x.body)+'</p>'+(x.reply?'<div class="fbreply"><b>'+esc(t("fbReply"))+'</b><p>'+esc(x.reply)+'</p></div>':'')+'</article>'}
function fbSummary(list){var rated=list.filter(function(x){return x.rating}),avg=rated.length?rated.reduce(function(s,x){return s+x.rating},0)/rated.length:0;
 return rated.length?'<div class="fbsum"><b class="tnum">'+avg.toFixed(1)+'</b>'+stars(Math.round(avg),"lg")+'<span>'+esc(t("fbAvg"))+' · '+esc(f(t("fbCount"),{n:list.length}))+'</span></div>':''}
function homeFeedback(){if(!sb)return"";if(st.fb===null){loadFb();return""}var l=st.fb.slice(0,3);
 return '<section class="section"><div class="container"><div class="sec-head"><div><span class="eyebrow">'+esc(t("navFeedback"))+'</span><h2>'+esc(t("fbListT"))+'</h2></div><a class="btn btn-primary" href="#feedback">'+ic("msg")+esc(t("fbHomeCta"))+'</a></div>'+
 (l.length?'<div class="cards">'+l.map(fbCard).join("")+'</div>':'<div class="empty"><b>'+esc(t("fbNone"))+'</b></div>')+'</div></section>'}
function fbForm(){st.fbA=2+Math.floor(Math.random()*7);st.fbB=1+Math.floor(Math.random()*8);st.fbStart=Date.now();var dis=sb?'':' disabled';
 return '<div class="panel fbform"><h3>'+esc(t("fbFormT"))+'</h3>'+(sb?'':'<p class="formmsg err">'+esc(t("noAuth"))+'</p>')+'<form class="form" id="fbForm" novalidate>'+
 '<div class="row2"><label>'+esc(t("fbWho"))+'<select id="fb-role"'+dis+'>'+["parent","student","graduate","other"].map(function(r){return '<option value="'+r+'">'+esc(t("w_"+r))+'</option>'}).join("")+'</select></label>'+
 '<label>'+esc(t("fbKind"))+'<select id="fb-kind"'+dis+'>'+["review","idea","thanks","complaint"].map(function(k){return '<option value="'+k+'">'+esc(t("k_"+k))+'</option>'}).join("")+'</select></label></div>'+
 '<label>'+esc(t("fbName"))+'<input id="fb-name" maxlength="60" autocomplete="name"'+dis+'></label>'+
 '<div class="rate" role="group" aria-label="'+esc(t("fbRating"))+'"><span>'+esc(t("fbRating"))+'</span><div>'+[1,2,3,4,5].map(function(i){return '<button type="button" data-rate="'+i+'" aria-label="'+i+'"'+dis+'>★</button>'}).join("")+'</div><input type="hidden" id="fb-rating" value="0"></div>'+
 '<label>'+esc(t("fbText"))+'<textarea id="fb-text" maxlength="1500" placeholder="'+esc(t("fbTextPh"))+'"'+dis+'></textarea><small class="cnt" id="fb-cnt">0 / 1500</small></label>'+
 '<label>'+esc(t("fbContact"))+'<input id="fb-contact" maxlength="100" placeholder="'+esc(t("fbContactPh"))+'"'+dis+'><small style="font-weight:400;color:var(--muted)">'+esc(t("fbContactNote"))+'</small></label>'+
 '<label class="hp" aria-hidden="true">Website<input id="fb-website" tabindex="-1" autocomplete="off"></label>'+
 
 '<div class="row2" style="align-items:end"><label>'+esc(f(t("fbCheck"),{a:st.fbA,b:st.fbB}))+'<input id="fb-check" inputmode="numeric" maxlength="3" autocomplete="off"'+dis+'></label><button class="btn btn-primary btn-lg" type="submit"'+dis+'>'+esc(t("fbSend"))+'</button></div>'+
 msgBox()+'</form><p class="hint" style="text-align:left;margin-top:12px">'+esc(t("fbModNote"))+'</p></div>'}
function pageFeedback(){if(sb&&st.fb===null)loadFb();var all=st.fb||[],list=all.filter(function(x){return st.fbKind==="all"||x.kind===st.fbKind});
 var left='<section style="min-width:0"><div class="toolbar" style="margin-bottom:18px"><h2 class="h2" style="margin:0">'+esc(t("fbListT"))+'</h2>'+fbSummary(all)+'</div>'+
  '<div class="pills" style="display:inline-flex;margin-bottom:18px">'+["all","review","idea","thanks","complaint"].map(function(k){return '<button data-fbkind="'+k+'" aria-pressed="'+(st.fbKind===k)+'">'+esc(k==="all"?t("all"):t("k_"+k))+'</button>'}).join("")+'</div>'+
  (st.fb===null&&sb?'<p class="hint">'+esc(t("loading"))+'</p>':list.length?'<div class="fblist">'+list.slice(0,st.fbShow).map(fbCard).join("")+'</div>'+(list.length>st.fbShow?'<div style="text-align:center;margin-top:16px"><button class="btn btn-soft" data-fbmore="1">'+esc(t("showMore"))+'</button></div>':''):'<div class="empty"><b>'+esc(t("fbNone"))+'</b></div>')+'</section>';
 return banner("navFeedback","pd_feedback")+'<div class="container page"><div class="fbgrid">'+left+'<aside style="min-width:0">'+fbForm()+'</aside></div></div>'}
function submitFb(form){var g=function(x){return document.getElementById(x).value.trim()},txt=g("fb-text");
 if(txt.length<15){showMsg("e_fbShort",false);return}
 if(parseInt(g("fb-check"),10)!==st.fbA+st.fbB){showMsg("e_fbCheck",false);return}
 var last=+store("gm-fb-last")||0;if(Date.now()-last<120000){showMsg("e_fbRate",false);return}
 var pb=document.getElementById("fb-public"),pub=pb?pb.checked:true;busy(form,true);
 sb.rpc("submit_feedback",{p_name:g("fb-name"),p_role:document.getElementById("fb-role").value,p_kind:document.getElementById("fb-kind").value,p_rating:+document.getElementById("fb-rating").value||0,
  p_body:txt,p_contact:g("fb-contact"),p_public:pub,p_hp:document.getElementById("fb-website").value,p_elapsed:Math.round((Date.now()-st.fbStart)/1000)}).then(function(r){busy(form,false);
  if(r.error){var m=r.error.message||"";showMsg(/rate|busy/i.test(m)?"e_fbRate":/fast/i.test(m)?"e_fbFast":/short/i.test(m)?"e_fbShort":"e_generic",false);return}
  store("gm-fb-last",String(Date.now()));form.querySelectorAll("input,select,textarea,button").forEach(function(x){x.disabled=true});showMsg("fbSentPrivate",true)})}
/* moderation (admin) */
var fbaLoading=false;
function loadFbAdmin(){if(!sb||!can("feedback")||fbaLoading)return;fbaLoading=true;sb.from("feedback").select("*").order("created_at",{ascending:false}).limit(500).then(function(r){fbaLoading=false;st.fbAdmin=r.error?[]:(r.data||[]);if(st.route.page==="profile"||st.route.page==="admin")render(true)})}
function tabFb(){if(!st.fbAdmin){loadFbAdmin();return '<div class="panel"><p class="hint">'+esc(t("loading"))+'</p></div>'}
 var S=["pending","read","rejected","spam"],cnt={};S.forEach(function(s){cnt[s]=st.fbAdmin.filter(function(x){return x.status===s}).length});
 var list=st.fbAdmin.filter(function(x){return x.status===st.fbStatus});
 return '<div class="panel"><h3>'+esc(t("p_fb"))+'</h3><div class="pills" style="display:inline-flex;margin-bottom:16px">'+S.map(function(s){return '<button data-fbstatus="'+s+'" aria-pressed="'+(st.fbStatus===s)+'">'+esc(t("s_"+s))+' <span class="cntb">'+cnt[s]+'</span></button>'}).join("")+'</div>'+
 (list.length?'<div class="fblist">'+list.map(function(x){
  var acts=
   (x.status!=="read"?'<button type="button" class="btn btn-soft" data-fbset="'+x.id+'" data-st="read">'+esc(t("markRead"))+'</button>':'')+
   (x.status!=="rejected"?'<button type="button" class="btn btn-soft" data-fbset="'+x.id+'" data-st="rejected">'+esc(t("reject"))+'</button>':'')+
   '<button type="button" class="btn btn-danger" data-fbdel="'+x.id+'">'+esc(st.sureId==="fb"+x.id?t("sure"):t("del"))+'</button>';
  return '<article class="fbcard mod"><div class="fbhead"><div style="min-width:0"><b>'+esc(x.name||t("fbAnon"))+'</b><span>'+esc(t("w_"+(x.author_role||"other")))+' · '+esc(fmtDate(String(x.created_at).slice(0,10)))+(x.contact?' · '+esc(x.contact):'')+'</span></div>'+(x.rating?stars(x.rating):'')+'</div>'+
   '<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="chip k-'+esc(x.kind)+'">'+esc(t("k_"+x.kind))+'</span>'+''+'</div><p>'+esc(x.body)+'</p>'+
   '<div class="acts" style="display:flex;gap:8px;flex-wrap:wrap">'+acts+'</div></article>'}).join("")+'</div>':'<div class="empty"><b>'+esc(t("done2"))+'</b></div>')+'</div>'}
function fbUpdate(id,patch){sb.from("feedback").update(patch).eq("id",id).then(function(r){if(r.error){toast(t("e_generic"));return}
 st.fbAdmin.forEach(function(x){if(String(x.id)===String(id))Object.assign(x,patch)});st.fb=null;toast(t("adminChanged"));render(true)})}
/* ------------------------------------------------------------ storage & publish (Supabase) */
function uploadImg(src){if(!src)return Promise.resolve(null);if(!sb)return Promise.resolve(null);
 return fetch(src).then(function(r){return r.blob()}).then(function(b){var mt=/^data:(image\/(png|webp|jpeg))/.exec(src),ct=mt?mt[1]:"image/jpeg",ext={"image/png":"png","image/webp":"webp"}[ct]||"jpg";var path=new Date().getFullYear()+"/"+uid("img")+"."+ext;
  return sb.storage.from("media").upload(path,b,{contentType:ct,cacheControl:"31536000",upsert:false}).then(function(r){if(r.error)throw r.error;return sb.storage.from("media").getPublicUrl(path).data.publicUrl})}).catch(function(){return null})}
function publish(){if(!sb||!st.user||st.saving)return;
 var now=new Date().toISOString(),rows=Object.keys(SECS).filter(function(s){return JSON.stringify(secData(s))!==st.base[s]&&can(SECPERM[s])}).map(function(s){return{id:s,data:secData(s),updated_at:now,updated_by:st.user.id}});
 if(!rows.length){toast(t("nothingToSave"));st.dirty=0;refreshBar();return}
 st.saving=true;refreshBar();
 sb.from("site_content").upsert(rows).then(function(r){st.saving=false;
  if(r.error){toast(/row-level|permission|42501/i.test(r.error.message+r.error.code)?t("readonly"):t("err"));refreshBar();return}
  rows.forEach(function(x){st.base[x.id]=JSON.stringify(x.data)});st.meta={updated_at:now,updated_by:st.user.id};st.dirty=0;toast(t("saved"));refreshBar()})}

/* ------------------------------------------------------------ boot */
function normalize(){if(!DATA.settings.motto)DATA.settings.motto={kk:"Білімді ұрпақ — ауылдың ертеңі",ru:"Образованное поколение — будущее села",en:"An educated generation is the village's future"};
 ["posts","events","clubs","facilities","docs","faq","albums","partners","achievements","alumni","staff"].forEach(function(k){if(!Array.isArray(DATA[k]))DATA[k]=[]});if(!DATA.classes||typeof DATA.classes!=="object")DATA.classes={};if(!Array.isArray(DATA.projects))DATA.projects=[];DATA.projects.forEach(function(p){regProj(p.id)});if(!Array.isArray(DATA.bells2))DATA.bells2=[["15:00","15:45"],["15:50","16:35"],["16:45","17:30"],["17:35","18:20"],["18:25","19:10"],["19:15","20:00"]]}
normalize();snapshot();
if(/access_token=|error_description=|type=recovery/.test(location.hash))history.replaceState(null,"",location.pathname+location.search+"#home");
parseHash();
setInterval(function(){var n=document.getElementById("now");if(n)n.innerHTML=nowHTML()},20000);
function setUser(u){var was=st.user&&st.user.id;st.user=u||null;
 if(!u){st.canEdit=false;st.isAdmin=false;st.perms=[];st.roleName="";st.editing=false;st.profile=null;st.admin=null;st.fbAdmin=null;render(true);return}
 if(was===u.id)return;
 sb.from("staff").select("role_id,roles(name,perms)").eq("user_id",u.id).maybeSingle().then(function(r){var ro=r&&r.data&&r.data.roles;
  st.perms=(ro&&ro.perms)||[];st.roleName=(ro&&ro.name)||"";st.canEdit=st.perms.length>0;st.isAdmin=can("users");
  render(true);loadProfile()})}
if(sb){
 sb.from("site_content").select("id,data,updated_at,updated_by").then(function(r){if(!r||r.error||!r.data||!r.data.length||st.dirty)return;
  r.data.forEach(function(row){if(/^pi_/.test(row.id)&&!SECS[row.id])regProj(row.id.slice(3));if(!SECS[row.id]||!row.data)return;SECS[row.id].forEach(function(k){if(row.data[k]!==undefined)DATA[k]=row.data[k]});if(!st.meta||row.updated_at>st.meta.updated_at)st.meta={updated_at:row.updated_at,updated_by:row.updated_by}});
  normalize();snapshot();render(true)});
 sb.auth.onAuthStateChange(function(ev,session){if(ev==="PASSWORD_RECOVERY"){setUser(session&&session.user);setTimeout(openNewPass,50);return}setUser(session&&session.user)});
}
})();
