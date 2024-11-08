import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiChevronUp, FiFilm, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import AddSeasonModal from '@/components/AddSeasonModal';
import TVSeriesEditModal from '@/components/TVSeriesEditModal';
import EpisodeEditModal from '@/components/EpisodeEditModal';
import type { Episode } from '@/types/episode';
import type { DownloadLink } from '@/types/movie';

const DashboardLayout = dynamic(() => import('../../components/DashboardLayout'), {
    ssr: false
});

interface Season {
    seasonNumber: number;
    episodes: Episode[];
}

interface TVSeries {
    _id: string;
    tmdbId: string;
    title: string;
    overview: string;
    poster: string;
    backdrop: string | null;
    genres: string[];
    year: number;
    rating: number;
    status: string;
    networks: string[];
    numberOfSeasons: number;
    autoSeasons: Season[];
    manualSeasons: Season[];
    viewMode: 'auto' | 'manual';
    quality: string;
    streamwishId: string;
}

interface SelectedEpisode {
    seriesId: string;
    seasonNumber: number;
    episodeNumber: number;
    title: string;
    embedCode: string;
    streamwishId: string;
    downloadLinks: DownloadLink[];
}

const TVSeriesManagement: React.FC = () => {
    const [series, setSeries] = useState<TVSeries[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedSeasons, setExpandedSeasons] = useState<{ [key: string]: boolean }>({});
    const [viewMode, setViewMode] = useState<'auto' | 'manual'>('auto');
    const [selectedEpisode, setSelectedEpisode] = useState<SelectedEpisode | null>(null);
    const [expandedEpisodes, setExpandedEpisodes] = useState<{ [key: string]: boolean }>({});
    const [showAddSeasonModal, setShowAddSeasonModal] = useState(false);
    const [editingEpisode, setEditingEpisode] = useState<{
        seriesId: string;
        seasonNumber: number;
        episodeNumber: number;
        embedCode: string;
    } | null>(null);
    const [selectedSeriesForSeason, setSelectedSeriesForSeason] = useState<TVSeries | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchTVSeries();
    }, []);

    const fetchTVSeries = async () => {
        try {
            const res = await fetch('/api/tv-series');
            const data = await res.json();
            setSeries(data);
        } catch (error) {
            console.error('Error fetching TV series:', error);
            toast.error('Error fetching TV series');
        }
    };

    const toggleSeasonExpand = (seriesId: string) => {
        setExpandedSeasons(prev => ({
            ...prev,
            [seriesId]: !prev[seriesId]
        }));
    };

    const handleEpisodeClick = (e: React.MouseEvent, seriesId: string, seasonNumber: number, episode: Episode) => {
        e.stopPropagation();
        setSelectedEpisode({
            seriesId,
            seasonNumber,
            episodeNumber: episode.episodeNumber,
            title: episode.title,
            embedCode: episode.embedCode,
            streamwishId: episode.streamwishId,
            downloadLinks: episode.downloadLinks || []
        });
    };

    const handleSaveEpisodeLink = async () => {
        if (!editingEpisode) return;

        try {
            const res = await fetch(`/api/tv-series/${editingEpisode.seriesId}/episodes`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seasonNumber: editingEpisode.seasonNumber,
                    episodeNumber: editingEpisode.episodeNumber,
                    embedCode: editingEpisode.embedCode
                }),
            });

            if (!res.ok) throw new Error('Failed to update episode');

            toast.success('Episode updated successfully');
            fetchTVSeries();
            setEditingEpisode(null);
        } catch (error) {
            console.error('Error updating episode:', error);
            toast.error('Error updating episode');
        }
    };

    const handleAddManualSeason = async (seriesId: string, seasonData: any) => {
        try {
            const res = await fetch(`/api/tv-series/${seriesId}/seasons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(seasonData),
            });

            if (!res.ok) throw new Error('Failed to add season');

            toast.success('Season added successfully');
            fetchTVSeries();
            setShowAddSeasonModal(false);
        } catch (error) {
            console.error('Error adding season:', error);
            toast.error('Error adding season');
        }
    };

    const handleDeleteSeason = async (seriesId: string, seasonNumber: number) => {
        if (!confirm('Are you sure you want to delete this season?')) return;

        try {
            const res = await fetch(`/api/tv-series/${seriesId}/seasons/${seasonNumber}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete season');

            toast.success('Season deleted successfully');
            fetchTVSeries();
        } catch (error) {
            console.error('Error deleting season:', error);
            toast.error('Error deleting season');
        }
    };

    const handleAddSeason = (show: TVSeries) => {
        setSelectedSeriesForSeason(show);
        setShowAddSeasonModal(true);
    };

    const handleDeleteEpisode = async (seriesId: string, seasonNumber: number, episodeNumber: number) => {
        if (!confirm('Are you sure you want to delete this episode?')) return;

        try {
            const res = await fetch(`/api/tv-series/${seriesId}/episodes/${episodeNumber}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seasonNumber })
            });

            if (!res.ok) throw new Error('Failed to delete episode');

            toast.success('Episode deleted successfully');
            fetchTVSeries();
        } catch (error) {
            console.error('Error deleting episode:', error);
            toast.error('Error deleting episode');
        }
    };

    const handleViewModeChange = async (seriesId: string, mode: 'auto' | 'manual') => {
        try {
            const res = await fetch(`/api/tv-series/${seriesId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ viewMode: mode }),
            });

            if (!res.ok) throw new Error('Failed to update view mode');

            fetchTVSeries();
        } catch (error) {
            console.error('Error updating view mode:', error);
            toast.error('Error updating view mode');
        }
    };

    const filteredSeries = series.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteSeries = async (seriesId: string) => {
        if (!confirm('Are you sure you want to delete this TV series?')) return;

        try {
            const res = await fetch(`/api/tv-series/${seriesId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete TV series');

            toast.success('TV series deleted successfully');
            fetchTVSeries();
        } catch (error) {
            console.error('Error deleting TV series:', error);
            toast.error('Error deleting TV series');
        }
    };

    const handleEditSeries = (series: TVSeries) => {
        setSelectedSeriesForSeason(series);
        setShowEditModal(true);
    };

    const hasLinks = (episode: Episode) => {
        return Boolean(episode.embedCode) || (episode.downloadLinks && episode.downloadLinks.length > 0);
    };

    return (
        <div>
            <DashboardLayout>
                <div className="bg-secondary rounded-lg p-4 md:p-6">
                    {/* Search Bar - Made Responsive */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
                        <h1 className="text-xl md:text-2xl font-bold text-white">TV Series Management</h1>
                        <input
                            type="text"
                            placeholder="Search TV series..."
                            className="w-full md:w-64 bg-primary text-white px-4 py-2 rounded"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* TV Series List */}
                    <div className="space-y-4 md:space-y-6">
                        {filteredSeries.map((show) => (
                            <div key={show._id} className="bg-primary rounded-lg p-4">
                                {/* Series Header - Made Responsive */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-start md:items-center gap-4">
                                        <img
                                            src={show.poster}
                                            alt={show.title}
                                            className="w-20 h-28 md:w-16 md:h-24 object-cover rounded"
                                        />
                                        <div>
                                            <h3 className="text-lg md:text-xl font-bold text-white">{show.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 text-gray-400 text-sm mt-1">
                                                <span>{show.year}</span>
                                                <span className="hidden md:inline">•</span>
                                                <span>⭐ {show.rating}</span>
                                                <span className="hidden md:inline">•</span>
                                                <span>{show.numberOfSeasons} Seasons</span>
                                                <span className="hidden md:inline">•</span>
                                                <span className="break-all">{show.streamwishId}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons - Made Responsive */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            onClick={() => handleEditSeries(show)}
                                            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <FiEdit2 size={18} />
                                            <span>Edit</span>
                                        </button>

                                        <button
                                            onClick={() => handleDeleteSeries(show._id)}
                                            className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <FiTrash2 size={18} />
                                            <span>Delete</span>
                                        </button>

                                        <button
                                            onClick={() => toggleSeasonExpand(show._id)}
                                            className="flex-1 md:flex-none bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                                        >
                                            {expandedSeasons[show._id] ? (
                                                <FiChevronUp size={24} className="text-gray-300" />
                                            ) : (
                                                <FiChevronDown size={24} className="text-gray-300" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Seasons Section - Made Responsive */}
                                {expandedSeasons[show._id] && (
                                    <div className="mt-4">
                                        {/* View Mode Toggle - Made Responsive */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleViewModeChange(show._id, 'auto')}
                                                    className={`px-4 py-2 rounded text-sm ${show.viewMode === 'auto'
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-700 text-gray-300'
                                                        }`}
                                                >
                                                    Auto Seasons
                                                </button>
                                                <button
                                                    onClick={() => handleViewModeChange(show._id, 'manual')}
                                                    className={`px-4 py-2 rounded text-sm ${show.viewMode === 'manual'
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-700 text-gray-300'
                                                        }`}
                                                >
                                                    Manual Seasons
                                                </button>
                                            </div>
                                            {show.viewMode === 'manual' && (
                                                <button
                                                    onClick={() => handleAddSeason(show)}
                                                    className="flex items-center text-purple-400 hover:text-purple-300 text-sm"
                                                >
                                                    <FiPlus size={16} className="mr-1" /> Add Season
                                                </button>
                                            )}
                                        </div>

                                        {/* Episodes List - Made Responsive */}
                                        <div className="space-y-4">
                                            {(show.viewMode === 'auto' ? show.autoSeasons : show.manualSeasons)?.map((season) => (
                                                <div key={season.seasonNumber} className="bg-secondary rounded-lg p-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="text-lg font-medium text-white">
                                                            Season {season.seasonNumber}
                                                        </h4>
                                                        {show.viewMode === 'manual' && (
                                                            <button
                                                                onClick={() => handleDeleteSeason(show._id, season.seasonNumber)}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid gap-2">
                                                        {season.episodes.map((episode) => (
                                                            <div
                                                                key={episode.episodeNumber}
                                                                className={`bg-primary p-4 rounded-lg ${hasLinks(episode)
                                                                    ? 'border-l-4 border-green-500'
                                                                    : 'border-l-4 border-red-500'
                                                                    }`}
                                                            >
                                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                                    <div>
                                                                        <div className="text-white">
                                                                            Episode {episode.episodeNumber}
                                                                        </div>
                                                                        <div className="text-sm text-gray-400">
                                                                            {episode.title}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={(e) => handleEpisodeClick(e, show._id, season.seasonNumber, episode)}
                                                                            className="text-blue-400 hover:text-blue-300 text-sm"
                                                                        >
                                                                            {hasLinks(episode) ? 'Edit Links' : 'Add Links'}
                                                                        </button>
                                                                        {show.viewMode === 'manual' && (
                                                                            <button
                                                                                onClick={() => handleDeleteEpisode(show._id, season.seasonNumber, episode.episodeNumber)}
                                                                                className="text-red-400 hover:text-red-300"
                                                                            >
                                                                                <FiTrash2 size={16} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardLayout>

            {/* Modals */}
            {showAddSeasonModal && selectedSeriesForSeason && (
                <AddSeasonModal
                    onClose={() => setShowAddSeasonModal(false)}
                    onSave={(seasonData) => handleAddManualSeason(selectedSeriesForSeason._id, seasonData)}
                />
            )}

            {showEditModal && selectedSeriesForSeason && (
                <TVSeriesEditModal
                    series={selectedSeriesForSeason}
                    onClose={() => setShowEditModal(false)}
                    onSave={async (updates) => {
                        try {
                            const res = await fetch(`/api/tv-series/${selectedSeriesForSeason._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(updates),
                            });

                            if (!res.ok) throw new Error('Failed to update TV series');

                            toast.success('TV series updated successfully');
                            fetchTVSeries();
                            setShowEditModal(false);
                        } catch (error) {
                            console.error('Error updating TV series:', error);
                            toast.error('Error updating TV series');
                        }
                    }}
                />
            )}

            {selectedEpisode && (
                <EpisodeEditModal
                    episode={selectedEpisode}
                    onClose={() => setSelectedEpisode(null)}
                    onSave={async (updates) => {
                        try {
                            const res = await fetch(`/api/tv-series/${selectedEpisode.seriesId}/episodes`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    seasonNumber: selectedEpisode.seasonNumber,
                                    episodeNumber: selectedEpisode.episodeNumber,
                                    ...updates
                                }),
                            });

                            if (!res.ok) throw new Error('Failed to update episode');

                            toast.success('Episode updated successfully');
                            fetchTVSeries();
                            setSelectedEpisode(null);
                        } catch (error) {
                            console.error('Error updating episode:', error);
                            toast.error('Error updating episode');
                        }
                    }}
                />
            )}
        </div>
    );
};

export default TVSeriesManagement; 