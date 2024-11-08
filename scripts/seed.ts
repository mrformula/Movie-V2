const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User').default;
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get admin credentials from env
        const adminUsers = process.env.ADMIN_USERS?.split(',') || ['admin1'];
        const adminPasswords = process.env.ADMIN_PASSWORDS?.split(',') || ['admin2'];

        // Create admin users
        for (let i = 0; i < adminUsers.length; i++) {
            const hashedPassword = await bcrypt.hash(adminPasswords[i], 10);

            await User.findOneAndUpdate(
                { username: adminUsers[i] },
                {
                    username: adminUsers[i],
                    password: hashedPassword,
                    role: 'admin',
                    createdBy: 'system'
                },
                { upsert: true, new: true }
            );

            console.log(`Admin user ${adminUsers[i]} created/updated`);
        }

        console.log('All admin users created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed(); 