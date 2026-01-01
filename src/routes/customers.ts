import { Router } from 'express';
import { CustomerModel } from '../models/CustomerModel.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/customers - Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await CustomerModel.getAll();
    res.json(customers);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'خطا در دریافت لیست مشتریان' });
  }
});

// GET /api/customers/:id - Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await CustomerModel.getById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'مشتری یافت نشد' });
    }
    res.json(customer);
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'خطا در دریافت اطلاعات مشتری' });
  }
});

// POST /api/customers - Create new customer
router.post('/', async (req, res) => {
  try {
    const { name, expectedAmount, collectedAmount, maturityDate } = req.body;
    
    if (!name || expectedAmount === undefined || !maturityDate) {
      return res.status(400).json({ message: 'فیلدهای الزامی را پر کنید' });
    }

    const customer = await CustomerModel.create({
      name,
      expectedAmount: Number(expectedAmount),
      collectedAmount: collectedAmount !== undefined ? Number(collectedAmount) : 0,
      maturityDate,
    });

    res.status(201).json(customer);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    if (error.message?.includes('UNIQUE') || error.code === '23505') {
      return res.status(400).json({ message: 'این مشتری قبلاً ثبت شده است' });
    }
    res.status(500).json({ message: 'خطا در ایجاد مشتری' });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, expectedAmount, collectedAmount, maturityDate } = req.body;
    
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (expectedAmount !== undefined) updates.expectedAmount = Number(expectedAmount);
    if (collectedAmount !== undefined) updates.collectedAmount = Number(collectedAmount);
    if (maturityDate !== undefined) updates.maturityDate = maturityDate;

    const customer = await CustomerModel.update(req.params.id, updates);
    if (!customer) {
      return res.status(404).json({ message: 'مشتری یافت نشد' });
    }

    res.json(customer);
  } catch (error: any) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'خطا در به‌روزرسانی مشتری' });
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await CustomerModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'مشتری یافت نشد' });
    }
    res.json({ message: 'مشتری با موفقیت حذف شد' });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'خطا در حذف مشتری' });
  }
});

export default router;

