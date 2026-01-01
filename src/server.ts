import { config } from 'dotenv';
import { resolve } from 'path';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { extractReceiptData, extractCreditorInfo } from './services/geminiService.js';
import { initDatabase } from './database/db.js';
import { UserModel } from './models/UserModel.js';
import { authenticateToken } from './middleware/auth.js';
import { startTokenCleanup } from './utils/cleanup.js';
import authRouter from './routes/auth.js';
import creditorsRouter from './routes/creditors.js';
import customersRouter from './routes/customers.js';
import receiptsRouter from './routes/receipts.js';

// Load .env file
config({ path: resolve(process.cwd(), '.env') });

// Initialize database
initDatabase();

// Create default admin user if not exists
const createDefaultUser = async () => {
  try {
    const existingUser = await UserModel.findByUsername('admin');
    if (!existingUser) {
      await UserModel.create('admin', 'admin123');
      console.log('✅ Default admin user created (username: admin, password: admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('Error checking/creating default user:', error);
  }
};
createDefaultUser();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
// Allow both localhost and production frontend URL
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'https://localhost:3000',
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.some(allowed => origin.includes(allowed.replace(/^https?:\/\//, '')))) {
      callback(null, true);
    } else {
      // For development, allow localhost
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to convert file buffer to base64
function bufferToBase64(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

// AI Extraction endpoints (require authentication)
app.post('/api/extract-receipt', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    let imageBase64: string;
    
    // Check if file was uploaded via FormData
    if (req.file) {
      imageBase64 = bufferToBase64(req.file.buffer, req.file.mimetype);
    } else if (req.body.image) {
      // Fallback to JSON base64 (for backward compatibility)
      imageBase64 = req.body.image;
    } else {
      return res.status(400).json({ message: 'تصویر ارسال نشده است.' });
    }

    const creditors = req.body.creditors ? JSON.parse(req.body.creditors) : [];
    const result = await extractReceiptData(imageBase64, creditors);
    res.json(result);
  } catch (error: any) {
    console.error('Error extracting receipt:', error);
    res.status(500).json({ message: error.message || 'خطا در پردازش تصویر.' });
  }
});

app.post('/api/extract-creditor', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    let imageBase64: string;
    
    // Check if file was uploaded via FormData
    if (req.file) {
      imageBase64 = bufferToBase64(req.file.buffer, req.file.mimetype);
    } else if (req.body.image) {
      // Fallback to JSON base64 (for backward compatibility)
      imageBase64 = req.body.image;
    } else {
      return res.status(400).json({ message: 'تصویر ارسال نشده است.' });
    }

    const result = await extractCreditorInfo(imageBase64);
    res.json(result);
  } catch (error: any) {
    console.error('Error extracting creditor:', error);
    console.error('Error details:', error);
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
app.get('/api/health', async (req, res) => {
  try {
    const { getPool } = await import('./database/db.js');
    const pool = getPool();
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      message: 'Backend is running', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Backend is running but database connection failed', 
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start token cleanup
startTokenCleanup();

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Database initialized at: ${process.env.DB_PATH || './data/database.db'}`);
  console.log(`🔐 JWT authentication enabled`);
});

