import { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';

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

interface DownloadLink {
    language: string[];
    quality: string;
    size: string;
    format: string;
    type: string;
    url: string;
}

interface Props {
    episode: {
        episodeNumber: number;
        title: string;
        embedCode: string;
        streamwishId: string;
        downloadLinks?: DownloadLink[];
    };
    onClose: () => void;
    onSave: (updates: any) => void;
}

export default function EpisodeEditModal({ episode, onClose, onSave }: Props) {
    const [editedEpisode, setEditedEpisode] = useState({
        ...episode,
        embedCode: episode.embedCode || '',
        downloadLinks: episode.downloadLinks || []
    });

    const [newLanguage, setNewLanguage] = useState('');
    const [showCustomLanguageInput, setShowCustomLanguageInput] = useState(false);

    const addDownloadLink = () => {
        setEditedEpisode({
            ...editedEpisode,
            downloadLinks: [
                ...editedEpisode.downloadLinks,
                {
                    language: [],
                    quality: '720p',
                    size: '',
                    format: 'mkv',
                    type: 'WebDL',
                    url: ''
                }
            ]
        });
    };

    const handleAddCustomLanguage = (index: number) => {
        if (newLanguage.trim()) {
            const newLinks = [...editedEpisode.downloadLinks];
            newLinks[index].language = [...newLinks[index].language, newLanguage.trim()];
            setEditedEpisode({
                ...editedEpisode,
                downloadLinks: newLinks
            });
            setNewLanguage('');
            setShowCustomLanguageInput(false);
        }
    };

    const removeLanguageFromLink = (index: number, language: string) => {
        const newLinks = [...editedEpisode.downloadLinks];
        newLinks[index].language = newLinks[index].language.filter(l => l !== language);
        setEditedEpisode({
            ...editedEpisode,
            downloadLinks: newLinks
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary p-6 rounded-lg w-full max-w-[800px] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">
                        Add Links - Episode {episode.episodeNumber}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Watch Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Watch Online</h3>
                        <div>
                            <label className="text-white text-sm">Embed Code</label>
                            <textarea
                                className="w-full bg-primary text-white p-2 rounded"
                                rows={3}
                                value={editedEpisode.embedCode}
                                onChange={(e) => setEditedEpisode({
                                    ...editedEpisode,
                                    embedCode: e.target.value
                                })}
                                placeholder="Enter embed code"
                            />
                        </div>
                    </div>

                    {/* Download Section */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-white">Download Links</h3>
                            <button
                                onClick={addDownloadLink}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1"
                            >
                                <FiPlus size={16} />
                                Add Link
                            </button>
                        </div>

                        <div className="space-y-4">
                            {editedEpisode.downloadLinks.map((link, index) => (
                                <div key={index} className="bg-primary p-4 rounded-lg space-y-3">
                                    {/* Languages */}
                                    <div>
                                        <label className="text-sm text-gray-300">Languages</label>
                                        <div className="flex flex-wrap gap-2 mt-1 mb-2">
                                            {link.language.map((lang) => (
                                                <span
                                                    key={lang}
                                                    className="bg-purple-600 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                                                >
                                                    {lang}
                                                    <button
                                                        onClick={() => removeLanguageFromLink(index, lang)}
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
                                                        const newLinks = [...editedEpisode.downloadLinks];
                                                        newLinks[index].language = [...newLinks[index].language, e.target.value];
                                                        setEditedEpisode({
                                                            ...editedEpisode,
                                                            downloadLinks: newLinks
                                                        });
                                                        e.target.value = '';
                                                    }
                                                }}
                                                value=""
                                            >
                                                <option value="">Select Language</option>
                                                {AVAILABLE_LANGUAGES.filter(lang => !link.language.includes(lang)).map(lang => (
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
                                                                handleAddCustomLanguage(index);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleAddCustomLanguage(index)}
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

                                    {/* Quality and Format */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-300">Quality</label>
                                            <select
                                                className="w-full bg-secondary text-white p-2 rounded mt-1"
                                                value={link.quality}
                                                onChange={(e) => {
                                                    const newLinks = [...editedEpisode.downloadLinks];
                                                    newLinks[index].quality = e.target.value;
                                                    setEditedEpisode({
                                                        ...editedEpisode,
                                                        downloadLinks: newLinks
                                                    });
                                                }}
                                            >
                                                <option value="360p">360p</option>
                                                <option value="480p">480p</option>
                                                <option value="720p">720p</option>
                                                <option value="1080p">1080p</option>
                                                <option value="4K">4K</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-sm text-gray-300">Format</label>
                                            <select
                                                className="w-full bg-secondary text-white p-2 rounded mt-1"
                                                value={link.format}
                                                onChange={(e) => {
                                                    const newLinks = [...editedEpisode.downloadLinks];
                                                    newLinks[index].format = e.target.value;
                                                    setEditedEpisode({
                                                        ...editedEpisode,
                                                        downloadLinks: newLinks
                                                    });
                                                }}
                                            >
                                                <option value="mkv">MKV</option>
                                                <option value="mp4">MP4</option>
                                                <option value="zip">ZIP</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Size and Type */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-300">Size</label>
                                            <input
                                                type="text"
                                                className="w-full bg-secondary text-white p-2 rounded mt-1"
                                                value={link.size}
                                                onChange={(e) => {
                                                    const newLinks = [...editedEpisode.downloadLinks];
                                                    newLinks[index].size = e.target.value;
                                                    setEditedEpisode({
                                                        ...editedEpisode,
                                                        downloadLinks: newLinks
                                                    });
                                                }}
                                                placeholder="e.g. 1.2GB"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm text-gray-300">Type</label>
                                            <select
                                                className="w-full bg-secondary text-white p-2 rounded mt-1"
                                                value={link.type}
                                                onChange={(e) => {
                                                    const newLinks = [...editedEpisode.downloadLinks];
                                                    newLinks[index].type = e.target.value;
                                                    setEditedEpisode({
                                                        ...editedEpisode,
                                                        downloadLinks: newLinks
                                                    });
                                                }}
                                            >
                                                <option value="WebDL">WebDL</option>
                                                <option value="WebRip">WebRip</option>
                                                <option value="BluRay">BluRay</option>
                                                <option value="BrRip">BrRip</option>
                                                <option value="HDTS">HDTS</option>
                                                <option value="CAM">CAM</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Download URL */}
                                    <div>
                                        <label className="text-sm text-gray-300">Download URL</label>
                                        <input
                                            type="text"
                                            className="w-full bg-secondary text-white p-2 rounded mt-1"
                                            value={link.url}
                                            onChange={(e) => {
                                                const newLinks = [...editedEpisode.downloadLinks];
                                                newLinks[index].url = e.target.value;
                                                setEditedEpisode({
                                                    ...editedEpisode,
                                                    downloadLinks: newLinks
                                                });
                                            }}
                                            placeholder="Enter download link"
                                        />
                                    </div>

                                    <button
                                        onClick={() => {
                                            const newLinks = editedEpisode.downloadLinks.filter((_, i) => i !== index);
                                            setEditedEpisode({
                                                ...editedEpisode,
                                                downloadLinks: newLinks
                                            });
                                        }}
                                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                    >
                                        Remove Link
                                    </button>
                                </div>
                            ))}
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
                            onClick={() => onSave(editedEpisode)}
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