import { getDatabase } from '../database/db';
import { Creditor } from '../types';

export class CreditorModel {
  static getAll(): Creditor[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM creditors ORDER BY created_at DESC').all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      accountNumber: row.account_number,
      shebaNumber: row.sheba_number,
      totalAmount: row.total_amount,
      remainingAmount: row.remaining_amount,
      createdAt: row.created_at,
    }));
  }

  static getById(id: string): Creditor | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM creditors WHERE id = ?').get(id) as any;
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      accountNumber: row.account_number,
      shebaNumber: row.sheba_number,
      totalAmount: row.total_amount,
      remainingAmount: row.remaining_amount,
      createdAt: row.created_at,
    };
  }

  static create(creditor: Omit<Creditor, 'id' | 'createdAt'>): Creditor {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const createdAt = Date.now();

    db.prepare(`
      INSERT INTO creditors (id, name, account_number, sheba_number, total_amount, remaining_amount, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      creditor.name,
      creditor.accountNumber,
      creditor.shebaNumber,
      creditor.totalAmount,
      creditor.remainingAmount,
      createdAt
    );

    return {
      id,
      ...creditor,
      createdAt,
    };
  }

  static update(id: string, updates: Partial<Omit<Creditor, 'id' | 'createdAt'>>): Creditor | null {
    const db = getDatabase();
    const existing = this.getById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
    };

    db.prepare(`
      UPDATE creditors 
      SET name = ?, account_number = ?, sheba_number = ?, total_amount = ?, remaining_amount = ?, updated_at = ?
      WHERE id = ?
    `).run(
      updated.name,
      updated.accountNumber,
      updated.shebaNumber,
      updated.totalAmount,
      updated.remainingAmount,
      Date.now(),
      id
    );

    return updated;
  }

  static delete(id: string): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM creditors WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

