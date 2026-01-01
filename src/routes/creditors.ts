import { Router } from 'express';
import { CreditorModel } from '../models/CreditorModel.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/creditors - Get all creditors
router.get('/', async (req, res) => {
  try {
    const creditors = await CreditorModel.getAll();
    res.json(creditors);
  } catch (error: any) {
    console.error('Error fetching creditors:', error);
    res.status(500).json({ message: 'خطا در دریافت لیست طلبکاران' });
  }
});

// GET /api/creditors/:id - Get creditor by ID
router.get('/:id', async (req, res) => {
  try {
    const creditor = await CreditorModel.getById(req.params.id);
    if (!creditor) {
      return res.status(404).json({ message: 'طلبکار یافت نشد' });
    }
    res.json(creditor);
  } catch (error: any) {
    console.error('Error fetching creditor:', error);
    res.status(500).json({ message: 'خطا در دریافت اطلاعات طلبکار' });
  }
});

// POST /api/creditors - Create new creditor
router.post('/', async (req, res) => {
  try {
    const { name, accountNumber, shebaNumber, totalAmount, remainingAmount } = req.body;
    
    if (!name || !accountNumber || totalAmount === undefined) {
      return res.status(400).json({ message: 'فیلدهای الزامی را پر کنید' });
    }

    const creditor = await CreditorModel.create({
      name,
      accountNumber,
      shebaNumber: shebaNumber || '',
      totalAmount: Number(totalAmount),
      remainingAmount: remainingAmount !== undefined ? Number(remainingAmount) : Number(totalAmount),
    });

    res.status(201).json(creditor);
  } catch (error: any) {
    console.error('Error creating creditor:', error);
    res.status(500).json({ message: 'خطا در ایجاد طلبکار' });
  }
});

// PUT /api/creditors/:id - Update creditor
router.put('/:id', async (req, res) => {
  try {
    const { name, accountNumber, shebaNumber, totalAmount, remainingAmount } = req.body;
    
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (accountNumber !== undefined) updates.accountNumber = accountNumber;
    if (shebaNumber !== undefined) updates.shebaNumber = shebaNumber;
    if (totalAmount !== undefined) updates.totalAmount = Number(totalAmount);
    if (remainingAmount !== undefined) updates.remainingAmount = Number(remainingAmount);

    const creditor = await CreditorModel.update(req.params.id, updates);
    if (!creditor) {
      return res.status(404).json({ message: 'طلبکار یافت نشد' });
    }

    res.json(creditor);
  } catch (error: any) {
    console.error('Error updating creditor:', error);
    res.status(500).json({ message: 'خطا در به‌روزرسانی طلبکار' });
  }
});

// DELETE /api/creditors/:id - Delete creditor
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await CreditorModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'طلبکار یافت نشد' });
    }
    res.json({ message: 'طلبکار با موفقیت حذف شد' });
  } catch (error: any) {
    console.error('Error deleting creditor:', error);
    res.status(500).json({ message: 'خطا در حذف طلبکار' });
  }
});

export default router;

