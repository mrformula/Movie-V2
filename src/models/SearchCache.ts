import { Subtitle } from '@/types';

export interface SearchCache {
    query: string;
    results: Subtitle[];
    createdAt: Date;
    updatedAt: Date;
}

export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours 