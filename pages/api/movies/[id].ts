import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Movie from '@/models/Movie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    await connectDB();

    if (req.method === 'GET') {
        try {
            const movie = await Movie.findById(id);
            if (!movie) {
                return res.status(404).json({ error: 'Movie not found' });
            }
            res.status(200).json(movie);
        } catch (error: any) {
            console.error('Error fetching movie:', error);
            res.status(500).json({ error: 'Error fetching movie' });
        }
    }
    else if (req.method === 'PUT') {
        try {
            const updates = req.body;

            // Clean up downloadLinks data
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

            // Remove undefined values
            Object.keys(updates).forEach(key => {
                if (updates[key] === undefined) {
                    delete updates[key];
                }
            });

            const movie = await Movie.findByIdAndUpdate(
                id,
                {
                    $set: {
                        ...updates,
                        updatedAt: Date.now()
                    }
                },
                { new: true, runValidators: true }
            );

            if (!movie) {
                return res.status(404).json({ error: 'Movie not found' });
            }

            res.status(200).json(movie);
        } catch (error: any) {
            console.error('Error updating movie:', error);
            res.status(500).json({
                error: 'Error updating movie',
                details: error?.message || 'Unknown error'
            });
        }
    }
    else if (req.method === 'DELETE') {
        try {
            const movie = await Movie.findByIdAndDelete(id);

            if (!movie) {
                return res.status(404).json({ error: 'Movie not found' });
            }

            res.status(200).json({ message: 'Movie deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting movie:', error);
            res.status(500).json({ error: 'Error deleting movie' });
        }
    }
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 