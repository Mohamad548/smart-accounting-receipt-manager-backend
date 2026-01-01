import { Router } from 'express';
import { ReceiptModel } from '../models/ReceiptModel';
import { CustomerModel } from '../models/CustomerModel';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/receipts - Get all receipts
router.get('/', (req, res) => {
  try {
    const receipts = ReceiptModel.getAll();
    res.json(receipts);
  } catch (error: any) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ message: 'خطا در دریافت لیست فیش‌ها' });
  }
});

// GET /api/receipts/:id - Get receipt by ID
router.get('/:id', (req, res) => {
  try {
    const receipt = ReceiptModel.getById(req.params.id);
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
router.get('/customer/:customerId', (req, res) => {
  try {
    const receipts = ReceiptModel.getByCustomerId(req.params.customerId);
    res.json(receipts);
  } catch (error: any) {
    console.error('Error fetching customer receipts:', error);
    res.status(500).json({ message: 'خطا در دریافت فیش‌های مشتری' });
  }
});

// POST /api/receipts - Create new receipt
router.post('/', (req, res) => {
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
    const customer = CustomerModel.getById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'مشتری یافت نشد' });
    }

    // Check for duplicate by refNumber
    if (refNumber) {
      const existing = ReceiptModel.getByRefNumber(refNumber);
      if (existing) {
        return res.status(400).json({ message: 'این فیش قبلاً ثبت شده است' });
      }
    }

    const receipt = ReceiptModel.create({
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
    CustomerModel.updateCollectedAmount(customerId, receipt.amount);

    res.status(201).json(receipt);
  } catch (error: any) {
    console.error('Error creating receipt:', error);
    res.status(500).json({ message: 'خطا در ایجاد فیش' });
  }
});

// DELETE /api/receipts/:id - Delete receipt
router.delete('/:id', (req, res) => {
  try {
    const receipt = ReceiptModel.getById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'فیش یافت نشد' });
    }

    // Update customer collected amount (subtract)
    CustomerModel.updateCollectedAmount(receipt.customerId, -receipt.amount);

    const deleted = ReceiptModel.delete(req.params.id);
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

