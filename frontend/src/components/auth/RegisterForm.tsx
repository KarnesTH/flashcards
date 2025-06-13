import { useState } from "react";
import { api } from "../../lib/api";

interface FormErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
        if (!formData.username) {
            newErrors.username = "Benutzername ist erforderlich";
        } else if (formData.username.length < 3) {
            newErrors.username = "Benutzername muss mindestens 3 Zeichen lang sein";
        }

        if (!formData.email) {
            newErrors.email = "E-Mail ist erforderlich";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Ungültige E-Mail-Adresse";
        }

        if (!formData.password) {
            newErrors.password = "Passwort ist erforderlich";
        } else if (formData.password.length < 8) {
            newErrors.password = "Passwort muss mindestens 8 Zeichen lang sein";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Bitte bestätige dein Passwort";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwörter stimmen nicht überein";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitError(null);
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await api.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });
            window.location.href = '/dashboard';
        } catch (err) {
            if (err instanceof Error) {
                setSubmitError(err.message);
            } else {
                setSubmitError('Ein unbekannter Fehler ist aufgetreten');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {submitError && (
                <div className="bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-lg">
                    {submitError}
                </div>
            )}

            <div>
                <label 
                    htmlFor="username" 
                    className="block text-sm font-medium text-foreground"
                >
                    Benutzername
                </label>
                <input 
                    type="text" 
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={isLoading}
                />
                {errors.username && (
                    <p className="mt-1 text-sm text-danger-500">
                        {errors.username}
                    </p>
                )}
            </div>

            <div>
                <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-foreground"
                >
                    E-Mail
                </label>
                <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={isLoading}
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-danger-500">
                        {errors.email}
                    </p>
                )}
            </div>

            <div>
                <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-foreground"
                >
                    Passwort
                </label>
                <input 
                    type="password" 
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={isLoading}
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-danger-500">
                        {errors.password}
                    </p>
                )}
            </div>

            <div>
                <label 
                    htmlFor="confirmPassword" 
                    className="block text-sm font-medium text-foreground"
                >
                    Passwort bestätigen
                </label>
                <input 
                    type="password" 
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={isLoading}
                />
                {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-danger-500">
                        {errors.confirmPassword}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
                {isLoading ? 'Wird registriert...' : 'Registrieren'}
            </button>
        </form>
    );
};

export default RegisterForm;