import { useState } from "react";
import { api } from "../../lib/api";
import { RegisterError, type RegisterFormData } from "../../types/errors";

/**
 * RegisterForm component
 * 
 * @description This component is used to register a new user.
 * It will validate the form data and submit it to the API.
 * If the registration is successful, it will redirect to the dashboard.
 * If there is an error, it will set the error state and display the error message.
 * 
 * @returns The RegisterForm component
 */
const RegisterForm = () => {
    const [formData, setFormData] = useState<RegisterFormData>({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState<RegisterError | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    /**
     * Handle the form submission
     * 
     * @description This function is used to handle the form submission.
     * It will validate the form data, submit it to the API and redirect to the dashboard if successful.
     * If there is an error, it will set the error state and display the error message.
     * 
     * @param e - The form event
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const validationError = RegisterError.validateForm(formData);
        if (validationError) {
            setErrors(validationError);
            return;
        }

        setErrors(null);
        setSubmitError(null);
        setIsLoading(true);
        
        try {
            await api.register({
                username: formData.username!,
                email: formData.email!,
                password: formData.password!,
                confirmPassword: formData.confirmPassword!
            });
            window.location.href = '/dashboard';
        } catch (err) {
            if (err instanceof RegisterError) {
                setErrors(err);
            } else if (err instanceof Error) {
                setSubmitError(err.message);
            } else {
                setSubmitError('Ein unbekannter Fehler ist aufgetreten');
            }
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle the form change
     * 
     * @description This function is used to handle the form change.
     * It will update the form data and clear the error state if the form data is valid.
     * 
     * @param e - The form event
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors?.formErrors[name as keyof typeof errors.formErrors]) {
            setErrors(prev => {
                if (!prev) return null;
                const newErrors = new RegisterError(prev.message, { ...prev.formErrors });
                delete newErrors.formErrors[name as keyof typeof newErrors.formErrors];
                return Object.keys(newErrors.formErrors).length > 0 ? newErrors : null;
            });
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {submitError && (
                <div className="bg-transparent border border-danger-500 text-danger-500 px-4 py-3 rounded-lg">
                    {submitError}
                </div>
            )}

            <div>
                <label 
                    htmlFor="username" 
                    className="block text-sm font-medium text-primary-600"
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
                    className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:outline-primary-500 focus:ring-primary-500"
                    disabled={isLoading}
                />
                {errors?.formErrors.username && (
                    <p className="mt-1 text-sm text-danger-500">
                        {errors.formErrors.username}
                    </p>
                )}
            </div>

            <div>
                <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-primary-600"
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
                    className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:outline-primary-500 focus:ring-primary-500"
                    disabled={isLoading}
                />
                {errors?.formErrors.email && (
                    <p className="mt-1 text-sm text-danger-500">
                        {errors.formErrors.email}
                    </p>
                )}
            </div>

            <div>
                <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-primary-600"
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
                    className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:outline-primary-500 focus:ring-primary-500"
                    disabled={isLoading}
                />
                {errors?.formErrors.password && (
                    <p className="mt-1 text-sm text-danger-500">
                        {errors.formErrors.password}
                    </p>
                )}
            </div>

            <div>
                <label 
                    htmlFor="confirmPassword" 
                    className="block text-sm font-medium text-primary-600"
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
                    className="mt-1 block w-full rounded-lg border-border bg-background px-4 py-2 text-foreground shadow-sm focus:outline-primary-500 focus:ring-primary-500"
                    disabled={isLoading}
                />
                {errors?.formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-danger-500">
                        {errors.formErrors.confirmPassword}
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