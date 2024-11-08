import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import { FiPlay, FiStar, FiChevronDown, FiChevronUp, FiDownload, FiArrowLeft } from 'react-icons/fi';
import AdBlocker from '@/components/AdBlocker';

interface DownloadLink {
    language: string[];
    quality: string;
    size: string;
    format: string;
    type: string;
    url: string;
}

interface Episode {
    episodeNumber: number;
    title: string;
    overview: string;
    airDate: string;
    stillPath: string | null;
    embedCode?: string;
    downloadLinks?: DownloadLink[];
}

interface SelectedEpisode {
    seasonNumber: number;
    episodeNumber: number;
    title: string;
    embedCode?: string;
    downloadLinks?: DownloadLink[];
}

interface Season {
    seasonNumber: number;
    episodes: Episode[];
}

interface TVSeries {
    _id: string;
    title: string;
    poster: string;
    backdrop: string;
    genres: string[];
    year: number;
    rating: number;
    status: string;
    quality: string;
    overview: string;
    numberOfSeasons: number;
    networks: string[];
    autoSeasons: Season[];
    manualSeasons: Season[];
    viewMode: 'auto' | 'manual';
    languages?: string[];
}

export default function TVSeriesDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [series, setSeries] = useState<TVSeries | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSeasons, setExpandedSeasons] = useState<{ [key: number]: boolean }>({});
    const [selectedEpisode, setSelectedEpisode] = useState<SelectedEpisode | null>(null);
    const [adBlockEnabled, setAdBlockEnabled] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [showDownloadSection, setShowDownloadSection] = useState(false);

    useEffect(() => {
        if (id) {
            fetchTVSeriesDetails();
        }
    }, [id]);

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

    const fetchTVSeriesDetails = async () => {
        try {
            const res = await fetch(`/api/tv-series/${id}`);
            if (!res.ok) throw new Error('TV series not found');
            const data = await res.json();
            setSeries(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching TV series details:', error);
            setLoading(false);
        }
    };

    const toggleSeason = (seasonNumber: number) => {
        setExpandedSeasons(prev => ({
            ...prev,
            [seasonNumber]: !prev[seasonNumber]
        }));
    };

    const getEmbedUrl = (code: string) => {
        const videoId = code.replace('https://hlswish.com/', '')
            .replace('https://hlswish.com/e/', '')
            .replace('https://embedwish.com/e/', '')
            .replace('https://embedwish.com/', '')
            .replace('/e/', '')
            .replace('e/', '');

        return `https://embedwish.com/e/${videoId}`;
    };

    const scrollToPlayer = () => {
        const playerSection = document.getElementById('player-section');
        if (playerSection) {
            setExpandedSeasons({});

            setTimeout(() => {
                playerSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 50);
        }
    };

    const getLanguageDisplay = (series: TVSeries): string => {
        if (!series.languages || series.languages.length === 0) return '';

        const uniqueLanguages = Array.from(new Set(
            series.languages.map(lang => lang.toLowerCase())
        )).map(lang => {
            const originalLang = series.languages?.find(l => l.toLowerCase() === lang) || lang;
            return originalLang;
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

    const handleEpisodeClick = (episode: Episode, seasonNumber: number) => {
        setSelectedEpisode({
            seasonNumber,
            episodeNumber: episode.episodeNumber,
            title: episode.title,
            embedCode: episode.embedCode,
            downloadLinks: episode.downloadLinks
        });
        scrollToPlayer();
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

    if (loading) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!series) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="text-white">TV series not found</div>
            </div>
        );
    }

    const seasons = series.viewMode === 'auto' ? series.autoSeasons : series.manualSeasons;

    return (
        <div className="min-h-screen bg-primary">
            <Navbar />
            <AdBlocker enabled={adBlockEnabled} />

            <div className="container mx-auto px-4 pt-20 pb-12">
                {/* Series Info Section */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Poster */}
                    <div className="w-full md:w-1/3 lg:w-1/4">
                        <img
                            src={series.poster}
                            alt={series.title}
                            className="w-full rounded-lg shadow-lg"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-white mb-4">{series.title}</h1>

                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <div className="flex items-center text-yellow-400">
                                <FiStar className="mr-1" />
                                <span>{series.rating}/10</span>
                            </div>
                            <span className="text-gray-400">{series.year}</span>
                            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                                {series.quality}
                            </span>
                            <span className={`
                                ${series.status === 'Ended'
                                    ? 'bg-gradient-to-r from-red-600 to-pink-600'
                                    : 'bg-gradient-to-r from-green-600 to-emerald-600'
                                } 
                                text-white text-xs px-3 py-1 rounded-full shadow-lg backdrop-blur-sm
                            `}>
                                {series.status}
                            </span>
                            {series.languages && series.languages.length > 0 && (
                                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                                    {getLanguageDisplay(series)}
                                </span>
                            )}
                        </div>

                        {/* Overview */}
                        <p className="text-gray-300 leading-relaxed mb-6">
                            {series.overview}
                        </p>

                        {/* Genres */}
                        {series.genres && series.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {series.genres.map((genre, index) => (
                                    <span
                                        key={index}
                                        className="bg-secondary text-gray-300 px-3 py-1 rounded-full text-sm"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Seasons and Episodes Section */}
                <div className="mt-8">
                    {/* Season Selector */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {(series.viewMode === 'auto' ? series.autoSeasons : series.manualSeasons)?.map((season) => (
                            <button
                                key={season.seasonNumber}
                                onClick={() => setSelectedSeason(season.seasonNumber)}
                                className={`px-4 py-2 rounded-lg ${selectedSeason === season.seasonNumber
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-secondary text-gray-300 hover:bg-purple-600/20'
                                    }`}
                            >
                                Season {season.seasonNumber}
                            </button>
                        ))}
                    </div>

                    {/* Episodes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(series.viewMode === 'auto' ? series.autoSeasons : series.manualSeasons)
                            ?.find(s => s.seasonNumber === selectedSeason)
                            ?.episodes
                            .filter(episode => episode.embedCode || (episode.downloadLinks && episode.downloadLinks.length > 0))
                            .map((episode) => (
                                <div
                                    key={episode.episodeNumber}
                                    onClick={() => handleEpisodeClick(episode, selectedSeason)}
                                    className={`bg-secondary p-4 rounded-lg cursor-pointer transition-all duration-200 
                                        ${selectedEpisode?.episodeNumber === episode.episodeNumber
                                            ? 'ring-2 ring-purple-500'
                                            : 'hover:ring-2 hover:ring-purple-500/50'
                                        }`}
                                >
                                    <h3 className="text-white font-medium">Episode {episode.episodeNumber}</h3>
                                    <p className="text-gray-400 text-sm mt-1">{episode.title}</p>

                                    {/* Episode Badges */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {episode.embedCode && (
                                            <span className="bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                                                Watch Online
                                            </span>
                                        )}
                                        {episode.downloadLinks && episode.downloadLinks.length > 0 && (
                                            <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                                                Download Available
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Player/Download Section */}
                    {selectedEpisode && (
                        <div id="player-section" className="mt-8">
                            <div className="bg-secondary rounded-lg p-6">
                                <h2 className="text-2xl font-bold text-white mb-6">
                                    {series.title} - Season {selectedEpisode.seasonNumber} Episode {selectedEpisode.episodeNumber}
                                </h2>

                                {/* Download Section - Show First */}
                                {selectedEpisode.downloadLinks && selectedEpisode.downloadLinks.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-xl font-semibold text-white mb-4">Download Options</h3>
                                        <div className="space-y-4">
                                            {selectedEpisode.downloadLinks.map((link, index) => (
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
                                )}

                                {/* Watch Section - Show Second */}
                                {selectedEpisode.embedCode && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-4">Watch Online</h3>
                                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                            <iframe
                                                src={getVideoUrl(selectedEpisode.embedCode)}
                                                className="w-full h-full"
                                                frameBorder="0"
                                                scrolling="no"
                                                allowFullScreen
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            ></iframe>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 