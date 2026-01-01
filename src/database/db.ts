import { Pool, PoolClient } from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let pool: Pool | null = null;

// Get database connection string from environment
function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return dbUrl;
}

export function initDatabase(): Pool {
  if (pool) {
    return pool;
  }

  const databaseUrl = getDatabaseUrl();
  
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Test connection
  pool.query('SELECT NOW()')
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((err) => {
      console.error('❌ Database connection failed:', err);
    });

  // Initialize schema
  initializeSchema();

  return pool;
}

async function initializeSchema() {
  if (!pool) return;

  try {
    const schemaPath = join(__dirname, 'schema.postgresql.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    const client = await pool.connect();
    try {
      for (const statement of statements) {
        if (statement.trim()) {
          await client.query(statement);
        }
      }
      console.log('✅ Database schema initialized successfully');
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('❌ Error initializing database schema:', error.message);
    // Don't throw - schema might already exist
  }
}

export async function getDatabaseClient(): Promise<PoolClient> {
  if (!pool) {
    initDatabase();
  }
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool.connect();
}

export function getPool(): Pool {
  if (!pool) {
    return initDatabase();
  }
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});
