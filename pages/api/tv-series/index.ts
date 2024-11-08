import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import TvSeries from '@/models/TvSeries';
import { tmdbApi } from '@/services/tmdb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();

    if (req.method === 'GET') {
        try {
            const series = await TvSeries.find({}).sort({ createdAt: -1 });
            res.status(200).json(series);
        } catch (error) {
            console.error('Error fetching TV series:', error);
            res.status(500).json({ error: 'Error fetching TV series' });
        }
    } else if (req.method === 'POST') {
        try {
            const { tmdbId } = req.body;

            // Check if TV series already exists
            const existingSeries = await TvSeries.findOne({ tmdbId });
            if (existingSeries) {
                return res.status(400).json({ error: 'TV series already exists' });
            }

            // Fetch TV series details from TMDB
            const seriesDetails = await tmdbApi.fetchTvSeriesDetails(tmdbId);

            // Create new TV series
            const series = await TvSeries.create({
                tmdbId: seriesDetails.tmdbId,
                title: seriesDetails.title,
                poster: seriesDetails.poster,
                backdrop: seriesDetails.backdrop,
                genres: seriesDetails.genres,
                year: seriesDetails.year,
                rating: seriesDetails.rating,
                numberOfSeasons: seriesDetails.numberOfSeasons,
                overview: seriesDetails.overview,
                status: seriesDetails.status,
                quality: 'HD',
                inProduction: seriesDetails.inProduction,
                lastAirDate: seriesDetails.lastAirDate,
                networks: seriesDetails.networks,
                autoSeasons: seriesDetails.autoSeasons,
                manualSeasons: []
            });

            res.status(201).json(series);
        } catch (error) {
            console.error('Error creating TV series:', error);
            res.status(500).json({ error: 'Error creating TV series' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 