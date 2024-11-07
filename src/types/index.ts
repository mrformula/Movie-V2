export interface Subtitle {
    id: string;
    movieTitle: string;
    year: number;
    language: string;
    source: string;
    downloadUrl: string;
    uploadDate: Date;
    uploader: string;
    posterUrl?: string;
    description?: string;
    releaseInfo?: string;
    overview?: string;
    isAIGenerated?: boolean;
    seasonNumber?: number;
    episodeNumber?: number;
    isTVSeries?: boolean;
}

export interface SearchResult {
    subtitles: Subtitle[];
    totalCount: number;
    cached?: boolean;
} 