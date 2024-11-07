import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { path, query } = req.query;

        // Build the target URL
        let targetPath = Array.isArray(path) ? path.join('/') : path || '';
        if (query) {
            targetPath = `search?query=${encodeURIComponent(query as string)}`;
        }

        const target = 'https://subscene.cam';
        const targetUrl = `${target}/${targetPath}`;

        console.log('Proxying request to:', targetUrl);

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        // Forward the response
        res.status(response.status).send(response.data);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy request failed' });
    }
}

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
}; 