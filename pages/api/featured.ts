import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import Movie from '@/models/Movie';
import type { FeaturedContent } from '@/types/settings';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectDB();

        // Get featured content IDs from settings
        const settings = await Settings.findOne();
        const featuredIds = settings?.featuredContent?.map((item: FeaturedContent) => item.contentId) || [];

        // Fetch featured movies
        const featuredMovies = await Movie.find({
            _id: { $in: featuredIds }
        }).sort({ createdAt: -1 });

        res.status(200).json(featuredMovies);
    } catch (error) {
        console.error('Error fetching featured content:', error);
        res.status(500).json({ error: 'Error fetching featured content' });
    }
} 