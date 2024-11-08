import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface TVSeriesData {
    _id: string;
    title: string;
    poster: string;
    genres: string[];
    status: string;
    quality: string;
    year: number;
    streamwishId: string;
    languages?: string[];
}

interface Props {
    series: TVSeriesData;
    onClose: () => void;
    onSave: (updates: Partial<TVSeriesData>) => void;
}

const AVAILABLE_LANGUAGES = [
    'Bengali',
    'English',
    'Hindi',
    'Tamil',
    'Telugu',
    'Malayalam',
    'Kannada',
    'Dual Audio',
    'Multi Audio'
];

export default function TVSeriesEditModal({ series, onClose, onSave }: Props) {
    const [editedSeries, setEditedSeries] = useState({
        ...series,
        quality: series.quality || 'HD',
        year: series.year || new Date().getFullYear(),
        languages: series.languages || []
    });
    const [newLanguage, setNewLanguage] = useState('');
    const [showCustomLanguageInput, setShowCustomLanguageInput] = useState(false);

    const addLanguage = (language: string) => {
        if (!editedSeries.languages.includes(language)) {
            setEditedSeries({
                ...editedSeries,
                languages: [...editedSeries.languages, language]
            });
        }
    };

    const removeLanguage = (language: string) => {
        setEditedSeries({
            ...editedSeries,
            languages: editedSeries.languages.filter(l => l !== language)
        });
    };

    const handleAddCustomLanguage = () => {
        if (newLanguage.trim() && !editedSeries.languages.includes(newLanguage.trim())) {
            setEditedSeries({
                ...editedSeries,
                languages: [...editedSeries.languages, newLanguage.trim()]
            });
            setNewLanguage('');
            setShowCustomLanguageInput(false);
        }
    };

    const handleSave = () => {
        onSave({
            ...editedSeries,
            languages: editedSeries.languages
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary p-6 rounded-lg w-full max-w-[800px] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Edit TV Series</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-white text-sm">Title</label>
                        <input
                            type="text"
                            className="w-full bg-primary text-white p-2 rounded"
                            value={editedSeries.title}
                            onChange={(e) => setEditedSeries({
                                ...editedSeries,
                                title: e.target.value
                            })}
                        />
                    </div>

                    <div>
                        <label className="text-white text-sm">Year</label>
                        <input
                            type="number"
                            className="w-full bg-primary text-white p-2 rounded"
                            value={editedSeries.year}
                            onChange={(e) => setEditedSeries({
                                ...editedSeries,
                                year: parseInt(e.target.value)
                            })}
                        />
                    </div>

                    <div>
                        <label className="text-white text-sm">Poster URL</label>
                        <input
                            type="text"
                            className="w-full bg-primary text-white p-2 rounded"
                            value={editedSeries.poster}
                            onChange={(e) => setEditedSeries({
                                ...editedSeries,
                                poster: e.target.value
                            })}
                        />
                    </div>

                    <div>
                        <label className="text-white text-sm">Genres (comma separated)</label>
                        <input
                            type="text"
                            className="w-full bg-primary text-white p-2 rounded"
                            value={editedSeries.genres.join(', ')}
                            onChange={(e) => setEditedSeries({
                                ...editedSeries,
                                genres: e.target.value.split(',').map(g => g.trim()).filter(Boolean)
                            })}
                        />
                    </div>

                    <div>
                        <label className="text-white text-sm">Status</label>
                        <select
                            className="w-full bg-primary text-white p-2 rounded"
                            value={editedSeries.status}
                            onChange={(e) => setEditedSeries({
                                ...editedSeries,
                                status: e.target.value
                            })}
                        >
                            <option value="Returning Series">Ongoing</option>
                            <option value="Ended">Ended</option>
                            <option value="Canceled">Canceled</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-white text-sm">Quality</label>
                        <select
                            className="w-full bg-primary text-white p-2 rounded"
                            value={editedSeries.quality}
                            onChange={(e) => setEditedSeries({
                                ...editedSeries,
                                quality: e.target.value
                            })}
                        >
                            <option value="CAM">CAM</option>
                            <option value="HDCAM">HDCAM</option>
                            <option value="HD">HD</option>
                            <option value="WebRip">WebRip</option>
                            <option value="WebDL">WebDL</option>
                            <option value="HDTS">HDTS</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-300">Languages</label>
                        <div className="flex flex-wrap gap-2 mt-1 mb-2">
                            {editedSeries.languages.map((lang) => (
                                <span
                                    key={lang}
                                    className="bg-purple-600 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                                >
                                    {lang}
                                    <button
                                        onClick={() => removeLanguage(lang)}
                                        className="hover:text-red-300"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <select
                                className="bg-secondary text-white p-2 rounded flex-1 md:flex-none"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        addLanguage(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                value=""
                            >
                                <option value="">Select Language</option>
                                {AVAILABLE_LANGUAGES.filter(lang => !editedSeries.languages.includes(lang)).map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>

                            {!showCustomLanguageInput ? (
                                <button
                                    onClick={() => setShowCustomLanguageInput(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm whitespace-nowrap"
                                >
                                    Add Custom Language
                                </button>
                            ) : (
                                <div className="flex gap-2 flex-1">
                                    <input
                                        type="text"
                                        className="bg-secondary text-white p-2 rounded flex-1"
                                        value={newLanguage}
                                        onChange={(e) => setNewLanguage(e.target.value)}
                                        placeholder="Enter custom language"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddCustomLanguage();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handleAddCustomLanguage}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCustomLanguageInput(false);
                                            setNewLanguage('');
                                        }}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 