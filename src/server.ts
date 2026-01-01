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
      } else if (origin.includes('vercel.app')) {
        // Allow all Vercel preview and production deployments
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
    console.log('📥 [extract-receipt] Received request');
    
    let imageBase64: string;
    
    // Check if file was uploaded via FormData
    if (req.file) {
      console.log('📸 [extract-receipt] File received via FormData:', {
        size: req.file.size,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname
      });
      imageBase64 = bufferToBase64(req.file.buffer, req.file.mimetype);
    } else if (req.body.image) {
      console.log('📸 [extract-receipt] Image received via JSON body');
      // Fallback to JSON base64 (for backward compatibility)
      imageBase64 = req.body.image;
    } else {
      console.error('❌ [extract-receipt] No image provided');
      return res.status(400).json({ 
        message: 'تصویر ارسال نشده است.',
        error: 'No image file or image data provided'
      });
    }

    const creditors = req.body.creditors ? JSON.parse(req.body.creditors) : [];
    console.log('🔄 [extract-receipt] Calling extractReceiptData with', creditors.length, 'creditors...');
    const result = await extractReceiptData(imageBase64, creditors);
    console.log('✅ [extract-receipt] Extraction successful');
    res.json(result);
  } catch (error: any) {
    console.error('❌ [extract-receipt] Error extracting receipt');
    console.error('📋 [extract-receipt] Error details:', JSON.stringify({
      message: error.message,
      status: error.status || error.code,
      name: error.name,
    }, null, 2));
    console.error('📚 [extract-receipt] Error stack:', error.stack);
    
    const errorMessage = error.message || 'خطا در پردازش تصویر.';
    const statusCode = error.status || error.code || 500;
    
    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({ 
      message: errorMessage,
      error: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      status: statusCode
    });
  }
});

app.post('/api/extract-creditor', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    console.log('📥 [extract-creditor] Received request');
    
    let imageBase64: string;
    
    // Check if file was uploaded via FormData
    if (req.file) {
      console.log('📸 [extract-creditor] File received via FormData:', {
        size: req.file.size,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname
      });
      imageBase64 = bufferToBase64(req.file.buffer, req.file.mimetype);
    } else if (req.body.image) {
      console.log('📸 [extract-creditor] Image received via JSON body');
      // Fallback to JSON base64 (for backward compatibility)
      imageBase64 = req.body.image;
    } else {
      console.error('❌ [extract-creditor] No image provided');
      return res.status(400).json({ 
        message: 'تصویر ارسال نشده است.',
        error: 'No image file or image data provided'
      });
    }

    console.log('🔄 [extract-creditor] Calling extractCreditorInfo...');
    const result = await extractCreditorInfo(imageBase64);
    console.log('✅ [extract-creditor] Extraction successful:', {
      hasName: !!result.name,
      hasAccount: !!result.account,
      hasSheba: !!result.sheba
    });
    res.json(result);
  } catch (error: any) {
    console.error('❌ [extract-creditor] Error extracting creditor');
    console.error('📋 [extract-creditor] Error details:', JSON.stringify({
      message: error.message,
      status: error.status || error.code,
      name: error.name,
    }, null, 2));
    console.error('📚 [extract-creditor] Error stack:', error.stack);
    
    // برگرداندن پیام خطای دقیق‌تر
    const errorMessage = error.message || 'خطا در خواندن تصویر فیش.';
    const statusCode = error.status || error.code || 500;
    
    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({ 
      message: errorMessage,
      error: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      status: statusCode
    });
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

// Test Gemini API Connection
app.get('/api/test-gemini', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Testing Gemini API connection...');
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.error('❌ API_KEY not found in environment variables');
      return res.status(500).json({ 
        success: false,
        message: 'API Key تنظیم نشده است',
        error: 'API_KEY environment variable is not set',
        details: 'لطفاً API_KEY را در environment variables تنظیم کنید'
      });
    }

    console.log('✅ API Key found, length:', apiKey.length);
    
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    
    console.log('🔄 Sending test request to Gemini API...');
    const startTime = Date.now();
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [{ text: "سلام، فقط یک تست ساده است. لطفاً پاسخ دهید: OK" }],
        },
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('✅ Gemini API responded successfully');
      console.log('⏱️ Response time:', duration, 'ms');
      
      res.json({ 
        success: true,
        message: 'اتصال به Gemini API برقرار است',
        response: response.text || 'OK',
        responseTime: `${duration}ms`,
        model: 'gemini-3-flash-preview',
        timestamp: new Date().toISOString()
      });
    } catch (geminiError: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error('❌ Gemini API error:', geminiError);
      console.error('Error status:', geminiError.status);
      console.error('Error code:', geminiError.code);
      console.error('Error message:', geminiError.message);
      
      let errorMessage = 'خطا در اتصال به Gemini API';
      let errorDetails = geminiError.message || 'Unknown error';
      
      if (geminiError.status === 429 || geminiError.code === 429) {
        errorMessage = 'محدودیت Quota: تعداد درخواست‌های شما تمام شده است';
        errorDetails = 'لطفاً چند دقیقه صبر کنید یا quota خود را افزایش دهید';
      } else if (geminiError.message?.includes('API key')) {
        errorMessage = 'API Key معتبر نیست';
        errorDetails = 'لطفاً API_KEY را بررسی کنید';
      } else if (geminiError.message?.includes('quota')) {
        errorMessage = 'Quota تمام شده است';
        errorDetails = 'لطفاً چند دقیقه صبر کنید';
      }
      
      res.status(500).json({ 
        success: false,
        message: errorMessage,
        error: errorDetails,
        status: geminiError.status || geminiError.code,
        responseTime: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error('❌ Test Gemini API failed:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطا در تست اتصال',
      error: error.message || 'Unknown error',
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

