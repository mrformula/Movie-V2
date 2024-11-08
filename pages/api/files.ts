import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { fld_id = '0' } = req.query;

        const response = await axios.get(
            `https://api.streamwish.com/api/folder/list?key=${process.env.STREAMWISH_API_KEY}&fld_id=${fld_id}&files=1`
        );

        res.status(200).json(response.data.result);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Error fetching files' });
    }
} 