const NavbarList = () => {
    // Simuliere einen angemeldeten Benutzer für das Design
    const isLoggedIn = false;
    const user = {
        name: "Max Mustermann",
        avatar: null
    };

    return (
        <div className="flex items-center gap-6">
            {isLoggedIn ? (
                <>
                    {/* Wichtige Navigationslinks */}
                    <nav className="hidden md:flex items-center gap-6">
                        <a 
                            href="/dashboard" 
                            className="text-[var(--color-foreground)] hover:text-[var(--color-primary-500)] transition-colors"
                        >
                            Dashboard
                        </a>
                        <a 
                            href="/decks" 
                            className="text-[var(--color-foreground)] hover:text-[var(--color-primary-500)] transition-colors"
                        >
                            Meine Decks
                        </a>
                    </nav>

                    {/* Profil-Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--color-primary-100)] transition-colors">
                            {user.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt={user.name} 
                                    className="w-8 h-8 rounded-full"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-500)] flex items-center justify-center text-white font-medium">
                                    {user.name[0]}
                                </div>
                            )}
                            <span className="text-[var(--color-foreground)]">{user.name}</span>
                            <svg 
                                className="w-4 h-4 text-[var(--color-foreground)] transition-transform group-hover:rotate-180" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown-Menü */}
                        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <div className="py-1">
                                <a 
                                    href="/profile" 
                                    className="block px-4 py-2 text-[var(--color-foreground)] hover:bg-[var(--color-primary-100)]"
                                >
                                    Profil
                                </a>
                                <a 
                                    href="/settings" 
                                    className="block px-4 py-2 text-[var(--color-foreground)] hover:bg-[var(--color-primary-100)]"
                                >
                                    Einstellungen
                                </a>
                                <div className="border-t border-[var(--color-border)] my-1"></div>
                                <button 
                                    className="w-full text-left px-4 py-2 text-[var(--color-danger-500)] hover:bg-[var(--color-primary-100)]"
                                >
                                    Abmelden
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <a 
                    href="/login" 
                    className="px-4 py-2 rounded-lg bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                    Anmelden
                </a>
            )}
        </div>
    )
}

export default NavbarList;