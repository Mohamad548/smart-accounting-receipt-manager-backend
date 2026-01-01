import { query, queryOne, execute } from '../database/query.js';
import { Customer } from '../types.js';

export class CustomerModel {
  static async getAll(): Promise<Customer[]> {
    const rows = await query<any>('SELECT * FROM customers ORDER BY created_at DESC');
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      expectedAmount: parseFloat(row.expected_amount),
      collectedAmount: parseFloat(row.collected_amount),
      maturityDate: row.maturity_date,
      createdAt: parseInt(row.created_at),
    }));
  }

  static async getById(id: string): Promise<Customer | null> {
    const row = await queryOne<any>('SELECT * FROM customers WHERE id = $1', [id]);
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      expectedAmount: parseFloat(row.expected_amount),
      collectedAmount: parseFloat(row.collected_amount),
      maturityDate: row.maturity_date,
      createdAt: parseInt(row.created_at),
    };
  }

  static async create(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const id = globalThis.crypto.randomUUID();
    const createdAt = Date.now();

    await execute(
      `INSERT INTO customers (id, name, expected_amount, collected_amount, maturity_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, customer.name, customer.expectedAmount, customer.collectedAmount, customer.maturityDate, createdAt]
    );

    return {
      id,
      ...customer,
      createdAt,
    };
  }

  static async update(id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<Customer | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
    };

    await execute(
      `UPDATE customers 
       SET name = $1, expected_amount = $2, collected_amount = $3, maturity_date = $4, updated_at = $5
       WHERE id = $6`,
      [updated.name, updated.expectedAmount, updated.collectedAmount, updated.maturityDate, Date.now(), id]
    );

    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await execute('DELETE FROM customers WHERE id = $1', [id]);
    return result > 0;
  }

  static async updateCollectedAmount(id: string, amount: number): Promise<boolean> {
    const result = await execute(
      `UPDATE customers 
       SET collected_amount = collected_amount + $1, updated_at = $2
       WHERE id = $3`,
      [amount, Date.now(), id]
    );
    
    return result > 0;
  }
}
