import { config } from 'dotenv';
import { resolve } from 'path';
import { initDatabase } from '../src/database/db';
import { UserModel } from '../src/models/UserModel';

// Load .env file
config({ path: resolve(process.cwd(), '.env') });

async function createAdmin() {
  console.log('🔐 Creating admin user...\n');

  try {
    initDatabase();

    const existingUser = await UserModel.findByUsername('admin');
    if (existingUser) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    const user = await UserModel.create('admin', 'admin123');
    console.log('✅ Admin user created successfully!');
    console.log('\n📝 Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change the password in production!');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();

