# 🔐 راهنمای تنظیم Environment Variables

## 📋 دو حالت تنظیم

### 1️⃣ Local Development (فایل `.env`)

### 2️⃣ Production (Render Environment Variables)

---

## 🏠 حالت 1: Local Development

### قدم 1: ایجاد فایل `.env`

در دایرکتوری `backend`، فایل `.env` را ایجاد کنید:

```bash
cd backend
cp .env.example .env
```

یا به صورت دستی:

1. در دایرکتوری `backend` یک فایل جدید با نام `.env` ایجاد کنید
2. محتوای زیر را در آن قرار دهید

### قدم 2: پر کردن مقادیر

فایل `.env` را باز کنید و این مقادیر را پر کنید:

```env
# Database (برای Local - SQLite)
DB_PATH=./data/database.db

# یا برای تست با PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Server
PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000

# JWT Secrets (تولید کنید!)
JWT_SECRET=change-this-to-a-random-secret-key-min-32-chars
JWT_REFRESH_SECRET=change-this-to-another-random-secret-key-min-32-chars

# Gemini API
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### قدم 3: تولید JWT Secrets

**روش 1: از Terminal (Linux/Mac)**
```bash
openssl rand -hex 32
```

**روش 2: از Terminal (Windows - Git Bash)**
```bash
openssl rand -hex 32
```

**روش 3: Online Generator**
- به https://www.random.org/strings/ بروید
- 32 کاراکتر تصادفی تولید کنید

**مثال:**
```
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4
```

### قدم 4: دریافت Gemini API Key

1. به [Google AI Studio](https://aistudio.google.com/apikey) بروید
2. وارد حساب Google خود شوید
3. روی **"Create API Key"** کلیک کنید
4. API Key را کپی کنید
5. در `.env` قرار دهید:
   ```
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

---

## ☁️ حالت 2: Production (Render)

در Render، Environment Variables را از طریق Dashboard تنظیم می‌کنید (نه فایل `.env`).

### قدم 1: ورود به Render Dashboard

1. به [Render Dashboard](https://dashboard.render.com) بروید
2. Service خود را انتخاب کنید
3. به **"Environment"** بروید

### قدم 2: اضافه کردن Variables

روی **"Add Environment Variable"** کلیک کنید و این متغیرها را یکی یکی اضافه کنید:

#### ✅ متغیرهای ضروری:

| Key | Value | توضیح |
|-----|-------|-------|
| `NODE_ENV` | `production` | - |
| `PORT` | `10000` | Port پیش‌فرض Render |
| `DATABASE_URL` | `postgresql://...` | Connection String از Neon |
| `GEMINI_API_KEY` | `your_key` | API Key از Google AI Studio |
| `JWT_SECRET` | `random-32-chars` | یک رشته تصادفی قوی |
| `JWT_REFRESH_SECRET` | `random-32-chars` | یک رشته تصادفی قوی دیگر |
| `FRONTEND_URL` | `https://your-frontend.com` | آدرس frontend |

### قدم 3: دریافت DATABASE_URL از Neon

1. به [Neon Console](https://console.neon.tech) بروید
2. پروژه خود را انتخاب کنید
3. روی **"Connection Details"** یا **"Connect"** کلیک کنید
4. Connection String را کپی کنید
5. در Render، به عنوان `DATABASE_URL` اضافه کنید

**مثال:**
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### قدم 4: تولید JWT Secrets

همان روش‌های بالا را استفاده کنید (openssl یا online generator).

---

## 📝 مثال کامل فایل `.env` (Local)

```env
# ============================================
# Database
# ============================================
# برای Local Development با SQLite:
DB_PATH=./data/database.db

# یا برای تست با PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# ============================================
# Server
# ============================================
PORT=3001
NODE_ENV=development

# ============================================
# Frontend
# ============================================
FRONTEND_URL=http://localhost:3000

# ============================================
# JWT Secrets (تولید شده با openssl rand -hex 32)
# ============================================
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1

# ============================================
# Gemini AI
# ============================================
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 📝 مثال Environment Variables در Render

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1
FRONTEND_URL=https://your-frontend-domain.com
```

---

## ⚠️ نکات مهم

### امنیت:
- ❌ **هرگز** فایل `.env` را commit نکنید
- ✅ فایل `.env` در `.gitignore` است
- ✅ در Render، Environment Variables به صورت امن ذخیره می‌شوند

### JWT Secrets:
- ⚠️ باید حداقل 32 کاراکتر باشند
- ⚠️ باید تصادفی و قوی باشند
- ⚠️ در production حتماً تغییر دهید

### DATABASE_URL:
- ⚠️ باید `?sslmode=require` داشته باشد (برای Neon)
- ⚠️ Connection String را از Neon کپی کنید

---

## 🔍 بررسی تنظیمات

### Local:
```bash
cd backend
npm run dev
```

اگر خطا نداد، تنظیمات درست است.

### Production (Render):
1. به Logs در Render Dashboard بروید
2. اگر خطای "DATABASE_URL is not set" دیدید، Environment Variable را بررسی کنید
3. اگر خطای connection دیدید، DATABASE_URL را بررسی کنید

---

## 🐛 عیب‌یابی

### خطا: "DATABASE_URL environment variable is not set"
- در Render، Environment Variable `DATABASE_URL` را اضافه کنید

### خطا: "Database connection failed"
- `DATABASE_URL` را بررسی کنید
- مطمئن شوید `?sslmode=require` در connection string است

### خطا: "JWT_SECRET is not set"
- در Render، Environment Variable `JWT_SECRET` را اضافه کنید

---

## ✅ Checklist

### Local:
- [ ] فایل `.env` ایجاد شد
- [ ] `JWT_SECRET` تولید و تنظیم شد
- [ ] `JWT_REFRESH_SECRET` تولید و تنظیم شد
- [ ] `GEMINI_API_KEY` دریافت و تنظیم شد
- [ ] `PORT` و `NODE_ENV` تنظیم شدند
- [ ] `FRONTEND_URL` تنظیم شد

### Production (Render):
- [ ] `NODE_ENV=production` اضافه شد
- [ ] `PORT=10000` اضافه شد
- [ ] `DATABASE_URL` از Neon کپی و اضافه شد
- [ ] `GEMINI_API_KEY` اضافه شد
- [ ] `JWT_SECRET` تولید و اضافه شد
- [ ] `JWT_REFRESH_SECRET` تولید و اضافه شد
- [ ] `FRONTEND_URL` اضافه شد

