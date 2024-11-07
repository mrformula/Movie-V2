import axios from 'axios';
import * as cheerio from 'cheerio';
import { Subtitle } from '@/types';
import { getImdbIdFromTmdb } from './tmdbHelper';

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

export async function scrapeSubscene(query: string): Promise<Subtitle[]> {
    try {
        let searchQuery = query;

        // TMDB/IMDB লিঙ্ক চেক করি
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

        // Step 1: Get subtitle list page
        const searchResponse = await axios.get(`https://subscene.cam/search?query=${encodeURIComponent(searchQuery)}`);
        const $ = cheerio.load(searchResponse.data);
        const subtitleLinks: { url: string; title: string }[] = [];

        // Get all subtitle links
        $('.search-result ul li').each((_, item) => {
            const titleElement = $(item).find('.title a');
            const url = titleElement.attr('href');
            const title = titleElement.text().trim();

            if (url && title) {
                subtitleLinks.push({ url: `https://subscene.cam${url}`, title });
            }
        });

        // Step 2: Get all Bengali subtitles from list page
        const subtitleDetails: { url: string; language: string; uploader: string }[] = [];

        for (const { url } of subtitleLinks) {
            const listResponse = await axios.get(url);
            const $list = cheerio.load(listResponse.data);

            $list('tbody tr').each((_, row) => {
                const language = $list(row).find('.a1 span.l').text().trim();
                if (language.toLowerCase().includes('bengali')) {
                    const detailUrl = $list(row).find('.a1 a').attr('href');
                    const uploader = $list(row).find('.a5 a').text().trim() || 'Unknown';

                    if (detailUrl) {
                        subtitleDetails.push({
                            url: `https://subscene.cam${detailUrl}`,
                            language,
                            uploader
                        });
                    }
                }
            });
        }

        // Step 3: Get details from each subtitle page
        const subtitles = await Promise.all(
            subtitleDetails.map(async ({ url, language, uploader }) => {
                try {
                    const response = await axios.get(url);
                    const $detail = cheerio.load(response.data);

                    // Get basic info
                    const posterUrl = $detail('.box.subtitle .poster img').attr('src');
                    const movieTitle = $detail('.box.subtitle .title a').first().text().trim();
                    let releaseInfo = '';

                    // Get release info
                    const releaseDiv = $detail('.box.subtitle .release');
                    if (releaseDiv.length) {
                        releaseDiv.find('b').remove();
                        const releaseText = releaseDiv.html() || '';
                        releaseInfo = releaseText
                            .replace(/<br\s*\/?>/gi, '\n')
                            .split('\n')
                            .map(line => cheerio.load(line).text().trim())
                            .filter(line => line)
                            .join('\n');
                    }

                    // Get description
                    let description = '';
                    const commentDiv = $detail('.box.subtitle .comment p');
                    if (commentDiv.length) {
                        description = commentDiv.text().trim();
                    }

                    // Get download URL
                    const downloadUrl = $detail('.download a').attr('href');

                    if (downloadUrl) {
                        // চেক করি এটা TV সিরিজ কিনা
                        const isTVSeries = await checkIfTVSeries(movieTitle, releaseInfo);

                        // সিজন এবং এপিসোড নাম্বার এক্সট্র্যাক্ট করি
                        let seasonNumber: number | undefined;
                        let episodeNumber: number | undefined;

                        if (isTVSeries) {
                            const episodeInfo = releaseInfo.match(/S(\d{1,2})[\s\.]?E(\d{1,2})/i) ||
                                releaseInfo.match(/Season\s*(\d+)\s*Episode\s*(\d+)/i) ||
                                releaseInfo.match(/(\d{1,2})x(\d{1,2})/);

                            if (episodeInfo) {
                                seasonNumber = parseInt(episodeInfo[1]);
                                episodeNumber = parseInt(episodeInfo[2]);
                            } else {
                                // শুধু সিজন নাম্বার খুঁজি
                                const seasonMatch = releaseInfo.match(/Season\s*(\d+)/i);
                                if (seasonMatch) {
                                    seasonNumber = parseInt(seasonMatch[1]);
                                }
                            }
                        }

                        const subtitle: Subtitle = {
                            id: Math.random().toString(),
                            movieTitle,
                            year: parseInt($detail('span:contains("Year:")').next().text().trim()) || new Date().getFullYear(),
                            language,
                            source: 'Subscene',
                            downloadUrl: `https://subscene.cam${downloadUrl}`,
                            uploadDate: new Date(),
                            uploader,
                            posterUrl,
                            releaseInfo,
                            description,
                            isAIGenerated: false,
                            seasonNumber,
                            episodeNumber,
                            isTVSeries
                        };

                        return subtitle;
                    }
                } catch (error) {
                    console.error(`Error fetching subtitle details from ${url}:`, error);
                }
                return null;
            })
        );

        // টাইপ গার্ড ব্যবহার করে ফিল্টার করি
        return subtitles.filter(isValidSubtitle);

    } catch (error) {
        console.error('Error in scrapeSubscene:', error);
        return [];
    }
}