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

Адаптивна лендінг-сторінка квіткового магазину. Написана на чистому HTML, CSS та JavaScript без фреймворків і збирачів.

**Макет у Figma:** [Flora — Figma](https://www.figma.com/design/2Tj16H7IO7dq1ViTvIh57V/Flora?node-id=5999-10563&t=QFMZTKIsQg1Qf6jO-1)

## Можливості

- **Адаптивна верстка** — mobile-first підхід, брейкпоінти на 768 px і 1440 px
- **Мобільна навігація** — меню на базі `<details>` з popover-оверлеєм і підтримкою клавіші `Escape`
- **Каталог товарів** — секція бестселерів і повна сітка букетів
- **Модалка товару** — клік на картку відкриває `<dialog>` із зображенням, назвою, ціною, описом, лічильником кількості та кнопкою «Купити»
- **Модалка замовлення** — відкривається з модалки товару; форма з полями імені, телефону, адреси та повідомлення
- **Анімації входу** — переходи через `@starting-style` на обох діалогах без JS
- **Закриття по backdrop** — mousedown + click guard не дає випадково закрити модалку при виділенні тексту
- **Делегування подій** — один слухач на рівні document для карток і кнопок закриття; масштабується під динамічний контент
- **Доступна розмітка** — `aria-modal`, `aria-labelledby`, `aria-label`, `role="group"` на інтерактивних елементах
- **SVG-спрайт** — всі іконки з одного `sprite.svg` через `<use>`
- **Web App Manifest + фавіконки** — повний набір включно з Apple Touch Icon

## Стек

| Шар | Технологія |
|---|---|
| Розмітка | HTML5 семантичні елементи (`<dialog>`, `<details>`, `<address>`) |
| Стилі | Vanilla CSS, CSS custom properties, `@starting-style`, `@media` |
| Скрипти | Vanilla JS ES modules (`import` / `export`) |
| Шрифти | Google Fonts — Hanuman, Roboto |
| Нормалізація | modern-normalize 3.x |
| Анімації | AOS (Animate On Scroll) |

## Структура проекту

```
flora/
├── index.html
├── favicon.svg
├── site.webmanifest
├── icons/
│   ├── sprite.svg          # SVG-спрайт іконок
│   └── *.svg               # Вихідні іконки
├── images/                 # Фото товарів і секцій
├── styles/
│   ├── reset.css           # Скидання box-sizing та базових елементів
│   ├── fonts.css           # Оголошення @font-face
│   ├── colors.css          # CSS custom properties (дизайн-токени)
│   ├── styles.css          # Основні стилі розкладки й компонентів
│   └── modal.css           # Стилі діалогів/модалок
└── js/
    ├── main.js             # Точка входу — меню, модалки, делегування подій
    └── modal.js            # Утиліти openModal / closeModal
```

## Архітектура модалок

Обидві модалки використовують нативний HTML-елемент `<dialog>` з `.showModal()` / `.close()`.

- **Без класу `is-open`** — стан відкриття керується атрибутом `[open]` Dialog API
- **Backdrop** — рендериться через `dialog::backdrop`, стилізується тільки CSS
- **Блокування скролу** — `html:has(dialog[open]) { overflow: hidden }`, JS не потрібен
- **Тригери закриття** — атрибут `data-close-modal="<id>"` на будь-якій кнопці; обробляється одним делегованим слухачем

## Оптимізація ресурсів

| Тип | Інструмент |
|---|---|
| Растрові зображення (поштучно) | [Squoosh](https://squoosh.app/) |
| Растрові зображення (пакетна обробка) | [ImageMagick](https://imagemagick.org/) |
| SVG-іконки | [SVG Viewer](https://www.svgviewer.dev/) |

## Запуск

Збірка не потрібна. Відкрий `index.html` через будь-який статичний сервер:

```bash
npx serve .
# або
python -m http.server
```

> **Увага:** ES-модулі потребують HTTP/HTTPS сервера — протокол `file://` заблокує завантаження модулів у більшості браузерів. GitHub Pages роздає файли через HTTPS, тому деплой на Pages працює без будь-яких змін у коді.
