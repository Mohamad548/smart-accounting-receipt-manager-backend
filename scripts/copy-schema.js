import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcPath = join(__dirname, '..', 'src', 'database', 'schema.postgresql.sql');
const destDir = join(__dirname, '..', 'dist', 'database');
const destPath = join(destDir, 'schema.postgresql.sql');

try {
  // Create dist/database directory if it doesn't exist
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }
  
  // Copy the schema file
  copyFileSync(srcPath, destPath);
  console.log('✅ Schema file copied to dist/database/schema.postgresql.sql');
} catch (error) {
  console.error('❌ Error copying schema file:', error.message);
  process.exit(1);
}

