import { initDatabase, getDatabase } from '../src/database/db';
import { UserModel } from '../src/models/UserModel';

async function testDatabase() {
  console.log('🧪 Testing database connection...\n');

  try {
    // Initialize database
    const db = initDatabase();
    console.log('✅ Database initialized');

    // Test query
    const result = db.prepare('SELECT name FROM sqlite_master WHERE type="table"').all();
    console.log('✅ Database tables:', result.map((r: any) => r.name).join(', '));

    // Test UserModel
    const adminUser = UserModel.findByUsername('admin');
    if (adminUser) {
      console.log('✅ Admin user exists:', adminUser.username);
    } else {
      console.log('⚠️  Admin user not found, creating...');
      await UserModel.create('admin', 'admin123');
      console.log('✅ Admin user created');
    }

    // Test database operations
    const testUser = UserModel.findByUsername('admin');
    if (testUser) {
      console.log('✅ User lookup works');
    }

    console.log('\n✅ All database tests passed!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();

