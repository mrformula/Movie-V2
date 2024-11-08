import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import TvSeries from '@/models/TvSeries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    await connectDB();

    if (req.method === 'POST') {
        try {
            const { seasonNumber, episodes } = req.body;

            const series = await TvSeries.findById(id);
            if (!series) {
                return res.status(404).json({ error: 'TV series not found' });
            }

            const newSeason = {
                seasonNumber,
                episodes: episodes.map((episode: any) => ({
                    episodeNumber: episode.episodeNumber,
                    title: episode.title
                }))
            };

            if (!series.manualSeasons) {
                series.manualSeasons = [];
            }

            series.manualSeasons.push(newSeason);
            await series.save();

            res.status(200).json(series);
        } catch (error) {
            console.error('Error adding season:', error);
            res.status(500).json({ error: 'Error adding season' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 