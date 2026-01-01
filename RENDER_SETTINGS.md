# ⚙️ تنظیمات Render - راهنمای دقیق

## 📋 تنظیمات فرم Render

بر اساس تصویر شما، این تنظیمات را اعمال کنید:

### ✅ فیلدهای درست (نیازی به تغییر نیست):

1. **Name:** `smart-accounting-receipt-manager-backend` ✅
2. **Language:** `Node` ✅
3. **Branch:** `main` ✅
4. **Region:** `Oregon (US West)` ✅ (یا هر منطقه دیگری که می‌خواهید)
5. **Start Command:** `node dist/server.js` ✅

### ⚠️ فیلدهایی که باید تغییر کنند:

#### 1. Root Directory
**فعلی:** خالی  
**باید باشد:** `backend`

**چرا؟** چون repository شما در root است و فایل‌های backend در پوشه `backend` قرار دارند.

---

#### 2. Build Command
**فعلی:** `yarn install`  
**باید باشد:** `npm install && npm run build`

**چرا؟** 
- پروژه شما از `npm` استفاده می‌کند (نه yarn)
- باید TypeScript را compile کنید (`npm run build`)

---

## 📝 تنظیمات کامل

| فیلد | مقدار |
|------|-------|
| **Name** | `smart-accounting-receipt-manager-backend` |
| **Project** | (اختیاری - می‌توانید خالی بگذارید) |
| **Language** | `Node` |
| **Branch** | `main` |
| **Region** | `Oregon (US West)` (یا منطقه مورد نظر) |
| **Root Directory** | `backend` ⚠️ **خیلی مهم!** |
| **Build Command** | `npm install && npm run build` ⚠️ |
| **Start Command** | `node dist/server.js` |

---

## 🔧 مراحل تنظیم

### قدم 1: Root Directory
1. در فیلد **Root Directory** کلیک کنید
2. تایپ کنید: `backend`
3. Enter بزنید

### قدم 2: Build Command
1. در فیلد **Build Command** کلیک کنید
2. محتوای فعلی را پاک کنید (`yarn install`)
3. تایپ کنید: `npm install && npm run build`
4. Enter بزنید

### قدم 3: Start Command (بررسی)
1. مطمئن شوید که **Start Command** برابر است با: `node dist/server.js`
2. اگر نیست، تغییر دهید

---

## ✅ بعد از تنظیمات

1. به پایین صفحه بروید
2. روی **"Create Web Service"** کلیک کنید
3. Render شروع به build می‌کند

---

## ⚠️ نکات مهم

- **Root Directory** باید حتماً `backend` باشد، وگرنه فایل‌ها پیدا نمی‌شوند
- **Build Command** باید شامل `npm run build` باشد تا TypeScript compile شود
- اگر از yarn استفاده می‌کنید، می‌توانید `npm` را با `yarn` جایگزین کنید

---

## 🐛 اگر خطا گرفتید

### خطا: "Cannot find module"
- مطمئن شوید Root Directory = `backend` است

### خطا: "Command failed"
- Build Command را بررسی کنید
- مطمئن شوید `npm run build` وجود دارد

### خطا: "Cannot find dist/server.js"
- مطمئن شوید Build Command شامل `npm run build` است
- مطمئن شوید Start Command = `node dist/server.js` است

