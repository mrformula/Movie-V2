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

const movieSchema = new mongoose.Schema({
    tmdbId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    poster: String,
    genres: [String],
    year: Number,
    rating: Number,
    overview: String,
    runtime: Number,
    quality: {
        type: String,
        enum: ['CAM', 'HDCAM', 'HD', 'WebRip', 'WebDL', 'HDTS'],
        default: 'HD'
    },
    streamwishId: String,
    embedCode: String,
    downloadLinks: [downloadLinkSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Add pre-save middleware to generate streamwishId
movieSchema.pre('save', function (next) {
    if (!this.streamwishId) {
        this.streamwishId = `${this.get('tmdbId')}_${this.get('title').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    }
    next();
});

const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);
export default Movie; 