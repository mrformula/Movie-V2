import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import { FiPlay, FiClock, FiStar, FiDownload, FiArrowLeft } from 'react-icons/fi';
import VideoPlayer from '@/components/VideoPlayer';
import AdBlocker from '@/components/AdBlocker';
import type { Movie, DownloadLink } from '@/types/movie';

export default function MovieDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPlayer, setShowPlayer] = useState(false);
    const [directLink, setDirectLink] = useState<string | null>(null);
    const [adBlockEnabled, setAdBlockEnabled] = useState(true);
    const [showDownloadSection, setShowDownloadSection] = useState(false);

    useEffect(() => {
        if (id) {
            fetchMovieDetails();
        }
    }, [id]);

    const fetchMovieDetails = async () => {
        try {
            const res = await fetch(`/api/movies/${id}`);
            if (!res.ok) throw new Error('Movie not found');
            const data = await res.json();
            setMovie(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching movie details:', error);
            setLoading(false);
        }
    };

    const getVideoUrl = (embedCode: string) => {
        // Remove any URL parts and get just the ID
        const videoId = embedCode.replace('https://hlswish.com/', '')
            .replace('https://hlswish.com/e/', '')
            .replace('https://embedwish.com/e/', '')
            .replace('https://embedwish.com/', '')
            .replace('/e/', '')
            .replace('e/', '');

        // Return the correct embed URL
        return `https://embedwish.com/e/${videoId}`;
    };

    const getEmbedUrl = (code: string) => {
        const videoId = code.replace('https://hlswish.com/', '')
            .replace('https://hlswish.com/e/', '')
            .replace('https://embedwish.com/e/', '')
            .replace('https://embedwish.com/', '')
            .replace('/e/', '')
            .replace('e/', '');

        return `https://hlswish.com/e/${videoId}`;
    };

    const getDirectLink = async (embedCode: string) => {
        try {
            const videoId = embedCode.replace('https://hlswish.com/', '')
                .replace('https://hlswish.com/e/', '')
                .replace('https://embedwish.com/e/', '')
                .replace('https://embedwish.com/', '')
                .replace('/e/', '')
                .replace('e/', '');

            const res = await fetch(`/api/stream/direct-link?fileCode=${videoId}`);
            const data = await res.json();

            // Get highest quality version
            const highestQuality = data.versions.find((v: any) => v.name === 'o') ||
                data.versions[0];

            if (highestQuality) {
                setDirectLink(highestQuality.url);
            }
        } catch (error) {
            console.error('Error getting direct link:', error);
        }
    };

    useEffect(() => {
        if (movie?.embedCode) {
            getDirectLink(movie.embedCode);
        }
    }, [movie]);

    const scrollToPlayer = () => {
        const playerSection = document.getElementById('player-section');
        if (playerSection) {
            playerSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        // Fetch ad block settings
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                setAdBlockEnabled(data.adBlockEnabled);
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };
        fetchSettings();
    }, []);

    const hasLinks = (movie: Movie) => {
        return Boolean(movie.embedCode) || (movie.downloadLinks && movie.downloadLinks.length > 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="text-white">Movie not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary">
            <Navbar />
            <AdBlocker enabled={adBlockEnabled} />

            <div className="container mx-auto px-4 pt-24 pb-12">
                {/* Movie Details Section */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Poster */}
                    <div className="w-full md:w-1/3 lg:w-1/4">
                        <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-full rounded-lg shadow-lg"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>

                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <div className="flex items-center text-yellow-400">
                                <FiStar className="mr-1" />
                                <span>{movie.rating}/10</span>
                            </div>
                            <span className="text-gray-400">{movie.year}</span>
                            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                                {movie.quality}
                            </span>
                            {movie.downloadLinks && movie.downloadLinks.length > 0 && (
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                                    {getLanguageDisplay(movie.downloadLinks)}
                                </span>
                            )}
                        </div>

                        {movie.genres && movie.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {movie.genres.map((genre, index) => (
                                    <span
                                        key={index}
                                        className="bg-secondary text-gray-300 px-3 py-1 rounded-full text-sm"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}

                        {movie.overview && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold mb-4 text-white">Overview</h2>
                                <p className="text-gray-300 leading-relaxed mb-6">
                                    {movie.overview}
                                </p>

                                {/* Action Buttons */}
                                {hasLinks(movie) && (
                                    <div className="flex flex-wrap gap-4 mt-6">
                                        {movie.embedCode && (
                                            <button
                                                onClick={() => {
                                                    setShowDownloadSection(false);
                                                    scrollToPlayer();
                                                }}
                                                className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg flex items-center justify-center gap-2 text-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                            >
                                                <FiPlay className="w-5 h-5" />
                                                Watch Now
                                            </button>
                                        )}

                                        {movie.downloadLinks && movie.downloadLinks.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    setShowDownloadSection(true);
                                                    scrollToPlayer();
                                                }}
                                                className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-lg flex items-center justify-center gap-2 text-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                            >
                                                <FiDownload className="w-5 h-5" />
                                                Download
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Player/Download Section */}
                <div id="player-section" className="mt-12">
                    {showDownloadSection ? (
                        <div className="bg-secondary rounded-lg p-6">
                            {/* Back Button */}
                            {movie.embedCode && (
                                <button
                                    onClick={() => setShowDownloadSection(false)}
                                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                                >
                                    <FiArrowLeft className="w-5 h-5 mr-2" />
                                    Back to Video
                                </button>
                            )}

                            <h2 className="text-2xl font-bold text-white mb-6">Download {movie.title}</h2>
                            <div className="space-y-4">
                                {movie.downloadLinks.map((link, index) => (
                                    <div
                                        key={index}
                                        className="bg-primary rounded-lg p-4 hover:ring-2 hover:ring-purple-500 transition-all duration-200"
                                    >
                                        {/* Quality & Format Row */}
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                                                {link.quality} {link.type}
                                            </span>
                                            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                                                {link.format.toUpperCase()}
                                            </span>
                                            <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                                                {link.size}
                                            </span>
                                        </div>

                                        {/* Languages */}
                                        <div className="text-gray-400 text-sm mb-3">
                                            {link.language.join(' + ')}
                                        </div>

                                        {/* Download Button */}
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative block w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white p-4 rounded-lg text-center font-medium transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
                                        >
                                            {/* Button Content */}
                                            <div className="relative z-10 flex items-center justify-center gap-2">
                                                <FiDownload className="w-5 h-5 animate-bounce" />
                                                <span>Download Now</span>
                                            </div>

                                            {/* Animated Background */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="absolute inset-0 bg-[url('/download-pattern.png')] bg-repeat-x animate-slide"></div>
                                            </div>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        movie.embedCode && (
                            <div className="bg-secondary rounded-lg p-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Watch {movie.title}</h2>
                                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                    <iframe
                                        src={getVideoUrl(movie.embedCode)}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        scrolling="no"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        style={{ width: '100%', height: '100%' }}
                                    ></iframe>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

// Add this function to handle language display
function getLanguageDisplay(downloadLinks: DownloadLink[]): string {
    if (!downloadLinks || downloadLinks.length === 0) return '';

    const allLanguages = downloadLinks.reduce((acc: string[], link) => {
        if (Array.isArray(link.language)) {
            return [...acc, ...link.language];
        }
        return acc;
    }, []);

    const uniqueLanguages = Array.from(new Set(
        allLanguages.map(lang => lang.toLowerCase())
    )).map(lang => {
        const originalLang = allLanguages.find(l => l.toLowerCase() === lang);
        return originalLang || lang;
    });

    if (uniqueLanguages.length === 0) return '';
    if (uniqueLanguages.length === 1) return uniqueLanguages[0];
    if (uniqueLanguages.length > 3) return 'MULTI';

    return uniqueLanguages
        .map(lang => {
            const shortForm = lang.length <= 3 ? lang : lang.slice(0, 3);
            return shortForm.charAt(0).toUpperCase() + shortForm.slice(1).toLowerCase();
        })
        .join('+');
} 