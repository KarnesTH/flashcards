import { useState } from "react";

interface FormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
}

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
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
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            // Hier später die echte Register-Logik implementieren
            console.log(formData);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simuliere API-Call
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
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-foreground"
                >
                    E-Mail
                </label>
                <div className="relative">
                    <input 
                        type="email" 
                        id="email"
                        name="email"
                        placeholder="name@beispiel.de"
                        autoComplete="email"
                        className={`w-full px-4 py-2.5 rounded-lg border 
                            ${errors.email 
                                ? 'border-danger-500 focus:ring-danger-500' 
                                : 'border-border focus:ring-primary-500'
                            } 
                            bg-background
                            focus:outline-none focus:ring-2 
                            focus:border-transparent transition-colors
                            placeholder:text-muted`}
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-danger-500">
                            {errors.email}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-foreground"
                >
                    Passwort
                </label>
                <div className="relative">
                    <input 
                        type="password" 
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className={`w-full px-4 py-2.5 rounded-lg border 
                            ${errors.password 
                                ? 'border-danger-500 focus:ring-danger-500' 
                                : 'border-border focus:ring-primary-500'
                            } 
                            bg-background
                            focus:outline-none focus:ring-2 
                            focus:border-transparent transition-colors
                            placeholder:text-muted`}
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-danger-500">
                            {errors.password}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label 
                    htmlFor="confirmPassword" 
                    className="block text-sm font-medium text-foreground"
                >
                    Passwort bestätigen
                </label>
                <div className="relative">
                    <input 
                        type="password" 
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className={`w-full px-4 py-2.5 rounded-lg border 
                            ${errors.confirmPassword 
                                ? 'border-danger-500 focus:ring-danger-500' 
                                : 'border-border focus:ring-primary-500'
                            } 
                            bg-background
                            focus:outline-none focus:ring-2 
                            focus:border-transparent transition-colors
                            placeholder:text-muted`}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-danger-500">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-primary-500 
                         hover:bg-primary-600 text-white font-medium
                         transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-primary-500 
                         focus:ring-offset-2 focus:ring-offset-background"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle 
                                className="opacity-25" 
                                cx="12" 
                                cy="12" 
                                r="10" 
                                stroke="currentColor" 
                                strokeWidth="4"
                            />
                            <path 
                                className="opacity-75" 
                                fill="currentColor" 
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Registrieren...
                    </span>
                ) : (
                    "Registrieren"
                )}
            </button>
        </form>
    )
}

export default RegisterForm;