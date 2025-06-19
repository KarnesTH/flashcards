import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { User } from '../../types/types';

/**
 * SettingsForm component
 * 
 * @description This component is used to display the settings form.
 * 
 * @returns The SettingsForm component
 */
const SettingsForm = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        checkUserSettings();
    }, []);

    /**
     * Check User Settings
     * 
     * @description This function is used to check the user settings.
     * 
     */
    const checkUserSettings = async () => {
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
            setIsPublic(userData.is_public);
        } catch (error) {
            console.error('Fehler beim Abrufen der Benutzerdaten:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle Save
     * 
     * @description This function is used to handle the save of the settings.
     * 
     */
    const handleSave = async () => {
        if (!user) return;
        
        setIsSaving(true);
        setError(null);
        setSuccess(null);
        
        try {
            await api.updateUser({
                bio: user.bio,
                email: user.email,
                is_public: isPublic,
            });
            setSuccess('Einstellungen erfolgreich gespeichert');
        } catch (error) {
            console.error('Fehler beim Speichern der Einstellungen:', error);
            setError(error instanceof Error ? error.message : 'Fehler beim Speichern der Einstellungen');
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Handle Public Profile Change
     * 
     * @description This function is used to handle the change of the public profile.
     * 
     */
    const handleTogglePublicProfile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) return;

        setIsPublic(e.target.checked);
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {error && (
                <div className="p-4 rounded-lg border border-danger-500 text-danger-500">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-4 rounded-lg border border-success-500 text-success-500">
                    {success}
                </div>
            )}
            
            <section id="account" className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Account</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground">
                            E-Mail
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={user?.email || ''}
                            onChange={(e) => setUser(user ? { ...user, email: e.target.value } : null)}
                            className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-foreground">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            value={user?.bio || ''}
                            onChange={(e) => setUser(user ? { ...user, bio: e.target.value } : null)}
                            rows={3}
                            className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Kurze Beschreibung über dich..."
                        />
                    </div>
                </div>
            </section>

            <section id="privacy" className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Privatsphäre</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-foreground">Profil öffentlich machen</h3>
                            <p className="text-sm text-foreground/60">
                                {user?.is_public 
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
                                checked={isPublic}
                                onChange={handleTogglePublicProfile}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-background border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500/20"></div>
                        </label>
                    </div>
                </div>
            </section>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Speichern...
                        </span>
                    ) : (
                        'Einstellungen speichern'
                    )}
                </button>
            </div>
        </div>
    );
};

export default SettingsForm; 