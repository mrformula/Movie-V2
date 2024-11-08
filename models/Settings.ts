import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    adBlockEnabled: { type: Boolean, default: true },
    popupBlockEnabled: { type: Boolean, default: true },
    redirectBlockEnabled: { type: Boolean, default: true },
    noticeBar: {
        enabled: { type: Boolean, default: false },
        text: { type: String, default: '' },
        type: {
            type: String,
            enum: ['info', 'warning', 'success', 'telegram', 'join', 'update', 'event'],
            default: 'info'
        },
        template: {
            type: String,
            enum: [
                'simple', // Just text
                'telegram-join', // Telegram join template
                'discord-join', // Discord join template
                'update-info', // Update information
                'event-announce', // Event announcement
                'maintenance', // Maintenance notice
                'custom' // Custom template
            ],
            default: 'simple'
        },
        link: { type: String, default: '' },
        buttonText: { type: String, default: '' },
        icon: { type: String, default: '' },
        bgColor: { type: String, default: '' },
        textColor: { type: String, default: '' },
        buttonColor: { type: String, default: '' }
    },
    featuredContent: [{
        contentId: { type: String, required: true },
        contentType: {
            type: String,
            enum: ['movie', 'tvSeries'],
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
export default Settings; 