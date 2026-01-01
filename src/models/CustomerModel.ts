import { getDatabase } from '../database/db';
import { Customer } from '../types';

export class CustomerModel {
  static getAll(): Customer[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      expectedAmount: row.expected_amount,
      collectedAmount: row.collected_amount,
      maturityDate: row.maturity_date,
      createdAt: row.created_at,
    }));
  }

  static getById(id: string): Customer | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as any;
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      expectedAmount: row.expected_amount,
      collectedAmount: row.collected_amount,
      maturityDate: row.maturity_date,
      createdAt: row.created_at,
    };
  }

  static create(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const createdAt = Date.now();

    db.prepare(`
      INSERT INTO customers (id, name, expected_amount, collected_amount, maturity_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      customer.name,
      customer.expectedAmount,
      customer.collectedAmount,
      customer.maturityDate,
      createdAt
    );

    return {
      id,
      ...customer,
      createdAt,
    };
  }

  static update(id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>): Customer | null {
    const db = getDatabase();
    const existing = this.getById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
    };

    db.prepare(`
      UPDATE customers 
      SET name = ?, expected_amount = ?, collected_amount = ?, maturity_date = ?, updated_at = ?
      WHERE id = ?
    `).run(
      updated.name,
      updated.expectedAmount,
      updated.collectedAmount,
      updated.maturityDate,
      Date.now(),
      id
    );

    return updated;
  }

  static delete(id: string): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static updateCollectedAmount(id: string, amount: number): boolean {
    const db = getDatabase();
    const result = db.prepare(`
      UPDATE customers 
      SET collected_amount = collected_amount + ?, updated_at = ?
      WHERE id = ?
    `).run(amount, Date.now(), id);
    
    return result.changes > 0;
  }
}

