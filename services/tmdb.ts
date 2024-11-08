import axios from 'axios';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const tmdbApi = {
    fetchMovieDetails: async (tmdbId: string) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`
            );
            const movie = response.data;
            return {
                tmdbId: movie.id.toString(),
                title: movie.title,
                poster: `${IMAGE_BASE_URL}${movie.poster_path}`,
                genres: movie.genres.map((g: any) => g.name),
                year: new Date(movie.release_date).getFullYear(),
                rating: movie.vote_average,
                overview: movie.overview,
                runtime: movie.runtime,
            };
        } catch (error) {
            console.error('Error fetching movie details:', error);
            throw error;
        }
    },

    fetchTvSeriesDetails: async (tmdbId: string) => {
        try {
            // Fetch basic series info
            const seriesResponse = await axios.get(
                `${BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}`
            );
            const series = seriesResponse.data;

            // Fetch all seasons details
            const seasonsPromises = Array.from({ length: series.number_of_seasons }, async (_, index) => {
                const seasonNumber = index + 1;
                const seasonResponse = await axios.get(
                    `${BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`
                );
                return seasonResponse.data;
            });

            const seasonsData = await Promise.all(seasonsPromises);
            const seasons = seasonsData.map((season, index) => ({
                seasonNumber: index + 1,
                episodes: season.episodes.map((episode: any) => ({
                    episodeNumber: episode.episode_number,
                    title: episode.name,
                    overview: episode.overview,
                    airDate: episode.air_date,
                    stillPath: episode.still_path ? `${IMAGE_BASE_URL}${episode.still_path}` : null,
                    embedCode: '',
                    streamwishId: ''
                }))
            }));

            return {
                tmdbId: series.id.toString(),
                title: series.name,
                poster: `${IMAGE_BASE_URL}${series.poster_path}`,
                backdrop: series.backdrop_path ? `${IMAGE_BASE_URL}${series.backdrop_path}` : null,
                genres: series.genres.map((g: any) => g.name),
                year: new Date(series.first_air_date).getFullYear(),
                rating: series.vote_average,
                numberOfSeasons: series.number_of_seasons,
                overview: series.overview,
                status: series.status,
                inProduction: series.in_production,
                lastAirDate: series.last_air_date,
                networks: series.networks?.map((n: any) => n.name) || [],
                autoSeasons: seasons
            };
        } catch (error) {
            console.error('Error fetching TV series details:', error);
            throw error;
        }
    },
}; 