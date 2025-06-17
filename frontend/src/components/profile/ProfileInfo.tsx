import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { User } from "../../types/types";

const ProfileInfo = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        {user.username}
                    </h2>
                    <p className="text-sm text-foreground/60 mt-1">
                        {user.email}
                    </p>
                    {user.bio && (
                        <p className="text-foreground/80 mt-2">
                            {user.bio}
                        </p>
                    )}
                </div>
            </div>

            {/* Einfache Statistiken */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background rounded-xl border border-border p-6">
                    <h3 className="text-sm font-medium text-foreground/60">Erstellte Karten</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        {user.total_cards_created}
                    </p>
                </div>
                <div className="bg-background rounded-xl border border-border p-6">
                    <h3 className="text-sm font-medium text-foreground/60">Erstellte Decks</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        {user.total_decks_created}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ProfileInfo;