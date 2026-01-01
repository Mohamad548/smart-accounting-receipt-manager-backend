# Backend - Smart Accounting Receipt Manager

Backend API server for the Smart Accounting Receipt Manager application with SQLite database, JWT authentication, and Gemini AI integration.

## 🚀 Features

- 🗄️ SQLite database with automatic schema initialization
- 🤖 Gemini AI integration for receipt extraction
- 📡 RESTful API endpoints
- 🔐 JWT Authentication with Refresh Tokens
- 🔒 Secure password hashing with bcrypt
- 🍪 HttpOnly cookies for token storage
- 🚀 Express.js server with TypeScript

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your configuration to `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
DB_PATH=./data/database.db
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**⚠️ Important:** Generate secure random strings for JWT secrets:
```bash
# On Linux/Mac
openssl rand -hex 32

# Or use any random string generator
```

## 🗄️ Database

The database is automatically initialized when the server starts. The schema includes:

- **users** - کاربران سیستم (با رمز عبور هش شده)
- **refresh_tokens** - Refresh token‌ها برای احراز هویت
- **creditors** - طلبکاران (صراف‌ها)
- **customers** - مشتریان
- **receipt_records** - فیش‌های واریزی

The database file will be created at `./data/database.db` (or the path specified in `DB_PATH`).

### Initialize Database

```bash
npm run init:db
```

This will:
- ✅ Create database and tables
- ✅ Create default admin user (username: `admin`, password: `admin123`)

### Test Database

```bash
npm run test:db
```

## Running

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication (🔓 Public)
- `POST /api/auth/login` - Login and get tokens (sets httpOnly cookies)
- `POST /api/auth/logout` - Logout and clear tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### AI Extraction (🔒 Protected)
- `POST /api/extract-receipt` - Extract receipt data from image
- `POST /api/extract-creditor` - Extract creditor information from image

### Creditors (طلبکاران) (🔒 Protected)
- `GET /api/creditors` - Get all creditors
- `GET /api/creditors/:id` - Get creditor by ID
- `POST /api/creditors` - Create new creditor
- `PUT /api/creditors/:id` - Update creditor
- `DELETE /api/creditors/:id` - Delete creditor

### Customers (مشتریان) (🔒 Protected)
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Receipts (فیش‌ها) (🔒 Protected)
- `GET /api/receipts` - Get all receipts
- `GET /api/receipts/:id` - Get receipt by ID
- `GET /api/receipts/customer/:customerId` - Get receipts by customer
- `POST /api/receipts` - Create new receipt
- `DELETE /api/receipts/:id` - Delete receipt

### Health Check
- `GET /api/health` - Server health status

## 📁 Project Structure

```
backend/
├── src/
│   ├── database/
│   │   ├── db.ts          # Database initialization
│   │   └── schema.sql     # Database schema
│   ├── models/
│   │   ├── CreditorModel.ts
│   │   ├── CustomerModel.ts
│   │   ├── ReceiptModel.ts
│   │   ├── UserModel.ts
│   │   └── RefreshTokenModel.ts
│   ├── routes/
│   │   ├── auth.ts        # Authentication routes
│   │   ├── creditors.ts
│   │   ├── customers.ts
│   │   └── receipts.ts
│   ├── middleware/
│   │   └── auth.ts       # JWT authentication middleware
│   ├── services/
│   │   └── geminiService.ts
│   ├── utils/
│   │   ├── jwt.ts         # JWT utilities
│   │   ├── password.ts    # Password hashing
│   │   └── cleanup.ts     # Token cleanup
│   ├── types.ts
│   └── server.ts
├── scripts/
│   ├── init-db.ts         # Database initialization script
│   └── test-db.ts         # Database test script
├── data/                  # Database files (auto-created, gitignored)
└── package.json
```

## 🔒 Security Features

- ✅ JWT Access Tokens (15 minutes expiry)
- ✅ Refresh Tokens (7 days expiry) stored in database
- ✅ HttpOnly cookies (XSS protection)
- ✅ Secure flag in production (HTTPS only)
- ✅ SameSite strict (CSRF protection)
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Automatic token cleanup for expired tokens

## 📝 Default Credentials

⚠️ **Change these in production!**

- **Username:** `admin`
- **Password:** `admin123`

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Initialize database
npm run init:db

# Start development server
npm run dev
```

## 📄 License

This project is free for personal and commercial use.
