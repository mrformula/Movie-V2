import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import AdmZip from 'adm-zip';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { url } = req.query;

        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'Download URL is required' });
        }

        console.log('Fetching subtitle from:', url);

        // সাবটাইটেল ডাউনলোড করি
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/zip,application/octet-stream',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            maxRedirects: 5,
            timeout: 30000
        });

        if (!response.data || response.data.length === 0) {
            return res.status(404).json({
                error: 'কোন ডাটা পাওয়া যায়নি',
                showAlert: true
            });
        }

        // ZIP ফাইল পার্স করি
        const sourceZip = new AdmZip(response.data);
        const zipEntries = sourceZip.getEntries();

        // সব সাবটাইটেল ফাইল খুঁজি
        const subtitleEntries = zipEntries.filter(entry =>
            entry.entryName.toLowerCase().endsWith('.srt') ||
            entry.entryName.toLowerCase().endsWith('.ass') ||
            entry.entryName.toLowerCase().endsWith('.ssa')
        );

        if (subtitleEntries.length === 0) {
            return res.status(404).json({
                error: 'কোন সাবটাইটেল ফাইল পাওয়া যায়নি',
                showAlert: true
            });
        }

        // একটি ফাইল থাকলে সরাসরি পাঠাই
        if (subtitleEntries.length === 1) {
            const subtitleContent = subtitleEntries[0].getData();
            const fileName = subtitleEntries[0].entryName;

            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', subtitleContent.length);
            res.send(subtitleContent);
            return;
        }

        // একাধিক ফাইল থাকলে নতুন ZIP ফাইল তৈরি করি
        const newZip = new AdmZip();

        // শুধু সাবটাইটেল ফাইলগুলো নতুন ZIP এ যোগ করি
        subtitleEntries.forEach(entry => {
            newZip.addFile(entry.entryName, entry.getData());
        });

        // ZIP ফাইল বাফার আকারে নিই
        const zipBuffer = newZip.toBuffer();

        // ZIP ফাইল পাঠাই
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="subtitles.zip"');
        res.setHeader('Content-Length', zipBuffer.length);
        res.send(zipBuffer);

    } catch (error) {
        console.error('Download error:', error);
        return res.status(500).json({
            error: 'সাবটাইটেল ডাউনলোড করতে সমস্যা হয়েছে',
            showAlert: true
        });
    }
}

export const config = {
    api: {
        responseLimit: false,
    },
}; 