import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { fileCode, quality = 'h' } = req.query;

    if (!fileCode) {
        return res.status(400).json({ error: 'File code is required' });
    }

    try {
        const response = await axios.get(
            `https://api.streamwish.com/api/file/direct_link?key=${process.env.STREAMWISH_API_KEY}&file_code=${fileCode}&q=${quality}`
        );

        if (response.data.status === 200) {
            res.status(200).json(response.data.result);
        } else {
            res.status(400).json({ error: 'Failed to get direct link' });
        }
    } catch (error) {
        console.error('Error getting direct link:', error);
        res.status(500).json({ error: 'Error getting direct link' });
    }
} 