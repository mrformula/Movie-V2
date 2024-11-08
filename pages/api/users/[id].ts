import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    await connectDB();

    if (req.method === 'DELETE') {
        try {
            const user = await User.findByIdAndDelete(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting user' });
        }
    }
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 