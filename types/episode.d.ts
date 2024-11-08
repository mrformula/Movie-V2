import type { DownloadLink } from './movie';

export interface Episode {
    episodeNumber: number;
    title: string;
    overview: string;
    airDate: string;
    stillPath: string | null;
    embedCode: string;
    streamwishId: string;
    downloadLinks: DownloadLink[];
} 