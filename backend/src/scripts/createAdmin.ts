// backend/src/scripts/createAdmin.ts
import { db } from '../config/firebase';
import bcrypt from 'bcryptjs';

export const createAdminUser = async () => {
  const adminEmail = 'admin@africanleague.com';
  const adminPassword = 'admin123';

  // Check if admin already exists
  const existingAdmin = await db.collection('users').where('email', '==', adminEmail).get();
  if (!existingAdmin.empty) {
    console.log('Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = {
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date()
  };

  await db.collection('users').add(adminUser);
  console.log('Admin user created successfully');
  console.log('Email:', adminEmail);
  console.log('Password:', adminPassword);
};

// Run if this file is executed directly
if (require.main === module) {
  createAdminUser();
}