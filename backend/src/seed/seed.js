const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const School = require('../models/School');

dotenv.config({ path: './.env' });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing data
    await User.deleteMany();
    await School.deleteMany();

    console.log('Data Cleared...');

    // Create a dummy school for Admin and Teacher
    const school = await School.create({
      name: '1-IDUM',
      director: 'Maktab Direktori',
      teachersCount: 1,
      studentsCount: 100,
      status: 'Active'
    });

    // Create SuperAdmin
    await User.create({
      fullName: 'Super Admin',
      email: 'super@example.com',
      password: '123',
      role: 'superadmin'
    });

    // Create Admin (Director)
    await User.create({
      fullName: 'Maktab Direktori',
      email: 'admin@example.com',
      password: '123',
      role: 'admin',
      schoolId: school._id
    });

    // Create Teacher
    await User.create({
      fullName: 'Anvarov Jamshid',
      email: 'teacher@example.com',
      password: '123',
      role: 'teacher',
      schoolId: school._id
    });

    console.log('Seed Data Created!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
