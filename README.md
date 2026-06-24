![Flora preview](prew_banner.avif)

# Flora — Квітковий магазин

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-222?style=flat&logo=github&logoColor=white)](https://codenoob53.github.io/1_hw_flora/)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![ES Modules](https://img.shields.io/badge/ES%20Modules-%E2%9C%93-brightgreen?style=flat)
![Responsive](https://img.shields.io/badge/Responsive-Mobile%20First-blueviolet?style=flat)
![No Framework](https://img.shields.io/badge/Framework-None-lightgrey?style=flat)

Практична робота з дисципліни **«Практикум з сучасних методологій розробки ПЗ»**.

Адаптивна лендінг-сторінка квіткового магазину на чистому HTML, CSS та JavaScript (ES modules). Каталог, бестселери та відгуки завантажуються динамічно через `axios` з REST API бекенду ([umt-backend-flora](https://github.com/CodeNoob53/UMT-backend-flora)).

**Макет у Figma:** [Flora — Figma](https://www.figma.com/design/2Tj16H7IO7dq1ViTvIh57V/Flora?node-id=5999-10563&t=QFMZTKIsQg1Qf6jO-1)

## Можливості

- **Адаптивна верстка** — mobile-first підхід, брейкпоінти на 768 px і 1440 px
- **Мобільна навігація** — меню на базі `<details>` з popover-оверлеєм і підтримкою клавіші `Escape`
- **Динамічний каталог** — секції бестселерів, букетів і відгуків формуються повністю на основі даних з API (`axios` + `async/await`), без статичної HTML-розмітки; рендер через шаблонні рядки та `insertAdjacentHTML` однією вставкою
- **Skeleton-завантаження** — замість спіннера показуються shimmer-плейсхолдери реальної форми карток (CSS `background-position` анімація, compositor-only)
- **Пагінація «Show More»** — букети підвантажуються частинами (`_page` + `_per_page`); кнопка ховається в кінці колекції, показуються empty/end-повідомлення, дублів немає
- **Обробка помилок** — тост-сповіщення при мережевій помилці, retry-кнопка при провалі першого завантаження каталогу
- **Модалка товару** — клік на картку відкриває `<dialog>` із зображенням, назвою, ціною, описом, лічильником кількості та кнопкою «Купити»
- **Модалка замовлення** — відкривається з модалки товару; форма з полями імені, телефону, адреси та повідомлення, надсилається на `POST /api/orders`
- **Анімації входу** — переходи через `@starting-style` на обох діалогах без JS
- **Закриття по backdrop** — mousedown + click guard не дає випадково закрити модалку при виділенні тексту
- **Делегування подій** — один слухач на рівні document для карток і кнопок закриття; масштабується під динамічний контент
- **Доступна розмітка** — `aria-modal`, `aria-labelledby`, `aria-label`, `role="group"`, `aria-busy` на контейнерах що завантажуються
- **Зображення з Cloudinary** — фото букетів зберігаються в Cloudinary; фронтенд будує адаптивний `<picture>` з AVIF-варіантами @1x/@2x/@3x для трьох брейкпоінтів через URL-трансформації Cloudinary (`f_avif,w_N,c_fill,q_auto`)
- **SVG-спрайт** — всі іконки з одного `sprite.svg` через `<use>`; соціальні іконки використовують `currentColor` для hover-ефекту через CSS
- **Web App Manifest + фавіконки** — повний набір включно з Apple Touch Icon
- **`loading="lazy"`** — на всіх зображеннях нижче фолду; hero і about без lazy

## Стек

| Шар | Технологія |
|---|---|
| Розмітка | HTML5 семантичні елементи (`<dialog>`, `<details>`, `<address>`) |
| Стилі | Vanilla CSS, CSS custom properties, `@starting-style`, `@media` |
| Скрипти | Vanilla JS ES modules (`import` / `export`) |
| HTTP-клієнт | axios (`async/await`) |
| Збірка / dev | Vite |
| API | REST API — [umt-backend-flora](https://github.com/CodeNoob53/UMT-backend-flora) на Render |
| Зображення | Cloudinary (CDN + URL-трансформації для AVIF retina) |
| Шрифти | Локальні woff2 — Hanuman, Roboto (без запитів до Google Fonts) |
| Нормалізація | modern-normalize 3.x |
| Анімації | Native `IntersectionObserver` scroll-reveal (без бібліотек) |

## Структура проекту

```
flora/
├── index.html
├── vite.config.js              # Vite конфіг з dev-проксі на бекенд
├── .env                        # VITE_API_BASE_URL для prod (Render)
├── .env.development            # VITE_API_BASE_URL=/api для dev (проксі)
├── .github/workflows/
│   └── deploy.yml              # CI: збірка + деплой на GitHub Pages
├── public/
│   └── assets/                 # Іконки, шрифти, зображення (копіюються as-is)
│       ├── icons/sprite.svg
│       ├── fonts/
│       └── images/             # avif (mob/tab/pc, @1x/@2x/@3x) + fallback (локальні fallback)
├── styles/
│   ├── reset.css
│   ├── fonts.css
│   ├── colors.css
│   ├── styles.css
│   ├── modal.css
│   └── skeleton.css            # Shimmer skeleton loader
└── js/
    ├── main.js                 # Точка входу — імпортує всі модулі
    ├── apiClient.js            # Налаштований інстанс axios
    ├── catalogue.js            # Букети: рендер, пагінація, skeleton, empty/end state
    ├── bestsellers.js          # Бестселери: рендер + слайдер + skeleton
    ├── feedback.js             # Відгуки: рендер + карусель
    ├── productStore.js         # Спільний кеш товарів для модалки
    ├── forms.js                # Сабміт форми замовлення → POST /api/orders
    ├── notifications.js        # Тост-сповіщення (помилки/успіх)
    ├── utils.js                # Хелпери: escape, retina <picture>, skeleton, Cloudinary URL
    ├── menu.js                 # Мобільне меню
    ├── modal.js                # Утиліти openModal / closeModal
    └── product-modal.js        # Логіка модалки товару
```

## Архітектура модалок

Обидві модалки використовують нативний HTML-елемент `<dialog>` з `.showModal()` / `.close()`.

- **Без класу `is-open`** — стан відкриття керується атрибутом `[open]` Dialog API
- **Backdrop** — рендериться через `dialog::backdrop`, стилізується тільки CSS
- **Блокування скролу** — `html:has(dialog[open]) { overflow: hidden }`, JS не потрібен
- **Тригери закриття** — атрибут `data-close-modal="<id>"` на будь-якій кнопці; обробляється одним делегованим слухачем; додатково — клік по backdrop (mousedown + click guard)
- **Валідація форми** — нативна HTML5-валідація у формі замовлення (`required`, `type="tel"`, `type="email"`)

## Зображення товарів

Фото букетів — безкоштовні знімки з [Unsplash](https://unsplash.com/s/photos/flower-bouquet) (ліцензія Unsplash: вільне використання, без атрибуції). Завантажені через адмін-панель бекенду на Cloudinary.

Фронтенд будує `<picture>` з трьома `<source>` (mob 335 px, tab 340 px, pc 405 px) і srcset @1x/@2x/@3x через Cloudinary URL-трансформації:
```
https://res.cloudinary.com/<cloud>/image/upload/f_avif,w_670,c_fill,q_auto/v.../bouquet.jpg
```
Якщо `photoURL` відсутній — використовуються локальні AVIF-файли з `public/assets/images/`.

## Запуск локально

Потрібен Node.js 20+. Бекенд має бути запущений локально (або використовується Render URL).

```bash
# 1. встановити залежності
npm install

# 2. запустити фронтенд
npm run dev
```

Vite проксіює `/api/*` на `http://localhost:3000` (локальний бекенд). Для роботи з Render-бекендом без локального сервера — змінити `VITE_API_BASE_URL` у `.env.development` на Render URL.

### Збірка та деплой

```bash
npm run build      # продакшн-збірка у dist/
npm run preview    # локальний перегляд зібраного
```

Деплой автоматизований через `.github/workflows/deploy.yml` (push у `main`). CI збирає проект із `VITE_API_BASE_URL` що вказує на Render.
