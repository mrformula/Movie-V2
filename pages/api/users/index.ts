import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();

    if (req.method === 'GET') {
        try {
            const users = await User.find({}).select('-password');
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching users' });
        }
    }
    else if (req.method === 'POST') {
        try {
            const { username, password, role } = req.body;

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                username,
                password: hashedPassword,
                role,
                createdBy: 'admin' // You might want to get this from the session
            });

            res.status(201).json({ ...user.toObject(), password: undefined });
        } catch (error) {
            res.status(500).json({ error: 'Error creating user' });
        }
    }
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 