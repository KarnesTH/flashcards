import { useState } from 'react';
import { api } from '../../lib/api';
import type { LoginFormData } from '../../types/types';
import { LoginError } from '../../types/errors';

/**
 * LoginForm component
 * 
 * @returns The LoginForm component
 */
const LoginForm = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<LoginError | null>(null);

    /**
     * Handle the form submission
     * 
     * @description This function is used to handle the form submission.
     * It will submit the form data to the API and redirect to the dashboard if successful.
     * If there is an error, it will set the error state and display the error message.
     * 
     * @param e - The form event
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await api.login(formData);
            window.location.href = '/dashboard';
        } catch (err) {
            setError(
                err instanceof LoginError ? err : new LoginError(
                    'Bitte überprüfe deine Eingaben und versuche es erneut.'
                )
            );
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
                <label htmlFor="username" className="block text-sm font-medium text-primary-600">
                    Benutzername
                </label>
                <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:outline-primary-500 focus:ring-primary-500"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary-600">
                    Passwort
                </label>
                <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:outline-primary-500 focus:ring-primary-500"
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