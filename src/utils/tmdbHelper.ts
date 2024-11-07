import axios from 'axios';

const TMDB_API_KEY = 'aa2925a0a11c4bfede12d54a47918c14';

interface TMDBMovie {
    imdb_id: string;
    title: string;
    poster_path: string;
    overview: string;
    release_date: string;
}

export async function getImdbIdFromTmdb(tmdbId: string): Promise<string | null> {
    try {
        // প্রথমে TV সিরিজ চেক করি
        const tvResponse = await axios.get(
            `https://api.themoviedb.org/3/tv/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (tvResponse.data?.imdb_id) {
            console.log('Found TV IMDB ID:', tvResponse.data.imdb_id);
            return tvResponse.data.imdb_id;
        }
    } catch (error) {
        console.log('Not a TV series, trying movie...');
    }

    try {
        // এরপর মুভি চেক করি
        const movieResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (movieResponse.data?.imdb_id) {
            console.log('Found Movie IMDB ID:', movieResponse.data.imdb_id);
            return movieResponse.data.imdb_id;
        }
    } catch (error) {
        console.error('TMDB Movie API error:', error);
    }

    return null;
}

export async function getMovieDetails(imdbId: string): Promise<{
    poster: string;
    title: string;
    overview: string;
    year: string;
} | null> {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`
        );

        const movie = response.data.movie_results[0] || response.data.tv_results[0];
        if (!movie) return null;

        return {
            poster: `https://image.tmdb.org/t/p/w200${movie.poster_path}`,
            title: movie.title || movie.name,
            overview: movie.overview,
            year: (movie.release_date || movie.first_air_date || '').split('-')[0]
        };
    } catch (error) {
        console.error('TMDB API error:', error);
        return null;
    }
}

export async function getMovieFromReleaseInfo(releaseInfo: string): Promise<{
    title: string;
    year: string;
    poster: string;
    overview: string;
    isAIGenerated: boolean;
} | null> {
    try {
        const match = releaseInfo.match(/^(.*?)[.\s](\d{4})/);
        if (!match) return null;

        const [, title, year] = match;
        const cleanTitle = title
            .replace(/\./g, ' ')
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .trim();

        const searchResponse = await axios.get(
            `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&year=${year}`
        );

        const movie = searchResponse.data.results[0];
        if (!movie) return null;

        return {
            title: movie.title,
            year: year,
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '',
            overview: movie.overview,
            isAIGenerated: true
        };
    } catch (error) {
        console.error('TMDB search error:', error);
        return null;
    }
} 