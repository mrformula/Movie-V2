import axios from 'axios';
import * as cheerio from 'cheerio';
import { Subtitle } from '@/types';
import { getImdbIdFromTmdb } from './tmdbHelper';
import { fetchWithPuppeteer } from './puppeteerScraper';

async function checkIfTVSeries(title: string, releaseInfo: string): Promise<boolean> {
    // প্যাটার্ন ম্যাচিং
    const patterns = [
        /S\d{1,2}E\d{1,2}/i,                  // S01E01
        /Season\s*\d+\s*Episode\s*\d+/i,       // Season 1 Episode 1
        /\d{1,2}x\d{1,2}/,                    // 1x01
        /Season\s*\d+/i,                       // Season 1
    ];

    // রিলিজ ইনফো থেকে চেক
    const isSeriesByPattern = patterns.some(pattern => pattern.test(releaseInfo));
    if (isSeriesByPattern) return true;

    try {
        // TMDB API দিয়ে চেক
        const response = await axios.get(
            `https://api.themoviedb.org/3/search/multi?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(title)}`
        );

        const results = response.data.results;
        if (results && results.length > 0) {
            return results[0].media_type === 'tv';
        }
    } catch (error) {
        console.error('TMDB API error:', error);
    }

    return false;
}

// টাইপ গার্ড ফাংশন যোগ করি
function isValidSubtitle(sub: any): sub is Subtitle {
    return sub !== null &&
        typeof sub.id === 'string' &&
        typeof sub.movieTitle === 'string' &&
        typeof sub.language === 'string';
}

// Alternative domains
const DOMAINS = [
    'https://subscene.club',
    'https://subscene.best',
    'https://v2.subscene.com',
    'https://subscene.life',
    'https://subscene.vip'
];

async function getWorkingDomain(): Promise<string> {
    for (const domain of DOMAINS) {
        try {
            const response = await axios.get(domain, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            if (response.status === 200) {
                return domain;
            }
        } catch (error) {
            continue;
        }
    }
    return DOMAINS[0]; // Default to first domain if none work
}

// Free proxy list
const PROXY_LIST = [
    'https://api.scraperapi.com?api_key=YOUR_API_KEY&url=',
    'https://proxy.scrapeops.io/v1/?api_key=YOUR_API_KEY&url=',
    'https://api.webscrapingapi.com/v1?api_key=YOUR_API_KEY&url=',
];

async function fetchWithProxy(url: string) {
    for (const proxy of PROXY_LIST) {
        try {
            const response = await axios.get(proxy + encodeURIComponent(url), {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
                },
                timeout: 30000
            });
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            continue;
        }
    }
    throw new Error('All proxies failed');
}

const BASE_URL = 'https://indexsubtitle.cc';

export async function scrapeSubscene(query: string): Promise<Subtitle[]> {
    try {
        let searchQuery = query;

        // TMDB/IMDB চেক
        if (query.includes('themoviedb.org')) {
            const tmdbMatch = query.match(/(?:movie|tv)\/(\d+)/);
            if (tmdbMatch) {
                const imdbId = await getImdbIdFromTmdb(tmdbMatch[1]);
                if (imdbId) searchQuery = imdbId;
            }
        } else if (query.includes('imdb.com/title/')) {
            const match = query.match(/title\/(tt\d+)/);
            if (match) searchQuery = match[1];
        }

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        };

        // সার্চ রিকোয়েস্ট
        const searchResponse = await axios.get(
            `${BASE_URL}/search?q=${encodeURIComponent(searchQuery)}`,
            { headers }
        );

        const $ = cheerio.load(searchResponse.data);
        const subtitles: Subtitle[] = [];

        // সাবটাইটেল লিস্ট পার্স করি
        $('.subtitle-entry').each((_, element) => {
            const title = $(element).find('.title').text().trim();
            const language = $(element).find('.language').text().trim();

            if (language.toLowerCase().includes('bengali')) {
                const downloadUrl = $(element).find('.download-link').attr('href');
                const uploader = $(element).find('.uploader').text().trim();
                const releaseInfo = $(element).find('.release-info').text().trim();

                if (downloadUrl) {
                    subtitles.push({
                        id: Math.random().toString(),
                        movieTitle: title,
                        year: new Date().getFullYear(), // or parse from title
                        language: 'Bengali',
                        source: 'IndexSubtitle',
                        downloadUrl: `${BASE_URL}${downloadUrl}`,
                        uploadDate: new Date(),
                        uploader,
                        releaseInfo,
                        isAIGenerated: false
                    });
                }
            }
        });

        return subtitles;

    } catch (error) {
        console.error('Error in scrapeIndexSubtitle:', error);
        return [];
    }
}

async function scrapeIndexSubtitle(query: string): Promise<Subtitle[]> {
    try {
        const searchUrl = `https://indexsubtitle.cc/search?q=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl);
        const $ = cheerio.load(response.data);
        const subtitles: Subtitle[] = [];

        // সাবটাইটেল টেবিল থেকে ডেটা নিই
        $('#example tbody tr').each((_, row) => {
            const $row = $(row);
            const title = $row.find('td:nth-child(1)').text().trim();
            const language = $row.find('td:nth-child(2)').text().trim();
            const uploader = $row.find('td:nth-child(3)').text().trim();
            const downloadUrl = $row.find('td:nth-child(1) a').attr('href');

            if (downloadUrl && language.toLowerCase() === 'bengali') {
                subtitles.push({
                    id: Math.random().toString(),
                    movieTitle: title,
                    year: new Date().getFullYear(),
                    language: 'Bengali',
                    source: 'IndexSubtitle',
                    downloadUrl: `https://indexsubtitle.cc${downloadUrl}`,
                    uploadDate: new Date(),
                    uploader,
                    isAIGenerated: false
                });
            }
        });

        return subtitles;
    } catch (error) {
        console.error('Error scraping IndexSubtitle:', error);
        return [];
    }
}

// মেইন ফাংশনে যোগ করি
export async function scrapeSubtitles(query: string): Promise<Subtitle[]> {
    const [subsceneResults, indexResults] = await Promise.all([
        scrapeSubscene(query),
        scrapeIndexSubtitle(query)
    ]);

    return [...subsceneResults, ...indexResults];
}