import { Router } from 'express';
import { ReceiptModel } from '../models/ReceiptModel.js';
import { CustomerModel } from '../models/CustomerModel.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/receipts - Get all receipts
router.get('/', async (req, res) => {
  try {
    const receipts = await ReceiptModel.getAll();
    res.json(receipts);
  } catch (error: any) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ message: 'خطا در دریافت لیست فیش‌ها' });
  }
});

// GET /api/receipts/:id - Get receipt by ID
router.get('/:id', async (req, res) => {
  try {
    const receipt = await ReceiptModel.getById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'فیش یافت نشد' });
    }
    res.json(receipt);
  } catch (error: any) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ message: 'خطا در دریافت اطلاعات فیش' });
  }
});

// GET /api/receipts/customer/:customerId - Get receipts by customer ID
router.get('/customer/:customerId', async (req, res) => {
  try {
    const receipts = await ReceiptModel.getByCustomerId(req.params.customerId);
    res.json(receipts);
  } catch (error: any) {
    console.error('Error fetching customer receipts:', error);
    res.status(500).json({ message: 'خطا در دریافت فیش‌های مشتری' });
  }
});

// POST /api/receipts - Create new receipt
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      amount,
      date,
      refNumber,
      sender,
      receiver,
      description,
      imageUrl,
      matchedCreditorId,
      dynamicFields,
    } = req.body;

    if (!customerId || amount === undefined || !date || !imageUrl) {
      return res.status(400).json({ message: 'فیلدهای الزامی را پر کنید' });
    }

    // Check if customer exists
    const customer = await CustomerModel.getById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'مشتری یافت نشد' });
    }

    // Check for duplicate by refNumber
    if (refNumber) {
      const existing = await ReceiptModel.getByRefNumber(refNumber);
      if (existing) {
        return res.status(400).json({ message: 'این فیش قبلاً ثبت شده است' });
      }
    }

    const receipt = await ReceiptModel.create({
      customerId,
      amount: Number(amount),
      date,
      refNumber: refNumber || '',
      sender: sender || '',
      receiver: receiver || '',
      description: description || '',
      imageUrl,
      matchedCreditorId: matchedCreditorId || undefined,
      dynamicFields: dynamicFields || {},
    });

    // Update customer collected amount
    await CustomerModel.updateCollectedAmount(customerId, receipt.amount);

    res.status(201).json(receipt);
  } catch (error: any) {
    console.error('Error creating receipt:', error);
    res.status(500).json({ message: 'خطا در ایجاد فیش' });
  }
});

// DELETE /api/receipts/:id - Delete receipt
router.delete('/:id', async (req, res) => {
  try {
    const receipt = await ReceiptModel.getById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'فیش یافت نشد' });
    }

    // Update customer collected amount (subtract)
    await CustomerModel.updateCollectedAmount(receipt.customerId, -receipt.amount);

    const deleted = await ReceiptModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'فیش یافت نشد' });
    }

    res.json({ message: 'فیش با موفقیت حذف شد' });
  } catch (error: any) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({ message: 'خطا در حذف فیش' });
  }
});

export default router;

