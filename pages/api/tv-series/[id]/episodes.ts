import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import TvSeries from '@/models/TvSeries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    await connectDB();

    if (req.method === 'PUT') {
        try {
            const { seasonNumber, episodeNumber, embedCode, downloadLinks } = req.body;

            const series = await TvSeries.findById(id);
            if (!series) {
                return res.status(404).json({ error: 'TV series not found' });
            }

            let season = series.manualSeasons?.find((s: any) => s.seasonNumber === seasonNumber);
            let isManualSeason = true;

            if (!season) {
                season = series.autoSeasons?.find((s: any) => s.seasonNumber === seasonNumber);
                isManualSeason = false;
            }

            if (!season) {
                return res.status(404).json({ error: 'Season not found' });
            }

            const episode = season.episodes.find((e: any) => e.episodeNumber === episodeNumber);
            if (!episode) {
                return res.status(404).json({ error: 'Episode not found' });
            }

            if (embedCode !== undefined) {
                episode.embedCode = embedCode;
            }

            if (downloadLinks) {
                episode.downloadLinks = downloadLinks.map((link: any) => ({
                    language: Array.isArray(link.language) ? link.language : [],
                    quality: link.quality || '720p',
                    size: link.size || '',
                    format: link.format || 'mkv',
                    type: link.type || 'WebDL',
                    url: link.url || ''
                }));
            }

            if (isManualSeason) {
                const seasonIndex = series.manualSeasons.findIndex((s: any) => s.seasonNumber === seasonNumber);
                if (seasonIndex !== -1) {
                    series.manualSeasons[seasonIndex] = season;
                }
            } else {
                const seasonIndex = series.autoSeasons.findIndex((s: any) => s.seasonNumber === seasonNumber);
                if (seasonIndex !== -1) {
                    series.autoSeasons[seasonIndex] = season;
                }
            }

            series.markModified(isManualSeason ? 'manualSeasons' : 'autoSeasons');
            await series.save();
            res.status(200).json(series);
        } catch (error) {
            console.error('Error updating episode:', error);
            res.status(500).json({ error: 'Error updating episode', details: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 