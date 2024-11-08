import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FiFolder, FiFile, FiSearch, FiArrowLeft } from 'react-icons/fi';

interface Folder {
    name: string;
    fld_id: string;
    code: string;
}

interface File {
    title: string;
    file_code: string;
    link: string;
    uploaded: string;
    views: string;
    length: string;
}

interface FolderContent {
    folders: Folder[];
    files: File[];
}

export default function FilesManagement() {
    const [currentFolder, setCurrentFolder] = useState('0');
    const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([{ id: '0', name: 'Root' }]);
    const [content, setContent] = useState<FolderContent>({ folders: [], files: [] });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchFolderContent = async (folderId: string) => {
        try {
            const res = await fetch(`/api/files?fld_id=${folderId}`);
            const data = await res.json();
            setContent(data);
        } catch (error) {
            console.error('Error fetching folder content:', error);
        }
    };

    useEffect(() => {
        fetchFolderContent(currentFolder);
    }, [currentFolder]);

    const handleFolderClick = (folder: Folder) => {
        setCurrentFolder(folder.fld_id);
        setFolderPath([...folderPath, { id: folder.fld_id, name: folder.name }]);
    };

    const handleBackClick = () => {
        if (folderPath.length > 1) {
            const newPath = folderPath.slice(0, -1);
            setFolderPath(newPath);
            setCurrentFolder(newPath[newPath.length - 1].id);
        }
    };

    const filteredContent = {
        folders: content.folders?.filter(folder =>
            folder.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [],
        files: content.files?.filter(file =>
            file.title.toLowerCase().includes(searchTerm.toLowerCase())
        ) || []
    };

    return (
        <DashboardLayout>
            <div className="bg-secondary rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        {folderPath.length > 1 && (
                            <button
                                onClick={handleBackClick}
                                className="text-gray-400 hover:text-white"
                            >
                                <FiArrowLeft size={20} />
                            </button>
                        )}
                        <h1 className="text-2xl font-bold text-white">Files</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search files..."
                                className="bg-primary text-white pl-10 pr-4 py-2 rounded w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Folder Path */}
                <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
                    {folderPath.map((folder, index) => (
                        <div key={folder.id} className="flex items-center">
                            {index > 0 && <span className="mx-2">/</span>}
                            <span className={index === folderPath.length - 1 ? 'text-white' : ''}>
                                {folder.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Folders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredContent.folders.map((folder) => (
                        <div
                            key={folder.fld_id}
                            onClick={() => handleFolderClick(folder)}
                            className="bg-primary p-4 rounded-lg cursor-pointer hover:bg-opacity-80"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-500 bg-opacity-20 p-3 rounded-lg">
                                    <FiFolder className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{folder.name}</h3>
                                    <p className="text-sm text-gray-400">Folder</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredContent.files.map((file) => (
                        <div
                            key={file.file_code}
                            className="bg-primary p-4 rounded-lg"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="bg-green-500 bg-opacity-20 p-3 rounded-lg">
                                    <FiFile className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{file.title}</h3>
                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                        <span>Views: {file.views}</span>
                                        <span>•</span>
                                        <span>Length: {file.length}s</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
} 