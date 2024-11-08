import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0',
                'Referer': 'https://subscene.cam/',
                'Origin': 'https://subscene.cam'
            },
            timeout: 30000,
            maxRedirects: 5
        });

        // HTML রেসপন্স চেক করি
        if (response.data.includes('Access denied | subscene.cam used Cloudflare')) {
            return res.status(403).json({ error: 'Cloudflare blocked access' });
        }

        res.status(200).json(response.data);
    } catch (error: any) {
        console.error('Proxy error:', error.message);

        // এরর মেসেজ চেক করি
        if (error.response?.status === 403) {
            return res.status(403).json({ error: 'Access denied by Cloudflare' });
        }

        res.status(500).json({
            error: 'Proxy request failed',
            details: error.message
        });
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
        responseLimit: false,
    },
}; 