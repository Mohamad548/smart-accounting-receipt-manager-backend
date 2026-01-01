# 🚀 راهنمای سریع اجرای Schema در Neon

## ✅ وضعیت فعلی

از terminal مشخص است که:
- ✅ اتصال به دیتابیس موفق است
- ❌ Schema `smart_accounting_receipt_manager` هنوز ایجاد نشده است
- ❌ جداول وجود ندارند

## 📋 مراحل اجرا (3 دقیقه)

### قدم 1: باز کردن Neon SQL Editor

1. به [Neon Console](https://console.neon.tech/app/projects/flat-frog-84289534) بروید
2. در منوی سمت چپ، روی **"SQL Editor"** کلیک کنید
3. یک Query جدید ایجاد کنید (یا Query موجود را باز کنید)

### قدم 2: کپی کردن Schema

**روش 1: از فایل**
1. فایل `backend/SCHEMA_TO_COPY.sql` را باز کنید
2. **تمام محتوا** را انتخاب کنید (Ctrl+A)
3. کپی کنید (Ctrl+C)

**روش 2: از اینجا**
- تمام کد SQL زیر را کپی کنید

### قدم 3: پیست و اجرا

1. در SQL Editor، محتوا را پیست کنید (Ctrl+V)
2. روی دکمه **"Run"** یا **"Execute"** کلیک کنید
3. منتظر بمانید تا اجرا شود (چند ثانیه)

### قدم 4: بررسی

بعد از اجرا، این Query را در SQL Editor اجرا کنید:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'smart_accounting_receipt_manager'
ORDER BY table_name;
```

**باید این 5 جدول را ببینید:**
- users
- refresh_tokens
- creditors
- customers
- receipt_records

### قدم 5: تست دوباره

در terminal:

```bash
cd backend
npm run test:connection
```

**باید این پیام را ببینید:**
```
✅ All required tables exist in schema: smart_accounting_receipt_manager!
🎉 Database connection test passed!
```

---

## 📝 کد SQL برای کپی

اگر فایل `SCHEMA_TO_COPY.sql` را پیدا نکردید، این کد را کپی کنید:

```sql
-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS smart_accounting_receipt_manager;

-- Set search path to use our schema
SET search_path TO smart_accounting_receipt_manager, public;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS smart_accounting_receipt_manager.users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS smart_accounting_receipt_manager.refresh_tokens (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES smart_accounting_receipt_manager.users(id) ON DELETE CASCADE
);

-- Creditors Table
CREATE TABLE IF NOT EXISTS smart_accounting_receipt_manager.creditors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    sheba_number VARCHAR(255) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    remaining_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

-- Customers Table
CREATE TABLE IF NOT EXISTS smart_accounting_receipt_manager.customers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expected_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    collected_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    maturity_date VARCHAR(50) NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

-- Receipt Records Table
CREATE TABLE IF NOT EXISTS smart_accounting_receipt_manager.receipt_records (
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
    FOREIGN KEY (customer_id) REFERENCES smart_accounting_receipt_manager.customers(id) ON DELETE CASCADE,
    FOREIGN KEY (matched_creditor_id) REFERENCES smart_accounting_receipt_manager.creditors(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_receipt_records_customer_id ON smart_accounting_receipt_manager.receipt_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_receipt_records_ref_number ON smart_accounting_receipt_manager.receipt_records(ref_number);
CREATE INDEX IF NOT EXISTS idx_receipt_records_created_at ON smart_accounting_receipt_manager.receipt_records(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_name ON smart_accounting_receipt_manager.customers(name);
CREATE INDEX IF NOT EXISTS idx_creditors_name ON smart_accounting_receipt_manager.creditors(name);
CREATE INDEX IF NOT EXISTS idx_users_username ON smart_accounting_receipt_manager.users(username);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON smart_accounting_receipt_manager.refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON smart_accounting_receipt_manager.refresh_tokens(user_id);
```

---

## ⚠️ نکات مهم

- تمام کد را یکجا کپی کنید
- در SQL Editor پیست کنید
- روی "Run" کلیک کنید
- اگر خطای "already exists" دیدید، مشکلی نیست (یعنی قبلاً اجرا شده)

---

## 🎯 خلاصه

1. Neon Console → SQL Editor
2. کد را کپی کنید (از `SCHEMA_TO_COPY.sql` یا از بالا)
3. پیست و Run کنید
4. تست کنید: `npm run test:connection`

---

## ✅ بعد از موفقیت

بعد از اجرای موفق Schema، باید این پیام را ببینید:

```
✅ All required tables exist in schema: smart_accounting_receipt_manager!
🎉 Database connection test passed!
```

حالا می‌توانید backend را deploy کنید! 🚀

