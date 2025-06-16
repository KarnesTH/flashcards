import type { SettingsFormData, User, UserSettings } from "../types/types";

const API_URL = 'http://localhost:8000/api/v1';

interface LoginCredentials {
    username: string;
    password: string;
}

interface RegisterCredentials extends LoginCredentials {
    email: string;
    confirmPassword: string;
}

interface AuthResponse {
    token: string;
    user: {
        id: number;
        email: string;
        username: string;
    };
}

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export const api = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                error.detail || 'Anmeldung fehlgeschlagen'
            );
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data;
    },

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: credentials.username,
                email: credentials.email,
                password: credentials.password,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                error.detail || 'Registrierung fehlgeschlagen'
            );
        }

        return this.login({
            username: credentials.username,
            password: credentials.password,
        });
    },

    async logout() {
        localStorage.removeItem('token');
    },

    async getCurrentUser() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const response = await fetch(`${API_URL}/user/`, {
            headers: {
                'Authorization': `Token ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                return null;
            }
            throw new ApiError(response.status, 'Fehler beim Abrufen des Benutzers');
        }

        return response.json();
    },

    async fetchWithAuth(url: string, options: RequestInit = {}) {
        const token = localStorage.getItem('token');
        if (!token) throw new ApiError(401, 'Nicht authentifiziert');

        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                throw new ApiError(401, 'Sitzung abgelaufen');
            }
            const error = await response.json().catch(() => ({}));
            throw new ApiError(response.status, error.detail || 'API-Fehler');
        }

        return response.json();
    },

    async getPublicProfile(username: string) {
        const token = localStorage.getItem('token');
        if (!token) throw new ApiError(401, 'Nicht authentifiziert');

        const response = await fetch(`${API_URL}/users/${username}/`, {
            headers: {
                'Authorization': `Token ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                throw new ApiError(401, 'Sitzung abgelaufen');
            }
            const error = await response.json().catch(() => ({}));
            throw new ApiError(response.status, error.detail || 'Fehler beim Abrufen des öffentlichen Profils');
        }

        return response.json();
    },

    async getUserSettings(username: string): Promise<UserSettings> {
        return this.fetchWithAuth(`${API_URL}/settings/${username}/`);
    },

    async updateUserSettings(username: string, settings: UserSettings): Promise<UserSettings> {
        return this.fetchWithAuth(`${API_URL}/settings/${username}/`, {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    },
}; 