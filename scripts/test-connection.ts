import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file
config({ path: resolve(process.cwd(), '.env') });

async function testConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('\n📝 Please set DATABASE_URL in your .env file or environment variables');
    process.exit(1);
  }

  console.log('🔍 Testing database connection...\n');
  console.log('📍 Connection String:', databaseUrl.replace(/:[^:@]+@/, ':****@')); // Hide password

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('   ✅ Connected!');
    console.log('   📅 Server time:', result.rows[0].current_time);

    // Set search path
    await pool.query('SET search_path TO smart_accounting_receipt_manager, public');

    // Test 2: Check tables in our schema
    console.log('\n2️⃣ Checking tables in schema: smart_accounting_receipt_manager...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'smart_accounting_receipt_manager'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`   ✅ Found ${tables.length} tables:`);
    tables.forEach(table => console.log(`      - ${table}`));

    const expectedTables = ['users', 'refresh_tokens', 'creditors', 'customers', 'receipt_records'];
    const missingTables = expectedTables.filter(t => !tables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('\n   ⚠️  Missing tables:', missingTables.join(', '));
      console.log('   💡 Run the schema.postgresql.sql file in Neon SQL Editor');
    } else {
      console.log('\n   ✅ All required tables exist in schema: smart_accounting_receipt_manager!');
    }

    // Test 3: Test query
    console.log('\n3️⃣ Testing query...');
    const userCount = await pool.query('SELECT COUNT(*) as count FROM smart_accounting_receipt_manager.users');
    console.log(`   ✅ Users table accessible (${userCount.rows[0].count} users)`);

    console.log('\n🎉 Database connection test passed!');
    console.log('✅ Everything is working correctly');
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Database connection test failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Check your DATABASE_URL - password might be incorrect');
    } else if (error.message.includes('does not exist')) {
      console.error('\n💡 Check your DATABASE_URL - database name might be incorrect');
    } else if (error.message.includes('SSL')) {
      console.error('\n💡 Make sure your DATABASE_URL includes ?sslmode=require');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();

