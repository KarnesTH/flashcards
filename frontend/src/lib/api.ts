import type { User, Deck, Card, RegisterFormData, LoginFormData, CreateDeckFormData, CreateCardFormData } from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'ApiError';
    }
}

class Api {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${token}`,
            };
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(
                    errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
                    response.status
                );
            }

            return await response.json();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(`Netzwerkfehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
        }
    }

    async register(data: RegisterFormData): Promise<{ access: string; refresh: string }> {
        const response = await this.request('/auth/users/', {
            method: 'POST',
            body: JSON.stringify({
                username: data.username,
                email: data.email,
                password: data.password,
            }),
        });
        
        return this.login({
            username: data.username,
            password: data.password,
        });
    }

    async login(data: LoginFormData): Promise<{ access: string; refresh: string }> {
        const response = await this.request<{ access: string; refresh: string }>('/auth/jwt/create/', {
            method: 'POST',
            body: JSON.stringify({
                username: data.username,
                password: data.password,
            }),
        });
        
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        
        return response;
    }

    async refreshToken(): Promise<{ access: string }> {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) {
            throw new ApiError('Kein Refresh-Token vorhanden');
        }

        const response = await this.request<{ access: string }>('/auth/jwt/refresh/', {
            method: 'POST',
            body: JSON.stringify({ refresh }),
        });
        
        localStorage.setItem('access_token', response.access);
        
        return response;
    }

    async logout(): Promise<void> {
        const refresh = localStorage.getItem('refresh_token');
        if (refresh) {
            try {
                await this.request('/auth/jwt/logout/', {
                    method: 'POST',
                    body: JSON.stringify({ refresh }),
                });
            } catch (error) {
                console.warn('Logout request failed:', error);
            }
        }
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    async getCurrentUser(): Promise<User> {
        return this.request('/auth/users/me/');
    }

    async getDecks(): Promise<Deck[]> {
        const response = await this.request<{ results: Deck[] }>('/decks/');
        return response.results || response;
    }

    async getDeck(id: number): Promise<Deck> {
        return this.request(`/decks/${id}/`);
    }

    async getDeckWithCards(id: number): Promise<Deck> {
        return this.request(`/decks/${id}/`);
    }

    async createDeck(data: CreateDeckFormData): Promise<Deck> {
        return this.request('/decks/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateDeck(id: number, data: Partial<CreateDeckFormData>): Promise<Deck> {
        return this.request(`/decks/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteDeck(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/decks/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
                response.status
            );
        }
    }

    async getCards(deckId?: number): Promise<Card[]> {
        const params = deckId ? `?deck=${deckId}` : '';
        const response = await this.request<{ results: Card[] }>(`/cards/${params}`);
        return response.results || response;
    }

    async createCard(data: CreateCardFormData): Promise<Card> {
        return this.request('/cards/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateCard(id: number, data: Partial<CreateCardFormData>): Promise<Card> {
        return this.request(`/cards/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteCard(id: number): Promise<void> {
        return this.request(`/cards/${id}/`, {
            method: 'DELETE',
        });
    }

    async createLearningSession(deckId: number): Promise<any> {
        return this.request('/learning-sessions/', {
            method: 'POST',
            body: JSON.stringify({ deck_id: deckId }),
        });
    }

    async updateLearningSession(sessionId: number, status: string, endedAt?: string): Promise<any> {
        const data: any = { status };
        if (endedAt) {
            data.ended_at = endedAt;
        }
        
        return this.request(`/learning-sessions/${sessionId}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async completeLearningSession(sessionId: number): Promise<any> {
        return this.request(`/learning-sessions/${sessionId}/complete/`, {
            method: 'POST',
        });
    }

    async createCardReview(
        sessionId: number, 
        cardId: number, 
        isCorrect: boolean, 
        difficultyRating?: number, 
        timeTaken?: number
    ): Promise<any> {
        const data: any = {
            session_id: sessionId,
            card_id: cardId,
            is_correct: isCorrect,
        };
        
        if (timeTaken !== undefined) {
            data.time_taken = timeTaken;
        }
        
        return this.request('/card-reviews/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const api = new Api();