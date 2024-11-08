import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';

export default function Navbar() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        // Check login status
        const checkLoginStatus = () => {
            const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
            const user = JSON.parse(sessionStorage?.getItem('user') || '{}');
            setIsLoggedIn(loggedIn);
            setUserRole(user.role || '');
        };

        window.addEventListener('scroll', handleScroll);
        checkLoginStatus();

        // Add event listener to logo
        const logo = document.getElementById('logo');
        if (logo) {
            logo.addEventListener('click', handleLogoClick);
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (logo) {
                logo.removeEventListener('click', handleLogoClick);
            }
        };
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
    };

    const handleLogoClick = (e: any) => {
        e.preventDefault();
        window.onbeforeunload = null;
        window.location.href = '/';
    };

    const handleTrendingClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (router.pathname === '/') {
            // If already on home page, scroll to trending section
            const trendingSection = document.getElementById('trending-section');
            if (trendingSection) {
                trendingSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // If on another page, go to home page and then scroll to trending
            window.location.href = '/#trending-section';
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-secondary transition-all duration-300 ${isScrolled ? 'shadow-lg bg-opacity-95' : ''
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link
                            href="/"
                            id="logo"
                            className="flex items-center"
                        >
                            <span className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-transparent bg-clip-text hover:from-purple-500 hover:via-pink-400 hover:to-red-400 transition-all duration-300">
                                CinemazBD
                            </span>
                            <span className="ml-2 text-xs text-gray-400">v2.0</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/movies" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                            Movies
                        </Link>
                        <Link href="/tv-series" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                            TV Series
                        </Link>
                        <a
                            href="/#trending-section"
                            onClick={handleTrendingClick}
                            className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
                        >
                            Trending
                        </a>
                        {isLoggedIn ? (
                            <Link
                                href="/admin"
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
                            >
                                <FiUser className="w-4 h-4" />
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
                            >
                                <FiUser className="w-4 h-4" />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-400 hover:text-white"
                        >
                            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-secondary border-t border-gray-700">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link
                                href="/movies"
                                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Movies
                            </Link>
                            <Link
                                href="/tv-series"
                                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                TV Series
                            </Link>
                            <a
                                href="/#trending-section"
                                onClick={(e) => {
                                    handleTrendingClick(e);
                                    setIsMenuOpen(false);
                                }}
                                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
                            >
                                Trending
                            </a>
                            {isLoggedIn ? (
                                <Link
                                    href="/admin"
                                    className="text-purple-500 hover:text-purple-400 block px-3 py-2 rounded-md"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="text-purple-500 hover:text-purple-400 block px-3 py-2 rounded-md"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
} 