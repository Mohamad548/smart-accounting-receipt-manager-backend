# ⚡ راهنمای سریع Deploy

## 🎯 خلاصه مراحل

### 1️⃣ Neon Database (5 دقیقه)

1. به [Neon Console](https://console.neon.tech/app/projects/flat-frog-84289534) بروید
2. **Connection Details** را باز کنید و Connection String را کپی کنید
3. به **SQL Editor** بروید
4. محتوای `backend/src/database/schema.postgresql.sql` را کپی و اجرا کنید
5. ✅ Schema ایجاد شد

### 2️⃣ Render Deploy (10 دقیقه)

1. به [Render Dashboard](https://dashboard.render.com/login) بروید
2. **New +** → **Web Service**
3. Repository را انتخاب کنید
4. تنظیمات:
   - **Root Directory:** `backend` ⚠️
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=postgresql://... (از Neon)
   GEMINI_API_KEY=your_key
   JWT_SECRET=random-32-chars
   JWT_REFRESH_SECRET=random-32-chars
   FRONTEND_URL=https://your-frontend.com
   ```
6. **Create Web Service**
7. منتظر بمانید تا deploy شود

### 3️⃣ ایجاد Admin User

بعد از deploy موفق:

1. در Render Dashboard → **Shell**
2. اجرا کنید: `npm run create-admin`
3. ✅ کاربر admin ایجاد شد

### 4️⃣ تست

```bash
# Health Check
curl https://your-service.onrender.com/api/health

# Login
curl -X POST https://your-service.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 📚 راهنمای کامل

برای راهنمای تفصیلی، فایل `RENDER_DEPLOY.md` را ببینید.

---

## ⚠️ نکات مهم

- Root Directory باید `backend` باشد
- Connection String باید `?sslmode=require` داشته باشد
- JWT secrets باید حداقل 32 کاراکتر باشند
- بعد از deploy، رمز عبور admin را تغییر دهید

