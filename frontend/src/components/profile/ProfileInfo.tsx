import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { User, Stats } from "../../types/types";

const ProfileInfo = () => {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
            // TODO: Stats von der API holen
            setStats({
                totalCards: 42,
                decksCreated: 5,
                cardsLearned: 128,
                averageScore: 85
            });
        } catch (err) {
            setUser(null);
            setStats(null);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-8">
                <p className="text-foreground/60">Bitte melde dich an, um dein Profil zu sehen.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Profil-Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-background rounded-xl border border-border">
                <div className="relative">
                    <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} 
                        alt="Profilbild" 
                        className="w-32 h-32 rounded-full border-2 border-primary-500/20"
                    />
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="absolute bottom-0 right-0 p-2 bg-primary-500 rounded-full text-white hover:bg-primary-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        {user.username}
                    </h2>
                    <p className="text-sm text-foreground/60 mt-1">
                        {user.email}
                    </p>
                </div>
            </div>

            {/* Statistiken */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-background rounded-xl border border-border p-6">
                        <h3 className="text-sm font-medium text-foreground/60">Gesamte Karten</h3>
                        <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                            {stats.totalCards}
                        </p>
                    </div>
                    <div className="bg-background rounded-xl border border-border p-6">
                        <h3 className="text-sm font-medium text-foreground/60">Erstellte Decks</h3>
                        <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                            {stats.decksCreated}
                        </p>
                    </div>
                    <div className="bg-background rounded-xl border border-border p-6">
                        <h3 className="text-sm font-medium text-foreground/60">Gelernte Karten</h3>
                        <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                            {stats.cardsLearned}
                        </p>
                    </div>
                    <div className="bg-background rounded-xl border border-border p-6">
                        <h3 className="text-sm font-medium text-foreground/60">Durchschnitt</h3>
                        <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                            {stats.averageScore}%
                        </p>
                    </div>
                </div>
            )}

            {/* Profil-Einstellungen */}
            {isEditing && (
                <div className="bg-background rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Profil-Einstellungen</h3>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-foreground">
                                Benutzername
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={user.username}
                                className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                disabled
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                E-Mail
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={user.email}
                                className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                disabled
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-primary-500/10 transition-colors"
                            >
                                Abbrechen
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                            >
                                Speichern
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ProfileInfo;