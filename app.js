const main = document.querySelector("#main");
const header = document.querySelector("#site-header");
const nav = document.querySelector("#primary-nav");
const navToggle = document.querySelector("#nav-toggle");
const STATIC_PAGES = document.documentElement.dataset.staticPages === "true";
let telegramInitData = "";
let telegramAuthenticated = false;
let miniAppSession = { state: "anonymous", user: null, entitlement: null, termsAccepted: false };
let miniAppLastResult = null;

navToggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href^='#/']");
  if (!link || link.target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  nav.classList.remove("open");
  navToggle?.setAttribute("aria-expanded", "false");
});
window.addEventListener("hashchange", render);

function routeLocation() {
  const raw = location.hash.startsWith("#/") ? location.hash.slice(1) : "/";
  const [path, query = ""] = raw.split("?");
  return { path: path || "/", query };
}

function assetUrl(path) {
  return String(path || "").replace(/^\//, "./");
}

const pages = {
  "/": homePage,
  "/services": servicesPage,
  "/methods": methodsPage,
  "/portfolio": portfolioPage,
  "/research": researchPage,
  "/calculator": calculatorPage,
  "/historical-ctr": historicalPage,
  "/quiz": () => quizPage(false),
  "/miniapp": miniAppPage,
  "/telegram": telegramPage,
  "/admin": adminPage,
  "/privacy": privacyPage,
  "/terms": termsPage,
  "/support": supportPage
};

function render() {
  const { path } = routeLocation();
  const page = STATIC_PAGES && path === "/admin" ? publicAdminPage : (pages[path] || notFoundPage);
  document.title = titleFor(path);
  const miniappMode = path === "/miniapp";
  header.hidden = miniappMode;
  document.querySelector(".site-footer").hidden = miniappMode;
  document.body.classList.toggle("miniapp-mode", miniappMode);
  main.innerHTML = page();
  main.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
  nav.querySelectorAll("a[href^='#/']").forEach(link => link.classList.toggle("active", link.getAttribute("href").split("?")[0] === `#${path}`));
  if (path === "/quiz") initQuiz(false);
  if (path === "/miniapp") initMiniApp();
  if (path === "/historical-ctr") loadHistorical();
  if (path === "/portfolio") loadPortfolioGallery();
  if (path === "/calculator") initCalculator();
  if (path === "/telegram") initTelegramPage();
  if (path === "/admin" && !STATIC_PAGES) initAdmin();
  initReveal();
}

function titleFor(path) {
  return ({ "/": "WISE / FRAME — визуальные системы для товаров и брендов", "/services": "Форматы работы · WISE / FRAME", "/methods": "Библиотека методов · WISE / FRAME", "/portfolio": "Архив работ · WISE / FRAME", "/research": "Исследование товара · WISE / FRAME", "/calculator": "Калькулятор CTR и конверсии · WISE / FRAME", "/historical-ctr": "Архив замеров · WISE / FRAME", "/quiz": "Подобрать визуальный маршрут · WISE / FRAME", "/miniapp": "WISE / FRAME · Mini App", "/telegram": "Telegram-воронка · WISE / FRAME", "/admin": "Панель заявок · WISE / FRAME", "/privacy": "Конфиденциальность · WISE / FRAME", "/terms": "Условия · WISE / FRAME", "/support": "Контакты · WISE / FRAME" })[path] || "Страница не найдена · WISE / FRAME";
}

function homePage() {
  return `<div class="page">
    <section class="hero"><div class="wrap hero-grid">
      <div class="hero-copy"><p class="eyebrow">Главный кадр → CTR → цена заказа</p><h1>Меньше<br><span class="outline">рекламы</span><br><em>на заказ.</em></h1><p class="hero-lead">Усиливаем главный кадр и всю последовательность карточки. Если CTR и конверсия растут при тех же условиях, для прежнего числа заказов требуется меньше платных показов. Сразу проверьте это на своих цифрах — без обещаний гарантированного роста.</p><div class="hero-quick-proof"><div><small>Демо · расход на те же 150 заказов</small><strong>225 000 ₽ → 84 375 ₽</strong></div><span>Модельная разница <b>140 625 ₽</b></span></div><div class="hero-actions"><a class="button accent hero-primary" href="#/calculator">Показать экономию на моих цифрах</a><a class="button secondary" href="#/portfolio">Смотреть 132 работы</a><a class="button secondary" href="#/telegram">Бот + Mini App</a><a class="hero-text-link" href="#/quiz?goal=improve_card">Подобрать визуальный маршрут →</a></div></div>
      <aside class="hero-lab hero-proof-lab" aria-label="Демонстрация модельной экономии рекламного бюджета"><div class="hero-photo-grid" aria-hidden="true"><img src="./assets/portfolio-preview/port-0005.webp" alt=""><img src="./assets/portfolio-preview/port-0008.webp" alt=""></div><section class="hero-model-card"><p class="eyebrow">Демонстрация модели · все цифры меняются</p><h2>Те же 150 заказов — меньше платных показов</h2><div class="hero-model-flow"><div><small>Реклама сейчас</small><b>225 000 ₽</b></div><i>→</i><div><small>При целевых CTR / CVR</small><b>84 375 ₽</b></div></div><div class="hero-model-saving"><small>Модельная разница</small><strong>140 625 ₽</strong></div><p>Пример: 500 000 показов, CPM 450 ₽, CTR 1% → 2%, конверсия в заказ 3% → 4%. Цена, рейтинг, остатки и качество трафика считаются неизменными.</p><a class="button accent hero-model-button" href="#/calculator">Пересчитать на своих данных</a></section></aside>
    </div></section>
    ${ticker()}
    <section class="section reveal"><div class="wrap"><span class="section-index">01 / Форматы + реальные работы</span><div class="section-title"><div><p class="eyebrow">Каждое обещание подкреплено примером</p><h2>Выберите задачу прямо по работе</h2></div><p>В подложках — материалы из вашего архива. Нажимается вся карточка: она открывает подходящую ветку опроса с уже выбранной задачей.</p></div>${serviceCards()}</div></section>
    <section class="section dark reveal"><div class="wrap"><div class="deliverables"><div class="deliverables-visual" aria-hidden="true"><div class="photo-rail"><div class="active"><span>01</span><b>Обложка</b></div><div><span>02</span><b>Сценарий</b></div><div><span>03</span><b>Деталь</b></div><div><span>04</span><b>Доверие</b></div><div><span>05</span><b>Выбор</b></div></div></div><div class="deliverables-copy"><p class="eyebrow">Фото как система</p><h2>Не пять случайных картинок. Пять ролей в одной карточке.</h2><ol class="deliverable-list"><li><span>01</span><div><b>Остановить взгляд</b><small>Главный кадр и отличимость в выдаче.</small></div></li><li><span>02</span><div><b>Объяснить товар</b><small>Посадка, масштаб, сценарий использования.</small></div></li><li><span>03</span><div><b>Снять сомнения</b><small>Материал, детали, фактура и важные ограничения.</small></div></li><li><span>04</span><div><b>Подвести к выбору</b><small>Последовательная визуальная аргументация.</small></div></li></ol><a class="button accent" href="#/portfolio">Открыть визуальный архив</a></div></div></div></section>
    ${proofSection()}
    <section class="section method reveal"><div class="wrap"><span class="section-index">03 / Процесс</span><div class="section-title"><div><p class="eyebrow">От контекста к кадру</p><h2>Сначала смысл. Затем производство.</h2></div><p>Для маркетплейса опираемся на выдачу и тест, для бренда или обложки — на аудиторию, сюжет и место контакта. Красивый кадр получает конкретную работу.</p></div>${methodFlow()}</div></section>
    <section class="section reveal"><div class="wrap contact-card"><div><p class="eyebrow">Следующий шаг · 3 минуты</p><h2>Покажите товар. Получите маршрут.</h2><p>Без оплаты и автоматических рассылок. В публичной версии результат появляется сразу в браузере, а данные формы никуда не отправляются.</p></div><a class="button accent" href="#/quiz">Начать диагностику</a></div></section>
  </div>`;
}

function ticker() {
  const items = ["Главный кадр", "Фото‑воронка", "AI‑фотосессия", "Обложки", "Бренд‑серии", "Рекламный визуал", "Идеи и концепции"];
  const content = [...items, ...items].map(item => `<span>${item}</span>`).join("");
  return `<div class="ticker" aria-hidden="true"><div class="ticker-track">${content}</div></div>`;
}

function serviceCards() {
  const cards = [
    { number: "F–01", title: "Маркетплейс‑система", copy: "Главный кадр, аргументы карточки и план проверки — чтобы связать визуал с CTR, конверсией и рекламной воронкой.", image: "port-0113.webp", proof: "Пример · home / карточка", goal: "improve_card" },
    { number: "F–02", title: "AI‑фотосессия", copy: "Новые сцены для товара, одежды или предмета без сложной студийной логистики, с контролем фактуры, цвета и масштаба.", image: "port-0005.webp", proof: "Пример · fashion / образ", goal: "new_launch" },
    { number: "F–03", title: "Обложка и key visual", copy: "Фотоальбом, книга, подкаст, релиз или рекламный запуск — один сильный образ и адаптации под носители.", image: "port-0129.webp", proof: "Пример · предмет / key visual", goal: "cover_concept" },
    { number: "F–04", title: "Бренд‑серия", copy: "Последовательность кадров для сайта, каталога, соцсетей и кампании с единым визуальным языком.", image: "port-0014.webp", proof: "Пример · fashion / серия", goal: "brand_series" },
    { number: "F–05", title: "Идея и арт‑направление", copy: "Референсы, сюжет и несколько направлений до производства — когда образ ещё нужно найти и проверить.", image: "port-0133.webp", proof: "Пример · food / концепт", goal: "content_campaign" },
    { number: "F–06", title: "Контент‑ритм", copy: "Серии, тесты и сезонные поводы, чтобы визуал развивался как система и накапливал доказательства.", image: "port-0132.webp", proof: "Пример · beauty / запуск", goal: "monthly_content" }
  ];
  return `<div class="card-grid">${cards.map(card => `<a class="card service-card" href="#/quiz?goal=${card.goal}" aria-label="${card.title}: открыть подходящую ветку опроса"><img class="card-photo" src="./assets/portfolio-preview/${card.image}" alt="" loading="lazy" decoding="async"><span class="card-shade" aria-hidden="true"></span><span class="card-number">${card.number}</span><div class="card-content"><span class="card-proof">${card.proof}</span><h3>${card.title}</h3><p>${card.copy}</p></div><span class="card-action">Подобрать формат</span></a>`).join("")}</div>`;
}

function audienceLanes() {
  const lanes = [
    ["Marketplace", "WB / Ozon", "Главный кадр, карточка, инфографика, тестовые серии"],
    ["D2C", "Бренды и магазины", "Каталог, лендинг, рекламная кампания, визуальная связность"],
    ["Editorial", "Фотоальбомы и книги", "Обложка, разворотная идея, серия образов, промо"],
    ["Audio", "Музыка и подкасты", "Key visual релиза, обложки выпусков, анонсы"],
    ["Social", "Эксперты и авторы", "Контент‑серии, лид‑магниты, запуски и визуальные рубрики"],
    ["Local", "Рестораны и сервисы", "Меню, афиши, сезонные предложения, визуал доверия"],
    ["Space", "Недвижимость и интерьер", "Концепты, презентация объекта, обложки подборок"],
    ["Creator", "Стримеры и вебкам‑креаторы 18+", "Образ эфира, превью, баннеры и безопасные промо‑серии с согласием модели"],
    ["Idea", "Новый проект", "Поиск образа, moodboard, тест нескольких арт‑направлений"]
  ];
  return `<div class="lane-grid">${lanes.map(item => `<article><small>${item[0]}</small><h3>${item[1]}</h3><p>${item[2]}</p></article>`).join("")}</div>`;
}

function unusualPlacements() {
  const placements = [
    ["Live", "Стрим и вебкам 18+", "Превью эфира, оформление комнаты, платные анонсы и серии для личного бренда. Только совершеннолетние участники и подтверждённое согласие на образ."],
    ["Touch", "Упаковка и вложения", "QR‑карточки, открытки, стикеры, коробка и инструкция становятся продолжением визуальной кампании."],
    ["Space", "Экран в точке продаж", "Шоурум, салон, бар, фестиваль или экран ожидания: кадр проектируется под несколько секунд внимания."],
    ["Collab", "Партнёрский носитель", "Совместная обложка, меню, чек, письмо, подборка или creator‑интеграция связывает две аудитории."],
    ["Story", "Сериал вместо баннера", "Короткие эпизоды, персонаж или визуальная загадка дают повод вернуться и открыть продолжение."],
    ["Object", "Сам товар как медиа", "Лимитированный принт, бирка, паттерн, комплект или коллекционный элемент превращаются в носитель идеи."]
  ];
  const steps = [
    ["01", "Найти точку внимания", "Где аудитория уже смотрит, ждёт, открывает или сканирует."],
    ["02", "Проверить правила", "Возраст 18+, согласия, права на лицо, правила площадки и ограничения категории."],
    ["03", "Собрать прототип", "Один носитель, один смысл и один понятный следующий шаг."],
    ["04", "Поставить тест", "Период, охват, переход, заявка, досмотр или заказ — метрика выбирается до запуска."],
    ["05", "Расширить связку", "Рабочая идея адаптируется в серию, канал, Mini App и повторный контакт."]
  ];
  return `<section class="section unusual-section reveal" id="unusual"><div class="wrap"><span class="section-index">Нестандартные носители</span><div class="section-title"><div><p class="eyebrow">Не только рекламный кабинет</p><h2>Продавать можно там, где уже есть внимание</h2></div><p>Ищем не «шок ради шока», а непривычное место контакта, которое подходит аудитории и даёт измеримый следующий шаг.</p></div><div class="unusual-grid">${placements.map(item => `<article><small>${item[0]}</small><h3>${item[1]}</h3><p>${item[2]}</p></article>`).join("")}</div><div class="sales-path"><p class="eyebrow">Как продать такую идею клиенту</p>${steps.map(item => `<article><span>${item[0]}</span><div><b>${item[1]}</b><p>${item[2]}</p></div></article>`).join("")}</div><div class="compliance-note"><strong>Граница для adult / webcam‑проектов</strong><p>WISE / FRAME работает только с законными проектами, совершеннолетними участниками и явным согласием на съёмку и использование образа. Не берём материалы с признаками принуждения, скрытой съёмки, несовершеннолетних или нарушения правил площадки. Публичное портфолио — только по отдельному разрешению.</p></div></div></section>`;
}

function proofSection() {
  const proofs = [
    ["527", "Пост о сравнительном Marpla‑тесте", "2025-11-01", "https://t.me/WB_AI_CROCHET/242"],
    ["400", "Публичный разбор клиентского диалога", "2025-10-31", "https://t.me/WB_AI_CROCHET/241"],
    ["345", "Аудио о жизнеспособном визуале", "2025-10-30", "https://t.me/WB_AI_CROCHET/240"],
    ["319", "Пост о визуальной части доверия", "2025-10-30", "https://t.me/WB_AI_CROCHET/238"],
    ["235", "Схема: конкуренты → варианты → тест → серия", "2026-03-10", "https://t.me/WB_AI_CROCHET/251"]
  ];
  return `<section class="section evidence-section reveal"><div class="wrap"><span class="section-index">02 / Публичный след</span><div class="section-title"><div><p class="eyebrow">Архив Telegram · WB_AI_CROCHET</p><h2>Метод существовал до этого сайта</h2></div><p>В старом Telegram‑архиве уже были сравнительные тесты, визуальная воронка, клиентские вопросы и переход от одного кадра к серии. Здесь это собрано в понятный продукт.</p></div><div class="proof-grid">${proofs.map(item => `<a href="${item[3]}" target="_blank" rel="noopener noreferrer"><b>${item[0]}</b><span>${item[1]}</span><small>${item[2]} · просмотры</small></a>`).join("")}</div><p class="evidence-note">Просмотры зафиксированы в Telegram Web 07.08.2026. Они подтверждают публикацию и внимание к материалу, но сами по себе не доказывают рост продаж. Коммерческий эффект оценивается только по данным конкретного проекта.</p></div></section>`;
}

function methodFlow() {
  return `<div class="method-flow">${[
    ["01 · Listen", "Задача", "Что человек должен заметить, понять или почувствовать"],
    ["02 · Map", "Контекст", "Выдача, аудитория, бренд, носитель и визуальные ожидания"],
    ["03 · Frame", "Гипотезы", "Несколько разных причин выбрать кадр, а не смена фона"],
    ["04 · Flow", "Система", "Обложка или последовательность: внимание → смысл → доверие"],
    ["05 · Check", "Проверка", "Тест, обратная связь или критерий приёмки под задачу"]
  ].map(item => `<article><span>${item[0]}</span><h3>${item[1]}</h3><p>${item[2]}</p></article>`).join("")}</div>`;
}

function servicesPage() {
  return `<div class="page">
    <section class="page-head" data-code="06"><div class="wrap"><p class="eyebrow">Форматы работы · WISE / FRAME</p><h1>Визуал под задачу, а не под шаблон</h1><p>Можно начать с одного тестового направления, обложки или аудита. Если нужна система — собрать серию для карточки, бренда, сайта или контент‑кампании.</p></div></section>
    <section class="section reveal"><div class="wrap"><span class="section-index">Выберите точку входа</span>${serviceCards()}</div></section>
    <section class="section dark reveal"><div class="wrap"><div class="section-title"><div><p class="eyebrow">Не только маркетплейсы</p><h2>Кому ещё нужен сильный кадр</h2></div><p>Один и тот же навык — исследовать контекст и проектировать выбор — работает в коммерческих, редакционных и авторских задачах.</p></div>${audienceLanes()}</div></section>
    ${unusualPlacements()}
    <section class="section method reveal"><div class="wrap"><div class="section-title"><div><p class="eyebrow">Что входит в работу</p><h2>Решение начинается не с промпта</h2></div><p>Фиксируем исходники, ограничения, роль каждого кадра, критерий приёмки и разрешённые способы использования.</p></div>${methodFlow()}</div></section>
    ${proofSection()}
    <section class="section reveal"><div class="wrap contact-card"><div><p class="eyebrow">Не знаете формат?</p><h2>Ответьте на вопросы — получите маршрут.</h2><p>Mini App ведёт по ветке задачи и передаёт Олегу уже собранный контекст.</p></div><a class="button accent" href="#/quiz">Подобрать формат</a></div></section>
  </div>`;
}

function methodsPage() {
  const researchMethods = [
    ["01", "Поиск гипотез", "20–50 идей из категорий, спроса, трендов и ограничений — без выбора «одного победителя» по ролику.", "Выгрузка / таблица"],
    ["02", "Фильтр ниши", "Спрос, глубина рынка, доля товаров с продажами, продавцы, цена и качество данных.", "Выгрузка MPStats"],
    ["03", "Монополизация", "Концентрация отдельно по продавцам, брендам и SKU. Один уровень не подменяет другой.", "Продажи по сущностям"],
    ["04", "Тренд и сезон", "12–24 месяца спроса, цены, конкуренции и остатков; проверка, успеет ли закупка к пику.", "Помесячные данные"],
    ["05", "Юнит‑экономика", "Цена, себестоимость, комиссия, логистика, возвраты, налоги и допустимая реклама.", "Фактические расходы"],
    ["06", "Боли в отзывах", "Повторяемые причины недовольства превращаются в ТЗ на продукт, упаковку и контент.", "Отзывы конкурентов"],
    ["07", "Антинеликвид", "Первая поставка ограничивается сроком, MOQ, скоростью продаж и бюджетом допустимой потери.", "Сроки и бюджет риска"],
    ["08", "Скоринг и стоп‑факторы", "Критический минус не усредняется красивым баллом. В финал проходят несколько кандидатов.", "Результаты проверок"],
    ["09", "Финальный shortlist", "5–10 кандидатов, явные отказы, уверенность и следующий тест для каждого решения.", "Свежий паспорт среза"]
  ];
  const operatingMethods = [
    ["Visual", "Фото‑воронка", "Топы и конкуренты → визуальные паттерны → разные гипотезы → тест → серия карточки.", "Работает"],
    ["Math", "CTR × конверсия", "Прозрачная модель влияния на клики, заказы и цену достижения того же результата.", "Встроено в сайт"],
    ["Ads", "Контур биддера", "Импорт отчёта или API‑связка: ставки, бюджеты, CPC/CPM, DRR, места и изменения по времени.", "Нужны доступ и документация"],
    ["CRM", "Диалог до малого шага", "Наблюдение → полезный вопрос → артикул/исходники → тест → согласованный объём.", "В приватной панели"],
    ["Channel", "Контент‑петля", "Практика → A/B‑опрос → разбор → доказательство → мягкое приглашение в диагностику.", "Календарь подготовлен"],
    ["Mini App", "Диагностическая воронка", "Ветка по задаче собирает контекст и передаёт менеджеру готовую заявку.", "Локально проверяется"]
  ];
  return `<div class="page"><section class="page-head" data-code="M"><div class="wrap"><p class="eyebrow">Методы из практики и обучающей системы</p><h1>Не набор обещаний. Карта решений.</h1><p>Восемь учебных видео по поиску товара уже были превращены в систему из девяти проверяемых навыков. Полных транскриптов не было, поэтому на сайт перенесены воспроизводимые принципы, а не «секретные пороги» из роликов.</p></div></section><section class="section reveal"><div class="wrap"><div class="section-title"><div><p class="eyebrow">MPStats · от идеи до решения</p><h2>Девять ворот перед закупкой</h2></div><p>Каждый вывод помечается как факт, расчёт, допущение или гипотеза. Старое обучение даёт логику, решение требует свежей выгрузки и фактической экономики.</p></div><div class="method-library">${researchMethods.map(item => `<article><span>${item[0]}</span><h3>${item[1]}</h3><p>${item[2]}</p><small>${item[3]}</small></article>`).join("")}</div></div></section><section class="section dark reveal"><div class="wrap"><div class="section-title"><div><p class="eyebrow">Менеджерский контур</p><h2>После выбора товара начинается управление</h2></div><p>Менеджер не смешивает исследование, визуал и рекламу. Он проверяет их по очереди и понимает, какой инструмент действительно может изменить решение.</p></div><div class="operation-grid">${operatingMethods.map(item => `<article><small>${item[0]}</small><h3>${item[1]}</h3><p>${item[2]}</p><b>${item[3]}</b></article>`).join("")}</div></div></section><section class="section reveal"><div class="wrap"><div class="manager-path"><div><p class="eyebrow">Как работает обученный менеджер</p><h2>Сначала находит узкое место. Потом подключает инструмент.</h2></div><ol><li><span>01</span><p><b>Товар ещё не выбран</b> — запускает исследование ниши, экономики и риска.</p></li><li><span>02</span><p><b>Товар есть, кликов мало</b> — проверяет выдачу, CTR и гипотезы главного кадра.</p></li><li><span>03</span><p><b>Клики есть, заказов мало</b> — разбирает цену, доверие, карточку и конверсию.</p></li><li><span>04</span><p><b>Реклама уже идёт</b> — сопоставляет ставки и бюджет с качеством воронки; биддер подключается только к измеримой стратегии.</p></li><li><span>05</span><p><b>Найдена рабочая связка</b> — масштабирует серию, контент и накопление доказательств.</p></li></ol></div><div class="notice"><strong>Что значит «подключить биддер»</strong><p>В текущей локальной версии нет доступа к рекламному кабинету и автоматической смены ставок. Возможна безопасная интеграция через документированный API или регулярный импорт отчётов. Любые автоматические изменения бюджета требуют лимитов, журнала действий и подтверждения владельца.</p></div></div></section><section class="section reveal"><div class="wrap contact-card"><div><p class="eyebrow">Начать с правильной ветки</p><h2>Один опрос — разные маршруты.</h2></div><a class="button accent" href="#/quiz">Выбрать задачу</a></div></section></div>`;
}

function portfolioPage() {
  return `<div class="page"><section class="page-head" data-code="132"><div class="wrap"><p class="eyebrow">Визуальный архив · публичная витрина</p><h1>Не только CTR. Вся ширина работ.</h1><p>Fashion, предметные товары, аксессуары, beauty, food и товары для дома — по одному найденному финалу на каждый проект реестра.</p></div></section><section class="section compact reveal"><div class="wrap"><div class="archive-stats" id="portfolio-stats"><div><b>139</b><span>позиций в реестре</span></div><div><b>132</b><span>найденных финала</span></div><div><b>8</b><span>категорий</span></div><div><b>01</b><span>визуальная система</span></div></div><div class="notice"><strong>Что доказывает эта витрина</strong><p>Объём и разнообразие выполненных визуальных проектов. Продажи, пики спроса и влияние конкретного кадра не приписываются работе без свежих данных. Витрина включает переданные владельцем проекта материалы; при споре о правах отдельная работа должна быть снята до выяснения.</p></div></div></section><section class="portfolio-collection reveal"><div class="wrap"><div class="section-title"><div><p class="eyebrow">Archive view · 132</p><h2>Погрузиться в визуальный почерк</h2></div><p>Фильтруйте по направлению. Даты с пометкой «архив» взяты из времени файла, когда проектная дата не была заполнена.</p></div><div class="portfolio-filters" id="portfolio-filters" aria-label="Фильтр работ"></div><div id="portfolio-gallery" class="portfolio-gallery loading">Собираю визуальный архив…</div><button class="gallery-more" id="gallery-more" type="button" hidden>Показать ещё работы</button></div></section><section class="section method reveal"><div class="wrap"><div class="section-title"><div><p class="eyebrow">Как читать архив</p><h2>Работа — это визуал. Кейс — визуал плюс доказательство.</h2></div><p>Поэтому архив работ и архив старых сравнительных замеров разведены: фотографию можно оценить глазами, а коммерческий эффект требует отдельного подтверждения.</p></div>${methodFlow()}</div></section></div>`;
}

function researchPage() {
  return `<div class="page"><section class="page-head" data-code="R"><div class="wrap"><p class="eyebrow">До первого кадра</p><h1>Не производить визуал вслепую</h1><p>Если товар ещё не выбран, сначала проверяются спрос, конкуренция, сезонность и экономика. Фото подключается тогда, когда понятна роль запуска.</p></div></section><section class="section reveal"><div class="wrap"><div class="research-panel"><div><p class="eyebrow">Отдельный рабочий модуль</p><h2>Кабинет исследования товара уже работает отдельно</h2><p>WISE / FRAME связывает его результат с будущим визуальным сценарием, но не переписывает кабинет и не выдаёт старые данные за текущие.</p><ul><li>shortlist кандидатов;</li><li>спрос, тренд и сезонность;</li><li>концентрация конкурентов;</li><li>риски неликвида;</li><li>проверка экономики;</li><li>финальный decision gate.</li></ul><a class="button accent" href="https://mpstats-autumn-2026-oleg.altheasolwold3296.chatgpt.site" target="_blank" rel="noopener noreferrer">Открыть кабинет</a></div><div class="metric-box"><div><b>01</b><span>SKU / товар</span></div><div><b>02</b><span>период данных</span></div><div><b>03</b><span>источник</span></div><div><b>04</b><span>уровень доказательства</span></div></div></div><div class="notice"><strong>Граница текущей версии</strong><p>Публичный кабинет проверялся отдельно. Защищённые API, платежи и Telegram‑интеграции требуют серверного размещения и новой приёмки.</p></div></div></section></div>`;
}

function calculatorPage() {
  return `<div class="page"><section class="page-head" data-code="%"><div class="wrap"><p class="eyebrow">Математика рекламной воронки</p><h1>Что меняют CTR и конверсия</h1><p>Введите свои показатели и сравните текущую воронку с целевой. Расчёт не обещает рост — он показывает, при каких допущениях меняются клики, заказы и рекламные затраты.</p></div></section><section class="section compact"><div class="wrap"><div class="calculator-layout"><form class="calculator-form" id="funnel-calculator"><div class="calculator-head"><p class="eyebrow">Учебный сценарий · все поля меняются</p><h2>Исходные данные</h2></div><div class="field-grid"><div class="field"><label for="calc-impressions">Показы</label><input id="calc-impressions" name="impressions" type="number" min="100" step="100" value="500000"></div><div class="field"><label for="calc-cpm">Цена 1000 показов, ₽</label><input id="calc-cpm" name="cpm" type="number" min="0" step="1" value="450"></div><div class="field"><label for="calc-ctr-before">CTR сейчас, %</label><input id="calc-ctr-before" name="ctrBefore" type="number" min="0.01" max="100" step="0.01" value="1"></div><div class="field"><label for="calc-ctr-after">CTR цель, %</label><input id="calc-ctr-after" name="ctrAfter" type="number" min="0.01" max="100" step="0.01" value="2"></div><div class="field"><label for="calc-cvr-before">Клик → заказ сейчас, %</label><input id="calc-cvr-before" name="cvrBefore" type="number" min="0.01" max="100" step="0.01" value="3"></div><div class="field"><label for="calc-cvr-after">Клик → заказ цель, %</label><input id="calc-cvr-after" name="cvrAfter" type="number" min="0.01" max="100" step="0.01" value="4"></div><div class="field"><label for="calc-aov">Средний заказ, ₽</label><input id="calc-aov" name="aov" type="number" min="0" step="1" value="2500"></div><div class="field"><label for="calc-margin">Маржинальность до рекламы, %</label><input id="calc-margin" name="margin" type="number" min="0" max="100" step="0.1" value="30"></div><div class="field full"><label for="calc-visual-cost">Стоимость визуального теста, ₽</label><input id="calc-visual-cost" name="visualCost" type="number" min="0" step="1" value="15000"></div></div><div class="calculator-assumption"><b>Модель расчёта</b><p>Одинаковая цена за 1000 показов (CPM) и неизменные цена, рейтинг, остатки, доставка и трафик. Если у кампании оплата за клик, подставьте фактический CPC в отдельный управленческий расчёт — CTR не превращается в экономию автоматически.</p></div></form><section class="calculator-results" aria-live="polite"><div class="result-strip"><article><small>Реклама при тех же показах</small><b id="calc-spend">—</b></article><article><small>Заказы сейчас → цель</small><b id="calc-orders">—</b></article><article class="accent"><small>Модельная экономия на том же числе заказов</small><b id="calc-saving">—</b></article></div><div class="impact-grid"><article><span>Только CTR</span><b id="calc-ctr-impact">—</b><p>Конверсия остаётся прежней.</p></article><article><span>Только конверсия</span><b id="calc-cvr-impact">—</b><p>CTR остаётся прежним.</p></article><article><span>Вместе</span><b id="calc-combined-impact">—</b><p>Оба целевых показателя.</p></article><article><span>Изменение вклада после рекламы</span><b id="calc-profit-impact">—</b><p>С учётом указанной стоимости визуального теста.</p></article></div><div class="formula-card"><h3>Как считается экономия</h3><p id="calc-formula">—</p></div></section></div><div class="archive-fact-grid"><article><p class="eyebrow">Что подтверждено архивом</p><h3>Был запрос с CTR ниже 1% и целью около 4%</h3><p>В последующем сообщении клиент написал, что заказы пошли и прислал ещё один товар. Но показов, рекламных затрат, маржи и сопоставимого периода нет — поэтому сумму экономии из этой переписки считать нельзя.</p><a href="https://t.me/WB_AI_CROCHET/244" target="_blank" rel="noopener noreferrer">Открыть исходный диалог ↗</a></article><article class="dark"><p class="eyebrow">Что показывает пример выше</p><h3>Большая сумма — не «кейс», а проверяемая модель</h3><p>При 500 000 показов по 450 ₽ CPM рост CTR с 1% до 2% и конверсии с 3% до 4% математически снижает объём показов, нужный для прежних 150 заказов. Измените любой вход — результат пересчитается.</p></article></div></div></section><section class="section reveal"><div class="wrap contact-card"><div><p class="eyebrow">Нужен расчёт на реальных данных?</p><h2>Пришлите скрин рекламной воронки.</h2><p>Нужны период, показы, клики, расход, заказы, средний чек и маржа. Тогда модель можно сверить с вашей фактической кампанией.</p></div><a class="button accent" href="#/quiz">Собрать данные</a></div></section></div>`;
}

function initCalculator() {
  const form = document.querySelector("#funnel-calculator");
  if (!form) return;
  const rubles = value => `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(value))} ₽`;
  const units = value => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value);
  const renderCalculation = () => {
    const values = Object.fromEntries(new FormData(form));
    const impressions = Math.max(0, Number(values.impressions) || 0);
    const cpm = Math.max(0, Number(values.cpm) || 0);
    const ctrBefore = Math.max(.0001, (Number(values.ctrBefore) || 0) / 100);
    const ctrAfter = Math.max(.0001, (Number(values.ctrAfter) || 0) / 100);
    const cvrBefore = Math.max(.0001, (Number(values.cvrBefore) || 0) / 100);
    const cvrAfter = Math.max(.0001, (Number(values.cvrAfter) || 0) / 100);
    const aov = Math.max(0, Number(values.aov) || 0);
    const margin = Math.max(0, Math.min(1, (Number(values.margin) || 0) / 100));
    const visualCost = Math.max(0, Number(values.visualCost) || 0);
    const spend = impressions / 1000 * cpm;
    const clicksBefore = impressions * ctrBefore;
    const ordersBefore = clicksBefore * cvrBefore;
    const ordersCtrOnly = impressions * ctrAfter * cvrBefore;
    const ordersCvrOnly = clicksBefore * cvrAfter;
    const clicksAfter = impressions * ctrAfter;
    const ordersAfter = clicksAfter * cvrAfter;
    const requiredImpressions = ordersBefore / (ctrAfter * cvrAfter);
    const targetSpend = requiredImpressions / 1000 * cpm;
    const saving = spend - targetSpend;
    const contributionBefore = ordersBefore * aov * margin - spend;
    const contributionAfter = ordersAfter * aov * margin - spend - visualCost;
    document.querySelector("#calc-spend").textContent = rubles(spend);
    document.querySelector("#calc-orders").textContent = `${units(ordersBefore)} → ${units(ordersAfter)}`;
    document.querySelector("#calc-saving").textContent = rubles(saving);
    document.querySelector("#calc-ctr-impact").textContent = `+${units(ordersCtrOnly - ordersBefore)} заказов`;
    document.querySelector("#calc-cvr-impact").textContent = `+${units(ordersCvrOnly - ordersBefore)} заказов`;
    document.querySelector("#calc-combined-impact").textContent = `+${units(ordersAfter - ordersBefore)} заказов`;
    document.querySelector("#calc-profit-impact").textContent = rubles(contributionAfter - contributionBefore);
    document.querySelector("#calc-formula").textContent = `${units(ordersBefore)} заказов сейчас требуют ${units(impressions)} показов. При целевых CTR и конверсии для того же числа заказов модели нужно ${units(requiredImpressions)} показов и ${rubles(targetSpend)} рекламных затрат вместо ${rubles(spend)}. Разница: ${rubles(saving)}.`;
  };
  form.addEventListener("input", renderCalculation);
  renderCalculation();
}

function historicalPage() {
  return `<div class="page"><section class="page-head" data-code="08"><div class="wrap"><p class="eyebrow">Архив сравнительных замеров</p><h1>Смотреть метод. Не переносить цифры.</h1><p>Восемь найденных экранов сохранены как исторический слой. По сообщению владельца данным более двух лет; точная дата тестов документально не подтверждена.</p></div></section><section class="section reveal"><div class="wrap"><div class="notice danger"><strong>Это не прогноз и не обещание результата</strong><p>Числа нельзя переносить на новый товар. Заголовки части колонок обрезаны, а на результат кроме визуала влияют цена, рейтинг, отзывы, доставка, реклама и сам товар.</p></div><div id="archive-content" class="loading">Загружаю архив…</div></div></section></div>`;
}

async function loadHistorical() {
  const target = document.querySelector("#archive-content");
  try {
    const response = await fetch("./data/historical-ctr.json");
    const data = await response.json();
    target.className = "archive-grid";
    target.innerHTML = data.items.map(item => `<article class="archive-card"><img src="${assetUrl(item.image)}" alt="Архивный экран сравнительного теста: ${escapeHtml(item.subject)}" loading="lazy"><div class="archive-body"><small>${item.id} · дата теста не подтверждена</small><h3>${escapeHtml(item.subject)}</h3><p>${escapeHtml(item.winner)}. Подписи колонок не подтверждены.</p><div class="raw-values" aria-label="Значения, видимые в строке">${item.visibleValues.map(value => `<span>${escapeHtml(value)}</span>`).join("")}</div></div></article>`).join("");
  } catch {
    target.textContent = "Архив не удалось загрузить.";
  }
}

async function loadPortfolioGallery() {
  const gallery = document.querySelector("#portfolio-gallery");
  const filters = document.querySelector("#portfolio-filters");
  const more = document.querySelector("#gallery-more");
  if (!gallery || !filters || !more) return;
  try {
    const response = await fetch("./data/portfolio-preview.json");
    if (!response.ok) throw new Error("Не удалось открыть реестр работ");
    const data = await response.json();
    let active = "ALL";
    let limit = 24;

    filters.innerHTML = data.filters.map((filter, index) => `<button class="filter-button ${index === 0 ? "active" : ""}" type="button" data-filter="${escapeHtml(filter.value)}">${escapeHtml(filter.label)} · ${escapeHtml(filter.count)}</button>`).join("");
    gallery.className = "portfolio-gallery";
    gallery.innerHTML = data.items.map((item, index) => `<article class="work-card" data-category="${escapeHtml(item.category)}" data-index="${index}"><div class="work-image"><span class="work-index">${escapeHtml(item.id)}</span><img src="${escapeHtml(assetUrl(item.image))}" alt="${escapeHtml(item.title)} — работа из визуального архива" loading="${index < 12 ? "eager" : "lazy"}"></div><div class="work-body"><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.categoryLabel)}</p></div><small>${escapeHtml(item.period)}</small></div></article>`).join("");

    const update = () => {
      const matching = data.items.map((item, index) => ({ item, index })).filter(entry => active === "ALL" || entry.item.category === active);
      const visibleIndexes = new Set(matching.slice(0, limit).map(entry => entry.index));
      gallery.querySelectorAll(".work-card").forEach((card, index) => { card.hidden = !visibleIndexes.has(index); });
      more.hidden = matching.length <= limit;
      more.textContent = `Показать ещё · осталось ${Math.max(0, matching.length - limit)}`;
    };

    filters.addEventListener("click", event => {
      const button = event.target.closest("button[data-filter]");
      if (!button) return;
      active = button.dataset.filter;
      limit = 24;
      filters.querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button));
      update();
    });
    more.addEventListener("click", () => { limit += 24; update(); });
    update();
  } catch (error) {
    gallery.textContent = error.message;
  }
}

function quizPage(mini) {
  return `<div class="page ${mini ? "miniapp-page" : ""}">${mini ? `<div class="wrap telegram-banner" id="telegram-banner"><div><b>WISE / FRAME Mini App · подбор визуального маршрута</b><small>В браузере работает безопасный предпросмотр. В Telegram личность подтверждается сервером.</small></div><span id="telegram-status">Публичный preview</span></div>` : `<section class="page-head" data-code="Q"><div class="wrap"><p class="eyebrow">Подбор визуального маршрута · 3 минуты</p><h1>Что должен сделать ваш визуал?</h1><p>Опрос ведёт по разным веткам: маркетплейс, бренд‑серия, обложка, контент или поиск идеи. В конце — подходящий формат и список исходников.</p></div></section>`}<div class="wrap quiz-shell"><aside class="quiz-aside"><p class="eyebrow">WISE / FRAME · route builder</p><h1>От задачи к следующему действию</h1><p>Без универсального пакета, навязчивой продажи и обещаний гарантированного результата.</p><div class="progress-track" aria-hidden="true"><i id="quiz-progress"></i></div><p id="quiz-count">Шаг 1</p></aside><section class="quiz-panel" id="quiz-container">${quizForm(mini)}</section></div></div>`;
}

function miniAppPage() {
  return `<div class="page miniapp-page miniapp-product">
    <header class="miniapp-top"><div><span>WISE / FRAME</span><b>Visual performance studio</b></div><div class="miniapp-state" id="telegram-status">Проверяю…</div></header>
    <main class="miniapp-screen" id="mini-screen" aria-live="polite"><div class="miniapp-loading"><span></span><b>Собираю ваш кабинет</b><p>Проверяю Telegram-сессию и доступ.</p></div></main>
    <nav class="miniapp-bottom" aria-label="Навигация Mini App">
      <button type="button" data-mini-screen="home"><span>⌂</span>Главная</button>
      <button type="button" data-mini-screen="diagnostic"><span>◎</span>Диагностика</button>
      <button type="button" data-mini-screen="catalog"><span>▦</span>Услуги</button>
      <button type="button" data-mini-screen="purchases"><span>◫</span>Покупки</button>
      <button type="button" data-mini-screen="profile"><span>○</span>Профиль</button>
    </nav>
  </div>`;
}

function miniScreenFromHash() {
  return new URLSearchParams(routeLocation().query).get("screen") || "home";
}

async function initMiniApp() {
  const shell = document.querySelector(".miniapp-product");
  shell?.addEventListener("click", event => {
    const button = event.target.closest("[data-mini-screen]");
    if (!button) return;
    navigateMiniScreen(button.dataset.miniScreen);
  });
  await establishTelegramSession();
  await renderMiniScreen(miniScreenFromHash());
}

function navigateMiniScreen(screen) {
  history.replaceState({}, "", `${location.pathname}${location.search}#/miniapp?screen=${encodeURIComponent(screen)}`);
  renderMiniScreen(screen);
}

async function renderMiniScreen(screen) {
  const container = document.querySelector("#mini-screen");
  if (!container) return;
  window.scrollTo({ top: 0, behavior: "instant" });
  document.querySelectorAll(".miniapp-bottom button").forEach(button => button.classList.toggle("active", button.dataset.miniScreen === screen));
  if (screen === "home") container.innerHTML = miniHomeScreen();
  else if (screen === "diagnostic") {
    container.innerHTML = `<div class="mini-quiz-wrap"><div class="quiz-shell"><aside class="quiz-aside"><p class="eyebrow">Бесплатный маршрут · 3 минуты</p><h1>Что должен сделать кадр?</h1><p>Ответьте на несколько вопросов — результат появится до предложения оплаты.</p><div class="progress-track"><i id="quiz-progress"></i></div><p id="quiz-count">Шаг 1</p></aside><section class="quiz-panel" id="quiz-container">${quizForm(true)}</section></div></div>`;
    initQuiz(true);
  } else if (screen === "catalog") await renderMiniCatalog(container);
  else if (screen === "purchases") await renderMiniPurchases(container);
  else if (screen === "profile") container.innerHTML = miniProfileScreen();
  else if (screen === "terms") container.innerHTML = miniTermsScreen();
  else if (screen === "paid") await renderMiniPaid(container);
  else if (screen === "result") container.innerHTML = miniAppLastResult ? resultHtml(miniAppLastResult.result, miniAppLastResult.id, true) : miniEmptyResult();
  else container.innerHTML = miniHomeScreen();
}

function stateLabel(state) {
  return ({ anonymous: "Гостевой просмотр", free: "Бесплатный доступ", invoice_pending: "Ожидаем оплату", paid: "Платный доступ", refunded: "Возврат оформлен", admin: "Режим владельца" })[state] || "Бесплатный доступ";
}

function miniHomeScreen() {
  const name = miniAppSession.user?.firstName ? `, ${escapeHtml(miniAppSession.user.firstName)}` : "";
  const paid = ["paid", "admin"].includes(miniAppSession.state);
  return `<section class="mini-home">
    <div class="mini-hero-copy"><p class="eyebrow">Главный кадр → CTR → цена заказа</p><h1>Меньше<br><span>рекламы</span><br>на заказ.</h1><p>Здравствуйте${name}. Найдите слабое место визуальной цепочки и получите первый проверяемый шаг — без обещаний гарантированного роста.</p><button class="button accent mini-primary" type="button" data-mini-screen="${paid ? "paid" : "diagnostic"}">${paid ? "ОТКРЫТЬ ПЛАТНЫЙ РАЗБОР" : "ПОПРОБОВАТЬ БЕСПЛАТНО"}</button></div>
    <div class="mini-proof-stack"><img src="./assets/portfolio-preview/port-0005.webp" alt="Пример fashion-визуала"><img src="./assets/portfolio-preview/port-0008.webp" alt="Пример beauty-визуала"><article><small>Демо-модель</small><b>225 000 ₽ → 84 375 ₽</b><span>Только при заданных CTR/CVR и неизменных прочих условиях.</span></article></div>
    <div class="mini-status-strip"><span>${stateLabel(miniAppSession.state)}</span><b>${paid ? "Полный результат открыт сервером" : "Первый маршрут — бесплатно"}</b></div>
    <div class="mini-actions-grid"><button type="button" data-mini-screen="catalog"><small>01</small><b>Выбрать услугу</b><span>Результат, состав, статус цены</span></button><button type="button" data-mini-screen="purchases"><small>02</small><b>Мои покупки</b><span>Серверная история и доступ</span></button><a href="https://t.me/wise_video" target="_blank" rel="noopener noreferrer"><small>03</small><b>Спросить Олега</b><span>Передать собранный контекст</span></a><button type="button" data-mini-screen="terms"><small>04</small><b>Условия</b><span>Оплата, данные, поддержка</span></button></div>
  </section>`;
}

async function renderMiniCatalog(container) {
  container.innerHTML = `<div class="miniapp-loading"><span></span><b>Загружаю услуги</b></div>`;
  try {
    const data = STATIC_PAGES
      ? { paymentMode: "disabled", products: [{ id: "visual-audit", title: "Экспресс-разбор визуала", description: "Разбор одного кадра и приоритет теста.", paymentEnabled: false, amount: null }] }
      : await fetch("/api/products").then(response => response.json());
    const product = data.products?.[0];
    const price = product?.paymentEnabled ? `${product.amount} Stars` : "Цена согласуется";
    const canBuy = Boolean(product?.paymentEnabled && telegramAuthenticated);
    container.innerHTML = `<section class="mini-catalog"><p class="eyebrow">От бесплатного шага к работе</p><h1>Выберите результат,<br>а не размер пакета</h1><article class="mini-product featured"><div><span>Первый цифровой продукт</span><h2>${escapeHtml(product?.title || "Экспресс-разбор визуала")}</h2><p>${escapeHtml(product?.description || "Разбор одного кадра и приоритет теста.")}</p><ul><li>роль главного кадра;</li><li>3–5 смысловых гипотез;</li><li>план проверки CTR/CVR;</li><li>следующий шаг с Олегом.</li></ul></div><footer><b>${escapeHtml(price)}</b>${miniAppSession.state === "paid" ? `<button class="button accent" type="button" data-mini-screen="paid">Открыть результат</button>` : `<label class="mini-terms-check"><input id="mini-terms-check" type="checkbox" ${canBuy ? "" : "disabled"}><span>Я прочитал и принимаю <button type="button" data-mini-screen="terms">условия сервиса</button></span></label><button class="button accent" type="button" id="mini-buy" disabled>${product?.paymentEnabled ? "Подтвердите условия" : "Оплата пока выключена"}</button>`}<small>${data.paymentMode === "disabled" ? "Владелец ещё не утвердил цену; ложный счёт не создаётся." : "Доступ откроется только после подтверждения Telegram."}</small></footer></article><div class="mini-product-row"><article><small>Основная услуга</small><h3>Система из пяти ролей</h3><p>Обложка, сценарий, деталь, доверие и выбор.</p><a href="https://t.me/wise_video" target="_blank" rel="noopener noreferrer">Согласовать объём →</a></article><article><small>Премиум</small><h3>Разбор и производство с Олегом</h3><p>Живой эксперт получает уже заполненный контекст.</p><a href="https://t.me/wise_video" target="_blank" rel="noopener noreferrer">Связаться →</a></article></div></section>`;
    const checkbox = document.querySelector("#mini-terms-check");
    const buyButton = document.querySelector("#mini-buy");
    checkbox?.addEventListener("change", () => {
      buyButton.disabled = !checkbox.checked || !canBuy;
      buyButton.textContent = checkbox.checked && canBuy ? "Оплатить Stars" : product?.paymentEnabled ? "Подтвердите условия" : "Оплата пока выключена";
    });
    buyButton?.addEventListener("click", () => startMiniPayment(product));
  } catch (error) {
    container.innerHTML = miniError(error.message, "catalog");
  }
}

async function startMiniPayment(product) {
  const button = document.querySelector("#mini-buy");
  if (!telegramAuthenticated) return;
  if (!document.querySelector("#mini-terms-check")?.checked) {
    button.textContent = "Сначала подтвердите условия";
    return;
  }
  button.disabled = true;
  button.textContent = "Готовлю счёт…";
  try {
    if (!miniAppSession.termsAccepted) {
      const consent = await fetch("/api/terms/accept", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData: telegramInitData }) });
      if (!consent.ok) throw new Error((await consent.json()).error || "Не удалось подтвердить условия");
      miniAppSession.termsAccepted = true;
    }
    const response = await fetch("/api/payments/invoice", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData: telegramInitData, productId: product.id }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Не удалось создать счёт");
    miniAppSession.state = "invoice_pending";
    window.Telegram?.WebApp?.openInvoice?.(data.invoiceUrl, async () => {
      await establishTelegramSession();
      navigateMiniScreen(miniAppSession.state === "paid" ? "paid" : "purchases");
    });
  } catch (error) {
    button.disabled = false;
    button.textContent = error.message;
  }
}

async function renderMiniPurchases(container) {
  if (!telegramAuthenticated) {
    container.innerHTML = `<section class="mini-empty"><p class="eyebrow">Мои покупки</p><h1>Откройте Mini App через бота</h1><p>В обычном браузере нет проверенной Telegram-личности, поэтому история не загружается.</p><a class="button accent" href="https://t.me/WiseFrameOlegBot" target="_blank" rel="noopener noreferrer">Открыть бота</a></section>`;
    return;
  }
  try {
    const response = await fetch("/api/purchases", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData: telegramInitData }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    miniAppSession.state = data.state;
    container.innerHTML = `<section class="mini-purchases"><p class="eyebrow">Серверная история</p><h1>Мои покупки</h1>${data.purchases.length ? data.purchases.map(item => `<article><div><small>${escapeHtml(new Date(item.createdAt).toLocaleString("ru-RU"))}</small><h2>${escapeHtml(item.productId === "visual-audit" ? "Экспресс-разбор визуала" : item.productId)}</h2></div><span class="purchase-state ${escapeHtml(item.status)}">${escapeHtml(item.status)}</span></article>`).join("") : `<div class="mini-empty-card"><b>Покупок пока нет</b><p>Сначала получите бесплатный маршрут, затем решите, нужен ли полный разбор.</p><button class="button accent" type="button" data-mini-screen="diagnostic">Начать бесплатно</button></div>`}</section>`;
  } catch (error) {
    container.innerHTML = miniError(error.message, "purchases");
  }
}

async function renderMiniPaid(container) {
  if (!telegramAuthenticated) {
    container.innerHTML = miniError("Платный результат доступен только после входа через Telegram.", "home");
    return;
  }
  try {
    const response = await fetch("/api/paid/result", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData: telegramInitData }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    container.innerHTML = `<section class="mini-paid"><p class="eyebrow">Доступ подтверждён сервером</p><h1>${escapeHtml(data.result.title)}</h1><p>${escapeHtml(data.result.summary)}</p><div class="mini-paid-sections">${data.result.sections.map((section, index) => `<article><span>0${index + 1}</span><div><h2>${escapeHtml(section.title)}</h2><ul>${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div></article>`).join("")}</div><a class="button accent" href="${safeUrl(data.result.supportUrl)}" target="_blank" rel="noopener noreferrer">Передать контекст Олегу</a></section>`;
  } catch (error) {
    container.innerHTML = miniError(error.message, "purchases");
  }
}

function miniProfileScreen() {
  return `<section class="mini-profile"><p class="eyebrow">Профиль</p><h1>${escapeHtml(miniAppSession.user?.firstName || "Гость")}</h1><div class="profile-state"><small>Текущий статус</small><b>${stateLabel(miniAppSession.state)}</b><p>${telegramAuthenticated ? "Личность подтверждена сервером по Telegram initData." : "Это браузерный preview; Telegram ID не считается подтверждённым."}</p></div><div class="mini-actions-grid"><button type="button" data-mini-screen="purchases"><small>01</small><b>Покупки</b><span>Статусы заказов</span></button><button type="button" data-mini-screen="terms"><small>02</small><b>Условия</b><span>${miniAppSession.termsAccepted ? "Подтверждены" : "Прочитать"}</span></button><a href="https://t.me/wise_video" target="_blank" rel="noopener noreferrer"><small>03</small><b>Поддержка</b><span>@wise_video</span></a></div></section>`;
}

function miniTermsScreen() {
  if (STATIC_PAGES) {
    return `<section class="mini-terms"><p class="eyebrow">Публичный preview · 08.08.2026</p><h1>Условия и данные</h1><article><h2>Что работает</h2><p>Диагностика, калькулятор, портфолио и подбор маршрута работают прямо в браузере.</p></article><article><h2>Что отключено</h2><p>GitHub Pages не подтверждает Telegram‑личность, не принимает Stars и не выдаёт платный доступ. Для этого нужен отдельный сервер.</p></article><article><h2>Ваши ответы</h2><p>Данные диагностической формы не отправляются владельцу. Для связи нажмите <a href="https://t.me/wise_video" target="_blank" rel="noopener noreferrer">@wise_video</a> после результата.</p></article></section>`;
  }
  return `<section class="mini-terms"><p class="eyebrow">Версия 07.08.2026</p><h1>Условия и данные</h1><article><h2>Что делает сервис</h2><p>Подбирает маршрут работы с визуалом и показывает модель влияния CTR/CVR. Он не гарантирует рекламный результат, продажи или доход.</p></article><article><h2>Оплата</h2><p>Цифровой результат внутри Telegram оплачивается Stars только после утверждения цены. Доступ выдаёт сервер после <code>successful_payment</code>, а не закрытие окна счёта.</p></article><article><h2>Поддержка и возврат</h2><p>Напишите <a href="https://t.me/wise_video" target="_blank" rel="noopener noreferrer">@wise_video</a>, укажите дату и продукт. Telegram support не обрабатывает споры по покупкам у бота.</p></article><article><h2>Конфиденциальность</h2><p>Сервер хранит Telegram ID, имя, ответы диагностики, статусы заказов и аудит. Токены и полная initData не попадают в публичные файлы.</p></article></section>`;
}

function miniEmptyResult() {
  return `<section class="mini-empty"><p class="eyebrow">Бесплатный результат</p><h1>Сначала пройдите диагностику</h1><p>После последнего шага здесь появится маршрут, примеры и предложение продолжения.</p><button class="button accent" type="button" data-mini-screen="diagnostic">Начать</button></section>`;
}

function miniError(message, retryScreen) {
  return `<section class="mini-empty"><p class="eyebrow">Не удалось загрузить</p><h1>Нужен повтор</h1><p>${escapeHtml(message || "Неизвестная ошибка")}</p><button class="button accent" type="button" data-mini-screen="${escapeHtml(retryScreen)}">Повторить</button><a class="mini-support-link" href="https://t.me/wise_video" target="_blank" rel="noopener noreferrer">Поддержка @wise_video</a></section>`;
}

function quizForm(mini) {
  return `<form id="quiz-form" novalidate>
    <fieldset data-step="goal" class="active"><legend>Что нужно получить?</legend><div class="options">
      ${option("goal", "improve_card", "Улучшить существующую карточку", "Есть товар и текущая подача")}
      ${option("goal", "new_launch", "Запустить новый товар", "Нужна логика всей серии")}
      ${option("goal", "choose_product", "Сначала выбрать товар", "Нужна проверка ниши и рисков")}
      ${option("goal", "monthly_content", "Работать с контентом регулярно", "Несколько SKU и цикл гипотез")}
      ${option("goal", "brand_series", "Собрать бренд‑серию", "Для сайта, каталога, соцсетей или кампании")}
      ${option("goal", "cover_concept", "Создать обложку / key visual", "Фотоальбом, книга, релиз, подкаст или афиша")}
      ${option("goal", "content_campaign", "Запустить идею или нестандартную рекламу", "Стрим, creator‑площадка, сайт, событие или непривычный носитель")}
    </div></fieldset>
    <fieldset data-step="marketplace"><legend>Где будет работать визуал?</legend><div class="options">${option("marketplace","wildberries","Wildberries","")}${option("marketplace","ozon","Ozon","")}${option("marketplace","both","WB и Ozon","")}${option("marketplace","own_store","Сайт / интернет‑магазин","")}${option("marketplace","social","Соцсети / реклама","")}${option("marketplace","creator_platform","Стрим / creator‑площадка 18+","")}${option("marketplace","album_publishing","Альбом / книга / релиз","")}${option("marketplace","multi_channel","Сразу несколько каналов","")}${option("marketplace","other","Другой формат","")}</div></fieldset>
    <fieldset data-step="assets"><legend>Что уже есть на старте?</legend><div class="options">${option("assets","current_card","Готовая карточка или страница","Можно разобрать текущий путь")}${option("assets","product_photos","Исходные фото","Есть материал, но нет готовой серии")}${option("assets","analytics","Визуал и аналитика","Есть цифры и контекст")}${option("assets","brand_materials","Бренд‑материалы / рукопись / трек","Есть содержание и визуальные ориентиры")}${option("assets","nothing","Пока только идея","Начинаем с концепции")}</div></fieldset>
    <fieldset data-step="metrics"><legend>Насколько свежи замеры?</legend><div class="field-grid"><div class="field full"><label for="traffic">Ситуация с трафиком</label><select id="traffic" name="traffic"><option value="unknown">Не знаю / не разделяли источники</option><option value="stable">Есть стабильный органический трафик</option><option value="ads">Есть рекламный трафик</option><option value="low">Трафика пока мало</option></select></div><div class="field full"><label for="measurementAge">Возраст данных</label><select id="measurementAge" name="measurementAge"><option value="none">Свежего замера нет</option><option value="old">Только старые данные</option><option value="current">Есть сопоставимый замер за последние недели</option></select></div></div><div class="notice"><strong>Почему это важно</strong><p>Старые цифры полезны для истории, но не доказывают текущую эффективность визуала.</p></div></fieldset>
    <fieldset data-step="scale"><legend>Объём и срок</legend><div class="field-grid"><div class="field"><label for="volume">Масштаб</label><select id="volume" name="volume"><option value="one_sku">Один товар / одна обложка</option><option value="two_to_five">Серия 2–5 единиц</option><option value="six_plus">Система 6+ единиц</option></select></div><div class="field"><label for="timeline">Желаемый старт</label><select id="timeline" name="timeline"><option value="week">В течение недели</option><option value="two_weeks">В течение двух недель</option><option value="month">В течение месяца</option><option value="flexible">Без жёсткого срока</option></select></div></div></fieldset>
    ${STATIC_PAGES ? `<fieldset data-step="contact"><legend>Добавьте контекст — только для результата на экране</legend><div class="field-grid"><div class="field"><label for="name">Имя — необязательно</label><input id="name" name="name" autocomplete="name" maxlength="80"></div><div class="field"><label for="contact">Telegram — необязательно</label><input id="contact" name="contact" maxlength="160" placeholder="Не отправляется автоматически"></div><div class="field full"><label for="productUrl">Ссылка на товар — если есть</label><input id="productUrl" name="productUrl" inputmode="url" maxlength="500" placeholder="https://..."></div><div class="field full"><label for="comment">Что ещё важно знать</label><textarea id="comment" name="comment" maxlength="1200"></textarea></div><input type="hidden" name="company" value=""><input type="hidden" name="consent" value="on"><div class="notice full"><strong>Без отправки данных</strong><p>Публичная версия рассчитывает маршрут в этой вкладке. Чтобы связаться, после результата нажмите «Спросить Олега».</p></div></div></fieldset>` : `<fieldset data-step="contact"><legend>Куда отправить следующий шаг?</legend><div class="field-grid"><div class="field"><label for="name">Имя</label><input id="name" name="name" autocomplete="name" maxlength="80" required></div><div class="field"><label for="contact">Telegram или другой контакт</label><input id="contact" name="contact" autocomplete="email" maxlength="160" required placeholder="@username"></div><div class="field full"><label for="productUrl">Ссылка на товар — если есть</label><input id="productUrl" name="productUrl" inputmode="url" maxlength="500" placeholder="https://..."></div><div class="field full"><label for="comment">Что ещё важно знать</label><textarea id="comment" name="comment" maxlength="1200"></textarea></div><div class="field honeypot" aria-hidden="true"><label for="company">Компания</label><input id="company" name="company" tabindex="-1" autocomplete="off"></div><label class="option full"><input type="checkbox" name="consent" required><span><b>Согласен на обработку этой заявки</b><small>Данные сохраняются в закрытой панели и используются только для ответа.</small></span></label></div></fieldset>`}
    <input type="hidden" name="source" value="${mini ? "preview" : "website"}">
    <div class="quiz-actions"><button class="button secondary" id="quiz-back" type="button" hidden>Назад</button><button class="button accent" id="quiz-next" type="button">Продолжить</button><button class="button accent" id="quiz-submit" type="submit" hidden>Получить результат</button></div><div class="form-message" id="form-message" role="status"></div>
  </form>`;
}

function option(name, value, title, description) {
  return `<label class="option"><input type="radio" name="${name}" value="${value}" required><span><b>${title}</b>${description ? `<small>${description}</small>` : ""}</span></label>`;
}

function initQuiz(mini) {
  const form = document.querySelector("#quiz-form");
  const back = document.querySelector("#quiz-back");
  const next = document.querySelector("#quiz-next");
  const submit = document.querySelector("#quiz-submit");
  const message = document.querySelector("#form-message");
  let index = 0;
  let flow = ["goal", "marketplace", "assets", "metrics", "scale", "contact"];

  function updateFlow() {
    const goal = new FormData(form).get("goal");
    const noMetrics = ["choose_product", "monthly_content", "brand_series", "cover_concept", "content_campaign"].includes(goal);
    flow = goal === "choose_product" ? ["goal", "marketplace", "scale", "contact"] : noMetrics ? ["goal", "marketplace", "assets", "scale", "contact"] : ["goal", "marketplace", "assets", "metrics", "scale", "contact"];
    index = Math.min(index, flow.length - 1);
  }
  function show() {
    form.querySelectorAll("fieldset").forEach(fieldset => fieldset.classList.toggle("active", fieldset.dataset.step === flow[index]));
    back.hidden = index === 0;
    next.hidden = index === flow.length - 1;
    submit.hidden = index !== flow.length - 1;
    document.querySelector("#quiz-progress").style.width = `${((index + 1) / flow.length) * 100}%`;
    document.querySelector("#quiz-count").textContent = `Шаг ${index + 1} из ${flow.length}`;
    message.textContent = "";
  }
  next.addEventListener("click", () => {
    const panel = form.querySelector(`fieldset[data-step='${flow[index]}']`);
    if (!validatePanel(panel)) { message.textContent = "Выберите ответ, чтобы продолжить."; return; }
    updateFlow();
    index += 1;
    show();
  });
  back.addEventListener("click", () => { index = Math.max(0, index - 1); show(); });
  form.addEventListener("change", event => { if (event.target.name === "goal") updateFlow(); });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const panel = form.querySelector(`fieldset[data-step='${flow[index]}']`);
    if (!validatePanel(panel)) { message.textContent = "Заполните обязательные поля и подтвердите согласие."; return; }
    submit.disabled = true;
    submit.textContent = "Сохраняю…";
    const values = Object.fromEntries(new FormData(form));
    const goal = values.goal;
    const answers = {
      goal,
      marketplace: values.marketplace,
      assets: goal === "choose_product" ? "nothing" : values.assets,
      traffic: ["choose_product", "monthly_content", "brand_series", "cover_concept", "content_campaign"].includes(goal) ? "unknown" : values.traffic,
      measurementAge: ["choose_product", "monthly_content", "brand_series", "cover_concept", "content_campaign"].includes(goal) ? "none" : values.measurementAge,
      volume: values.volume,
      timeline: values.timeline,
      name: values.name,
      contact: values.contact,
      productUrl: values.productUrl,
      comment: values.comment,
      company: values.company,
      consent: values.consent === "on",
      source: mini ? (telegramAuthenticated ? "telegram" : "preview") : "website"
    };
    if (STATIC_PAGES) {
      const data = { id: `preview-${Date.now()}`, result: chooseStaticRoute(answers) };
      miniAppLastResult = mini ? { result: data.result, id: data.id } : miniAppLastResult;
      document.querySelector("#quiz-container").innerHTML = resultHtml(data.result, data.id, mini);
      return;
    }
    try {
      const response = await fetch("/api/questionnaire/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers, initData: telegramInitData }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Не удалось сохранить заявку");
      miniAppLastResult = mini ? { result: data.result, id: data.id } : miniAppLastResult;
      document.querySelector("#quiz-container").innerHTML = resultHtml(data.result, data.id, mini);
      if (telegramAuthenticated) window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
    } catch (error) {
      message.textContent = error.message;
      submit.disabled = false;
      submit.textContent = "Получить результат";
    }
  });
  const requestedGoal = new URLSearchParams(routeLocation().query).get("goal");
  const requestedOption = [...form.querySelectorAll("input[name='goal']")].find(input => input.value === requestedGoal);
  if (requestedOption) {
    requestedOption.checked = true;
    updateFlow();
  }
  if (mini) initTelegramPreview(form);
  show();
}

function validatePanel(panel) {
  for (const field of panel.querySelectorAll("input,select,textarea")) {
    if (!field.checkValidity()) { field.reportValidity(); return false; }
  }
  return true;
}

function chooseStaticRoute(answers) {
  const catalog = {
    quick_audit: ["Быстрый аудит карточки", "Сначала отделим проблему визуала от цены, рейтинга, отзывов, доставки и трафика.", "Аудит одного артикула", ["Собрать ссылку и текущий главный кадр", "Зафиксировать свежий базовый замер", "Выдать 3–5 проверяемых гипотез"]],
    visual_test: ["Тест главного кадра", "Есть база для аккуратного сравнения вариантов без обещаний заранее.", "Гипотезы и тест главного изображения", ["Сверить товар и ограничения бренда", "Собрать 2–4 разные гипотезы", "Провести новый тест в одинаковых условиях"]],
    full_funnel: ["Полная фото-воронка", "Нужна не одна картинка, а последовательность: клик → понимание → доверие → выбор.", "Главный кадр, серия и инфографика", ["Исследовать нишу и топы", "Спроектировать порядок кадров", "Подготовить тест главного кадра и логику серии"]],
    product_research: ["Исследование товара", "До визуала нужно проверить спрос, конкуренцию, сезонность и экономику кандидата.", "Исследование ниши и shortlist", ["Зафиксировать бюджет и ограничения", "Проверить кандидатов по данным", "Передать shortlist с рисками и следующими проверками"]],
    monthly_content: ["Регулярный контент-контур", "Подойдёт ритм тестов, обновлений карточек и накопления доказательств по SKU.", "Ежемесячный план гипотез и контента", ["Выбрать приоритетные SKU", "Согласовать календарь тестов", "Ежемесячно сравнивать свежие результаты"]],
    brand_series: ["Бренд‑серия", "Нужна единая визуальная логика для нескольких точек контакта, а не набор несвязанных кадров.", "Арт‑направление и серия для бренда", ["Зафиксировать аудиторию и роль серии", "Собрать 2–3 визуальных направления", "Адаптировать выбранную систему под носители"]],
    cover_concept: ["Обложка и key visual", "Сначала нужно найти один сильный образ, который удержит тему и останется читаемым на нужном носителе.", "Концепция обложки и адаптации", ["Разобрать содержание и аудиторию", "Предложить разные смысловые метафоры", "Довести выбранный образ и форматы"]],
    content_campaign: ["Идея и визуальная кампания", "До производства нужно определить сюжет, ритм и набор образов, которые можно развивать серией.", "Концепт‑спринт и карта контента", ["Собрать ограничения и референсы", "Развести 2–3 арт‑направления", "Сформировать серию и план производства"]]
  };
  let code;
  if (answers.goal === "choose_product") code = "product_research";
  else if (["monthly_content", "brand_series", "cover_concept", "content_campaign"].includes(answers.goal)) code = answers.goal;
  else if (answers.goal === "new_launch" || answers.volume === "six_plus") code = "full_funnel";
  else if (answers.assets === "nothing" || answers.traffic === "unknown" || answers.measurementAge === "none") code = "quick_audit";
  else code = "visual_test";
  const [title, lead, packageName, steps] = catalog[code];
  const performanceRoute = ["quick_audit", "visual_test", "full_funnel", "monthly_content"].includes(code);
  const needsFreshMeasurement = performanceRoute && answers.measurementAge !== "current";
  return {
    code,
    title,
    lead,
    package: packageName,
    steps,
    measurementNote: needsFreshMeasurement
      ? "Архивные или отсутствующие цифры нельзя использовать как текущую базу — сначала нужен новый замер."
      : performanceRoute ? "Свежий замер можно использовать как базу, если условия теста и контекст сохранены." : "Для этой ветки критерий проверки задаётся носителем, аудиторией и задачей — CTR не является универсальной мерой.",
    disclaimer: "Это маршрут работы, а не гарантия CTR, рекламной ставки или продаж. В публичной версии результат рассчитывается в браузере и не отправляет контактные данные."
  };
}

function resultHtml(result, id, mini = false) {
  return `<article class="result-card ${mini ? "mini-result-card" : ""}"><p class="eyebrow">Ваш бесплатный маршрут · ${escapeHtml(id.slice(0, 8))}</p><h2>${escapeHtml(result.title)}</h2><p>${escapeHtml(result.lead)}</p><h3>${escapeHtml(result.package)}</h3><ol>${result.steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol><p class="result-warning">${escapeHtml(result.measurementNote)}</p><small>${escapeHtml(result.disclaimer)}</small>${mini ? `<div class="mini-result-proof"><img src="./assets/portfolio-preview/port-0113.webp" alt="Пример карточки товара"><img src="./assets/portfolio-preview/port-0129.webp" alt="Пример key visual"><div><small>Платное продолжение</small><b>Разбор одного кадра + 3–5 гипотез</b><p>Цена не появится, пока владелец её не утвердит.</p></div></div><div class="hero-actions"><button class="button accent" type="button" data-mini-screen="catalog">Смотреть продолжение</button><a class="button secondary" href="https://t.me/wise_video" target="_blank" rel="noopener noreferrer">Спросить Олега</a></div>` : `<div class="hero-actions" style="margin-top:24px"><a class="button accent" href="#/support">Связаться с Олегом</a><a class="button secondary" href="#/calculator">Посчитать воронку</a></div>`}</article>`;
}

async function initTelegramPreview(form) {
  if (telegramAuthenticated) {
    form.elements.source.value = "telegram";
    return;
  }
  await establishTelegramSession();
  if (telegramAuthenticated) form.elements.source.value = "telegram";
}

async function establishTelegramSession() {
  const status = document.querySelector("#telegram-status");
  try {
    await loadTelegramScript();
    const webApp = window.Telegram?.WebApp;
    webApp?.ready?.();
    webApp?.expand?.();
    if (!webApp?.initData) {
      miniAppSession = { state: "anonymous", user: null, entitlement: null, termsAccepted: false };
      if (status) status.textContent = "Гостевой preview";
      return miniAppSession;
    }
    telegramInitData = webApp.initData;
    const response = await fetch("/api/telegram/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData: telegramInitData }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    telegramAuthenticated = true;
    miniAppSession = { state: data.state, user: data.user, entitlement: data.entitlement, termsAccepted: data.termsAccepted };
    if (status) status.textContent = `${stateLabel(data.state)} · ${data.user.firstName}`;
    return miniAppSession;
  } catch (error) {
    telegramAuthenticated = false;
    miniAppSession = { state: "anonymous", user: null, entitlement: null, termsAccepted: false };
    if (status) status.textContent = "Гостевой preview";
    return miniAppSession;
  }
}

function loadTelegramScript() {
  if (window.Telegram?.WebApp) return Promise.resolve();
  return new Promise(resolve => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js?63";
    script.onload = resolve;
    script.onerror = resolve;
    document.head.appendChild(script);
  });
}

function telegramPage() {
  return `<div class="page telegram-hub">
    <section class="page-head" data-code="TG"><div class="wrap"><p class="eyebrow">Пост → разговор → диагностика → заявка</p><h1>Telegram не вместо сайта. Он ведёт внутрь.</h1><p>Канал показывает реальные работы и задаёт вопрос. Комментарий начинает разговор. Бот собирает задачу и открывает тот же опрос, который работает на сайте.</p></div></section>
    <section class="section compact"><div class="wrap"><div class="telegram-state" id="telegram-state"><div><span>BOT + MINI APP</span><b id="bot-state-title">Проверяю подключение…</b><p id="bot-state-copy">Секретные данные никогда не показываются на странице.</p></div><div class="telegram-state-actions"><a class="button accent" id="bot-state-action" href="#/quiz">Открыть бота</a><a class="button secondary" href="#/miniapp">Посмотреть Mini App</a></div></div></div></section>
    <section class="section dark"><div class="wrap"><div class="section-title"><div><p class="eyebrow">Один маршрут · пять касаний</p><h2>Не бросать человека после красивого поста</h2></div><p>На каждом шаге есть понятное действие, а у Олега остаётся контекст: категория, цель, ссылка на товар и удобный контакт.</p></div><div class="telegram-flow"><article><span>01</span><h3>Работа</h3><p>Пост показывает изображение из портфолио, а не рассказывает о фото только текстом.</p></article><article><span>02</span><h3>Вопрос</h3><p>Подпись заканчивается выбором или вопросом, на который легко ответить в комментариях.</p></article><article><span>03</span><h3>Бот</h3><p>Кнопка открывает проводник по задачам: маркетплейс, бренд, обложка, контент или идея.</p></article><article><span>04</span><h3>Mini App</h3><p>Telegram подтверждает пользователя, сервер проверяет подпись, опрос показывает маршрут.</p></article><article><span>05</span><h3>Заявка</h3><p>Собранная задача появляется в закрытой панели, а не теряется в длинной переписке.</p></article></div></div></section>
    <section class="section telegram-posts-section"><div class="wrap"><div class="section-title"><div><p class="eyebrow">Новая визуальная серия · прямо на сайте</p><h2>Сначала увидеть работу. Потом перейти в разговор.</h2></div><p>Три поста показывают не абстрактные обещания, а диапазон студии: визуальный манифест, fashion‑гипотезу и последовательность кадров для beauty.</p></div><div class="telegram-post-grid"><article><div class="telegram-post-image"><img src="./assets/telegram-posts/channel-manifest-v2.png" alt="Визуальный манифест WISE FRAME с примерами fashion, beauty и предметной подачи" loading="lazy"></div><div class="telegram-post-copy"><span>Новая серия · 07.08.2026</span><h3>Не говорить о фото. Показывать.</h3><p>Манифест канала: товар, фактура, человек и среда складываются в последовательную визуальную систему.</p><a class="button accent" href="https://t.me/PM_path_to_dreams" target="_blank" rel="noopener noreferrer">Открыть канал</a></div></article><article><div class="telegram-post-image"><img src="./assets/telegram-posts/fashion-first-frame-v2.png" alt="Два варианта первого fashion-кадра для одного товара" loading="lazy"></div><div class="telegram-post-copy"><span>Fashion · гипотеза</span><h3>Один свитер. Две подачи.</h3><p>Светлый каталожный кадр и контрастная редакционная сцена решают разные задачи. Победителя определяют цифры теста.</p><a class="button secondary" href="https://t.me/PM_path_to_dreams" target="_blank" rel="noopener noreferrer">Смотреть серию</a></div></article><article><div class="telegram-post-image"><img src="./assets/telegram-posts/beauty-funnel-v2.png" alt="Последовательность beauty-кадров: фактура, применение и образ" loading="lazy"></div><div class="telegram-post-copy"><span>Beauty · система кадров</span><h3>Красота привлекает. Серия объясняет.</h3><p>Фактура продукта, понятное применение и эмоциональный образ работают как одна воронка — без ложного «до/после».</p><a class="button secondary" href="https://t.me/PM_path_to_dreams" target="_blank" rel="noopener noreferrer">Перейти в канал</a></div></article></div></div></section>
    <section class="section"><div class="wrap telegram-split"><article><p class="eyebrow">Канал с работами и новыми сериями</p><h2>@PM_path_to_dreams</h2><p>Основная вещательная лента студии: новые визуалы, ранние работы, разбор логики кадра и вопросы к аудитории.</p><a class="button accent" href="https://t.me/PM_path_to_dreams" target="_blank" rel="noopener noreferrer">Открыть канал</a></article><article class="archive-card"><p class="eyebrow">Комментарии к публикациям</p><h2>@WB_AI_CROCHET</h2><p>Связанное обсуждение, куда можно прийти из поста канала и ответить. Это не основная лента работ.</p><a class="button secondary" href="https://t.me/WB_AI_CROCHET" target="_blank" rel="noopener noreferrer">Открыть обсуждение</a></article></div></section>
    <section class="section compact"><div class="wrap notice"><strong>Честный статус подключения</strong><p>Публичный предпросмотр Mini App уже использует общий опрос. Живой запуск внутри Telegram требует реального бота, публичного HTTPS-адреса и серверной проверки данных запуска. Пока любой из этих пунктов не проверен, сайт прямо показывает резервный путь через обычную диагностику.</p></div></section>
  </div>`;
}

async function initTelegramPage() {
  const title = document.querySelector("#bot-state-title");
  const copy = document.querySelector("#bot-state-copy");
  const action = document.querySelector("#bot-state-action");
  try {
    const config = STATIC_PAGES
      ? { botUsername: "WiseFrameOlegBot", miniAppLive: false }
      : await fetch("/api/public/config").then(response => response.json());
    if (config.botUsername) {
      title.textContent = `@${config.botUsername}`;
      copy.textContent = config.miniAppLive ? "Бот и Mini App подключены к публичному HTTPS." : "Бот указан, но Mini App ещё не подтверждён на публичном HTTPS.";
      action.href = `https://t.me/${config.botUsername}`;
      action.target = "_blank";
      action.rel = "noopener noreferrer";
      action.textContent = "Открыть бота";
    } else {
      title.textContent = "Пока доступен путь через сайт";
      copy.textContent = "BotFather-токен и публичный HTTPS ещё не подтверждены. Диагностика полностью работает в браузере.";
    }
  } catch {
    title.textContent = "Статус временно недоступен";
    copy.textContent = "Опрос на сайте остаётся рабочим резервным маршрутом.";
  }
}

function adminPage() {
  return `<div class="page"><section class="page-head" data-code="A"><div class="wrap"><p class="eyebrow">WISE / FRAME · для владельца</p><h1>Поток заявок и маршрутов</h1><p>Панель не показывает секреты и не доступна без токена. В локальном режиме тестовый токен указан в README.</p></div></section><section class="admin-wrap"><div class="wrap"><div class="admin-login" id="admin-login"><h2>Вход</h2><form id="admin-form"><input type="password" name="token" autocomplete="current-password" placeholder="Токен администратора" required><button class="button" type="submit">Открыть</button></form><p class="admin-help">Токен хранится только в текущей вкладке браузера.</p><div class="form-message" id="admin-message"></div></div><div id="admin-content" hidden><div class="admin-tools"><div><b id="submission-count">0 заявок</b><small id="admin-mode"></small></div><button class="button secondary small" id="export-csv">Скачать CSV</button></div><div class="submission-list" id="submission-list"></div></div></div></section></div>`;
}

function publicAdminPage() {
  return `<div class="page"><section class="page-head" data-code="SAFE"><div class="wrap"><p class="eyebrow">Публичная версия</p><h1>Панель заявок не публикуется</h1><p>GitHub Pages показывает портфолио, калькулятор, диагностику и предпросмотр Mini App. Контакты посетителей здесь не отправляются и закрытая панель владельца не раскрывается.</p><a class="button accent" href="#/quiz">Открыть безопасную диагностику</a></div></section></div>`;
}

function initAdmin() {
  const form = document.querySelector("#admin-form");
  const saved = sessionStorage.getItem("marketplace-admin-token");
  if (saved) loadSubmissions(saved);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const token = new FormData(form).get("token");
    sessionStorage.setItem("marketplace-admin-token", token);
    loadSubmissions(token);
  });
  document.querySelector("#export-csv").addEventListener("click", () => exportCsv(sessionStorage.getItem("marketplace-admin-token")));
}

async function loadSubmissions(token) {
  const message = document.querySelector("#admin-message");
  try {
    const response = await fetch("/api/admin/submissions", { headers: { authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    document.querySelector("#admin-login").hidden = true;
    document.querySelector("#admin-content").hidden = false;
    document.querySelector("#submission-count").textContent = `${data.records.length} ${plural(data.records.length, "заявка", "заявки", "заявок")}`;
    document.querySelector("#admin-mode").textContent = data.mode === "local-preview" ? " · локальный предпросмотр" : " · защищённый режим";
    const list = document.querySelector("#submission-list");
    list.innerHTML = data.records.length ? data.records.map(submissionHtml).join("") : `<div class="notice"><strong>Заявок пока нет</strong><p>Пройдите опрос, чтобы проверить полный путь.</p></div>`;
    list.querySelectorAll("select[data-id]").forEach(select => select.addEventListener("change", () => updateSubmissionStatus(select.dataset.id, select.value, token)));
  } catch (error) { message.textContent = error.message; }
}

function submissionHtml(record) {
  const statuses = { new: "Новая", contacted: "Связались", qualified: "Подтверждена", closed: "Закрыта" };
  return `<article class="submission"><div class="submission-head"><div><small>${escapeHtml(new Date(record.createdAt).toLocaleString("ru-RU"))} · ${escapeHtml(record.source)}</small><h3>${escapeHtml(record.routeTitle)}</h3></div><select class="status-select" data-id="${escapeHtml(record.id)}" aria-label="Статус заявки">${Object.entries(statuses).map(([value,label]) => `<option value="${value}" ${record.status === value ? "selected" : ""}>${label}</option>`).join("")}</select></div><dl><div><dt>Имя</dt><dd>${escapeHtml(record.name)}</dd></div><div><dt>Контакт</dt><dd>${escapeHtml(record.contact)}</dd></div><div><dt>Маркетплейс</dt><dd>${escapeHtml(record.marketplace)}</dd></div><div><dt>Данные</dt><dd>${escapeHtml(record.measurementAge)}</dd></div><div><dt>Товар</dt><dd>${record.productUrl ? `<a href="${safeUrl(record.productUrl)}" target="_blank" rel="noopener noreferrer">Открыть ссылку</a>` : "не указан"}</dd></div><div><dt>Telegram ID</dt><dd>${escapeHtml(record.telegramUserId || "нет")}</dd></div><div><dt>Комментарий</dt><dd>${escapeHtml(record.comment || "—")}</dd></div><div><dt>ID</dt><dd>${escapeHtml(record.id.slice(0, 8))}</dd></div></dl></article>`;
}

async function updateSubmissionStatus(id, status, token) {
  await fetch(`/api/admin/submissions/${encodeURIComponent(id)}/status`, { method: "PATCH", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
}

async function exportCsv(token) {
  const response = await fetch("/api/admin/submissions.csv", { headers: { authorization: `Bearer ${token}` } });
  if (!response.ok) return;
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "submissions.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function privacyPage() { return legalPage("Конфиденциальность", `<p>Публичная версия GitHub Pages рассчитывает диагностический маршрут прямо в браузере. Имя, контакт, ссылка на товар и ответы формы не отправляются на сервер и не сохраняются владельцем сайта.</p><h2>Локальные данные</h2><p>Кабинет продвижения сохраняет отмеченные задачи и статусы только в <code>localStorage</code> текущего устройства. Очистить их можно средствами браузера.</p><h2>Telegram</h2><p>Предпросмотр Mini App на GitHub Pages не подтверждает Telegram‑личность, не принимает оплату и не выдаёт платный доступ.</p>`); }
function termsPage() { return legalPage("Условия использования", `<p>Сервис выдаёт рекомендацию маршрута работы с визуалом и не гарантирует CTR, позицию, рекламную ставку, конверсию или продажи.</p><h2>Архивные данные</h2><p>Старые скриншоты используются только для объяснения метода сравнительного теста. Дата измерений и подписи части колонок не подтверждены.</p><h2>Оплата</h2><p>Оплата и платный доступ в публичной версии отключены. Любые договорённости оформляются отдельно после ручного согласования.</p><h2>Права</h2><p>Фотографии, лица, бренды и отзывы публикуются только при наличии разрешённого материала.</p>`); }
function supportPage() { return `<div class="page"><section class="page-head" data-code="@"><div class="wrap"><p class="eyebrow">Прямой контакт · после диагностики</p><h1>Обсудить задачу с Олегом</h1><p>Пройдите опрос и отправьте Олегу получившийся маршрут или ссылку на товар — публичная версия сама контакты не пересылает.</p></div></section><section class="section reveal"><div class="wrap contact-card"><div><p class="eyebrow">WISE / FRAME · Telegram</p><h2>@wise_video</h2><p>Канал @PM_path_to_dreams показывает работы и новые визуальные серии. Связанный @WB_AI_CROCHET используется только для комментариев к публикациям.</p></div><div class="hero-actions"><a class="button accent" href="https://t.me/wise_video" target="_blank" rel="noopener noreferrer">Написать</a><a class="button secondary" href="https://t.me/PM_path_to_dreams" target="_blank" rel="noopener noreferrer">Открыть канал</a><a class="button secondary" href="https://t.me/WB_AI_CROCHET" target="_blank" rel="noopener noreferrer">Обсуждение</a></div></div></section></div>`; }
function legalPage(title, content) { return `<div class="page"><section class="page-head" data-code="DOC"><div class="wrap"><p class="eyebrow">Публичная портфолио‑версия</p><h1>${title}</h1><p>Версия от 08.08.2026. Оплата, серверная авторизация и автоматическая передача заявок здесь отключены.</p></div></section><section class="section"><article class="wrap legal">${content}</article></section></div>`; }
function notFoundPage() { return `<div class="page"><section class="page-head"><div class="wrap"><p class="eyebrow">404</p><h1>Такой страницы нет</h1><p><a class="button" href="#/">Вернуться на главную</a></p></div></section></div>`; }

function initReveal() {
  const items = [...document.querySelectorAll(".reveal")];
  if (!items.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    items.forEach(item => item.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: "0px 0px -5%" });
  items.forEach(item => observer.observe(item));
}

function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
function safeUrl(value) { try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? escapeHtml(url.href) : "#"; } catch { return "#"; } }
function plural(number, one, few, many) { const mod10 = number % 10, mod100 = number % 100; return mod10 === 1 && mod100 !== 11 ? one : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14) ? few : many; }

render();
