# ⚡ راهنمای سریع Neon Database

## 🎯 3 مرحله ساده

### 1️⃣ دریافت Connection String

1. به [Neon Console](https://console.neon.tech) بروید
2. پروژه را انتخاب کنید
3. **"Connection Details"** را باز کنید
4. Connection String را کپی کنید

```
postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

---

### 2️⃣ اجرای Schema

1. در Neon Console، به **"SQL Editor"** بروید
2. فایل `backend/src/database/schema.postgresql.sql` را باز کنید
3. **تمام محتوا** را کپی کنید
4. در SQL Editor پیست کنید
5. **"Run"** بزنید

✅ اگر موفق بود، 5 جدول ایجاد شد:
- `users`
- `refresh_tokens`
- `creditors`
- `customers`
- `receipt_records`

---

### 3️⃣ بررسی

در SQL Editor این Query را اجرا کنید:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

باید 5 جدول را ببینید.

---

## ✅ تمام!

حالا Connection String را برای Render آماده دارید.

---

## 📝 نکات

- Connection String را حتماً کپی کنید (برای Render نیاز دارید)
- Schema را فقط یک بار اجرا کنید
- اگر خطای "already exists" دیدید، مشکلی نیست

