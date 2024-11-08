import { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';

interface Props {
    onClose: () => void;
    onSave: (seasonData: {
        seasonNumber: number;
        episodes: {
            episodeNumber: string;
            title: string;
        }[];
    }) => void;
}

interface Episode {
    episodeNumber: string;
    title: string;
}

export default function AddSeasonModal({ onClose, onSave }: Props) {
    const [seasonNumber, setSeasonNumber] = useState(1);
    const [numberOfEpisodes, setNumberOfEpisodes] = useState(1);
    const [episodes, setEpisodes] = useState<Episode[]>([
        { episodeNumber: '1', title: 'Episode 1' }
    ]);

    const generateEpisodes = () => {
        const newEpisodes = Array.from({ length: numberOfEpisodes }, (_, i) => ({
            episodeNumber: (i + 1).toString(),
            title: `Episode ${i + 1}`
        }));
        setEpisodes(newEpisodes);
    };

    const handleSave = () => {
        if (episodes.length === 0) {
            alert('Please generate episodes first');
            return;
        }

        onSave({
            seasonNumber: Number(seasonNumber),
            episodes: episodes.map(episode => ({
                episodeNumber: episode.episodeNumber,
                title: episode.title
            }))
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary p-6 rounded-lg w-full max-w-[600px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Add New Season</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-white text-sm">Season Number</label>
                        <input
                            type="number"
                            className="w-full bg-primary text-white p-2 rounded"
                            value={seasonNumber}
                            onChange={(e) => setSeasonNumber(parseInt(e.target.value))}
                            min={1}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-300">Number of Episodes</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="1"
                                className="flex-1 bg-primary text-white p-2 rounded"
                                value={numberOfEpisodes}
                                onChange={(e) => setNumberOfEpisodes(parseInt(e.target.value))}
                            />
                            <button
                                onClick={generateEpisodes}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                            >
                                Generate
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-300">Episodes</label>
                        <div className="space-y-2 mt-2">
                            {episodes.map((episode, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        className="w-24 bg-primary text-white p-2 rounded"
                                        value={episode.episodeNumber}
                                        onChange={(e) => {
                                            const newEpisodes = [...episodes];
                                            newEpisodes[index] = {
                                                ...newEpisodes[index],
                                                episodeNumber: e.target.value,
                                                title: isNaN(Number(e.target.value)) ?
                                                    newEpisodes[index].title :
                                                    `Episode ${e.target.value}`
                                            };
                                            setEpisodes(newEpisodes);
                                        }}
                                        placeholder="Ep. No."
                                    />
                                    <input
                                        type="text"
                                        className="flex-1 bg-primary text-white p-2 rounded"
                                        value={episode.title}
                                        onChange={(e) => {
                                            const newEpisodes = [...episodes];
                                            newEpisodes[index] = {
                                                ...newEpisodes[index],
                                                title: e.target.value
                                            };
                                            setEpisodes(newEpisodes);
                                        }}
                                        placeholder="Episode Title"
                                    />
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
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                            Add Season
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 