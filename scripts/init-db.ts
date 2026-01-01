import { initDatabase } from '../src/database/db';
import { UserModel } from '../src/models/UserModel';

async function initializeDatabase() {
  console.log('🚀 Initializing database...\n');

  try {
    // Initialize database
    const db = initDatabase();
    console.log('✅ Database initialized successfully');

    // Check tables
    const tables = db.prepare('SELECT name FROM sqlite_master WHERE type="table"').all() as any[];
    console.log(`✅ Created ${tables.length} tables:`, tables.map(t => t.name).join(', '));

    // Create default admin user
    const existingUser = UserModel.findByUsername('admin');
    if (!existingUser) {
      await UserModel.create('admin', 'admin123');
      console.log('✅ Default admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log('✅ Admin user already exists');
    }

    console.log('\n🎉 Database initialization completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start backend: npm run dev');
    console.log('   2. Start frontend: cd ../frontend && npm run dev');
    console.log('   3. Open http://localhost:3000');
    console.log('   4. Login with admin/admin123');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

initializeDatabase();

