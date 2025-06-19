import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { User } from '../types/types';

/**
 * NavbarList component
 * 
 * @description This component is used to display the navbar list.
 * It will check if the user is authenticated and display the appropriate links.
 * 
 * @returns The NavbarList component
 */
const NavbarList = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('access_token')) {
            checkAuth();
        } else {
            setUser(null);
            setIsLoading(false);
        }
    }, []);

    /**
     * Check if the user is authenticated
     * 
     * @description This function is used to check if the user is authenticated.
     * It will check if the user has a valid access token in the local storage.
     * If the user is authenticated, it will fetch the user data from the API.
     * If the user is not authenticated, it will set the user to null and set the loading state to false.
     * 
     * @returns The user data
     */
    const checkAuth = async () => {
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
        } catch (err) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Handle the logout
     * 
     * @description This function is used to handle the logout.
     * It will logout the user by calling the logout function from the API.
     * It will then set the user to null and redirect to the login page.
     * 
     * @returns The response from the API
     */
    const handleLogout = async () => {
        await api.logout();
        setUser(null);
        window.location.href = '/auth/login';
    }

    if (isLoading) {
        return null;
    }

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                aria-label="Menü öffnen"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isMobileMenuOpen ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                </svg>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
                {user ? (
                    <>
                        {/* Wichtige Navigationslinks */}
                        <nav className="flex items-center gap-6">
                            <a 
                                href="/dashboard"
                                aria-label="Dashboard"
                                className="text-foreground hover:text-primary-500 transition-colors"
                            >
                                Dashboard
                            </a>
                        </nav>

                        {/* Profil-Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-primary-100 transition-colors">
                                <img 
                                    src={user.avatar_url} 
                                    alt="Profilbild" 
                                    className="w-8 h-8 rounded-full border-2 border-primary-500/20 object-cover"
                                />
                                <span className="text-foreground">{user.username}</span>
                                <svg 
                                    className="w-4 h-4 text-foreground transition-transform group-hover:rotate-180" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown-Menü */}
                            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-background border border-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="py-1">
                                    <a 
                                        href="/profile" 
                                        aria-label="Profil"
                                        className="block px-4 py-2 text-foreground hover:bg-primary-100"
                                    >
                                        Profil
                                    </a>
                                    <a 
                                        href="/settings"
                                        aria-label="Einstellungen"
                                        className="block px-4 py-2 text-foreground hover:bg-primary-100"
                                    >
                                        Einstellungen
                                    </a>
                                    <div className="border-t border-border my-1"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-danger-500 hover:bg-primary-100"
                                    >
                                        Abmelden
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <a
                            href="/auth/login"
                            aria-label="Melde dich mit deinem Account an"
                            className="text-foreground hover:text-primary-500 transition-colors"
                        >
                            Anmelden
                        </a>
                        <a
                            href="/auth/register"
                            aria-label="Erstelle einen neuen Account"
                            className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                            Registrieren
                        </a>
                    </div>
                )}
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="fixed top-[4rem] left-0 right-0 bg-background border-b border-border md:hidden z-50">
                    <div className="container mx-auto px-4 py-4 space-y-4">
                        {user ? (
                            <>
                                <a 
                                    href="/dashboard"
                                    aria-label="Dashboard"
                                    className="block py-2 text-foreground hover:text-primary-500"
                                >
                                    Dashboard
                                </a>
                                <a 
                                    href="/profile"
                                    aria-label="Profil"
                                    className="block py-2 text-foreground hover:text-primary-500"
                                >
                                    Profil
                                </a>
                                <a 
                                    href="/settings"
                                    aria-label="Einstellungen"
                                    className="block py-2 text-foreground hover:text-primary-500"
                                >
                                    Einstellungen
                                </a>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left py-2 text-danger-500 hover:text-danger-600"
                                >
                                    Abmelden
                                </button>
                            </>
                        ) : (
                            <>
                                <a
                                    href="/auth/login"
                                    aria-label="Melde dich mit deinem Account an"
                                    className="block py-2 text-foreground hover:text-primary-500"
                                >
                                    Anmelden
                                </a>
                                <a
                                    href="/auth/register"
                                    aria-label="Erstelle einen neuen Account"
                                    className="block py-2 text-foreground hover:text-primary-500"
                                >
                                    Registrieren
                                </a>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default NavbarList;