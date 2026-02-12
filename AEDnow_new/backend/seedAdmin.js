require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');

const createDefaultAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Default admin already exists');
      console.log('Username: admin');
      console.log('If you forgot the password, delete this admin from MongoDB and run this script again');
      process.exit(0);
    }

    // Create default admin
    const defaultAdmin = new Admin({
      username: 'admin',
      password: 'admin123',  // Change this password after first login!
      email: 'admin@aednow.online'
    });

    await defaultAdmin.save();
    
    console.log('✅ Default admin created successfully!');
    console.log('-----------------------------------');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@aednow.online');
    console.log('-----------------------------------');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating default admin:', error);
    process.exit(1);
  }
};

createDefaultAdmin();
