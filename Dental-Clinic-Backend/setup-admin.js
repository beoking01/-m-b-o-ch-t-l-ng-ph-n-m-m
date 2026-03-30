// Create admin account
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Account = require('./src/models/account');
const Role = require('./src/models/role');

const createAdminAccount = async () => {
  try {
    console.log('🚀 Starting in-memory MongoDB...');

    // Start in-memory MongoDB
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create admin role if not exists
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'admin',
        description: 'Administrator',
        permissions: [
          { module: 'appointment', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'patient', actions: ['read', 'update'] },
          { module: 'schedule', actions: ['read', 'update'] },
          { module: 'invoice', actions: ['read', 'update', 'delete'] },
        ]
      });
      console.log('✅ Created admin role');
    }

    // Create admin account
    const existingAdmin = await Account.findOne({ email: 'admin@healthcare.vn' });
    if (existingAdmin) {
      console.log('✅ Admin account already exists');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Account.create({
        email: 'admin@healthcare.vn',
        password: hashedPassword,
        roleId: adminRole._id,
        status: 'active'
      });
      console.log('✅ Created admin account: admin@healthcare.vn');
    }

    console.log('🎉 Admin account ready!');
    console.log('📧 Email: admin@healthcare.vn');
    console.log('🔑 Password: admin123');

    // Keep connection open for testing
    return mongoServer;

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

module.exports = { createAdminAccount };

// Run if called directly
if (require.main === module) {
  createAdminAccount().then(() => {
    console.log('Admin account created. You can now test login.');
  });
}