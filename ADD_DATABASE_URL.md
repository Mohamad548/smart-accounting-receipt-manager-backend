# 🔧 اضافه کردن DATABASE_URL به .env

## 📝 مشکل

خطای `DATABASE_URL environment variable is not set` یعنی که `DATABASE_URL` در فایل `.env` تنظیم نشده است.

## ✅ راه حل

### قدم 1: باز کردن فایل `.env`

فایل `backend/.env` را در ویرایشگر باز کنید.

### قدم 2: اضافه کردن DATABASE_URL

Connection String را از Neon کپی کنید و در فایل `.env` اضافه کنید:

```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-mute-cell-a5sopkbp-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

⚠️ **مهم:** `YOUR_PASSWORD` را با password واقعی از Neon جایگزین کنید!

### قدم 3: محتوای کامل فایل `.env`

فایل `.env` باید این محتوا را داشته باشد:

```env
# Database
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-mute-cell-a5sopkbp-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Server
PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000

# JWT Secrets (تولید کنید با: openssl rand -hex 32)
JWT_SECRET=change-this-to-random-32-chars-minimum
JWT_REFRESH_SECRET=change-this-to-random-32-chars-minimum

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```

### قدم 4: تست دوباره

بعد از ذخیره فایل `.env`:

```bash
npm run test:connection
```

---

## 📋 نحوه کپی کردن از Neon

1. در Neon Console، Modal "Connect to your database" را باز کنید
2. روی **"Show password"** کلیک کنید
3. روی **"Copy snippet"** کلیک کنید
4. Connection String را در فایل `.env` پیست کنید

---

## ⚠️ نکات مهم

- فایل `.env` باید در دایرکتوری `backend` باشد
- `DATABASE_URL` باید در یک خط باشد (بدون خط جدید)
- Password را از Neon کپی کنید (با Show password)

