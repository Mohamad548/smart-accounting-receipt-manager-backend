import { getPool } from './db.js';
import { PoolClient } from 'pg';

// Schema name
const SCHEMA = 'smart_accounting_receipt_manager';

// Helper function for queries (automatically uses schema via search_path)
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    // Set search path for this connection
    await client.query(`SET search_path TO ${SCHEMA}, public`);
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

// Helper function for single row queries
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    // Set search path for this connection
    await client.query(`SET search_path TO ${SCHEMA}, public`);
    const result = await client.query(text, params);
    return result.rows[0] as T || null;
  } finally {
    client.release();
  }
}

// Helper function for insert/update/delete
export async function execute(text: string, params?: any[]): Promise<number> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    // Set search path for this connection
    await client.query(`SET search_path TO ${SCHEMA}, public`);
    const result = await client.query(text, params);
    return result.rowCount || 0;
  } finally {
    client.release();
  }
}

