# 🗄️ راهنمای قدم به قدم ایجاد دیتابیس در Neon

## 📋 مراحل کامل

### مرحله 1: ورود به Neon Console

1. به [Neon Console](https://console.neon.tech/app/projects/flat-frog-84289534) بروید
2. وارد حساب کاربری خود شوید
3. پروژه خود را انتخاب کنید (یا یک پروژه جدید ایجاد کنید)

---

### مرحله 2: دریافت Connection String

1. در پروژه خود، روی **"Connection Details"** یا **"Connect"** کلیک کنید
2. یک صفحه با اطلاعات اتصال باز می‌شود
3. **Connection String** را کپی کنید

**مثال Connection String:**
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

⚠️ **مهم:** این Connection String را برای مرحله بعد نگه دارید!

---

### مرحله 3: اجرای Schema (ایجاد جداول)

شما دو روش دارید:

#### روش 1: از طریق SQL Editor در Neon (پیشنهادی) ✅

1. در Neon Console، به **"SQL Editor"** بروید
2. یک Query جدید ایجاد کنید
3. فایل `backend/src/database/schema.postgresql.sql` را باز کنید
4. **تمام محتوای** فایل را کپی کنید
5. در SQL Editor پیست کنید
6. روی **"Run"** یا **"Execute"** کلیک کنید
7. منتظر بمانید تا اجرا شود

**اگر موفق بود، باید پیام موفقیت را ببینید:**
```
Query executed successfully
```

#### روش 2: از طریق psql (اختیاری)

اگر `psql` نصب دارید:

```bash
# اتصال به دیتابیس
psql "YOUR_CONNECTION_STRING_HERE"

# اجرای schema
\i backend/src/database/schema.postgresql.sql
```

---

### مرحله 4: بررسی جداول

1. در SQL Editor، این Query را اجرا کنید:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**باید این جداول را ببینید:**
- `users`
- `refresh_tokens`
- `creditors`
- `customers`
- `receipt_records`

---

### مرحله 5: تست اتصال (اختیاری)

در SQL Editor، این Query را اجرا کنید:

```sql
SELECT NOW();
```

اگر تاریخ و زمان را دیدید، اتصال درست است! ✅

---

## 📝 محتوای Schema (برای کپی)

اگر فایل `schema.postgresql.sql` را پیدا نکردید، این محتوا را کپی کنید:

```sql
-- Database Schema for Smart Accounting Receipt Manager
-- PostgreSQL Database (for Neon.tech)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (کاربران)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Creditors Table (صراف‌ها)
CREATE TABLE IF NOT EXISTS creditors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    sheba_number VARCHAR(255) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    remaining_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

-- Customers Table (مشتریان)
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expected_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    collected_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    maturity_date VARCHAR(50) NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

-- Receipt Records Table (فیش‌های واریزی)
CREATE TABLE IF NOT EXISTS receipt_records (
    id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date VARCHAR(255) NOT NULL,
    ref_number VARCHAR(255),
    sender TEXT,
    receiver TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    matched_creditor_id VARCHAR(255),
    dynamic_fields JSONB,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (matched_creditor_id) REFERENCES creditors(id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipt_records_customer_id ON receipt_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_receipt_records_ref_number ON receipt_records(ref_number);
CREATE INDEX IF NOT EXISTS idx_receipt_records_created_at ON receipt_records(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_creditors_name ON creditors(name);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

---

## ✅ Checklist

- [ ] وارد Neon Console شدم
- [ ] پروژه را انتخاب کردم
- [ ] Connection String را کپی کردم
- [ ] به SQL Editor رفتم
- [ ] Schema را کپی و اجرا کردم
- [ ] جداول را بررسی کردم (5 جدول)
- [ ] Connection String را برای Render ذخیره کردم

---

## 🔧 عیب‌یابی

### خطا: "relation already exists"
- این خطا یعنی جداول قبلاً ایجاد شده‌اند
- مشکلی نیست، می‌توانید ادامه دهید

### خطا: "permission denied"
- مطمئن شوید که به پروژه دسترسی دارید
- اگر پروژه جدید است، باید owner باشید

### خطا: "extension uuid-ossp does not exist"
- این خطا معمولاً در Neon رخ نمی‌دهد
- اگر رخ داد، می‌توانید خط `CREATE EXTENSION` را حذف کنید

---

## 🎯 بعد از ایجاد دیتابیس

1. **Connection String را کپی کنید** - برای Render نیاز دارید
2. **در Render، Environment Variable `DATABASE_URL` را تنظیم کنید**
3. **تست کنید** - بعد از deploy، health check را تست کنید

---

## 📸 تصاویر راهنما (مراحل)

### مرحله 1: پیدا کردن Connection Details
- در Dashboard، روی پروژه کلیک کنید
- در سمت چپ، "Connection Details" یا "Connect" را ببینید

### مرحله 2: SQL Editor
- در منوی سمت چپ، "SQL Editor" را انتخاب کنید
- یک Query جدید ایجاد کنید

### مرحله 3: اجرای Schema
- Schema را پیست کنید
- روی "Run" کلیک کنید

---

## 🚀 بعد از این مرحله

بعد از ایجاد دیتابیس:
1. Connection String را در Render Environment Variables قرار دهید
2. Service را deploy کنید
3. کاربر admin را ایجاد کنید

