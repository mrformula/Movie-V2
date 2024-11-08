import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHome, FiFilm, FiTv, FiLogOut, FiSettings, FiUser, FiMenu, FiX } from 'react-icons/fi';
import AuthGuard from './AuthGuard';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const currentPath = router.pathname;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        // Get user role from sessionStorage on client side
        const user = JSON.parse(sessionStorage?.getItem('user') || '{}');
        setUserRole(user.role || '');

        // Check user role for settings page
        if (currentPath === '/admin/settings' && user.role !== 'admin') {
            router.push('/admin');
            toast.error('Only administrators can access settings');
        }
    }, [currentPath]);

    const isActive = (path: string) => currentPath === path;

    const handleLogout = () => {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('user');
        router.push('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <AuthGuard>
            <div className="flex h-screen bg-primary">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={closeSidebar}
                    />
                )}

                {/* Sidebar */}
                <div className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-secondary transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
                        <span className="text-2xl font-bold text-purple-500">CinemazBD</span>
                        <button
                            onClick={closeSidebar}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                    <nav className="mt-6">
                        <Link
                            href="/admin"
                            className={`flex items-center px-6 py-4 ${isActive('/admin')
                                ? 'bg-purple-600 bg-opacity-20 text-purple-500 border-r-4 border-purple-500'
                                : 'text-gray-300 hover:bg-purple-600 hover:bg-opacity-10 hover:text-purple-500'
                                }`}
                            onClick={closeSidebar}
                        >
                            <FiHome className="w-5 h-5" />
                            <span className="mx-4">Dashboard</span>
                        </Link>
                        <Link
                            href="/admin/movies"
                            className={`flex items-center px-6 py-4 ${isActive('/admin/movies')
                                ? 'bg-purple-600 bg-opacity-20 text-purple-500 border-r-4 border-purple-500'
                                : 'text-gray-300 hover:bg-purple-600 hover:bg-opacity-10 hover:text-purple-500'
                                }`}
                            onClick={closeSidebar}
                        >
                            <FiFilm className="w-5 h-5" />
                            <span className="mx-4">Movies</span>
                        </Link>
                        <Link
                            href="/admin/tv-series"
                            className={`flex items-center px-6 py-4 ${isActive('/admin/tv-series')
                                ? 'bg-purple-600 bg-opacity-20 text-purple-500 border-r-4 border-purple-500'
                                : 'text-gray-300 hover:bg-purple-600 hover:bg-opacity-10 hover:text-purple-500'
                                }`}
                            onClick={closeSidebar}
                        >
                            <FiTv className="w-5 h-5" />
                            <span className="mx-4">TV Series</span>
                        </Link>
                        <div className="border-t border-gray-700 mt-6 pt-4">
                            {userRole === 'admin' && (
                                <Link
                                    href="/admin/settings"
                                    className={`flex items-center px-6 py-4 ${isActive('/admin/settings')
                                        ? 'bg-purple-600 bg-opacity-20 text-purple-500 border-r-4 border-purple-500'
                                        : 'text-gray-300 hover:bg-purple-600 hover:bg-opacity-10 hover:text-purple-500'
                                        }`}
                                    onClick={closeSidebar}
                                >
                                    <FiSettings className="w-5 h-5" />
                                    <span className="mx-4">Settings</span>
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-6 py-4 text-gray-300 hover:bg-red-600 hover:bg-opacity-10 hover:text-red-500"
                            >
                                <FiLogOut className="w-5 h-5" />
                                <span className="mx-4">Logout</span>
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Navigation */}
                    <header className="bg-secondary shadow-md">
                        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
                            <div className="flex items-center">
                                <button
                                    onClick={toggleSidebar}
                                    className="text-gray-400 hover:text-white lg:hidden"
                                >
                                    <FiMenu size={24} />
                                </button>
                                <h2 className="text-xl font-semibold text-gray-200 ml-4">
                                    {currentPath === '/admin' && 'Dashboard Overview'}
                                    {currentPath === '/admin/movies' && 'Movies Management'}
                                    {currentPath === '/admin/tv-series' && 'TV Series Management'}
                                    {currentPath === '/admin/settings' && 'Settings'}
                                </h2>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                                    <FiUser className="w-6 h-6 text-gray-300" />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-primary p-4">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
} 