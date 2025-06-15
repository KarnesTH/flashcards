import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { User } from '../types/types';

const NavbarList = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

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
                                className="text-foreground hover:text-primary-500 transition-colors"
                            >
                                Dashboard
                            </a>
                            <a 
                                href="/decks" 
                                className="text-foreground hover:text-primary-500 transition-colors"
                            >
                                Meine Decks
                            </a>
                        </nav>

                        {/* Profil-Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-primary-100 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                                    {user.username[0].toUpperCase()}
                                </div>
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
                                        className="block px-4 py-2 text-foreground hover:bg-primary-100"
                                    >
                                        Profil
                                    </a>
                                    <a 
                                        href="/settings" 
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
                            className="text-foreground hover:text-primary-500 transition-colors"
                        >
                            Anmelden
                        </a>
                        <a
                            href="/auth/register"
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
                                    className="block py-2 text-foreground hover:text-primary-500"
                                >
                                    Dashboard
                                </a>
                                <a 
                                    href="/decks" 
                                    className="block py-2 text-foreground hover:text-primary-500"
                                >
                                    Meine Decks
                                </a>
                                <a 
                                    href="/profile" 
                                    className="block py-2 text-foreground hover:text-primary-500"
                                >
                                    Profil
                                </a>
                                <a 
                                    href="/settings" 
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
                                    className="block py-2 text-foreground hover:text-primary-500"
                                >
                                    Anmelden
                                </a>
                                <a
                                    href="/auth/register"
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