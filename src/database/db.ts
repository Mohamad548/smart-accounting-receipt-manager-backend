import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DB_PATH || join(__dirname, '../../data/database.db');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

let db: Database.Database | null = null;

export function initDatabase(): Database.Database {
  if (db) {
    return db;
  }

  // Ensure data directory exists
  try {
    mkdirSync(dirname(DB_PATH), { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  // Create or open database
  db = new Database(DB_PATH);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Read and execute schema
  try {
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

