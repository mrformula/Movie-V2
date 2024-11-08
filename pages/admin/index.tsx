import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FiFilm, FiTv, FiHardDrive, FiCloud, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { format } from 'timeago.js';

// Add new interface for recent activities
interface RecentActivity {
    type: 'movie' | 'tvSeries';
    title: string;
    createdAt: Date;
}

// Update stats interface
interface Stats {
    movies: number;
    tvSeries: number;
    totalFiles: number;
    storageUsed: string;
    storageLeft: string;
    recentActivities: RecentActivity[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        movies: 0,
        tvSeries: 0,
        totalFiles: 0,
        storageUsed: '0 MB',
        storageLeft: '0 MB',
        recentActivities: []
    });

    const [loading, setLoading] = useState({
        movie: false,
        tvSeries: false
    });

    const [tmdbId, setTmdbId] = useState({
        movie: '',
        tvSeries: ''
    });

    const handleAddMovie = async () => {
        if (!tmdbId.movie) {
            toast.error('Please enter TMDB Movie ID');
            return;
        }

        setLoading({ ...loading, movie: true });
        try {
            const response = await fetch('/api/movies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tmdbId: tmdbId.movie }),
            });

            if (!response.ok) throw new Error('Failed to add movie');

            toast.success('Movie added successfully');
            setTmdbId({ ...tmdbId, movie: '' });
            fetchStats();
        } catch (error) {
            toast.error('Error adding movie');
            console.error(error);
        } finally {
            setLoading({ ...loading, movie: false });
        }
    };

    const handleAddTVSeries = async () => {
        if (!tmdbId.tvSeries) {
            toast.error('Please enter TMDB TV Series ID');
            return;
        }

        setLoading({ ...loading, tvSeries: true });
        try {
            const response = await fetch('/api/tv-series', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tmdbId: tmdbId.tvSeries }),
            });

            if (!response.ok) throw new Error('Failed to add TV series');

            toast.success('TV Series added successfully');
            setTmdbId({ ...tmdbId, tvSeries: '' });
            fetchStats();
        } catch (error) {
            toast.error('Error adding TV series');
            console.error(error);
        } finally {
            setLoading({ ...loading, tvSeries: false });
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <DashboardLayout>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {/* Movie Stats */}
                <div className="bg-secondary rounded-xl shadow-lg overflow-hidden">
                    <div className="px-4 md:px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-400">Total Movies</div>
                                <div className="text-2xl md:text-3xl font-bold text-white mt-2">{stats.movies}</div>
                            </div>
                            <div className="bg-purple-500 bg-opacity-20 rounded-lg p-3">
                                <FiFilm className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-purple-600 bg-opacity-10 px-4 md:px-6 py-3">
                        <Link href="/admin/movies" className="flex items-center text-purple-500 hover:text-purple-400">
                            <FiActivity className="w-4 h-4" />
                            <span className="text-sm ml-2">Manage Movies</span>
                        </Link>
                    </div>
                </div>

                {/* TV Series Stats */}
                <div className="bg-secondary rounded-xl shadow-lg overflow-hidden">
                    <div className="px-4 md:px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-400">Total TV Series</div>
                                <div className="text-2xl md:text-3xl font-bold text-white mt-2">{stats.tvSeries}</div>
                            </div>
                            <div className="bg-pink-500 bg-opacity-20 rounded-lg p-3">
                                <FiTv className="w-6 h-6 md:w-8 md:h-8 text-pink-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-pink-600 bg-opacity-10 px-4 md:px-6 py-3">
                        <Link href="/admin/tv-series" className="flex items-center text-pink-500 hover:text-pink-400">
                            <FiActivity className="w-4 h-4" />
                            <span className="text-sm ml-2">Manage TV Series</span>
                        </Link>
                    </div>
                </div>

                {/* Files Stats */}
                <Link href="/admin/files" className="bg-secondary rounded-xl shadow-lg overflow-hidden">
                    <div className="px-4 md:px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-400">StreamWish Files</div>
                                <div className="text-2xl md:text-3xl font-bold text-white mt-2">{stats.totalFiles}</div>
                            </div>
                            <div className="bg-blue-500 bg-opacity-20 rounded-lg p-3">
                                <FiHardDrive className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-600 bg-opacity-10 px-4 md:px-6 py-3">
                        <div className="flex items-center text-blue-500">
                            <FiActivity className="w-4 h-4" />
                            <span className="text-sm ml-2">View Files</span>
                        </div>
                    </div>
                </Link>

                {/* Storage Stats */}
                <div className="bg-secondary rounded-xl shadow-lg overflow-hidden">
                    <div className="px-4 md:px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-400">Storage Used</div>
                                <div className="text-2xl md:text-3xl font-bold text-white mt-2">{stats.storageUsed}</div>
                            </div>
                            <div className="bg-green-500 bg-opacity-20 rounded-lg p-3">
                                <FiCloud className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-600 bg-opacity-10 px-4 md:px-6 py-3">
                        <div className="flex items-center text-green-500">
                            <FiActivity className="w-4 h-4" />
                            <span className="text-sm ml-2">Storage Details</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Add Movie Section */}
                <div className="bg-secondary rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-6">Add New Movie</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400">TMDB Movie ID</label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    placeholder="Enter TMDB Movie ID"
                                    className="w-full bg-primary text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={tmdbId.movie}
                                    onChange={(e) => setTmdbId({ ...tmdbId, movie: e.target.value })}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleAddMovie}
                            disabled={loading.movie}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition duration-200"
                        >
                            {loading.movie ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Adding Movie...
                                </span>
                            ) : (
                                'Add Movie'
                            )}
                        </button>
                    </div>
                </div>

                {/* Add TV Series Section */}
                <div className="bg-secondary rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-6">Add New TV Series</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400">TMDB TV Series ID</label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    placeholder="Enter TMDB TV Series ID"
                                    className="w-full bg-primary text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    value={tmdbId.tvSeries}
                                    onChange={(e) => setTmdbId({ ...tmdbId, tvSeries: e.target.value })}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleAddTVSeries}
                            disabled={loading.tvSeries}
                            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-medium transition duration-200"
                        >
                            {loading.tvSeries ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Adding TV Series...
                                </span>
                            ) : (
                                'Add TV Series'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-secondary rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
                <div className="space-y-4">
                    {stats.recentActivities?.map((activity, index) => (
                        <div key={index} className="flex items-center p-4 bg-primary rounded-lg">
                            <div className={`${activity.type === 'movie'
                                ? 'bg-purple-500 bg-opacity-20'
                                : 'bg-pink-500 bg-opacity-20'
                                } rounded-lg p-2 mr-4`}>
                                {activity.type === 'movie' ? (
                                    <FiFilm className="w-6 h-6 text-purple-500" />
                                ) : (
                                    <FiTv className="w-6 h-6 text-pink-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-white">
                                    New {activity.type === 'movie' ? 'movie' : 'TV series'} added:{' '}
                                    <span className="font-medium">{activity.title}</span>
                                </p>
                                <p className="text-sm text-gray-400">
                                    {format(new Date(activity.createdAt))}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
} 