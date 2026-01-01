# 🚀 راهنمای Push کردن Backend به GitHub

## مراحل Push کردن Backend

### 1. اطمینان از آماده بودن فایل‌ها

✅ فایل `.gitignore` موجود است و شامل:
- `node_modules/`
- `.env`
- `*.db`
- `data/`
- `dist/`

### 2. Initialize Git Repository

```bash
cd backend
git init
```

### 3. Add و Commit فایل‌ها

```bash
# Add all files
git add .

# Check what will be committed
git status

# Commit
git commit -m "Initial commit: Backend API with JWT auth and SQLite database"
```

### 4. اتصال به GitHub Repository

از تصویر مشخص است که repository شما:
`https://github.com/Mohamad548/smart-accounting-receipt-manager-backend.git`

```bash
git remote add origin https://github.com/Mohamad548/smart-accounting-receipt-manager-backend.git
git branch -M main
```

### 5. Push به GitHub

```bash
git push -u origin main
```

## ✅ دستورات کامل (یکجا)

```bash
cd backend
git init
git add .
git commit -m "Initial commit: Backend API with JWT auth, SQLite database, and Gemini AI integration"
git remote add origin https://github.com/Mohamad548/smart-accounting-receipt-manager-backend.git
git branch -M main
git push -u origin main
```

## ⚠️ نکات مهم

### فایل‌هایی که نباید commit شوند:
- ❌ `.env` (حاوی API keys و secrets)
- ❌ `*.db` (فایل‌های دیتابیس)
- ❌ `node_modules/`
- ❌ `dist/`

### فایل‌هایی که باید commit شوند:
- ✅ `package.json`
- ✅ `tsconfig.json`
- ✅ `README.md`
- ✅ تمام فایل‌های source code در `src/`
- ✅ `schema.sql`
- ✅ `.gitignore`

## 🔍 بررسی قبل از Push

```bash
# بررسی فایل‌های staged
git status

# بررسی محتوای commit
git log --oneline

# بررسی remote
git remote -v
```

## 🐛 حل مشکلات

### اگر خطای authentication گرفتید:
```bash
# استفاده از Personal Access Token
git remote set-url origin https://YOUR_TOKEN@github.com/Mohamad548/smart-accounting-receipt-manager-backend.git
```

### اگر فایل‌های ناخواسته commit شدند:
```bash
# حذف از staging
git reset HEAD <file>

# اضافه کردن به .gitignore
echo "<file>" >> .gitignore
```

## ✅ بعد از Push موفق

1. به GitHub بروید و repository را بررسی کنید
2. مطمئن شوید که `.env` و `*.db` commit نشده‌اند
3. README.md را در GitHub بررسی کنید

