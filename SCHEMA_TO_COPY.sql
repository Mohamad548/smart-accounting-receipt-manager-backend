-- ============================================
-- Smart Accounting Receipt Manager Schema
-- کپی کنید و در Neon SQL Editor اجرا کنید
-- ============================================

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS smart_accounting_receipt_manager;

-- Set search path to use our schema
SET search_path TO smart_accounting_receipt_manager, public;

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (کاربران)
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

-- Creditors Table (صراف‌ها)
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

-- Customers Table (مشتریان)
CREATE TABLE IF NOT EXISTS smart_accounting_receipt_manager.customers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    expected_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    collected_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    maturity_date VARCHAR(50) NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

-- Receipt Records Table (فیش‌های واریزی)
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipt_records_customer_id ON smart_accounting_receipt_manager.receipt_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_receipt_records_ref_number ON smart_accounting_receipt_manager.receipt_records(ref_number);
CREATE INDEX IF NOT EXISTS idx_receipt_records_created_at ON smart_accounting_receipt_manager.receipt_records(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_name ON smart_accounting_receipt_manager.customers(name);
CREATE INDEX IF NOT EXISTS idx_creditors_name ON smart_accounting_receipt_manager.creditors(name);
CREATE INDEX IF NOT EXISTS idx_users_username ON smart_accounting_receipt_manager.users(username);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON smart_accounting_receipt_manager.refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON smart_accounting_receipt_manager.refresh_tokens(user_id);

