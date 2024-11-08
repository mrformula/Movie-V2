import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import TvSeries from '@/models/TvSeries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id, seasonNumber } = req.query;
    await connectDB();

    if (req.method === 'DELETE') {
        try {
            const series = await TvSeries.findById(id);
            if (!series) {
                return res.status(404).json({ error: 'TV series not found' });
            }

            // Remove season from manualSeasons
            series.manualSeasons = series.manualSeasons.filter(
                (s: any) => s.seasonNumber !== parseInt(seasonNumber as string)
            );

            await series.save();
            res.status(200).json({ message: 'Season deleted successfully' });
        } catch (error) {
            console.error('Error deleting season:', error);
            res.status(500).json({ error: 'Error deleting season' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 