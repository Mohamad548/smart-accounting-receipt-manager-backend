import { getDatabase } from '../database/db';
import { ReceiptRecord } from '../types';

export class ReceiptModel {
  static getAll(): ReceiptRecord[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM receipt_records ORDER BY created_at DESC').all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      customerId: row.customer_id,
      amount: row.amount,
      date: row.date,
      refNumber: row.ref_number || '',
      sender: row.sender || '',
      receiver: row.receiver || '',
      description: row.description || '',
      imageUrl: row.image_url,
      matchedCreditorId: row.matched_creditor_id || undefined,
      dynamicFields: row.dynamic_fields ? JSON.parse(row.dynamic_fields) : {},
      createdAt: row.created_at,
    }));
  }

  static getById(id: string): ReceiptRecord | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM receipt_records WHERE id = ?').get(id) as any;
    
    if (!row) return null;
    
    return {
      id: row.id,
      customerId: row.customer_id,
      amount: row.amount,
      date: row.date,
      refNumber: row.ref_number || '',
      sender: row.sender || '',
      receiver: row.receiver || '',
      description: row.description || '',
      imageUrl: row.image_url,
      matchedCreditorId: row.matched_creditor_id || undefined,
      dynamicFields: row.dynamic_fields ? JSON.parse(row.dynamic_fields) : {},
      createdAt: row.created_at,
    };
  }

  static getByCustomerId(customerId: string): ReceiptRecord[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM receipt_records WHERE customer_id = ? ORDER BY created_at DESC').all(customerId) as any[];
    
    return rows.map(row => ({
      id: row.id,
      customerId: row.customer_id,
      amount: row.amount,
      date: row.date,
      refNumber: row.ref_number || '',
      sender: row.sender || '',
      receiver: row.receiver || '',
      description: row.description || '',
      imageUrl: row.image_url,
      matchedCreditorId: row.matched_creditor_id || undefined,
      dynamicFields: row.dynamic_fields ? JSON.parse(row.dynamic_fields) : {},
      createdAt: row.created_at,
    }));
  }

  static getByRefNumber(refNumber: string): ReceiptRecord | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM receipt_records WHERE ref_number = ?').get(refNumber) as any;
    
    if (!row) return null;
    
    return {
      id: row.id,
      customerId: row.customer_id,
      amount: row.amount,
      date: row.date,
      refNumber: row.ref_number || '',
      sender: row.sender || '',
      receiver: row.receiver || '',
      description: row.description || '',
      imageUrl: row.image_url,
      matchedCreditorId: row.matched_creditor_id || undefined,
      dynamicFields: row.dynamic_fields ? JSON.parse(row.dynamic_fields) : {},
      createdAt: row.created_at,
    };
  }

  static create(receipt: Omit<ReceiptRecord, 'id' | 'createdAt'>): ReceiptRecord {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const createdAt = Date.now();

    db.prepare(`
      INSERT INTO receipt_records (
        id, customer_id, amount, date, ref_number, sender, receiver, 
        description, image_url, matched_creditor_id, dynamic_fields, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
    );

    return {
      id,
      ...receipt,
      createdAt,
    };
  }

  static delete(id: string): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM receipt_records WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

