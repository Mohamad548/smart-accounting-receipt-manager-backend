# 🚀 راهنمای کامل Deploy روی Render و Neon

## مرحله 1: راه‌اندازی دیتابیس در Neon.tech

### 1.1 ورود به Neon

1. به [Neon Console](https://console.neon.tech/app/projects/flat-frog-84289534) بروید
2. وارد حساب کاربری خود شوید

### 1.2 دریافت Connection String

1. در پروژه خود، روی **"Connection Details"** یا **"Connect"** کلیک کنید
2. Connection String را کپی کنید (شبیه به این):
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. این Connection String را برای مرحله بعد نگه دارید

### 1.3 اجرای Schema در Neon

1. در Neon Console، به **"SQL Editor"** بروید
2. محتوای فایل `src/database/schema.postgresql.sql` را کپی کنید
3. در SQL Editor پیست کنید و **"Run"** بزنید
4. مطمئن شوید که همه جداول ایجاد شدند

**یا از طریق psql:**

```bash
# نصب psql (اگر ندارید)
# Windows: از PostgreSQL installer
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# اتصال به دیتابیس
psql "postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# اجرای schema
\i src/database/schema.postgresql.sql
```

## مرحله 2: Deploy روی Render.com

### 2.1 ورود به Render

1. به [Render Dashboard](https://dashboard.render.com/login) بروید
2. با GitHub وارد شوید (یا حساب بسازید

### 2.2 اتصال Repository

1. روی **"New +"** کلیک کنید
2. **"Web Service"** را انتخاب کنید
3. **"Connect GitHub"** را بزنید
4. Repository `smart-accounting-receipt-manager-backend` را انتخاب کنید
5. روی **"Connect"** کلیک کنید

### 2.3 تنظیمات Service

**Basic Settings:**
- **Name:** `smart-accounting-backend` (یا هر نامی که می‌خواهید)
- **Region:** نزدیک‌ترین منطقه به شما
- **Branch:** `main`
- **Root Directory:** `backend` (⚠️ مهم!)
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

**Environment Variables:**

روی **"Environment"** کلیک کنید و این متغیرها را اضافه کنید:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
FRONTEND_URL=https://your-frontend-domain.com
```

**⚠️ مهم:**
- `DATABASE_URL` را از Neon کپی کنید
- `JWT_SECRET` و `JWT_REFRESH_SECRET` را با رشته‌های تصادفی قوی جایگزین کنید
- `FRONTEND_URL` را به آدرس frontend خود تنظیم کنید

### 2.4 Advanced Settings (اختیاری)

- **Auto-Deploy:** `Yes` (برای deploy خودکار با هر push)
- **Health Check Path:** `/api/health`

### 2.5 Create Service

1. روی **"Create Web Service"** کلیک کنید
2. Render شروع به build و deploy می‌کند
3. منتظر بمانید تا build کامل شود (معمولاً 5-10 دقیقه)

## مرحله 3: ایجاد کاربر Admin در دیتابیس

بعد از deploy موفق، باید کاربر admin را در دیتابیس ایجاد کنید:

### روش 1: از طریق API

```bash
# با استفاده از curl یا Postman
curl -X POST https://your-render-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

اما اول باید کاربر را در دیتابیس ایجاد کنید!

### روش 2: از طریق SQL در Neon

1. به Neon Console بروید
2. SQL Editor را باز کنید
3. این کد را اجرا کنید (رمز عبور باید hash شود):

```sql
-- ابتدا باید رمز عبور را hash کنید
-- می‌توانید از یک bcrypt hash generator استفاده کنید
-- یا از API endpoint استفاده کنید

-- برای ایجاد کاربر admin، می‌توانید از script استفاده کنید
```

### روش 3: استفاده از Script

یک endpoint موقت برای ایجاد کاربر اضافه کنید یا از script استفاده کنید.

## مرحله 4: تست Deployment

### 4.1 Health Check

```bash
curl https://your-render-url.onrender.com/api/health
```

باید پاسخ زیر را ببینید:
```json
{
  "status": "ok",
  "message": "Backend is running",
  "database": "connected"
}
```

### 4.2 تست Login

```bash
curl -X POST https://your-render-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt
```

## مرحله 5: ایجاد کاربر Admin (اگر وجود ندارد)

اگر کاربر admin وجود ندارد، می‌توانید از این روش استفاده کنید:

### 5.1 ایجاد Script موقت

یک endpoint موقت در `server.ts` اضافه کنید:

```typescript
// فقط برای اولین بار - بعد حذف کنید!
app.post('/api/admin/create', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username !== 'admin' || password !== 'admin123') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const user = await UserModel.create('admin', 'admin123');
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
```

**⚠️ بعد از ایجاد کاربر، این endpoint را حذف کنید!**

## 🔧 عیب‌یابی

### مشکل: Build Failed

- بررسی کنید که `package.json` درست است
- بررسی کنید که `tsconfig.json` درست است
- Logs را در Render Dashboard بررسی کنید

### مشکل: Database Connection Failed

- بررسی کنید `DATABASE_URL` درست است
- بررسی کنید SSL mode در connection string است
- بررسی کنید که Neon database در دسترس است

### مشکل: 500 Error

- Logs را در Render Dashboard بررسی کنید
- بررسی کنید که schema در دیتابیس اجرا شده است
- بررسی کنید که environment variables درست تنظیم شده‌اند

## 📝 Checklist

- [ ] دیتابیس در Neon ایجاد شد
- [ ] Schema در Neon اجرا شد
- [ ] Repository به Render متصل شد
- [ ] Environment variables تنظیم شدند
- [ ] Service در Render deploy شد
- [ ] Health check موفق بود
- [ ] کاربر admin ایجاد شد
- [ ] Login تست شد

## 🎉 بعد از Deploy موفق

1. URL backend را از Render کپی کنید
2. این URL را در frontend `.env.local` قرار دهید:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```

## 🔒 امنیت Production

- ✅ JWT secrets را قوی انتخاب کنید (حداقل 32 کاراکتر)
- ✅ رمز عبور admin را تغییر دهید
- ✅ HTTPS را فعال کنید
- ✅ CORS را فقط برای domain خود تنظیم کنید
- ✅ Rate limiting اضافه کنید (اختیاری)

