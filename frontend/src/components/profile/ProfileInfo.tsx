import { useEffect, useState, useRef } from "react";
import { api } from "../../lib/api";
import type { User } from "../../types/types";

const ProfileInfo = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleTogglePublic = async () => {
        if (!user) return;
        
        setIsUpdating(true);
        try {
            const updatedUser = await api.updateUser({
                ...user,
                is_public: !user.is_public
            });
            setUser(updatedUser);
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Profilsichtbarkeit:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Nur JPEG, PNG und GIF Dateien sind erlaubt');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Datei ist zu groß. Maximum 5MB erlaubt.');
            return;
        }

        setIsUploading(true);
        try {
            const result = await api.uploadAvatar(file);
            const updatedUser = await api.getCurrentUser();
            setUser(updatedUser);
            alert(result.message);
        } catch (error) {
            console.error('Fehler beim Hochladen des Avatars:', error);
            alert('Fehler beim Hochladen des Avatars');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAvatarDelete = async () => {
        if (!user || !user.avatar) return;

        if (!confirm('Möchtest du dein Profilbild wirklich löschen?')) return;

        setIsUploading(true);
        try {
            await api.deleteAvatar();
            const updatedUser = await api.getCurrentUser();
            setUser(updatedUser);
            alert('Profilbild erfolgreich gelöscht');
        } catch (error) {
            console.error('Fehler beim Löschen des Avatars:', error);
            alert('Fehler beim Löschen des Avatars');
        } finally {
            setIsUploading(false);
        }
    };

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
                <div className="relative group">
                    <img 
                        src={user.avatar_url} 
                        alt="Profilbild" 
                        className="w-32 h-32 rounded-full border-2 border-primary-500/20 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors disabled:opacity-50"
                                title="Avatar hochladen"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </button>
                            {user.avatar && (
                                <button
                                    onClick={handleAvatarDelete}
                                    disabled={isUploading}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                                    title="Avatar löschen"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                />
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

            {/* Profil-Sichtbarkeit Toggle */}
            <div className="bg-background rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-foreground">Profil öffentlich machen</h3>
                        <p className="text-sm text-foreground/60 mt-1">
                            {user.is_public 
                                ? 'Dein Profil ist öffentlich sichtbar' 
                                : 'Dein Profil ist nur für dich sichtbar'
                            }
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <label htmlFor="publicProfile" className="sr-only">
                            Profil Sichtbarkeit
                        </label>
                        <input
                            type="checkbox"
                            id="publicProfile"
                            checked={user.is_public}
                            onChange={handleTogglePublic}
                            disabled={isUpdating}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-background border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500/20 disabled:opacity-50"></div>
                    </label>
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