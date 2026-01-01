-- Database Schema for Smart Accounting Receipt Manager
-- SQLite Database

-- Users Table (کاربران)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Creditors Table (صراف‌ها)
CREATE TABLE IF NOT EXISTS creditors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    sheba_number TEXT NOT NULL,
    total_amount REAL NOT NULL DEFAULT 0,
    remaining_amount REAL NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Customers Table (مشتریان)
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    expected_amount REAL NOT NULL DEFAULT 0,
    collected_amount REAL NOT NULL DEFAULT 0,
    maturity_date TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Receipt Records Table (فیش‌های واریزی)
CREATE TABLE IF NOT EXISTS receipt_records (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    ref_number TEXT,
    sender TEXT,
    receiver TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    matched_creditor_id TEXT,
    dynamic_fields TEXT, -- JSON string
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (matched_creditor_id) REFERENCES creditors(id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipt_records_customer_id ON receipt_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_receipt_records_ref_number ON receipt_records(ref_number);
CREATE INDEX IF NOT EXISTS idx_receipt_records_created_at ON receipt_records(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_creditors_name ON creditors(name);

