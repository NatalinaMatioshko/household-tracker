# Household Tracker

Особистий трекер засобів гігієни та догляду. Допомагає фіксувати покупки, ціни й дату закінчення засобу.

Проєкт створений з власної потреби — зручно вести облік домашніх засобів і розуміти, коли що закінчується та скільки коштує повторна покупка.

Дані зберігаються в **PostgreSQL** для кожного користувача (Auth.js + Prisma). Статичний GitHub Pages більше не є основним способом деплою.

## Можливості

- Реєстрація / вхід (email + пароль)
- Додавання засобу: назва, категорія, дата покупки, ціна, кількість, примітка
- Категорії MVP: **Гігієна**, **Догляд**
- Історія покупок і повторні закупівлі
- Дата закінчення засобу (кастомний календар uk-UA)
- Згортані картки, зручні для мобільного
- Редагування / видалення засобів і покупок
- Ізоляція даних між користувачами (`Product.userId`)

## Стек

- [Next.js](https://nextjs.org) 16 (App Router, Node runtime)
- React 19
- TypeScript
- Tailwind CSS 4
- [Prisma](https://www.prisma.io) 6 + PostgreSQL
- [Auth.js](https://authjs.dev) (`next-auth` v5) — JWT, email/password
- Zod

## Налаштування

1. Скопіюй `.env.example` → `.env` і заповни значення.

```bash
cp .env.example .env
```

Потрібні змінні:

| Змінна | Призначення |
|--------|-------------|
| `DATABASE_URL` | PostgreSQL (для Supabase — Session pooler + `sslmode=require`) |
| `AUTH_SECRET` | Секрет сесій Auth.js (`openssl rand -base64 32`) |
| `AUTH_URL` | Опційно в локалі; обовʼязково на проді (публічний URL застосунку) |

2. Встанови залежності, згенеруй клієнт Prisma і застосуй міграції:

```bash
npm install
npm run db:generate
npm run db:migrate
```

3. Запусти dev-сервер:

```bash
npm run dev
```

Відкрий [http://localhost:3000](http://localhost:3000). Гості перенаправляються на `/login`.

Інші команди:

```bash
npm run build      # production build (потрібен Node host, не static export)
npm run start      # запуск зібраного застосунку
npm run lint
npm run db:studio  # Prisma Studio
```

## Деплой

Потрібен **Node.js host** (Vercel, Railway, Fly.io, VPS тощо): Auth.js cookies + Prisma не працюють як чистий static export на GitHub Pages.

Типовий чекліст:

1. Створи PostgreSQL (наприклад Supabase) і вкажи `DATABASE_URL`
2. Вистав `AUTH_SECRET` і `AUTH_URL` (HTTPS URL продакшену)
3. Запусти `prisma migrate deploy` на середовищі (або під час CI/CD)
4. Збери й запусти: `npm run build` → `npm run start` (або платформенний Next.js adapter)

Workflow `.github/workflows/deploy-pages.yml` залишено лише для ручного `workflow_dispatch` і **не** є основним шляхом деплою.

## Структура (коротко)

```
app/
  page.tsx                 # SSR: getProducts → HouseholdTracker
  HouseholdTracker.tsx     # UI + Server Actions
  actions/                 # auth, products, purchases
  components/              # форми, картки, модалки, DatePicker
  login/ register/
lib/
  auth.ts prisma.ts session.ts validators.ts mapProduct.ts
prisma/
  schema.prisma
proxy.ts                   # захист маршрутів (Auth.js)
```

## Примітки

- Інтерфейс українською, оптимізований під мобільне користування
- Старі дані з `localStorage` (`householdProducts`) можна **одноразово** імпортувати на захищеній сторінці [`/import`](/import): вставте JSON → перегляд лічильників → імпорт у поточний акаунт
- MVP без фото, бренду, магазину та кольору акценту (ці поля в імпорті ігноруються)
