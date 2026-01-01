# 🔍 راهنمای تست اتصال به دیتابیس

## 📋 روش‌های تست اتصال

### روش 1: تست در Render (بعد از Deploy)

#### قدم 1: اضافه کردن DATABASE_URL در Render

1. به [Render Dashboard](https://dashboard.render.com) بروید
2. Service خود را انتخاب کنید
3. به تب **"Environment"** بروید
4. روی **"Add Environment Variable"** کلیک کنید
5. این را اضافه کنید:
   - **Key:** `DATABASE_URL`
   - **Value:** Connection String که از Neon کپی کردید
6. روی **"Save Changes"** کلیک کنید
7. Service را **Redeploy** کنید (یا منتظر auto-deploy بمانید)

#### قدم 2: بررسی Logs

1. در Render Dashboard، به تب **"Logs"** بروید
2. بعد از deploy، این پیام‌ها را باید ببینید:

✅ **اگر موفق بود:**
```
✅ Database connected successfully
✅ Database schema initialized successfully
✅ Admin user already exists
🚀 Backend server running on port 10000
```

❌ **اگر خطا بود:**
```
❌ Database connection failed: ...
```

#### قدم 3: تست Health Check

بعد از deploy موفق، این URL را در مرورگر باز کنید:

```
https://your-service-name.onrender.com/api/health
```

**باید این پاسخ را ببینید:**
```json
{
  "status": "ok",
  "message": "Backend is running",
  "database": "connected"
}
```

---

### روش 2: تست از طریق Shell در Render

1. در Render Dashboard، به تب **"Shell"** بروید
2. این دستور را اجرا کنید:

```bash
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT NOW()').then(r => { console.log('✅ Connected!', r.rows[0]); process.exit(0); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); });"
```

**اگر موفق بود:**
```
✅ Connected! { now: '2024-01-01T12:00:00.000Z' }
```

**اگر خطا بود:**
```
❌ Error: connection failed
```

---

### روش 3: تست Local (با DATABASE_URL)

اگر می‌خواهید در local تست کنید:

#### قدم 1: تنظیم .env

در فایل `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
NODE_ENV=development
PORT=3001
```

#### قدم 2: اجرای تست

```bash
cd backend
npm run dev
```

**اگر موفق بود:**
```
✅ Database connected successfully
✅ Database schema initialized successfully
🚀 Backend server running on port 3001
```

---

### روش 4: تست مستقیم با psql (اختیاری)

اگر `psql` نصب دارید:

```bash
psql "YOUR_DATABASE_URL_HERE"
```

**اگر موفق بود:**
```
psql (15.0)
SSL connection (protocol: TLSv1.3)
Type "help" for help.

neondb=>
```

سپس این Query را اجرا کنید:
```sql
SELECT NOW();
```

---

## 🔍 بررسی دقیق‌تر

### بررسی جداول

در Render Shell یا Local:

```bash
# در Render Shell
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'\").then(r => { console.log('Tables:', r.rows.map(x => x.table_name)); process.exit(0); });"
```

**باید این جداول را ببینید:**
- users
- refresh_tokens
- creditors
- customers
- receipt_records

---

## ⚠️ مشکلات رایج

### مشکل 1: "DATABASE_URL environment variable is not set"

**راه حل:**
- در Render، Environment Variable `DATABASE_URL` را اضافه کنید
- مطمئن شوید که Service را redeploy کرده‌اید

### مشکل 2: "Database connection failed"

**راه حل:**
- `DATABASE_URL` را بررسی کنید
- مطمئن شوید که `?sslmode=require` در connection string است
- Connection String را از Neon دوباره کپی کنید

### مشکل 3: "relation does not exist"

**راه حل:**
- Schema را در Neon اجرا کنید
- به `NEON_DATABASE_SETUP.md` مراجعه کنید

### مشکل 4: "SSL connection required"

**راه حل:**
- مطمئن شوید که `?sslmode=require` در connection string است
- Connection String را از Neon دوباره کپی کنید

---

## ✅ Checklist

- [ ] `DATABASE_URL` در Render Environment Variables اضافه شد
- [ ] Service redeploy شد
- [ ] Logs را بررسی کردم
- [ ] Health check را تست کردم
- [ ] پیام "Database connected successfully" را دیدم

---

## 🎯 خلاصه سریع

1. **DATABASE_URL را در Render اضافه کنید**
2. **Service را redeploy کنید**
3. **Logs را بررسی کنید** - باید "✅ Database connected successfully" ببینید
4. **Health check را تست کنید** - `/api/health` باید `"database": "connected"` برگرداند

---

## 📝 مثال Connection String صحیح

```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

⚠️ **مهم:** باید `?sslmode=require` داشته باشد!

