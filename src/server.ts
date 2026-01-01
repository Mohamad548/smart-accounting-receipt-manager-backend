import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { extractReceiptData, extractCreditorInfo } from './services/geminiService';
import { initDatabase } from './database/db';
import { UserModel } from './models/UserModel';
import { authenticateToken } from './middleware/auth';
import { startTokenCleanup } from './utils/cleanup';
import authRouter from './routes/auth';
import creditorsRouter from './routes/creditors';
import customersRouter from './routes/customers';
import receiptsRouter from './routes/receipts';

// Initialize database
initDatabase();

// Create default admin user if not exists
const createDefaultUser = async () => {
  const existingUser = UserModel.findByUsername('admin');
  if (!existingUser) {
    try {
      await UserModel.create('admin', 'admin123');
      console.log('✅ Default admin user created (username: admin, password: admin123)');
    } catch (error) {
      console.error('Error creating default user:', error);
    }
  }
};
createDefaultUser();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));

// AI Extraction endpoints (require authentication)
app.post('/api/extract-receipt', authenticateToken, async (req, res) => {
  try {
    const { image, creditors } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'تصویر ارسال نشده است.' });
    }
    const result = await extractReceiptData(image, creditors || []);
    res.json(result);
  } catch (error: any) {
    console.error('Error extracting receipt:', error);
    res.status(500).json({ message: error.message || 'خطا در پردازش تصویر.' });
  }
});

app.post('/api/extract-creditor', authenticateToken, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'تصویر ارسال نشده است.' });
    }
    const result = await extractCreditorInfo(image);
    res.json(result);
  } catch (error: any) {
    console.error('Error extracting creditor:', error);
    res.status(500).json({ message: error.message || 'خطا در خواندن تصویر فیش.' });
  }
});

// Auth routes
app.use('/api/auth', authRouter);

// Protected CRUD API routes
app.use('/api/creditors', creditorsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/receipts', receiptsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running', database: 'connected' });
});

// Start token cleanup
startTokenCleanup();

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Database initialized at: ${process.env.DB_PATH || './data/database.db'}`);
  console.log(`🔐 JWT authentication enabled`);
});

