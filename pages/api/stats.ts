import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Movie from '@/models/Movie';
import TvSeries from '@/models/TvSeries';
import mongoose from 'mongoose';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectDB();

        // Get local stats
        const [movies, tvSeries] = await Promise.all([
            Movie.countDocuments(),
            TvSeries.countDocuments()
        ]);

        // Get MongoDB storage stats
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }

        const stats = await db.stats();

        // Convert bytes to MB with 2 decimal places
        const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);

        // Calculate storage
        const storageUsed = bytesToMB(stats.dataSize + stats.indexSize);
        const storageLimit = 512; // Free tier limit in MB
        const storageLeft = (storageLimit - parseFloat(storageUsed)).toFixed(2);

        // Get StreamWish account info
        const streamwishResponse = await axios.get(
            `https://api.streamwish.com/api/account/info?key=${process.env.STREAMWISH_API_KEY}`
        );

        const streamwishData = streamwishResponse.data.result;

        // Get recent activities
        const recentMovies = await Movie.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title createdAt');

        const recentTvSeries = await TvSeries.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title createdAt');

        // Combine and format activities
        const recentActivities = [
            ...recentMovies.map(movie => ({
                type: 'movie' as const,
                title: movie.title,
                createdAt: movie.createdAt
            })),
            ...recentTvSeries.map(series => ({
                type: 'tvSeries' as const,
                title: series.title,
                createdAt: series.createdAt
            }))
        ]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);

        res.status(200).json({
            movies,
            tvSeries,
            totalFiles: streamwishData.files_total,
            storageUsed: `${storageUsed} MB`,
            storageLeft: `${storageLeft} MB`,
            recentActivities
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Error fetching stats' });
    }
} 