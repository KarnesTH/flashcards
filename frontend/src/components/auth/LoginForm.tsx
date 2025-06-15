import { useState } from 'react';
import { api } from '../../lib/api';
import type { LoginErrors } from '../../types/errors';
import type { LoginFormData } from '../../types/types';

const LoginForm = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<LoginErrors | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await api.login(formData);
            window.location.href = '/dashboard';
        } catch (err) {
            if (err instanceof Error) {
                setError({ message: err.message });
            } else {
                setError({ message: 'Ein unbekannter Fehler ist aufgetreten' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-transparent border-2 border-danger-500 text-danger-500 px-4 py-3 rounded-lg">
                    {error.message}
                </div>
            )}
            
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground">
                    Benutzername
                </label>
                <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Passwort
                </label>
                <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={isSubmitting}
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
                {isSubmitting ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
        </form>
    );
} 

export default LoginForm;