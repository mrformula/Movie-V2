import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { username, password } = req.body;

        // First check env credentials
        const adminUsers = process.env.ADMIN_USERS?.split(',') || [];
        const adminPasswords = process.env.ADMIN_PASSWORDS?.split(',') || [];

        // Check if credentials match with env variables
        const envUserIndex = adminUsers.indexOf(username);
        if (envUserIndex !== -1 && adminPasswords[envUserIndex] === password) {
            const userData = {
                id: 'env_admin',
                username: username,
                role: 'admin'
            };

            return res.status(200).json({
                message: 'Login successful',
                user: userData
            });
        }

        // If not matched with env, check database
        await connectDB();
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const userData = {
            id: user._id,
            username: user.username,
            role: user.role
        };

        res.status(200).json({
            message: 'Login successful',
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
} 