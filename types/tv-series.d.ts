import type { Movie } from './movie';

export interface TVSeries extends Omit<Movie, 'quality' | 'downloadLinks'> {
    status: string;
    numberOfSeasons: number;
    viewMode: string;
    autoSeasons?: {
        seasonNumber: number;
        episodes: Episode[];
    }[];
    manualSeasons?: {
        seasonNumber: number;
        episodes: Episode[];
    }[];
    languages?: string[];
} 