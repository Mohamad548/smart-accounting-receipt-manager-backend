# 📦 راهنمای استفاده از Schema جداگانه

## 🎯 چرا Schema جداگانه؟

برای جلوگیری از قاطی شدن جداول این پروژه با پروژه‌های دیگر، تمام جداول در یک **Schema** جداگانه به نام `smart_accounting_receipt_manager` ایجاد می‌شوند.

## ✅ مزایا

- ✅ جداول پروژه‌های مختلف از هم جدا می‌مانند
- ✅ امکان داشتن جداول با نام یکسان در پروژه‌های مختلف
- ✅ مدیریت بهتر و سازماندهی بیشتر
- ✅ بدون تأثیر روی جداول موجود در `public` schema

## 📋 جداول در Schema

تمام جداول زیر در schema `smart_accounting_receipt_manager` ایجاد می‌شوند:

- `users`
- `refresh_tokens`
- `creditors`
- `customers`
- `receipt_records`

## 🚀 اجرای Schema

### در Neon SQL Editor:

1. به [Neon Console](https://console.neon.tech) بروید
2. به **SQL Editor** بروید
3. فایل `backend/src/database/schema.postgresql.sql` را باز کنید
4. **تمام محتوا** را کپی کنید
5. در SQL Editor پیست کنید
6. روی **"Run"** کلیک کنید

### بعد از اجرا:

Schema `smart_accounting_receipt_manager` ایجاد می‌شود و تمام جداول در آن قرار می‌گیرند.

## 🔍 بررسی Schema

برای دیدن جداول در schema:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'smart_accounting_receipt_manager'
ORDER BY table_name;
```

## 📝 استفاده در کد

کد به صورت خودکار از schema `smart_accounting_receipt_manager` استفاده می‌کند. نیازی به تغییر در Models نیست!

## ⚠️ نکات مهم

- Schema نام: `smart_accounting_receipt_manager` (با underscore)
- تمام جداول در این schema قرار می‌گیرند
- جداول در `public` schema دست نخورده می‌مانند
- کد به صورت خودکار از schema مخصوص استفاده می‌کند

