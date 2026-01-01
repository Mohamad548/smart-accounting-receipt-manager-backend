# 🚀 راهنمای قدم به قدم Deploy روی Render

## 📋 پیش‌نیازها

- ✅ حساب GitHub (repository باید push شده باشد)
- ✅ حساب Render.com
- ✅ حساب Neon.tech (دیتابیس آماده باشد)
- ✅ Connection String از Neon

---

## مرحله 1: آماده‌سازی Neon Database

### قدم 1.1: دریافت Connection String

1. به [Neon Console](https://console.neon.tech/app/projects/flat-frog-84289534) بروید
2. در پروژه خود، روی **"Connection Details"** یا **"Connect"** کلیک کنید
3. Connection String را کپی کنید (شبیه به این):
   ```
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. این را برای مرحله بعد نگه دارید

### قدم 1.2: اجرای Schema

**روش 1: از طریق SQL Editor در Neon**

1. در Neon Console، به **"SQL Editor"** بروید
2. فایل `backend/src/database/schema.postgresql.sql` را باز کنید
3. محتوای آن را کپی کنید
4. در SQL Editor پیست کنید
5. روی **"Run"** کلیک کنید
6. مطمئن شوید که پیام موفقیت را می‌بینید

**روش 2: از طریق psql (اختیاری)**

```bash
# نصب psql (اگر ندارید)
# Windows: از https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# اتصال
psql "YOUR_CONNECTION_STRING_HERE"

# اجرای schema
\i backend/src/database/schema.postgresql.sql
```

---

## مرحله 2: Deploy روی Render

### قدم 2.1: ورود و اتصال GitHub

1. به [Render Dashboard](https://dashboard.render.com/login) بروید
2. روی **"Get Started for Free"** کلیک کنید
3. **"Sign up with GitHub"** را انتخاب کنید
4. دسترسی‌های لازم را به Render بدهید

### قدم 2.2: ایجاد Web Service

1. در Dashboard، روی **"New +"** کلیک کنید
2. **"Web Service"** را انتخاب کنید
3. Repository `smart-accounting-receipt-manager-backend` را انتخاب کنید
4. روی **"Connect"** کلیک کنید

### قدم 2.3: تنظیمات Service

**Basic Settings:**

| فیلد | مقدار |
|------|-------|
| **Name** | `smart-accounting-backend` |
| **Region** | نزدیک‌ترین منطقه (مثلاً Singapore یا Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | `backend` ⚠️ **خیلی مهم!** |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

**⚠️ مهم:** Root Directory باید `backend` باشد!

### قدم 2.4: Environment Variables

روی **"Environment"** کلیک کنید و این متغیرها را اضافه کنید:

| Key | Value | توضیح |
|-----|-------|-------|
| `NODE_ENV` | `production` | - |
| `PORT` | `10000` | Port پیش‌فرض Render |
| `DATABASE_URL` | `postgresql://...` | Connection String از Neon |
| `GEMINI_API_KEY` | `your_key_here` | API Key از Google AI Studio |
| `JWT_SECRET` | `random-32-chars-min` | یک رشته تصادفی قوی |
| `JWT_REFRESH_SECRET` | `random-32-chars-min` | یک رشته تصادفی قوی دیگر |
| `FRONTEND_URL` | `https://your-frontend.com` | آدرس frontend (بعداً تنظیم می‌کنیم) |

**تولید JWT Secrets:**

```bash
# Linux/Mac
openssl rand -hex 32

# یا از یک generator online استفاده کنید
# https://www.random.org/strings/
```

### قدم 2.5: Advanced Settings (اختیاری)

- **Auto-Deploy:** `Yes` ✅
- **Health Check Path:** `/api/health`

### قدم 2.6: Create Service

1. روی **"Create Web Service"** کلیک کنید
2. Render شروع به build می‌کند
3. منتظر بمانید (5-10 دقیقه)

---

## مرحله 3: ایجاد کاربر Admin

بعد از deploy موفق، باید کاربر admin را ایجاد کنید:

### روش 1: از طریق Script (پیشنهادی)

در Render Dashboard:
1. به **"Shell"** بروید
2. این دستور را اجرا کنید:
```bash
npm run create-admin
```

### روش 2: از طریق SQL در Neon

1. به Neon Console بروید
2. SQL Editor را باز کنید
3. این کد را اجرا کنید (ابتدا باید password را hash کنید):

```sql
-- برای hash کردن password، می‌توانید از این endpoint استفاده کنید
-- یا از یک bcrypt hash generator online
```

**بهتر است از script استفاده کنید!**

---

## مرحله 4: تست

### 4.1 Health Check

```bash
curl https://your-service-name.onrender.com/api/health
```

باید این پاسخ را ببینید:
```json
{"status":"ok","message":"Backend is running","database":"connected"}
```

### 4.2 تست Login

```bash
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -v
```

---

## 🔧 عیب‌یابی

### Build Failed

**مشکل:** خطا در build

**راه حل:**
1. Logs را در Render Dashboard بررسی کنید
2. مطمئن شوید `package.json` درست است
3. مطمئن شوید Root Directory `backend` است

### Database Connection Error

**مشکل:** خطای اتصال به دیتابیس

**راه حل:**
1. `DATABASE_URL` را بررسی کنید
2. مطمئن شوید `?sslmode=require` در connection string است
3. مطمئن شوید Neon database در دسترس است

### 500 Internal Server Error

**مشکل:** خطای 500

**راه حل:**
1. Logs را در Render Dashboard بررسی کنید
2. مطمئن شوید schema در Neon اجرا شده است
3. مطمئن شوید environment variables درست هستند

---

## ✅ Checklist نهایی

- [ ] دیتابیس در Neon ایجاد شد
- [ ] Schema در Neon اجرا شد
- [ ] Connection String کپی شد
- [ ] Repository به Render متصل شد
- [ ] Root Directory = `backend` تنظیم شد
- [ ] Environment variables تنظیم شدند
- [ ] Service deploy شد
- [ ] Health check موفق بود
- [ ] کاربر admin ایجاد شد
- [ ] Login تست شد

---

## 🎉 بعد از Deploy موفق

1. URL backend را از Render کپی کنید (مثلاً: `https://smart-accounting-backend.onrender.com`)
2. این URL را در frontend استفاده کنید:
   ```
   NEXT_PUBLIC_API_URL=https://smart-accounting-backend.onrender.com/api
   ```

---

## 📝 نکات مهم

- ⚠️ Root Directory باید `backend` باشد
- ⚠️ JWT secrets باید قوی باشند (حداقل 32 کاراکتر)
- ⚠️ در production رمز عبور admin را تغییر دهید
- ⚠️ بعد از اولین deploy، endpoint موقت ایجاد کاربر را حذف کنید

