import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();

    if (req.method === 'GET') {
        try {
            let settings = await Settings.findOne();
            if (!settings) {
                settings = await Settings.create({
                    adBlockEnabled: true,
                    popupBlockEnabled: true,
                    redirectBlockEnabled: true,
                    noticeBar: {
                        enabled: false,
                        text: '',
                        type: 'info',
                        template: 'simple',
                        link: '',
                        buttonText: '',
                        icon: '',
                        bgColor: '',
                        textColor: '',
                        buttonColor: ''
                    }
                });
            }
            res.status(200).json(settings);
        } catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({ error: 'Error fetching settings' });
        }
    }
    else if (req.method === 'PUT') {
        try {
            const updates = req.body;
            let settings = await Settings.findOne();

            if (!settings) {
                settings = await Settings.create({
                    ...updates,
                    adBlockEnabled: true,
                    popupBlockEnabled: true,
                    redirectBlockEnabled: true,
                    noticeBar: {
                        enabled: false,
                        text: '',
                        type: 'info',
                        template: 'simple',
                        link: '',
                        buttonText: '',
                        icon: '',
                        bgColor: '',
                        textColor: '',
                        buttonColor: '',
                        ...updates.noticeBar
                    }
                });
            } else {
                // Handle noticeBar updates
                if (updates.noticeBar) {
                    const currentNoticeBar = settings.noticeBar || {};
                    updates.noticeBar = {
                        enabled: updates.noticeBar.enabled ?? currentNoticeBar.enabled ?? false,
                        text: updates.noticeBar.text ?? currentNoticeBar.text ?? '',
                        type: updates.noticeBar.type ?? currentNoticeBar.type ?? 'info',
                        template: updates.noticeBar.template ?? currentNoticeBar.template ?? 'simple',
                        link: updates.noticeBar.link ?? currentNoticeBar.link ?? '',
                        buttonText: updates.noticeBar.buttonText ?? currentNoticeBar.buttonText ?? '',
                        icon: updates.noticeBar.icon ?? currentNoticeBar.icon ?? '',
                        bgColor: updates.noticeBar.bgColor ?? currentNoticeBar.bgColor ?? '',
                        textColor: updates.noticeBar.textColor ?? currentNoticeBar.textColor ?? '',
                        buttonColor: updates.noticeBar.buttonColor ?? currentNoticeBar.buttonColor ?? ''
                    };
                }

                settings = await Settings.findOneAndUpdate(
                    {},
                    { $set: updates },
                    {
                        new: true,
                        runValidators: false,
                        upsert: true,
                        setDefaultsOnInsert: true
                    }
                );
            }

            res.status(200).json(settings);
        } catch (error) {
            console.error('Error updating settings:', error);
            res.status(500).json({ error: 'Error updating settings' });
        }
    }
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 