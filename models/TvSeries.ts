import mongoose from 'mongoose';

const downloadLinkSchema = new mongoose.Schema({
    language: {
        type: [String],
        default: []
    },
    quality: {
        type: String,
        enum: ['360p', '480p', '720p', '1080p', '4K'],
        default: '720p'
    },
    size: {
        type: String,
        default: ''
    },
    format: {
        type: String,
        enum: ['mkv', 'mp4', 'zip'],
        default: 'mkv'
    },
    type: {
        type: String,
        enum: ['WebDL', 'WebRip', 'BluRay', 'BrRip', 'HDTS', 'CAM'],
        default: 'WebDL'
    },
    url: {
        type: String,
        default: ''
    }
}, { _id: false });

const episodeSchema = new mongoose.Schema({
    episodeNumber: { type: String, required: true },
    title: { type: String, required: true },
    overview: String,
    airDate: String,
    stillPath: String,
    embedCode: String,
    streamwishId: String,
    downloadLinks: [downloadLinkSchema]
});

const seasonSchema = new mongoose.Schema({
    seasonNumber: { type: Number, required: true },
    episodes: [episodeSchema],
    combinedEpisodes: [{
        title: String,
        episodeRange: String,
        embedCode: String,
        streamwishId: String,
    }]
});

const tvSeriesSchema = new mongoose.Schema({
    tmdbId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    poster: String,
    backdrop: String,
    genres: [String],
    year: Number,
    rating: Number,
    numberOfSeasons: Number,
    overview: String,
    status: String,
    quality: {
        type: String,
        enum: ['CAM', 'HDCAM', 'HD', 'WebRip', 'WebDL', 'HDTS'],
        default: 'HD'
    },
    streamwishId: String,
    inProduction: Boolean,
    lastAirDate: String,
    networks: [String],
    autoSeasons: [{
        seasonNumber: Number,
        episodes: [episodeSchema]
    }],
    manualSeasons: [{
        seasonNumber: Number,
        episodes: [episodeSchema]
    }],
    viewMode: {
        type: String,
        enum: ['auto', 'manual'],
        default: 'auto'
    },
    languages: {
        type: [String],
        default: []
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Add pre-save middleware to generate streamwishId
tvSeriesSchema.pre('save', function (next) {
    if (!this.streamwishId) {
        this.streamwishId = `${this.get('tmdbId')}_${this.get('title').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    }
    next();
});

const TvSeries = mongoose.models.TvSeries || mongoose.model('TvSeries', tvSeriesSchema);
export default TvSeries; 