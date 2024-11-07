import type { NextApiRequest, NextApiResponse } from 'next';
import { scrapeSubscene } from '@/utils/subtitleScrapers';
import { SearchResult } from '@/types';
import clientPromise from '@/lib/mongodb';
import { CACHE_DURATION } from '@/models/SearchCache';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SearchResult | { error: string }>
) {
    try {
        const { query } = req.query;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Search query is required' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('subtitle_db');
            const cache = db.collection('search_cache');

            // ক্যাশ চেক করি
            const cachedResult = await cache.findOne({
                query: query.toLowerCase(),
                createdAt: { $gt: new Date(Date.now() - CACHE_DURATION) }
            });

            if (cachedResult) {
                console.log('Returning cached results for:', query);
                return res.status(200).json({
                    subtitles: cachedResult.results,
                    totalCount: cachedResult.results.length,
                    cached: true
                });
            }

            // নতুন সার্চ করি
            console.log('Searching for:', query);
            const subtitles = await scrapeSubscene(query);
            console.log('Found subtitles:', subtitles.length);

            // ক্যাশে সেভ করি
            if (subtitles.length > 0) {
                try {
                    await cache.updateOne(
                        { query: query.toLowerCase() },
                        {
                            $set: {
                                results: subtitles,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            }
                        },
                        { upsert: true }
                    );
                } catch (cacheError) {
                    console.error('Cache save error:', cacheError);
                    // ক্যাশে সেভ না হলেও রেজাল্ট রিটার্ন করব
                }
            }

            return res.status(200).json({
                subtitles,
                totalCount: subtitles.length,
                cached: false
            });

        } catch (dbError) {
            console.error('Database error:', dbError);
            // ডাটাবেস এরর হলেও সার্চ রেজাল্ট রিটার্ন করব
            const subtitles = await scrapeSubscene(query);
            return res.status(200).json({
                subtitles,
                totalCount: subtitles.length,
                cached: false
            });
        }

    } catch (error) {
        console.error('Search API error:', error);
        return res.status(500).json({ error: 'সাবটাইটেল খোঁজার সময় একটি সমস্যা হয়েছে' });
    }
} 