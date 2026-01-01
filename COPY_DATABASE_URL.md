# 📋 راهنمای کپی کردن DATABASE_URL از Neon

## 🎯 از تصویر شما

در Neon Console، Connection String شما این است:

```
postgresql://neondb_owner:****************@ep-mute-cell-a5sopkbp-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## 📝 مراحل کپی کردن

### قدم 1: نمایش Password

1. در Modal "Connect to your database"
2. روی دکمه **"Show password"** (با آیکون چشم) کلیک کنید
3. Password نمایش داده می‌شود

### قدم 2: کپی کردن Connection String

**روش 1: استفاده از دکمه Copy**
- روی دکمه **"Copy snippet"** کلیک کنید
- Connection String کامل کپی می‌شود

**روش 2: کپی دستی**
- تمام متن در تب `.env` را انتخاب کنید
- کپی کنید (Ctrl+C)

### قدم 3: استفاده در Local

در فایل `backend/.env`:

```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-mute-cell-a5sopkbp-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

⚠️ **مهم:** `YOUR_PASSWORD` را با password واقعی جایگزین کنید!

### قدم 4: استفاده در Render

در Render Dashboard:
1. به **Environment Variables** بروید
2. **Key:** `DATABASE_URL`
3. **Value:** Connection String کامل (با password)
4. **Save** کنید

---

## ✅ بعد از کپی

حالا می‌توانید تست کنید:

```bash
cd backend
npm run test:connection
```

