import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { SettingsFormData, User } from '../../types/types';


const SettingsForm = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState<SettingsFormData>({
        user: {
            id: 0,
            username: '',
            email: '',
        },
        theme: 'light',
        fontSize: 'small',
        privacySettings: 'show_stats',
        notificationSettings: 'email_notifications',
    });

    useEffect(() => {
        checkUserSettings();
    }, []);

    const checkUserSettings = async () => {
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
            const settings = await api.getUserSettings(userData?.username);
            setFormData({
                user: settings.user,
                theme: settings.theme,
                fontSize: settings.fontSize,
                privacySettings: settings.privacySettings,
                notificationSettings: settings.notificationSettings,
            });
            setIsLoading(false);
        } catch (error) {
            console.error('Fehler beim Abrufen der Einstellungen:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user?.username) return;
        
        setIsSaving(true);
        setError(null);
        setSuccess(null);
        
        try {
            await api.updateUserSettings(user.username, formData);
            setSuccess('Einstellungen erfolgreich gespeichert');
        } catch (error) {
            console.error('Fehler beim Speichern der Einstellungen:', error);
            setError(error instanceof Error ? error.message : 'Fehler beim Speichern der Einstellungen');
        } finally {
            setIsSaving(false);
        }
    };

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
                <div className="p-4 rounded-lg bg-red-500/10 text-red-500">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-4 rounded-lg bg-green-500/10 text-green-500">
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
                            value={user?.email}
                            onChange={(e) => setFormData({ ...formData, user: { ...formData.user, email: e.target.value } })}
                            className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </section>

            <section id="privacy" className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Privatsphäre</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-foreground">Statistiken anzeigen</h3>
                            <p className="text-sm text-foreground/60">Deine Lernstatistiken sind öffentlich sichtbar</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.privacySettings === 'show_stats'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    privacySettings: e.target.checked ? 'show_stats' : 'show_decks'
                                })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-background border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500/20"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-foreground">Decks anzeigen</h3>
                            <p className="text-sm text-foreground/60">Deine erstellten Decks sind öffentlich sichtbar</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.privacySettings === 'show_decks'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    privacySettings: e.target.checked ? 'show_decks' : 'show_progress'
                                })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-background border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500/20"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-foreground">Fortschritt anzeigen</h3>
                            <p className="text-sm text-foreground/60">Dein Lernfortschritt ist öffentlich sichtbar</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.privacySettings === 'show_progress'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    privacySettings: e.target.checked ? 'show_progress' : 'show_stats'
                                })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-background border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500/20"></div>
                        </label>
                    </div>
                </div>
            </section>

            <section id="notifications" className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Benachrichtigungen</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-foreground">E-Mail-Benachrichtigungen</h3>
                            <p className="text-sm text-foreground/60">Erhalte wichtige Updates per E-Mail</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.notificationSettings === 'email_notifications'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    notificationSettings: e.target.checked ? 'email_notifications' : 'learning_reminders'
                                })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-background border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500/20"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-foreground">Lern-Erinnerungen</h3>
                            <p className="text-sm text-foreground/60">Erinnere mich an regelmäßiges Lernen</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.notificationSettings === 'learning_reminders'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    notificationSettings: e.target.checked ? 'learning_reminders' : 'achievement_alerts'
                                })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-background border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500/20"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-foreground">Erfolgs-Benachrichtigungen</h3>
                            <p className="text-sm text-foreground/60">Benachrichtige mich über neue Erfolge</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.notificationSettings === 'achievement_alerts'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    notificationSettings: e.target.checked ? 'achievement_alerts' : 'email_notifications'
                                })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-background border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500/20"></div>
                        </label>
                    </div>
                </div>
            </section>

            <section id="appearance" className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Erscheinungsbild</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="theme" className="block text-sm font-medium text-foreground">
                            Theme
                        </label>
                        <select
                            id="theme"
                            value={formData.theme}
                            onChange={(e) => setFormData({
                                ...formData,
                                theme: e.target.value as 'light' | 'dark' | 'system'
                            })}
                            className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                            <option value="light">Hell</option>
                            <option value="dark">Dunkel</option>
                            <option value="system">System</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="fontSize" className="block text-sm font-medium text-foreground">
                            Schriftgröße
                        </label>
                        <select
                            id="fontSize"
                            value={formData.fontSize}
                            onChange={(e) => setFormData({
                                ...formData,
                                fontSize: e.target.value as 'small' | 'medium' | 'large'
                            })}
                            className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                            <option value="small">Klein</option>
                            <option value="medium">Mittel</option>
                            <option value="large">Groß</option>
                        </select>
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