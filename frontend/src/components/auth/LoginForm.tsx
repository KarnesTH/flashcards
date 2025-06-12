import { useState } from "react";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        return email !== "" && password !== "";
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            // Hier später die echte Login-Logik implementieren
            console.log(email, password);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simuliere API-Call
        } finally {
            setIsLoading(false);
        }
    }

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
                        placeholder="name@beispiel.de"
                        autoComplete="email"
                        className="w-full px-4 py-2.5 rounded-lg border border-border 
                                 bg-background
                                 focus:outline-none focus:ring-2 focus:ring-primary-500 
                                 focus:border-transparent transition-colors
                                 placeholder:text-muted"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label 
                        htmlFor="password" 
                        className="block text-sm font-medium text-foreground"
                    >
                        Passwort
                    </label>
                    <a 
                        href="/auth/forgot-password" 
                        className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
                    >
                        Passwort vergessen?
                    </a>
                </div>
                <div className="relative">
                    <input 
                        type="password" 
                        id="password"
                        autoComplete="current-password"
                        placeholder="••••••••" 
                        className="w-full px-4 py-2.5 rounded-lg border border-border 
                                 bg-background
                                 focus:outline-none focus:ring-2 focus:ring-primary-500 
                                 focus:border-transparent transition-colors
                                 placeholder:text-muted"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={!validateForm() || isLoading}
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
                        Anmelden...
                    </span>
                ) : (
                    "Anmelden"
                )}
            </button>
        </form>
    )
}

export default LoginForm;