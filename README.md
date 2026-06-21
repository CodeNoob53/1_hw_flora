![Flora preview](prew_banner.avif)

# 🌸 Flora — Квітковий магазин

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-222?style=flat&logo=github&logoColor=white)](https://codenoob53.github.io/1_hw_flora/)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![ES Modules](https://img.shields.io/badge/ES%20Modules-✓-brightgreen?style=flat)
![Responsive](https://img.shields.io/badge/Responsive-Mobile%20First-blueviolet?style=flat)
![No Framework](https://img.shields.io/badge/Framework-None-lightgrey?style=flat)

Практична робота з дисципліни **«Практикум з сучасних методологій розробки ПЗ»**.

Адаптивна лендінг-сторінка квіткового магазину на чистому HTML, CSS та JavaScript (ES modules). Каталог, бестселери та відгуки завантажуються динамічно через `axios` з локального `json-server` (для деплою на GitHub Pages дані віддаються як статичні JSON-файли, які генерує Vite зі спільного `db.json`).

**Макет у Figma:** [Flora — Figma](https://www.figma.com/design/2Tj16H7IO7dq1ViTvIh57V/Flora?node-id=5999-10563&t=QFMZTKIsQg1Qf6jO-1)

## Можливості

- **Адаптивна верстка** — mobile-first підхід, брейкпоінти на 768 px і 1440 px
- **Мобільна навігація** — меню на базі `<details>` з popover-оверлеєм і підтримкою клавіші `Escape`
- **Динамічний каталог** — секції бестселерів, букетів і відгуків формуються повністю на основі даних з API (`axios` + `async/await`), без статичної HTML-розмітки; рендер через шаблонні рядки та `insertAdjacentHTML` однією вставкою
- **Пагінація «Show More»** — букети підвантажуються частинами (`_page` + `_per_page`); кнопка ховається в кінці колекції, показується empty/end-повідомлення, дублів немає, стан застосунку зберігається в одному об'єкті
- **Обробка завантаження та помилок** — лоадер під час запиту, тост-сповіщення при помилці, коректний розбір структури відповіді json-server (`{ data, pages, items }`) і статичного масиву
- **Модалка товару** — клік на картку відкриває `<dialog>` із зображенням, назвою, ціною, описом, лічильником кількості та кнопкою «Купити»
- **Модалка замовлення** — відкривається з модалки товару; форма з полями імені, телефону, адреси, повідомлення та кастомним SVG-чекбоксом згоди (нативний `input` прихований)
- **Форма підписки у футері** — семантична розмітка з `label`, описовим `name`, `type="submit"`, валідацією email
- **Анімації входу** — переходи через `@starting-style` на обох діалогах без JS
- **Закриття по backdrop** — mousedown + click guard не дає випадково закрити модалку при виділенні тексту
- **Делегування подій** — один слухач на рівні document для карток і кнопок закриття; масштабується під динамічний контент
- **Доступна розмітка** — `aria-modal`, `aria-labelledby`, `aria-label`, `role="group"` на інтерактивних елементах
- **SVG-спрайт** — всі іконки з одного `sprite.svg` через `<use>`; соціальні іконки використовують `currentColor` для hover-ефекту через CSS
- **Web App Manifest + фавіконки** — повний набір включно з Apple Touch Icon
- **Паралельне завантаження CSS** — `@import` замінено на окремі `<link>` в HTML, всі стилі завантажуються одночасно замість послідовного ланцюжка
- **`loading="lazy"`** — на всіх зображеннях нижче фолду (картки, контакти); hero і about без lazy
- **Hero-фон на повну ширину** — окремий шар `.hero-bg` поза контейнером; два набори зображень (mob 768 px / pc 1440 px), планшет використовує pc-пакет; дизайнер не передбачив адаптивну версію hero-фону, тому мобільний asset підготовлений самостійно щоб виконати ТЗ і зберегти оригінальний вигляд дизайну; альтернативою було одне зображення для всіх брейкпоінтів, але завантаження pc-версії на мобільному пристрої суттєво б вплинуло на FCP і показники PageSpeed

## Стек

| Шар | Технологія |
|---|---|
| Розмітка | HTML5 семантичні елементи (`<dialog>`, `<details>`, `<address>`) |
| Стилі | Vanilla CSS, CSS custom properties, `@starting-style`, `@media` |
| Скрипти | Vanilla JS ES modules (`import` / `export`) |
| HTTP-клієнт | axios (`async/await`) |
| Збірка / dev | Vite |
| Mock API | json-server (`db.json`) + статичні `dist/api/*.json` для GitHub Pages |
| Шрифти | Локальні woff2 — Hanuman, Roboto (без запитів до Google Fonts) |
| Нормалізація | modern-normalize 3.x |
| Анімації | AOS (Animate On Scroll) |

## Структура проекту

```
flora/
├── index.html
├── db.json                 # Єдине джерело даних для json-server / static API
├── vite.config.js          # Vite + плагін, що емітить dist/api/*.json
├── .env.example            # Приклад змінних оточення (VITE_API_BASE_URL)
├── .github/workflows/
│   └── deploy.yml          # CI: збірка в static-режимі + деплой на Pages
├── public/
│   └── assets/             # Іконки, шрифти, зображення (копіюються as-is)
│       ├── icons/sprite.svg
│       ├── fonts/
│       └── images/         # avif (mob/tab/pc, @1x/@2x/@3x) + fallback + original
├── styles/
│   ├── reset.css
│   ├── fonts.css
│   ├── colors.css
│   ├── styles.css
│   └── modal.css
└── js/
    ├── main.js             # Точка входу — імпортує всі модулі
    ├── apiClient.js        # Налаштований інстанс axios (+ static-режим)
    ├── catalogue.js        # Букети: рендер, пагінація, empty/end state, стан
    ├── bestsellers.js      # Бестселери: рендер + слайдер
    ├── feedback.js         # Відгуки: рендер + карусель
    ├── productStore.js     # Спільний кеш товарів для модалки
    ├── forms.js            # Сабміт форм замовлення/підписки
    ├── notifications.js    # Тост-сповіщення (помилки/успіх)
    ├── utils.js            # Хелпери: помилки, escape, retina <picture>
    ├── menu.js             # Мобільне меню
    ├── modal.js            # Утиліти openModal / closeModal
    └── product-modal.js    # Логіка модалки товару
```

## Архітектура модалок

Обидві модалки використовують нативний HTML-елемент `<dialog>` з `.showModal()` / `.close()`.

- **Без класу `is-open`** — стан відкриття керується атрибутом `[open]` Dialog API
- **Backdrop** — рендериться через `dialog::backdrop`, стилізується тільки CSS
- **Блокування скролу** — `html:has(dialog[open]) { overflow: hidden }`, JS не потрібен
- **Тригери закриття** — атрибут `data-close-modal="<id>"` на будь-якій кнопці; обробляється одним делегованим слухачем; додатково — клік по backdrop (mousedown+click guard)
- **Кастомний чекбокс** — у формі замовлення нативний `input[type=checkbox]` прихований (`.visually-hidden`), видимий стан малюється через SVG-спрайт `#icon-check` з переходами `250ms cubic-bezier(0.4, 0, 0.2, 1)`

## Оптимізація ресурсів

| Тип | Інструмент |
|---|---|
| Растрові зображення (поштучно) | [Squoosh](https://squoosh.app/) |
| Растрові зображення (пакетна обробка) | [ImageMagick](https://imagemagick.org/) |
| SVG-іконки | [SVG Viewer](https://www.svgviewer.dev/) |
| Шрифти TTF → WOFF2 | [Transfonter](https://transfonter.org/) |
| Фавіконки | [favicon.io](https://favicon.io/) |

## Запуск локально

Потрібен Node.js 18+. Каталог тягне дані з `json-server`, тому запускаються **два процеси** — мок-API та dev-сервер Vite.

```bash
# 1. встановити залежності
npm install

# 2. створити .env з прикладу (один раз)
cp .env.example .env

# 3. термінал A — підняти mock API на http://127.0.0.1:3001
npm run api

# 4. термінал B — підняти фронтенд на http://localhost:5173
npm run dev
```

Vite проксіює `/api/*` на `json-server`, тому в браузері все працює з одного origin.

### Дані (`db.json`)

Усі товари та відгуки лежать у `db.json` (31 букет, 10 відгуків). Це єдине джерело даних: `json-server` віддає його локально, а збірка для GitHub Pages розкладає кожну колекцію в окремий статичний файл (`dist/api/products.json`, `dist/api/feedbacks.json`).

**Джерело зображень.** Фото букетів — це безкоштовні знімки з [Unsplash](https://unsplash.com/s/photos/flower-bouquet) (ліцензія Unsplash: вільне використання, без атрибуції). Кожне фото стягнуто один раз і локально оброблено через ImageMagick у retina-набір: `mob` (335×320), `tab` (340×320), `pc` (405×320), кожен у `@1x/@2x/@3x` AVIF (якість 82/75/70%) + JPEG-fallback + повнорозмірний original для модалки. У рантаймі зовнішніх запитів до Unsplash немає — усе лежить у `public/assets/images/`. Назви та описи товарів складені вручну під реальний вміст кожного знімка.

### Збірка та деплой

```bash
npm run build      # продакшн-збірка у dist/
npm run preview    # локальний перегляд зібраного
```

GitHub Pages не може запускати `json-server`, тому в CI збірка йде з `VITE_API_MODE=static`: Vite емітить `dist/api/*.json` із `db.json`, а axios-клієнт у статичному режимі переписує запити `/products` → `/products.json`. Деплой автоматизований через `.github/workflows/deploy.yml` (push у `main`).
