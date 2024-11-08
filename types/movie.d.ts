export interface DownloadLink {
    quality: string;
    url: string;
    language?: string;
    size?: string;
    format?: string;
    type?: string;
}

export interface Movie {
    _id: string;
    tmdbId: string;
    title: string;
    poster: string;
    backdrop: string | null;
    genres: string[];
    year: number;
    rating: number;
    quality: string;
    streamwishId: string;
    embedCode: string;
    overview: string;
    downloadLinks?: DownloadLink[];
} 