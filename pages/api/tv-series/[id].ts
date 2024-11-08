import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import TvSeries from '@/models/TvSeries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    await connectDB();

    if (req.method === 'GET') {
        try {
            const series = await TvSeries.findById(id);
            if (!series) {
                return res.status(404).json({ error: 'TV series not found' });
            }
            res.status(200).json(series);
        } catch (error) {
            console.error('Error fetching TV series:', error);
            res.status(500).json({ error: 'Error fetching TV series' });
        }
    }
    else if (req.method === 'PUT') {
        try {
            const updates = req.body;

            // Ensure languages is an array
            if (updates.languages && !Array.isArray(updates.languages)) {
                updates.languages = [];
            }

            const series = await TvSeries.findByIdAndUpdate(
                id,
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!series) {
                return res.status(404).json({ error: 'TV series not found' });
            }

            res.status(200).json(series);
        } catch (error) {
            console.error('Error updating TV series:', error);
            res.status(500).json({ error: 'Error updating TV series' });
        }
    }
    else if (req.method === 'DELETE') {
        try {
            const series = await TvSeries.findByIdAndDelete(id);

            if (!series) {
                return res.status(404).json({ error: 'TV series not found' });
            }

            res.status(200).json({ message: 'TV series deleted successfully' });
        } catch (error) {
            console.error('Error deleting TV series:', error);
            res.status(500).json({ error: 'Error deleting TV series' });
        }
    }
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 