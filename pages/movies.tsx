import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { FiSearch, FiFilter } from 'react-icons/fi';
import Link from 'next/link';

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
    genres: string[];
    downloadLinks?: DownloadLink[];
}

export default function Movies() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [selectedQuality, setSelectedQuality] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const res = await fetch('/api/movies');
            const data = await res.json();
            setMovies(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching movies:', error);
            setLoading(false);
        }
    };

    // Get unique genres from all movies
    const allGenres = Array.from(new Set(movies.flatMap(movie => movie.genres)));

    // Get unique qualities from all movies
    const allQualities = Array.from(new Set(movies.map(movie => movie.quality)));

    // Get unique years from all movies
    const allYears = Array.from(new Set(movies.map(movie => movie.year))).sort((a, b) => b - a);

    // Filter movies based on search, genre, quality and year
    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre === 'all' || movie.genres.includes(selectedGenre);
        const matchesQuality = selectedQuality === 'all' || movie.quality === selectedQuality;
        const matchesYear = selectedYear === 'all' || movie.year === parseInt(selectedYear);
        return matchesSearch && matchesGenre && matchesQuality && matchesYear;
    });

    const getLanguageDisplay = (downloadLinks: DownloadLink[]): string => {
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
    };

    return (
        <div className="min-h-screen bg-primary">
            <Navbar />

            {/* Search and Filter Section */}
            <div className="pt-24 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search movies..."
                            className="w-full bg-secondary text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        {/* Year Filter */}
                        <div className="relative w-full md:w-36">
                            <select
                                className="w-full bg-secondary text-white px-4 py-3 rounded-lg appearance-none cursor-pointer"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                <option value="all">All Years</option>
                                {allYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <FiFilter className="absolute right-3 top-3.5 text-gray-400" size={20} />
                        </div>

                        {/* Genre Filter */}
                        <div className="relative w-full md:w-48">
                            <select
                                className="w-full bg-secondary text-white px-4 py-3 rounded-lg appearance-none cursor-pointer"
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                            >
                                <option value="all">All Genres</option>
                                {allGenres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                            <FiFilter className="absolute right-3 top-3.5 text-gray-400" size={20} />
                        </div>

                        {/* Quality Filter */}
                        <div className="relative w-full md:w-48">
                            <select
                                className="w-full bg-secondary text-white px-4 py-3 rounded-lg appearance-none cursor-pointer"
                                value={selectedQuality}
                                onChange={(e) => setSelectedQuality(e.target.value)}
                            >
                                <option value="all">All Qualities</option>
                                {allQualities.map(quality => (
                                    <option key={quality} value={quality}>{quality}</option>
                                ))}
                            </select>
                            <FiFilter className="absolute right-3 top-3.5 text-gray-400" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Movies Grid */}
            <div className="px-4 md:px-8 pb-12 max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : filteredMovies.length === 0 ? (
                    <div className="text-center text-gray-400 min-h-[400px] flex items-center justify-center">
                        No movies found
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {filteredMovies.map((movie) => (
                            <Link
                                key={movie._id}
                                href={`/movies/${movie._id}`}
                                className="bg-secondary rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all duration-200"
                            >
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
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-secondary py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-gray-400">
                        <p>&copy; 2024 CinemazBD. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
} 