// Seed HR1 Admin and Employee accounts
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://carlobaclao789_db_user:z6CZqGsl3Nkves0R@cluster0.iabkgoj.mongodb.net/hr3?retryWrites=true&w=majority&appName=Cluster0';

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: 'employee' }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function seedHR1Users() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // HR1 Admin Account
        const adminPassword = await bcrypt.hash('Admin123!', 10);
        const admin = await User.findOneAndUpdate(
            { email: 'hr1admin@hr1.com' },
            {
                fullName: 'HR1 Admin',
                email: 'hr1admin@hr1.com',
                password: adminPassword,
                role: 'hr1admin'
            },
            { upsert: true, new: true }
        );
        console.log('✅ Admin created:', admin.email);

        // Employee Account
        const employeePassword = await bcrypt.hash('Employee123!', 10);
        const employee = await User.findOneAndUpdate(
            { email: 'employee@hr1.com' },
            {
                fullName: 'Test Employee',
                email: 'employee@hr1.com',
                password: employeePassword,
                role: 'employee'
            },
            { upsert: true, new: true }
        );
        console.log('✅ Employee created:', employee.email);

        console.log('\n🔐 HR1 Login Credentials:');
        console.log('   Admin: hr1admin@hr1.com / Admin123!');
        console.log('   Employee: employee@hr1.com / Employee123!');

        await mongoose.disconnect();
        console.log('\nDone!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

seedHR1Users();
