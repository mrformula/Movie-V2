import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Movie from '@/models/Movie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { q } = req.query;

    try {
        await connectDB();

        const movies = await Movie.find({
            title: { $regex: q, $options: 'i' }
        })
            .select('_id title poster year')
            .limit(4);

        res.status(200).json(movies);
    } catch (error) {
        console.error('Error searching movies:', error);
        res.status(500).json({ error: 'Error searching movies' });
    }
} 