import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import TvSeries from '@/models/TvSeries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id, episodeNumber } = req.query;
    await connectDB();

    if (req.method === 'DELETE') {
        try {
            const { seasonNumber } = req.body;

            const series = await TvSeries.findById(id);
            if (!series) {
                return res.status(404).json({ error: 'TV series not found' });
            }

            const season = series.manualSeasons?.find(
                (s: any) => s.seasonNumber === seasonNumber
            );

            if (!season) {
                return res.status(404).json({ error: 'Season not found' });
            }

            // Remove episode
            season.episodes = season.episodes.filter(
                (e: any) => e.episodeNumber !== parseInt(episodeNumber as string)
            );

            await series.save();
            res.status(200).json({ message: 'Episode deleted successfully' });
        } catch (error) {
            console.error('Error deleting episode:', error);
            res.status(500).json({ error: 'Error deleting episode' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 