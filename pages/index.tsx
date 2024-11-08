import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiFilm, FiTv, FiTrendingUp } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import NoticeBar from '@/components/NoticeBar';
import HeroSlider from '@/components/HeroSlider';

interface DownloadLink {
    language: string[];
    quality: string;
    size: string;
    format: string;
    type: string;
    url: string;
}

interface Movie {
    _id: string;
    title: string;
    poster: string;
    year: number;
    rating: number;
    quality: string;
    downloadLinks?: DownloadLink[];
}

interface TVSeries {
    _id: string;
    title: string;
    poster: string;
    year: number;
    rating: number;
    status: string;
    numberOfSeasons: number;
    viewMode: string;
    autoSeasons?: {
        seasonNumber: number;
        episodes: Episode[];
    };
    manualSeasons?: {
        seasonNumber: number;
        episodes: Episode[];
    };
    languages?: string[];
}

interface Episode {
    downloadLinks?: DownloadLink[];
}

interface Settings {
    noticeBar?: {
        enabled: boolean;
        text: string;
        type: string;
        template: string;
        link: string;
        buttonText: string;
        bgColor: string;
        textColor: string;
        buttonColor: string;
    };
}

export default function Home() {
    const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
    const [recentTVSeries, setRecentTVSeries] = useState<TVSeries[]>([]);
    const [trendingContent, setTrendingContent] = useState<(Movie | TVSeries)[]>([]);
    const [settings, setSettings] = useState<Settings>({});
    const [latestMovies, setLatestMovies] = useState<Movie[]>([]);
    const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
    const [featuredContent, setFeaturedContent] = useState<Movie[]>([]);

    useEffect(() => {
        fetchContent();
        fetchSettings();
    }, []);

    useEffect(() => {
        const preloadImages = async () => {
            const allContent = [
                ...latestMovies,
                ...recentTVSeries,
                ...popularMovies,
                ...featuredContent
            ];

            const imagePromises = allContent.map((content) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = content.backdrop || content.poster;
                    img.onload = resolve;
                    img.onerror = reject;
                });
            });

            try {
                await Promise.all(imagePromises);
            } catch (error) {
                console.error('Error preloading images:', error);
            }
        };

        if (latestMovies.length > 0 || recentTVSeries.length > 0) {
            preloadImages();
        }
    }, [latestMovies, recentTVSeries, popularMovies, featuredContent]);

    const fetchContent = async () => {
        try {
            // Fetch latest movies (sorted by createdAt)
            const latestRes = await fetch('/api/movies?sort=latest&limit=2');
            const latest = await latestRes.json();
            setLatestMovies(latest);

            // Fetch popular movies (most visited)
            const popularRes = await fetch('/api/movies?sort=popular&limit=4');
            const popular = await popularRes.json();
            setPopularMovies(popular);

            // Fetch featured content from settings
            const featuredRes = await fetch('/api/featured');
            const featured = await featuredRes.json();
            setFeaturedContent(featured);

            // Fetch other content
            const moviesRes = await fetch('/api/movies?limit=5');
            const movies = await moviesRes.json();
            setRecentMovies(movies);

            const tvSeriesRes = await fetch('/api/tv-series?limit=5');
            const tvSeries = await tvSeriesRes.json();
            setRecentTVSeries(tvSeries);

            const combined = [...movies, ...tvSeries]
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5);
            setTrendingContent(combined);
        } catch (error) {
            console.error('Error fetching content:', error);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    return (
        <div className="min-h-screen bg-primary">
            <Navbar />

            {/* Main Content with correct spacing */}
            <div className="pt-16"> {/* Space for navbar */}
                {/* Notice Bar */}
                {settings.noticeBar?.enabled && (
                    <NoticeBar
                        text={settings.noticeBar.text}
                        type={settings.noticeBar.type as any}
                        link={settings.noticeBar.link}
                        buttonText={settings.noticeBar.buttonText}
                        bgColor={settings.noticeBar.bgColor}
                        textColor={settings.noticeBar.textColor}
                        buttonColor={settings.noticeBar.buttonColor}
                    />
                )}

                {/* Hero Slider */}
                <HeroSlider
                    latestMovies={latestMovies}
                    latestTVSeries={recentTVSeries}
                    popularMovies={popularMovies}
                    popularTVSeries={recentTVSeries}
                    featuredContent={featuredContent}
                />

                {/* Content Sections */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                    {/* Recent Movies */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <FiFilm className="w-6 h-6 text-purple-500 mr-2" />
                                <h2 className="text-2xl font-bold text-white">Recent Movies</h2>
                            </div>
                            <Link
                                href="/movies"
                                className="text-purple-500 hover:text-purple-400"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                            {recentMovies.map((movie) => (
                                <Link key={movie._id} href={`/movies/${movie._id}`}>
                                    <div className="bg-secondary rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all duration-200">
                                        <div className="relative aspect-[2/3]">
                                            <img
                                                src={movie.poster}
                                                alt={movie.title}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                                                    {movie.quality}
                                                </span>
                                            </div>
                                            {movie.downloadLinks && movie.downloadLinks.length > 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                                                        {getLanguageDisplay(movie.downloadLinks)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-white font-medium truncate">{movie.title}</h3>
                                            <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                                                <span>{movie.year}</span>
                                                <div className="flex items-center">
                                                    <span className="text-yellow-400 mr-1">⭐</span>
                                                    <span>{movie.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Recent TV Series */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <FiTv className="w-6 h-6 text-pink-500 mr-2" />
                                <h2 className="text-2xl font-bold text-white">Recent TV Series</h2>
                            </div>
                            <Link
                                href="/tv-series"
                                className="text-pink-500 hover:text-pink-400"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                            {recentTVSeries.map((series) => (
                                <Link key={series._id} href={`/tv-series/${series._id}`}>
                                    <div className="bg-secondary rounded-lg overflow-hidden hover:ring-2 hover:ring-pink-500 transition-all duration-200">
                                        <div className="relative aspect-[2/3]">
                                            <img
                                                src={series.poster}
                                                alt={series.title}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <span className={`
                                                    ${series.status === 'Ended'
                                                        ? 'bg-gradient-to-r from-red-600 to-pink-600'
                                                        : 'bg-gradient-to-r from-green-600 to-emerald-600'
                                                    } 
                                                    text-white text-xs px-3 py-1 rounded-full shadow-lg backdrop-blur-sm
                                                `}>
                                                    {series.status}
                                                </span>
                                            </div>
                                            {series.languages && series.languages.length > 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                                                        {getSeriesLanguages(series)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-white font-medium truncate">{series.title}</h3>
                                            <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                                                <span>{series.year}</span>
                                                <div className="flex items-center">
                                                    <span className="text-yellow-400 mr-1">⭐</span>
                                                    <span>{series.rating}</span>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-xs text-gray-400">
                                                    {series.numberOfSeasons} Seasons
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Trending Section */}
                    <section id="trending-section">
                        <div className="flex items-center mb-6">
                            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" className="w-6 h-6 text-blue-500 mr-2">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                            <h2 className="text-2xl font-bold text-white">Trending Now</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                            {trendingContent.map((content) => (
                                <Link
                                    key={content._id}
                                    href={`/${('numberOfSeasons' in content) ? 'tv-series' : 'movies'}/${content._id}`}
                                >
                                    <div className="bg-secondary rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-200">
                                        <div className="relative aspect-[2/3]">
                                            <img
                                                src={content.poster}
                                                alt={content.title}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-white font-medium truncate">{content.title}</h3>
                                            <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                                                <span>{content.year}</span>
                                                <div className="flex items-center">
                                                    <span className="text-yellow-400 mr-1">⭐</span>
                                                    <span>{content.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Updated Footer */}
            <footer className="bg-secondary py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Logo & Description */}
                        <div className="text-center md:text-left">
                            <Link href="/" className="inline-block">
                                <span className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-transparent bg-clip-text">
                                    CinemazBD
                                </span>
                            </Link>
                            <p className="mt-4 text-gray-400 text-sm">
                                Your ultimate destination for movies and TV series. Watch and download your favorite content in high quality.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="text-center">
                            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                            <div className="space-y-2">
                                <Link href="/movies" className="block text-gray-400 hover:text-white transition-colors">
                                    Movies
                                </Link>
                                <Link href="/tv-series" className="block text-gray-400 hover:text-white transition-colors">
                                    TV Series
                                </Link>
                                <Link href="/trending" className="block text-gray-400 hover:text-white transition-colors">
                                    Trending
                                </Link>
                            </div>
                        </div>

                        {/* Contact & Social */}
                        <div className="text-center md:text-right">
                            <h3 className="text-white font-semibold mb-4">Connect With Us</h3>
                            <a
                                href="https://t.me/scriptwriterbd"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 3.767-1.362 5.467-.168.715-.505 1.93-.505 1.93s-.038.446-.366.527c-.328.081-.866-.241-.866-.241l-2.125-1.414c-.948-.632-1.862-1.159-1.862-1.159s-.336-.201-.336-.631c0-.43.366-.671.366-.671l3.125-2.076c.574-.376 1.171-.765 1.171-.765s.366-.241.366-.631c0-.39-.402-.471-.402-.471l-4.937.007c-.574 0-.574.471-.574.471l-2.125 1.414c-.328.215-.328.631-.328.631l1.171 4.836c.112.456.505.527.505.527l4.937-.007c.537-.003.537-.474.537-.474z" />
                                </svg>
                                <span>Join Our Telegram</span>
                            </a>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-700 text-center">
                        <p className="text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} CinemazBD. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function getLanguageDisplay(downloadLinks: DownloadLink[]): string {
    if (!downloadLinks || downloadLinks.length === 0) return '';

    // Get all languages from all download links
    const allLanguages = downloadLinks.reduce((acc: string[], link) => {
        if (Array.isArray(link.language)) {
            return [...acc, ...link.language];
        }
        return acc;
    }, []);

    // Get unique languages (case insensitive)
    const uniqueLanguages = Array.from(new Set(
        allLanguages.map(lang => lang.toLowerCase())
    )).map(lang => {
        // Convert back to proper case
        const originalLang = allLanguages.find(l => l.toLowerCase() === lang);
        return originalLang || lang;
    });

    if (uniqueLanguages.length === 0) return '';
    if (uniqueLanguages.length === 1) return uniqueLanguages[0];
    if (uniqueLanguages.length > 3) return 'MULTI';

    return uniqueLanguages
        .map(lang => {
            // Get first 3 letters for each language
            const shortForm = lang.length <= 3 ? lang : lang.slice(0, 3);
            return shortForm.charAt(0).toUpperCase() + shortForm.slice(1).toLowerCase();
        })
        .join('+');
}

function getAllEpisodeLanguages(series: TVSeries) {
    if (!series) return [];

    const seasons = series.viewMode === 'auto' ? series.autoSeasons : series.manualSeasons;
    if (!seasons) return [];

    const allLanguages: string[] = [];

    // Get languages from all episodes
    if (Array.isArray(seasons)) {
        seasons.forEach(season => {
            if (season.episodes) {
                season.episodes.forEach(episode => {
                    if (episode.downloadLinks) {
                        episode.downloadLinks.forEach(link => {
                            if (Array.isArray(link.language)) {
                                allLanguages.push(...link.language);
                            }
                        });
                    }
                });
            }
        });
    }

    return allLanguages;
}

const getSeriesLanguages = (series: TVSeries): string => {
    if (!series.languages || series.languages.length === 0) return '';

    const uniqueLanguages = Array.from(new Set(
        series.languages.map(lang => lang.toLowerCase())
    )).map(lang => {
        const originalLang = series.languages.find(l => l.toLowerCase() === lang);
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
}; 