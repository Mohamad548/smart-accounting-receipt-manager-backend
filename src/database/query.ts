import { getPool } from './db';
import { PoolClient } from 'pg';

// Helper function for queries
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows as T[];
}

// Helper function for single row queries
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows[0] as T || null;
}

// Helper function for insert/update/delete
export async function execute(text: string, params?: any[]): Promise<number> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rowCount || 0;
}

