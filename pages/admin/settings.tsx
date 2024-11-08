import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { FiShield, FiUsers, FiPlus, FiAlertCircle, FiSave, FiSearch, FiX, FiStar, FiTrash2 } from 'react-icons/fi';
import Layout from '../../components/DashboardLayout';
import type { Settings, NoticeBar, FeaturedContent } from '@/types/settings';
import type { User, NewUser } from '@/types/user';

const defaultNoticeBar: NoticeBar = {
    enabled: false,
    text: '',
    type: 'info',
    template: '',
    link: '',
    buttonText: '',
    bgColor: '',
    textColor: '',
    buttonColor: ''
};

const Settings = () => {
    const router = useRouter();
    const [settings, setSettings] = useState<Settings>({
        adBlockEnabled: true,
        popupBlockEnabled: true,
        redirectBlockEnabled: true,
        blockSocialMedia: false,
        blockTracking: false,
        blockInlineScripts: false,
        noticeBar: defaultNoticeBar,
        featuredContent: []
    });
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState<NewUser>({
        username: '',
        password: '',
        role: 'moderator'
    });

    useEffect(() => {
        // Check if user is admin
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/admin');
            toast.error('Only administrators can access settings');
        }

        // Fetch settings
        fetchSettings();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Error fetching settings');
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error fetching users');
        }
    };

    const updateSettings = (updates: Partial<Settings>) => {
        setSettings(prev => {
            const newSettings: Settings = {
                ...prev,
                ...updates,
                noticeBar: {
                    ...prev.noticeBar,
                    ...(updates.noticeBar || {})
                }
            };
            return newSettings;
        });
        setHasUnsavedChanges(true);
    };

    const saveChanges = async () => {
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!res.ok) throw new Error('Failed to update settings');

            toast.success('Settings updated successfully');
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Error updating settings');
        }
    };

    const searchContent = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const [moviesRes, tvSeriesRes] = await Promise.all([
                fetch(`/api/movies/search?q=${query}`),
                fetch(`/api/tv-series/search?q=${query}`)
            ]);

            const [movies, tvSeries] = await Promise.all([
                moviesRes.json(),
                tvSeriesRes.json()
            ]);

            const formattedResults = [
                ...movies.map((movie: any) => ({
                    ...movie,
                    type: 'movie'
                })),
                ...tvSeries.map((series: any) => ({
                    ...series,
                    type: 'tvSeries'
                }))
            ].slice(0, 4);

            setSearchResults(formattedResults);
        } catch (error) {
            console.error('Error searching content:', error);
            toast.error('Error searching content');
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchContent(searchTerm);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const searchContainer = document.getElementById('search-container');
            if (searchContainer && !searchContainer.contains(event.target as Node)) {
                setSearchResults([]);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addToFeatured = (content: any) => {
        if (settings.featuredContent?.length >= 4) {
            toast.error('Maximum 4 items can be featured');
            return;
        }

        const newContent = {
            contentId: content._id,
            contentType: content.type,
            addedAt: new Date()
        };

        updateSettings({
            featuredContent: [...(settings.featuredContent || []), newContent]
        });

        setSearchTerm('');
        setSearchResults([]);
        toast.success('Added to featured content');
    };

    const removeFromFeatured = (contentId: string) => {
        updateSettings({
            featuredContent: settings.featuredContent?.filter(item => item.contentId !== contentId) || []
        });
        toast.success('Removed from featured content');
    };

    const getContentPoster = (contentId: string) => {
        // Implement your logic to get content poster here
        return '';
    };

    const getContentTitle = (contentId: string) => {
        // Implement your logic to get content title here
        return '';
    };

    const handleAddUser = async () => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            if (!res.ok) throw new Error('Failed to add user');

            toast.success('User added successfully');
            setShowAddUser(false);
            setNewUser({
                username: '',
                password: '',
                role: 'moderator'
            });
            fetchUsers();
        } catch (error) {
            console.error('Error adding user:', error);
            toast.error('Error adding user');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete user');

            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Error deleting user');
        }
    };

    return (
        <Layout>
            <div className="bg-secondary rounded-lg p-4 md:p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    {hasUnsavedChanges && (
                        <button
                            onClick={saveChanges}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                            <FiSave size={18} />
                            Save Changes
                        </button>
                    )}
                </div>

                <div className="space-y-4 md:space-y-6">
                    {/* Ad Blocking Section */}
                    <div className="bg-primary rounded-lg p-4 md:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="bg-purple-500 bg-opacity-20 p-3 rounded-lg">
                                    <FiShield className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Security Settings</h2>
                                    <p className="text-gray-400 text-sm">Control security and blocking features</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">Ad Blocker</h3>
                                    <p className="text-sm text-gray-400">Block all advertisements</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.adBlockEnabled}
                                        onChange={(e) => updateSettings({ adBlockEnabled: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">Block Social Media</h3>
                                    <p className="text-sm text-gray-400">Block social media widgets and trackers</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.blockSocialMedia}
                                        onChange={(e) => updateSettings({ blockSocialMedia: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">Block Tracking</h3>
                                    <p className="text-sm text-gray-400">Block analytics and tracking pixels</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.blockTracking}
                                        onChange={(e) => updateSettings({ blockTracking: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">Block Inline Scripts</h3>
                                    <p className="text-sm text-gray-400">Block potentially harmful inline scripts</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.blockInlineScripts}
                                        onChange={(e) => updateSettings({ blockInlineScripts: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* User Management Section */}
                    <div className="bg-primary rounded-lg p-4 md:p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-500 bg-opacity-20 p-3 rounded-lg">
                                    <FiUsers className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">User Management</h2>
                                    <p className="text-gray-400 text-sm">Manage moderators and admins</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddUser(true)}
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                            >
                                <FiPlus size={18} />
                                Add User
                            </button>
                        </div>

                        {/* User List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {users.map(user => (
                                <div key={user._id} className="bg-secondary p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                                    <div>
                                        <h3 className="text-white font-medium">{user.username}</h3>
                                        <p className="text-sm text-gray-400">
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        className="w-full md:w-auto bg-red-600/10 hover:bg-red-600/20 text-red-500 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <FiTrash2 size={18} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add User Modal - Made Responsive */}
                        {showAddUser && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-secondary p-6 rounded-lg w-full max-w-md">
                                    <h3 className="text-xl font-bold text-white mb-4">Add New User</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-gray-300">Username</label>
                                            <input
                                                type="text"
                                                className="w-full bg-primary text-white p-2 rounded mt-1"
                                                value={newUser.username}
                                                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-300">Password</label>
                                            <input
                                                type="password"
                                                className="w-full bg-primary text-white p-2 rounded mt-1"
                                                value={newUser.password}
                                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-300">Role</label>
                                            <select
                                                className="w-full bg-primary text-white p-2 rounded mt-1"
                                                value={newUser.role}
                                                onChange={e => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'moderator' })}
                                            >
                                                <option value="moderator">Moderator</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col md:flex-row justify-end gap-2 mt-6">
                                            <button
                                                onClick={() => setShowAddUser(false)}
                                                className="w-full md:w-auto bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddUser}
                                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                            >
                                                Add User
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Featured Content Section */}
                    <div className="bg-primary rounded-lg p-4 md:p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <div className="flex items-center space-x-3 mb-4 md:mb-0">
                                <div className="bg-pink-500 bg-opacity-20 p-3 rounded-lg">
                                    <FiStar className="w-6 h-6 text-pink-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Featured Content</h2>
                                    <p className="text-gray-400 text-sm">Add content to homepage slider (max 4)</p>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div id="search-container" className="relative mb-6">
                            <input
                                type="text"
                                className="w-full bg-secondary text-white px-4 py-3 rounded-lg pr-10"
                                placeholder="Search movies or TV series..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isSearching ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent" />
                                ) : (
                                    <FiSearch className="text-gray-400" />
                                )}
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="absolute w-full bg-secondary mt-2 rounded-lg shadow-lg z-10 max-h-[300px] overflow-y-auto">
                                    {searchResults.map((content) => (
                                        <div
                                            key={content._id}
                                            className="flex items-center gap-3 p-3 hover:bg-primary cursor-pointer transition-colors duration-200"
                                            onClick={() => {
                                                addToFeatured(content);
                                                setSearchResults([]);
                                                setSearchTerm('');
                                            }}
                                        >
                                            <img
                                                src={content.poster}
                                                alt={content.title}
                                                className="w-12 h-16 object-cover rounded"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium truncate">{content.title}</h4>
                                                <p className="text-sm text-gray-400">
                                                    {content.type === 'movie' ? 'Movie' : 'TV Series'} • {content.year}
                                                </p>
                                            </div>
                                            <button className="text-purple-500 hover:text-purple-400 p-2">
                                                <FiPlus size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Featured List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {settings.featuredContent?.map((item) => (
                                <div
                                    key={item.contentId}
                                    className="bg-secondary p-4 rounded-lg flex items-center gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-medium truncate">
                                            {item.contentType === 'movie' ? 'Movie' : 'TV Series'}
                                        </h4>
                                        <p className="text-sm text-gray-400 truncate">
                                            Added {new Date(item.addedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFromFeatured(item.contentId)}
                                        className="text-red-500 hover:text-red-400 p-2"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notice Bar Settings */}
                    <div className="bg-primary rounded-lg p-4 md:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="bg-purple-500 bg-opacity-20 p-3 rounded-lg">
                                    <FiAlertCircle className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Notice Bar</h2>
                                    <p className="text-gray-400 text-sm">Configure the site-wide notice bar</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.noticeBar?.enabled}
                                    onChange={(e) => updateSettings({
                                        noticeBar: {
                                            ...settings.noticeBar,
                                            enabled: e.target.checked
                                        }
                                    })}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        {settings.noticeBar?.enabled && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-300">Notice Text</label>
                                    <input
                                        type="text"
                                        className="w-full bg-secondary text-white p-2 rounded mt-1"
                                        value={settings.noticeBar?.text || ''}
                                        onChange={(e) => updateSettings({
                                            noticeBar: {
                                                ...settings.noticeBar,
                                                text: e.target.value
                                            }
                                        })}
                                        placeholder="Enter notice text"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-300">Notice Type</label>
                                    <select
                                        className="w-full bg-secondary text-white p-2 rounded mt-1"
                                        value={settings.noticeBar?.type || 'info'}
                                        onChange={(e) => updateSettings({
                                            noticeBar: {
                                                ...settings.noticeBar,
                                                type: e.target.value
                                            }
                                        })}
                                    >
                                        <option value="info">Info</option>
                                        <option value="warning">Warning</option>
                                        <option value="success">Success</option>
                                        <option value="telegram">Telegram</option>
                                        <option value="join">Join</option>
                                        <option value="update">Update</option>
                                        <option value="event">Event</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-300">Link (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-secondary text-white p-2 rounded mt-1"
                                        value={settings.noticeBar?.link || ''}
                                        onChange={(e) => updateSettings({
                                            noticeBar: {
                                                ...settings.noticeBar,
                                                link: e.target.value
                                            }
                                        })}
                                        placeholder="e.g. https://t.me/your_channel"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-300">Button Text</label>
                                    <input
                                        type="text"
                                        className="w-full bg-secondary text-white p-2 rounded mt-1"
                                        value={settings.noticeBar?.buttonText || ''}
                                        onChange={(e) => updateSettings({
                                            noticeBar: {
                                                ...settings.noticeBar,
                                                buttonText: e.target.value
                                            }
                                        })}
                                        placeholder="e.g. Join Now"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-300">Background Color</label>
                                        <input
                                            type="text"
                                            className="w-full bg-secondary text-white p-2 rounded mt-1"
                                            value={settings.noticeBar?.bgColor || ''}
                                            onChange={(e) => updateSettings({
                                                noticeBar: {
                                                    ...settings.noticeBar,
                                                    bgColor: e.target.value
                                                }
                                            })}
                                            placeholder="e.g. #1f2937"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-300">Text Color</label>
                                        <input
                                            type="text"
                                            className="w-full bg-secondary text-white p-2 rounded mt-1"
                                            value={settings.noticeBar?.textColor || ''}
                                            onChange={(e) => updateSettings({
                                                noticeBar: {
                                                    ...settings.noticeBar,
                                                    textColor: e.target.value
                                                }
                                            })}
                                            placeholder="e.g. #ffffff"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-300">Button Color</label>
                                        <input
                                            type="text"
                                            className="w-full bg-secondary text-white p-2 rounded mt-1"
                                            value={settings.noticeBar?.buttonColor || ''}
                                            onChange={(e) => updateSettings({
                                                noticeBar: {
                                                    ...settings.noticeBar,
                                                    buttonColor: e.target.value
                                                }
                                            })}
                                            placeholder="e.g. #3b82f6"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings; 