import { query, queryOne, execute } from '../database/query';
import { Creditor } from '../types';

export class CreditorModel {
  static async getAll(): Promise<Creditor[]> {
    const rows = await query<any>('SELECT * FROM creditors ORDER BY created_at DESC');
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      accountNumber: row.account_number,
      shebaNumber: row.sheba_number,
      totalAmount: parseFloat(row.total_amount),
      remainingAmount: parseFloat(row.remaining_amount),
      createdAt: parseInt(row.created_at),
    }));
  }

  static async getById(id: string): Promise<Creditor | null> {
    const row = await queryOne<any>('SELECT * FROM creditors WHERE id = $1', [id]);
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      accountNumber: row.account_number,
      shebaNumber: row.sheba_number,
      totalAmount: parseFloat(row.total_amount),
      remainingAmount: parseFloat(row.remaining_amount),
      createdAt: parseInt(row.created_at),
    };
  }

  static async create(creditor: Omit<Creditor, 'id' | 'createdAt'>): Promise<Creditor> {
    const id = globalThis.crypto.randomUUID();
    const createdAt = Date.now();

    await execute(
      `INSERT INTO creditors (id, name, account_number, sheba_number, total_amount, remaining_amount, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, creditor.name, creditor.accountNumber, creditor.shebaNumber, creditor.totalAmount, creditor.remainingAmount, createdAt]
    );

    return {
      id,
      ...creditor,
      createdAt,
    };
  }

  static async update(id: string, updates: Partial<Omit<Creditor, 'id' | 'createdAt'>>): Promise<Creditor | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
    };

    await execute(
      `UPDATE creditors 
       SET name = $1, account_number = $2, sheba_number = $3, total_amount = $4, remaining_amount = $5, updated_at = $6
       WHERE id = $7`,
      [updated.name, updated.accountNumber, updated.shebaNumber, updated.totalAmount, updated.remainingAmount, Date.now(), id]
    );

    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await execute('DELETE FROM creditors WHERE id = $1', [id]);
    return result > 0;
  }
}
