import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('subtitle_db');

        // Drop the collection
        await db.collection('search_cache').drop();

        // Recreate the collection with indexes
        await db.createCollection('search_cache');
        await db.collection('search_cache').createIndex({ query: 1 });
        await db.collection('search_cache').createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 24 hours

        return res.status(200).json({ message: 'Database cleaned successfully' });
    } catch (error) {
        console.error('Error cleaning database:', error);
        return res.status(500).json({ error: 'Failed to clean database' });
    }
} 