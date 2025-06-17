import type { Deck, User, UserSettings, Tag } from "../types/types";

const API_URL = 'http://localhost:8000/api/v1';

interface LoginCredentials {
    username: string;
    password: string;
}

interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

interface JWTResponse {
    access: string;
    refresh: string;
}

interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export const api = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/jwt/create/`, {
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

        const jwtData: JWTResponse = await response.json();
        localStorage.setItem('access_token', jwtData.access);
        localStorage.setItem('refresh_token', jwtData.refresh);

        const userData = await this.getCurrentUser();
        return {
            access: jwtData.access,
            refresh: jwtData.refresh,
            user: userData!,
        };
    },

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: credentials.username,
                email: credentials.email,
                password: credentials.password,
                first_name: credentials.firstName || '',
                last_name: credentials.lastName || '',
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
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            try {
                await fetch(`${API_URL}/auth/jwt/logout/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refresh: refreshToken,
                    }),
                });
            } catch (error) {
                console.warn('Logout request failed:', error);
            }
        }
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },

    async refreshToken(): Promise<string> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new ApiError(401, 'Kein Refresh-Token verfügbar');
        }

        const response = await fetch(`${API_URL}/auth/jwt/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh: refreshToken,
            }),
        });

        if (!response.ok) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            throw new ApiError(401, 'Refresh-Token abgelaufen');
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return data.access;
    },

    async getCurrentUser(): Promise<User | null> {
        const token = localStorage.getItem('access_token');
        if (!token) return null;

        try {
            const response = await fetch(`${API_URL}/auth/users/me/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    try {
                        const newToken = await this.refreshToken();
                        const retryResponse = await fetch(`${API_URL}/auth/users/me/`, {
                            headers: {
                                'Authorization': `Bearer ${newToken}`,
                            },
                        });
                        
                        if (!retryResponse.ok) {
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            return null;
                        }
                        
                        return retryResponse.json();
                    } catch (refreshError) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        return null;
                    }
                }
                throw new ApiError(response.status, 'Fehler beim Abrufen des Benutzers');
            }

            return response.json();
        } catch (error) {
            console.error('Error fetching current user:', error);
            return null;
        }
    },

    async fetchWithAuth(url: string, options: RequestInit = {}) {
        let token = localStorage.getItem('access_token');
        if (!token) throw new ApiError(401, 'Nicht authentifiziert');

        const makeRequest = async (authToken: string) => {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    try {
                        const newToken = await this.refreshToken();
                        const retryResponse = await fetch(url, {
                            ...options,
                            headers: {
                                ...options.headers,
                                'Authorization': `Bearer ${newToken}`,
                                'Content-Type': 'application/json',
                            },
                        });
                        
                        if (!retryResponse.ok) {
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            throw new ApiError(401, 'Sitzung abgelaufen');
                        }
                        
                        return retryResponse.json();
                    } catch (refreshError) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        throw new ApiError(401, 'Sitzung abgelaufen');
                    }
                }
                const error = await response.json().catch(() => ({}));
                throw new ApiError(response.status, error.detail || 'API-Fehler');
            }

            return response.json();
        };

        return makeRequest(token);
    },

    async getPublicProfile(username: string): Promise<User> {
        return this.fetchWithAuth(`${API_URL}/auth/users/${username}/`);
    },

    async getUserSettings(): Promise<UserSettings> {
        return this.fetchWithAuth(`${API_URL}/settings/`);
    },

    async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
        return this.fetchWithAuth(`${API_URL}/settings/`, {
            method: 'PATCH',
            body: JSON.stringify(settings),
        });
    },

    async updateProfile(profile: Partial<User>): Promise<User> {
        return this.fetchWithAuth(`${API_URL}/auth/users/me/`, {
            method: 'PATCH',
            body: JSON.stringify(profile),
        });
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await this.fetchWithAuth(`${API_URL}/auth/users/set_password/`, {
            method: 'POST',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
            }),
        });
    },

    async resetPassword(email: string): Promise<void> {
        await fetch(`${API_URL}/auth/users/reset_password/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
            }),
        });
    },

    async getDecks(): Promise<Deck[]> {
        try {
            const response = await this.fetchWithAuth(`${API_URL}/decks/`);
            
            if (response && typeof response === 'object' && 'results' in response) {
                return response.results.map((deck: any) => ({
                    ...deck,
                    createdAt: deck.created_at,
                    updatedAt: deck.updated_at
                }));
            } else if (Array.isArray(response)) {
                return response.map(deck => ({
                    ...deck,
                    createdAt: deck.created_at,
                    updatedAt: deck.updated_at
                }));
            } else {
                return [];
            }
        } catch (error) {
            console.error('Fehler beim Laden der Decks:', error);
            return [];
        }
    },

    async getTags(): Promise<Tag[]> {
        try {
            const response = await this.fetchWithAuth(`${API_URL}/tags/`);
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('Fehler beim Laden der Tags:', error);
            return [];
        }
    },

    async createTag(name: string): Promise<Tag> {
        return this.fetchWithAuth(`${API_URL}/tags/`, {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    async getOrCreateTags(tagNames: string[]): Promise<number[]> {
        const tagIds: number[] = [];
        
        for (const tagName of tagNames) {
            try {
                const existingTags = await this.fetchWithAuth(`${API_URL}/tags/?search=${encodeURIComponent(tagName)}`);
                let tagId: number;
                
                if (existingTags && existingTags.length > 0) {
                    tagId = existingTags[0].id;
                } else {
                    const newTag = await this.createTag(tagName);
                    tagId = newTag.id;
                }
                
                tagIds.push(tagId);
            } catch (error) {
                console.error(`Fehler beim Verarbeiten des Tags "${tagName}":`, error);
            }
        }
        
        return tagIds;
    },

    async createDeck(deck: Deck): Promise<Deck> {
        try {
            const tagIds = await this.getOrCreateTags(deck.tags?.map(t => t.name) || []);
            
            const { cards, tags, ...deckWithoutCards } = deck;
            const createdDeck = await this.fetchWithAuth(`${API_URL}/decks/`, {
                method: 'POST',
                body: JSON.stringify({
                    ...deckWithoutCards,
                    tags: tagIds
                }),
            });

            if (cards && cards.length > 0) {
                for (let i = 0; i < cards.length; i++) {
                    const card = cards[i];
                    await this.fetchWithAuth(`${API_URL}/cards/`, {
                        method: 'POST',
                        body: JSON.stringify({
                            deck: createdDeck.id,
                            front: card.front,
                            back: card.back,
                            order: i + 1
                        }),
                    });
                }
            }

            const fullDeck = await this.fetchWithAuth(`${API_URL}/decks/${createdDeck.id}/`);
            return {
                ...fullDeck,
                createdAt: fullDeck.created_at,
                updatedAt: fullDeck.updated_at
            };
        } catch (error) {
            console.error('Fehler beim Erstellen des Decks:', error);
            throw error;
        }
    },

    async updateDeck(deck: Deck): Promise<Deck> {
        try {
            const tagIds = await this.getOrCreateTags(deck.tags?.map(t => t.name) || []);
            
            const { cards, tags, ...deckWithoutCards } = deck;
            await this.fetchWithAuth(`${API_URL}/decks/${deck.id}/`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...deckWithoutCards,
                    tags: tagIds
                }),
            });

            if (cards && cards.length > 0) {
                const existingCardsResponse = await this.fetchWithAuth(`${API_URL}/cards/?deck=${deck.id}`);
                const existingCards = Array.isArray(existingCardsResponse) ? existingCardsResponse : 
                                    (existingCardsResponse.results ? existingCardsResponse.results : []);

                for (let i = 0; i < cards.length; i++) {
                    const newCard = cards[i];
                    const existingCard = existingCards.find((ec: any) => ec.order === i + 1);

                    if (existingCard) {
                        if (existingCard.front !== newCard.front || existingCard.back !== newCard.back) {
                            await this.fetchWithAuth(`${API_URL}/cards/${existingCard.id}/`, {
                                method: 'PUT',
                                body: JSON.stringify({
                                    front: newCard.front,
                                    back: newCard.back,
                                    order: i + 1
                                }),
                            });
                        }
                    } else {
                        await this.fetchWithAuth(`${API_URL}/cards/`, {
                            method: 'POST',
                            body: JSON.stringify({
                                deck: deck.id,
                                front: newCard.front,
                                back: newCard.back,
                                order: i + 1
                            }),
                        });
                    }
                }

                const cardsToKeep = cards.length;
                for (const existingCard of existingCards) {
                    if (existingCard.order > cardsToKeep) {
                        await this.fetchWithAuth(`${API_URL}/cards/${existingCard.id}/`, {
                            method: 'DELETE',
                        });
                    }
                }
            }

            const fullDeck = await this.fetchWithAuth(`${API_URL}/decks/${deck.id}/`);
            return {
                ...fullDeck,
                createdAt: fullDeck.created_at,
                updatedAt: fullDeck.updated_at
            };
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Decks:', error);
            throw error;
        }
    },

    async deleteDeck(deckId: number): Promise<void> {
        await this.fetchWithAuth(`${API_URL}/decks/${deckId}/`, {
            method: 'DELETE',
        });
    },
};