# Household Tracker

Особистий трекер засобів гігієни, догляду та побутової хімії. Допомагає фіксувати покупки, ціни, бренди, місце купівлі та дату закінчення засобу.

Проєкт створений з власної потреби в такому застосунку — щоб зручно вести облік домашніх засобів і розуміти, коли що закінчується і скільки коштує повторна покупка.

Дані зберігаються локально в браузері (`localStorage`) — бекенд не потрібен.

## Можливості

- Додавання засобу: назва, категорія, бренд, фото, дата покупки, ціна, кількість, де куплено, примітка
- Категорії: Гігієна, Догляд, Побутова хімія, Прання, Кухня, Інше
- Історія покупок і повторні закупівлі
- Дата закінчення засобу (кастомний календар uk-UA)
- Згортані картки товарів, зручні для мобільного
- Редагування / видалення засобів і покупок
- Завантаження фото з комп’ютера (стискається перед збереженням)

## Стек

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

## Запуск

```bash
npm install
npm run dev
```

Відкрий [http://localhost:3000](http://localhost:3000).

Інші команди:

```bash
npm run build   # static export у папку out/
npm run lint    # ESLint
```

## GitHub Pages

Сайт: [https://natalinamatioshko.github.io/household-tracker/](https://natalinamatioshko.github.io/household-tracker/)

Після кожного пушу в `main` GitHub Actions збирає static export і викладає його на гілку `gh-pages`.

**Один раз у Settings → Pages:**

1. Source: **Deploy from a branch**
2. Branch: **`gh-pages`** / folder **`/(root)`**
3. Save

Не залишай Source = `main` / root — тоді GitHub показує README через Jekyll замість застосунку.
## Структура

```
app/
  HouseholdTracker.tsx   # головна композиція
  page.tsx
  layout.tsx
  globals.css
  components/
    AddProductForm.tsx
    ProductCard.tsx
    DatePicker.tsx
    EditProductModal.tsx
    EditPurchaseModal.tsx
    ImageUploadField.tsx
    Modal.tsx
    useProducts.ts       # стан + localStorage
    types.ts
    imageUtils.ts
```

## Примітки

- Усі дані лишаються в поточному браузері; очищення сайту / іншого профілю їх видалить
- Інтерфейс українською, оптимізований під мобільне користування
- Для локальної розробки `basePath` не використовується; для GitHub Pages у CI виставляється `GITHUB_PAGES=true`