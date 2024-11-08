import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Movie from '@/models/Movie';
import { tmdbApi } from '@/services/tmdb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();

    if (req.method === 'GET') {
        try {
            const movies = await Movie.find({}).sort({ createdAt: -1 });
            res.status(200).json(movies);
        } catch (error) {
            console.error('Error fetching movies:', error);
            res.status(500).json({ error: 'Error fetching movies' });
        }
    } else if (req.method === 'POST') {
        try {
            const { tmdbId } = req.body;

            // Check if movie already exists
            const existingMovie = await Movie.findOne({ tmdbId });
            if (existingMovie) {
                return res.status(400).json({ error: 'Movie already exists' });
            }

            // Fetch movie details from TMDB
            const movieDetails = await tmdbApi.fetchMovieDetails(tmdbId);

            // Create new movie with auto-generated streamwishId
            const movie = await Movie.create({
                ...movieDetails,
                quality: 'HD',
                embedCode: ''
            });

            res.status(201).json(movie);
        } catch (error) {
            console.error('Error creating movie:', error);
            res.status(500).json({ error: 'Error creating movie' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 