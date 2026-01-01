import { query, queryOne, execute } from '../database/query';
import { ReceiptRecord } from '../types';

export class ReceiptModel {
  static async getAll(): Promise<ReceiptRecord[]> {
    const rows = await query<any>('SELECT * FROM receipt_records ORDER BY created_at DESC');
    
    return rows.map(row => ({
      id: row.id,
      customerId: row.customer_id,
      amount: parseFloat(row.amount),
      date: row.date,
      refNumber: row.ref_number || '',
      sender: row.sender || '',
      receiver: row.receiver || '',
      description: row.description || '',
      imageUrl: row.image_url,
      matchedCreditorId: row.matched_creditor_id || undefined,
      dynamicFields: row.dynamic_fields || {},
      createdAt: parseInt(row.created_at),
    }));
  }

  static async getById(id: string): Promise<ReceiptRecord | null> {
    const row = await queryOne<any>('SELECT * FROM receipt_records WHERE id = $1', [id]);
    
    if (!row) return null;
    
    return {
      id: row.id,
      customerId: row.customer_id,
      amount: parseFloat(row.amount),
      date: row.date,
      refNumber: row.ref_number || '',
      sender: row.sender || '',
      receiver: row.receiver || '',
      description: row.description || '',
      imageUrl: row.image_url,
      matchedCreditorId: row.matched_creditor_id || undefined,
      dynamicFields: row.dynamic_fields || {},
      createdAt: parseInt(row.created_at),
    };
  }

  static async getByCustomerId(customerId: string): Promise<ReceiptRecord[]> {
    const rows = await query<any>(
      'SELECT * FROM receipt_records WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    );
    
    return rows.map(row => ({
      id: row.id,
      customerId: row.customer_id,
      amount: parseFloat(row.amount),
      date: row.date,
      refNumber: row.ref_number || '',
      sender: row.sender || '',
      receiver: row.receiver || '',
      description: row.description || '',
      imageUrl: row.image_url,
      matchedCreditorId: row.matched_creditor_id || undefined,
      dynamicFields: row.dynamic_fields || {},
      createdAt: parseInt(row.created_at),
    }));
  }

  static async getByRefNumber(refNumber: string): Promise<ReceiptRecord | null> {
    const row = await queryOne<any>('SELECT * FROM receipt_records WHERE ref_number = $1', [refNumber]);
    
    if (!row) return null;
    
    return {
      id: row.id,
      customerId: row.customer_id,
      amount: parseFloat(row.amount),
      date: row.date,
      refNumber: row.ref_number || '',
      sender: row.sender || '',
      receiver: row.receiver || '',
      description: row.description || '',
      imageUrl: row.image_url,
      matchedCreditorId: row.matched_creditor_id || undefined,
      dynamicFields: row.dynamic_fields || {},
      createdAt: parseInt(row.created_at),
    };
  }

  static async create(receipt: Omit<ReceiptRecord, 'id' | 'createdAt'>): Promise<ReceiptRecord> {
    const id = globalThis.crypto.randomUUID();
    const createdAt = Date.now();

    await execute(
      `INSERT INTO receipt_records (
        id, customer_id, amount, date, ref_number, sender, receiver, 
        description, image_url, matched_creditor_id, dynamic_fields, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        receipt.customerId,
        receipt.amount,
        receipt.date,
        receipt.refNumber || null,
        receipt.sender || null,
        receipt.receiver || null,
        receipt.description || null,
        receipt.imageUrl,
        receipt.matchedCreditorId || null,
        JSON.stringify(receipt.dynamicFields || {}),
        createdAt
      ]
    );

    return {
      id,
      ...receipt,
      createdAt,
    };
  }

  static async delete(id: string): Promise<boolean> {
    const result = await execute('DELETE FROM receipt_records WHERE id = $1', [id]);
    return result > 0;
  }
}
