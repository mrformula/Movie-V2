import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import TvSeries from '@/models/TvSeries';
import type { Episode } from '@/types/episode';

interface Season {
    seasonNumber: number;
    episodes: Episode[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    await connectDB();

    if (req.method === 'GET') {
        try {
            const series = await TvSeries.findById(id);
            if (!series) {
                return res.status(404).json({ error: 'TV series not found' });
            }
            res.status(200).json(series.episodes);
        } catch (error: any) {
            console.error('Error fetching episodes:', error);
            res.status(500).json({
                error: 'Error fetching episodes',
                details: error?.message || 'Unknown error'
            });
        }
    }
    else if (req.method === 'PUT') {
        try {
            const { seasonNumber, episodeNumber, ...updates } = req.body;

            // Clean up downloadLinks data if present
            if (updates.downloadLinks) {
                updates.downloadLinks = updates.downloadLinks.map((link: any) => ({
                    language: Array.isArray(link.language) ? link.language : [],
                    quality: link.quality || '',
                    size: link.size || '',
                    format: link.format || '',
                    type: link.type || '',
                    url: link.url || ''
                }));
            }

            const series = await TvSeries.findById(id);
            if (!series) {
                return res.status(404).json({ error: 'TV series not found' });
            }

            // Find the season and episode
            const season = series.manualSeasons?.find((s: Season) => s.seasonNumber === seasonNumber);
            if (!season) {
                return res.status(404).json({ error: 'Season not found' });
            }

            const episodeIndex = season.episodes.findIndex((e: Episode) => e.episodeNumber === episodeNumber);
            if (episodeIndex === -1) {
                return res.status(404).json({ error: 'Episode not found' });
            }

            // Update the episode
            season.episodes[episodeIndex] = {
                ...season.episodes[episodeIndex],
                ...updates,
                embedCode: updates.embedCode || season.episodes[episodeIndex].embedCode,
                downloadLinks: updates.downloadLinks || season.episodes[episodeIndex].downloadLinks
            };

            await series.save();
            res.status(200).json(season.episodes[episodeIndex]);
        } catch (error: any) {
            console.error('Error updating episode:', error);
            res.status(500).json({
                error: 'Error updating episode',
                details: error?.message || 'Unknown error'
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 