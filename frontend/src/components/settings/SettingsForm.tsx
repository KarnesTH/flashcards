import { useState } from 'react';
import { api } from '../../lib/api';
import type { SettingsFormData, User } from '../../types/types';


const SettingsForm = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('account');
    const [formData, setFormData] = useState<SettingsFormData>({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        privacySettings: {
            showStats: true,
            showDecks: true,
            showProgress: true,
        },
        notifications: {
            emailNotifications: true,
            learningReminders: true,
            achievementAlerts: true,
        },
        appearance: {
            theme: 'system',
            fontSize: 'medium',
        },
    });

    // TODO: Implementierung der API-Aufrufe für Einstellungen

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
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
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground">
                            Aktuelles Passwort
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
                            Neues Passwort
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                            Passwort bestätigen
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                                checked={formData.privacySettings.showStats}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    privacySettings: { ...formData.privacySettings, showStats: e.target.checked }
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
                                checked={formData.privacySettings.showDecks}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    privacySettings: { ...formData.privacySettings, showDecks: e.target.checked }
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
                                checked={formData.privacySettings.showProgress}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    privacySettings: { ...formData.privacySettings, showProgress: e.target.checked }
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
                                checked={formData.notifications.emailNotifications}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    notifications: { ...formData.notifications, emailNotifications: e.target.checked }
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
                                checked={formData.notifications.learningReminders}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    notifications: { ...formData.notifications, learningReminders: e.target.checked }
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
                                checked={formData.notifications.achievementAlerts}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    notifications: { ...formData.notifications, achievementAlerts: e.target.checked }
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
                            value={formData.appearance.theme}
                            onChange={(e) => setFormData({
                                ...formData,
                                appearance: { ...formData.appearance, theme: e.target.value as 'light' | 'dark' | 'system' }
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
                            value={formData.appearance.fontSize}
                            onChange={(e) => setFormData({
                                ...formData,
                                appearance: { ...formData.appearance, fontSize: e.target.value as 'small' | 'medium' | 'large' }
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
                    className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                >
                    Einstellungen speichern
                </button>
            </div>
        </div>
    );
};

export default SettingsForm; 