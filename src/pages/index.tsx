import { useState } from "react";
import axios from 'axios';
import { MagnifyingGlassIcon, UserIcon, ArrowDownTrayIcon, FilmIcon, DocumentTextIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Disclosure, Transition } from '@headlessui/react';
import { Subtitle } from '@/types';

// Download button component
const DownloadButton = ({ url }: { url: string }) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const response = await axios.get(`/api/download?url=${encodeURIComponent(url)}`, {
                responseType: 'blob'
            });

            // Content-Type চেক করি
            const contentType = response.headers['content-type'];

            // ডাউনলোড লিঙ্ক তৈরি করি
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;

            // ফাইলের নাম সেট করি
            const contentDisposition = response.headers['content-disposition'];
            const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
            const filename = filenameMatch ? filenameMatch[1] :
                contentType.includes('application/zip') ? 'subtitles.zip' : 'subtitle.srt';

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error: any) {
            // শুধু সার্ভার থেকে এরর মেসেজ দেখাব
            if (error.response?.data?.error && error.response?.data?.showAlert) {
                alert(error.response.data.error);
            }
            // অন্য এরর সাইলেন্টলি হ্যান্ডল করব
        } finally {
            setDownloading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap disabled:opacity-50"
        >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>{downloading ? 'ডাউনলোড হচ্ছে...' : 'ডাউনলোড'}</span>
        </button>
    );
};

export default function Home() {
    const [query, setQuery] = useState('');
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const searchSubtitles = async () => {
        try {
            setLoading(true);
            setError('');
            setSubtitles([]);

            const response = await axios.get(`/api/search?query=${encodeURIComponent(query)}`);
            if (response.data && response.data.subtitles) {
                setSubtitles(response.data.subtitles);
            }
        } catch (err) {
            setError('সাবটাইটেল খোঁজার সময় একটি সমস্যা হয়েছে');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Group subtitles by series
    const groupedContent = subtitles.reduce((acc, sub) => {
        if (sub.seasonNumber) {
            const seriesName = sub.movieTitle.split('Season')[0].trim();
            if (!acc.series) acc.series = {};
            if (!acc.series[seriesName]) {
                acc.series[seriesName] = {
                    title: seriesName,
                    posterUrl: sub.posterUrl,
                    description: sub.description,
                    seasons: {}
                };
            }

            const seasonNum = sub.seasonNumber;
            const episodeNum = sub.episodeNumber || 0;

            if (!acc.series[seriesName].seasons[seasonNum]) {
                acc.series[seriesName].seasons[seasonNum] = {};
            }

            if (!acc.series[seriesName].seasons[seasonNum][episodeNum]) {
                acc.series[seriesName].seasons[seasonNum][episodeNum] = [];
            }

            acc.series[seriesName].seasons[seasonNum][episodeNum].push(sub);
        } else {
            if (!acc.movies) acc.movies = {};
            if (!acc.movies[sub.movieTitle]) {
                acc.movies[sub.movieTitle] = [];
            }
            acc.movies[sub.movieTitle].push(sub);
        }
        return acc;
    }, {
        series: {} as Record<string, {
            title: string;
            posterUrl?: string;
            description?: string;
            seasons: Record<number, Record<number, Subtitle[]>>
        }>,
        movies: {} as Record<string, Subtitle[]>
    });

    const cleanDatabase = async () => {
        if (confirm('আপনি কি নিশ্চিত যে ডাটাবেস ক্লিন করতে চান?')) {
            try {
                const response = await fetch('/api/clean-db', { method: 'POST' });
                const data = await response.json();
                alert(data.message || 'ডাটাবেস ক্লিন করা হয়েছে');
            } catch (error) {
                alert('ডাটাবেস ক্লিন করতে সমস্যা হয়েছে');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-2 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <h1 className="text-2xl md:text-5xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    বাংলা সাবটাইটেল খোঁজার সাইট
                </h1>

                {/* Search Section */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            className="w-full pl-10 bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 rounded-lg p-3"
                            placeholder="IMDB/TMDB লিঙ্ক বা সিনেমা/সিরিজের নাম দিন..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={searchSubtitles}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <MagnifyingGlassIcon className="h-5 w-5" />
                        <span>{loading ? 'খোঁজা হচ্ছে...' : 'খোঁজ'}</span>
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-red-500 bg-red-100/10 p-4 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {/* No Results Message */}
                {subtitles.length === 0 && !loading && !error && (
                    <div className="text-center text-gray-400 p-8">
                        <p>কোন সাবটাইটেল পাওয়া যায়নি</p>
                        <p className="text-sm mt-2">অন্য কিছু সার্চ করে দেখুন</p>
                    </div>
                )}

                {/* Results Section */}
                <div className="space-y-8">
                    {/* Grouped TV Series Section */}
                    {groupedContent.series && Object.keys(groupedContent.series).length > 0 && (
                        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                            <h2 className="text-xl font-semibold mb-4 text-blue-400 flex items-center gap-2">
                                <FilmIcon className="w-6 h-6" />
                                TV সিরিজ সমূহ
                            </h2>
                            <div className="space-y-4">
                                {Object.entries(groupedContent.series).map(([seriesTitle, series]) => (
                                    <Disclosure key={seriesTitle}>
                                        {({ open }) => (
                                            <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50 shadow-lg">
                                                <Disclosure.Button className="w-full flex justify-between items-center p-4 hover:bg-gray-700/30">
                                                    <div className="flex items-center gap-4">
                                                        {series.posterUrl && (
                                                            <img
                                                                src={series.posterUrl}
                                                                alt={seriesTitle}
                                                                className="w-16 h-20 object-cover rounded-md shadow-lg"
                                                            />
                                                        )}
                                                        <div className="text-left">
                                                            <h3 className="text-lg font-semibold text-blue-400">{seriesTitle}</h3>
                                                            <p className="text-sm text-gray-400">
                                                                {Object.keys(series.seasons).length} টি সিজন
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ChevronUpIcon
                                                        className={`${open ? 'rotate-180 transform' : ''} w-5 h-5 transition-transform duration-200`}
                                                    />
                                                </Disclosure.Button>

                                                <Transition
                                                    show={open}
                                                    enter="transition duration-100 ease-out"
                                                    enterFrom="transform scale-95 opacity-0"
                                                    enterTo="transform scale-100 opacity-100"
                                                    leave="transition duration-75 ease-out"
                                                    leaveFrom="transform scale-100 opacity-100"
                                                    leaveTo="transform scale-95 opacity-0"
                                                >
                                                    <Disclosure.Panel className="p-4">
                                                        {series.description && (
                                                            <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                                                                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                                                                    {series.description}
                                                                </p>
                                                            </div>
                                                        )}

                                                        <div className="space-y-3">
                                                            {Object.entries(series.seasons)
                                                                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                                                .map(([seasonNum, episodes]) => (
                                                                    <Disclosure key={seasonNum}>
                                                                        {({ open: seasonOpen }) => (
                                                                            <div className="border border-gray-700/30 rounded-lg overflow-hidden">
                                                                                <Disclosure.Button className="w-full p-3 flex justify-between items-center bg-gray-700/30 hover:bg-gray-700/50">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <FilmIcon className="w-4 h-4 text-blue-400" />
                                                                                        <span className="font-medium">সিজন {seasonNum}</span>
                                                                                        <span className="text-sm text-gray-400">
                                                                                            ({Object.keys(episodes).length} টি এপিসোড)
                                                                                        </span>
                                                                                    </div>
                                                                                    <ChevronUpIcon
                                                                                        className={`${seasonOpen ? 'rotate-180 transform' : ''} w-4 h-4 transition-transform duration-200`}
                                                                                    />
                                                                                </Disclosure.Button>

                                                                                <Transition
                                                                                    show={seasonOpen}
                                                                                    enter="transition duration-100 ease-out"
                                                                                    enterFrom="transform scale-95 opacity-0"
                                                                                    enterTo="transform scale-100 opacity-100"
                                                                                    leave="transition duration-75 ease-out"
                                                                                    leaveFrom="transform scale-100 opacity-100"
                                                                                    leaveTo="transform scale-95 opacity-0"
                                                                                >
                                                                                    <Disclosure.Panel className="p-2 space-y-2 bg-gray-800/30">
                                                                                        {Object.entries(episodes)
                                                                                            .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                                                                            .map(([episodeNum, versions]) => (
                                                                                                <Disclosure key={episodeNum}>
                                                                                                    {({ open: episodeOpen }) => (
                                                                                                        <div className="border border-gray-600/30 rounded-lg overflow-hidden">
                                                                                                            <Disclosure.Button className="w-full p-3 flex justify-between items-center bg-gray-800/50 hover:bg-gray-800/70">
                                                                                                                <div className="flex items-center gap-2">
                                                                                                                    <span className="font-medium">এপিসোড {episodeNum}</span>
                                                                                                                    <span className="text-sm text-gray-400">
                                                                                                                        ({versions.length} টি ভার্সন)
                                                                                                                    </span>
                                                                                                                </div>
                                                                                                                <ChevronUpIcon
                                                                                                                    className={`${episodeOpen ? 'rotate-180 transform' : ''} w-4 h-4 transition-transform duration-200`}
                                                                                                                />
                                                                                                            </Disclosure.Button>

                                                                                                            <Transition
                                                                                                                show={episodeOpen}
                                                                                                                enter="transition duration-100 ease-out"
                                                                                                                enterFrom="transform scale-95 opacity-0"
                                                                                                                enterTo="transform scale-100 opacity-100"
                                                                                                                leave="transition duration-75 ease-out"
                                                                                                                leaveFrom="transform scale-100 opacity-100"
                                                                                                                leaveTo="transform scale-95 opacity-0"
                                                                                                            >
                                                                                                                <Disclosure.Panel className="divide-y divide-gray-700/30">
                                                                                                                    {versions.map((version, idx) => (
                                                                                                                        <div key={idx} className="p-4 hover:bg-gray-700/20">
                                                                                                                            <div className="space-y-3">
                                                                                                                                <div className="flex items-center gap-2">
                                                                                                                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                                                                                                                    <span className="text-sm text-gray-400">
                                                                                                                                        আপলোডার: {version.uploader}
                                                                                                                                    </span>
                                                                                                                                </div>

                                                                                                                                {version.releaseInfo && (
                                                                                                                                    <div className="text-sm text-gray-300">
                                                                                                                                        <strong className="text-blue-400">Release Info:</strong>
                                                                                                                                        <p className="mt-1 break-words whitespace-pre-wrap bg-gray-900/30 p-2 rounded">
                                                                                                                                            {version.releaseInfo}
                                                                                                                                        </p>
                                                                                                                                    </div>
                                                                                                                                )}

                                                                                                                                {version.description && (
                                                                                                                                    <div className="text-sm text-gray-300">
                                                                                                                                        <strong className="text-blue-400">Description:</strong>
                                                                                                                                        <p className="mt-1 break-words whitespace-pre-wrap bg-gray-900/30 p-2 rounded">
                                                                                                                                            {version.description}
                                                                                                                                        </p>
                                                                                                                                    </div>
                                                                                                                                )}

                                                                                                                                <div className="flex justify-end pt-2">
                                                                                                                                    <DownloadButton url={version.downloadUrl} />
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    ))}
                                                                                                                </Disclosure.Panel>
                                                                                                            </Transition>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </Disclosure>
                                                                                            ))}
                                                                                    </Disclosure.Panel>
                                                                                </Transition>
                                                                            </div>
                                                                        )}
                                                                    </Disclosure>
                                                                ))}
                                                        </div>
                                                    </Disclosure.Panel>
                                                </Transition>
                                            </div>
                                        )}
                                    </Disclosure>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Subtitles Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
                            <DocumentTextIcon className="w-6 h-6" />
                            সকল সাবটাইটেল
                        </h2>

                        {/* Group subtitles by page title */}
                        {Object.entries(
                            subtitles.reduce((acc, sub) => {
                                const pageTitle = sub.movieTitle;
                                if (!acc[pageTitle]) {
                                    acc[pageTitle] = [];
                                }
                                acc[pageTitle].push(sub);
                                return acc;
                            }, {} as Record<string, Subtitle[]>)
                        ).map(([pageTitle, subs]) => (
                            <Disclosure key={pageTitle}>
                                {({ open }) => (
                                    <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50">
                                        <Disclosure.Button className="w-full flex justify-between items-center p-4 hover:bg-gray-700/30">
                                            <div className="flex items-center gap-4">
                                                {subs[0].posterUrl && (
                                                    <img
                                                        src={subs[0].posterUrl}
                                                        alt={pageTitle}
                                                        className="w-16 h-20 object-cover rounded-md shadow-lg"
                                                    />
                                                )}
                                                <div className="text-left">
                                                    <h3 className="text-lg font-semibold text-blue-400">{pageTitle}</h3>
                                                    <p className="text-sm text-gray-400">
                                                        {subs.length} টি সাবটাইটেল
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronUpIcon
                                                className={`${open ? 'rotate-180 transform' : ''} w-5 h-5 transition-transform duration-200`}
                                            />
                                        </Disclosure.Button>

                                        <Transition
                                            show={open}
                                            enter="transition duration-100 ease-out"
                                            enterFrom="transform scale-95 opacity-0"
                                            enterTo="transform scale-100 opacity-100"
                                            leave="transition duration-75 ease-out"
                                            leaveFrom="transform scale-100 opacity-100"
                                            leaveTo="transform scale-95 opacity-0"
                                        >
                                            <Disclosure.Panel className="divide-y divide-gray-700/30">
                                                {subs.map((sub, idx) => (
                                                    <div key={idx} className="p-4 hover:bg-gray-700/20">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                                                    <span className="text-sm text-gray-400">
                                                                        আপলোডার: {sub.uploader}
                                                                    </span>
                                                                </div>
                                                                {/* Episode Format */}
                                                                {sub.seasonNumber && (
                                                                    <span className="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                                                                        S{String(sub.seasonNumber).padStart(2, '0')}
                                                                        {sub.episodeNumber ? `E${String(sub.episodeNumber).padStart(2, '0')}` : 'Undefined'}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {sub.releaseInfo && (
                                                                <div className="text-sm">
                                                                    <strong className="text-blue-400">Release Info:</strong>
                                                                    <p className="mt-1 text-gray-300 break-words whitespace-pre-wrap bg-gray-900/30 p-2 rounded">
                                                                        {sub.releaseInfo}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {sub.description && (
                                                                <div className="text-sm">
                                                                    <strong className="text-blue-400">Description:</strong>
                                                                    <p className="mt-1 text-gray-300 break-words whitespace-pre-wrap bg-gray-900/30 p-2 rounded">
                                                                        {sub.description}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            <div className="flex justify-end">
                                                                <DownloadButton url={sub.downloadUrl} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </Disclosure.Panel>
                                        </Transition>
                                    </div>
                                )}
                            </Disclosure>
                        ))}
                    </div>
                </div>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <button
                    onClick={cleanDatabase}
                    className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                    ক্লিন ডাটাবেস
                </button>
            )}
        </div>
    );
} 