import type { User, Deck, Card, LearningSession, CardReview, UserLearningStats, DeckStats, RegisterFormData, LoginFormData, CreateDeckFormData, CreateCardFormData, GenerateDeck, CheckAnswerCorrectness } from '../types/types';
import { ApiError } from '../types/errors';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * API class for interacting with the backend API
 * 
 * @example
 * import { api } from '@/lib/api';
 * 
 * const user = await api.getCurrentUser();
 * console.log(user);
 */
class Api {
    /**
     * Make a request to the API
     * 
     * @description This function is used to make a request to the API.
     * 
     * @param endpoint - The endpoint to request
     * @param options - The options for the request
     * 
     * @returns The response from the API
     */
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

    /**
     * Register a new user
     * 
     * @description This function is used to register a new user.
     * 
     * @param data - The data for the registration
     * 
     * @returns The response from the API
     */
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

    /**
     * Login a user
     * 
     * @description This function is used to login a user.
     * 
     * @param data - The data for the login
     * 
     * @returns The response from the API
     */
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

    /**
     * Refresh a token
     * 
     * @description This function is used to refresh a token.
     * 
     * @returns The response from the API
     */
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

    /**
     * Logout a user
     * 
     * @description This function is used to logout a user.
     * 
     * @returns The response from the API
     */
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

    /**
     * Get the current user
     * 
     * @description This function is used to get the current user.
     * 
     * @returns The current user
     */
    async getCurrentUser(): Promise<User> {
        return this.request('/auth/users/me/');
    }

    /**
     * Update the current user
     * 
     * @description This function is used to update the current user.
     * 
     * @param data - The data for the update
     * 
     * @returns The updated user
     */
    async updateUser(data: Partial<User>): Promise<User> {
        return this.request('/auth/users/me/', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    /**
     * Upload an avatar
     * 
     * @description This function is used to upload an avatar.
     * 
     * @param file - The file to upload
     * 
     * @returns The response from the API
     */
    async uploadAvatar(file: File): Promise<{ message: string; avatar_url: string }> {
        const formData = new FormData();
        formData.append('avatar', file);
        
        const url = `${API_BASE_URL}/auth/users/me/avatar/`;
        const token = localStorage.getItem('access_token');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.error || `HTTP ${response.status}: ${response.statusText}`,
                response.status
            );
        }
        
        return response.json();
    }

    /**
     * Delete an avatar
     * 
     * @description This function is used to delete an avatar.
     * 
     * @returns The response from the API
     */
    async deleteAvatar(): Promise<{ message: string }> {
        return this.request('/auth/users/me/avatar/', {
            method: 'DELETE',
        });
    }

    /**
     * Get all decks
     * 
     * @description This function is used to get all decks.
     * 
     * @returns The response from the API
     */
    async getDecks(): Promise<Deck[]> {
        const response = await this.request<{ results: Deck[] }>('/decks/');
        return response.results || response;
    }

    /**
     * Get a deck
     * 
     * @description This function is used to get a deck.
     * 
     * @param id - The ID of the deck
     * 
     * @returns The response from the API
     */
    async getDeck(id: number): Promise<Deck> {
        return this.request(`/decks/${id}/`);
    }

    /**
     * Get a deck with cards
     * 
     * @description This function is used to get a deck with cards.
     * 
     * @param id - The ID of the deck
     * 
     * @returns The response from the API
     */
    async getDeckWithCards(id: number): Promise<Deck> {
        return this.request(`/decks/${id}/`);
    }

    /**
     * Create a deck
     * 
     * @description This function is used to create a deck.
     * 
     * @param data - The data for the deck
     * 
     * @returns The response from the API
     */
    async createDeck(data: CreateDeckFormData): Promise<Deck> {
        return this.request('/decks/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Update a deck
     * 
     * @description This function is used to update a deck.
     * 
     * @param id - The ID of the deck
     * @param data - The data for the update
     * 
     * @returns The response from the API
     */
    async updateDeck(id: number, data: Partial<CreateDeckFormData>): Promise<Deck> {
        return this.request(`/decks/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    /**
     * Delete a deck
     * 
     * @description This function is used to delete a deck.
     * 
     * @param id - The ID of the deck
     * 
     * @returns The response from the API
     */
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

    /**
     * Get all cards
     * 
     * @description This function is used to get all cards.
     * 
     * @param deckId - The ID of the deck
     * 
     * @returns The response from the API
     */
    async getCards(deckId?: number): Promise<Card[]> {
        const params = deckId ? `?deck=${deckId}` : '';
        const response = await this.request<{ results: Card[] }>(`/cards/${params}`);
        return response.results || response;
    }

    /**
     * Create a card
     * 
     * @description This function is used to create a card.
     * 
     * @param data - The data for the card
     * 
     * @returns The response from the API
     */
    async createCard(data: CreateCardFormData): Promise<Card> {
        return this.request('/cards/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Update a card
     * 
     * @description This function is used to update a card.
     * 
     * @param id - The ID of the card
     * @param data - The data for the update
     * 
     * @returns The response from the API
     */
    async updateCard(id: number, data: Partial<CreateCardFormData>): Promise<Card> {
        return this.request(`/cards/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    /**
     * Delete a card
     * 
     * @description This function is used to delete a card.
     * 
     * @param id - The ID of the card
     * 
     * @returns The response from the API
     */
    async deleteCard(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/cards/${id}/`, {
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

    /**
     * Get cards for a learning session
     * 
     * @description This function is used to get the cards for a learning session.
     * 
     * @param sessionId - The ID of the session
     * 
     * @returns The response from the API
     */
    async getCardsForSession(sessionId: number): Promise<Card[]> {
        return this.request(`/learning-sessions/${sessionId}/cards/`);
    }

    /**
     * Create a learning session
     * 
     * @description This function is used to create a learning session.
     * 
     * @param deckId - The ID of the deck
     * 
     * @returns The response from the API
     */
    async createLearningSession(deckId: number): Promise<LearningSession> {
        return this.request('/learning-sessions/', {
            method: 'POST',
            body: JSON.stringify({ deck_id: deckId }),
        });
    }

    /**
     * Update a learning session
     * 
     * @description This function is used to update a learning session.
     * 
     * @param sessionId - The ID of the session
     * @param status - The status of the session
     * @param endedAt - The date and time the session ended
     * 
     * @returns The response from the API
     */
    async updateLearningSession(sessionId: number, status: string, endedAt?: string): Promise<LearningSession> {
        const data: any = { status };
        if (endedAt) {
            data.ended_at = endedAt;
        }
        
        return this.request(`/learning-sessions/${sessionId}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    /**
     * Complete a learning session
     * 
     * @description This function is used to complete a learning session.
     * 
     * @param sessionId - The ID of the session
     * 
     * @returns The response from the API
     */
    async completeLearningSession(sessionId: number): Promise<LearningSession> {
        return this.request(`/learning-sessions/${sessionId}/complete/`, {
            method: 'POST',
        });
    }

    /**
     * Create a card review
     * 
     * @description This function is used to create a card review.
     * 
     * @param sessionId - The ID of the session
     * @param cardId - The ID of the card
     * @param isCorrect - Whether the card was correct
     * @param timeTaken - The time taken to answer the card
     * 
     * @returns The response from the API
     */
    async createCardReview(
        sessionId: number, 
        cardId: number, 
        isCorrect: boolean, 
        timeTaken?: number
    ): Promise<CardReview> {
        const data: any = {
            session_id: sessionId,
            card_id: cardId,
            is_correct: isCorrect,
        };
        
        if (timeTaken !== undefined) {
            data.time_taken = timeTaken;
        }
        
        console.log('Creating CardReview:', data);
        
        return this.request('/card-reviews/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Get user learning statistics for SRS dashboard
     * 
     * @description This function is used to get SRS-specific learning statistics.
     * 
     * @returns The user learning statistics
     */
    async getUserLearningStats(): Promise<UserLearningStats> {
        return this.request('/learning-stats/');
    }

    /**
     * Get deck statistics for SRS dashboard
     * 
     * @description This function is used to get SRS-specific statistics for all user's decks.
     * 
     * @returns Array of deck statistics
     */
    async getDeckStats(): Promise<DeckStats[]> {
        return this.request('/decks/stats/');
    }

    /**
     * Generate a deck
     * 
     * @description This function is used to generate a deck.
     * 
     * @param data - The data for the generation
     * 
     * @returns The response from the API
     */
    async generateDeck(data: GenerateDeck): Promise<{ message: string; deck: Deck; cards_created: number }> {
        const url = `${API_BASE_URL}/ai/generate/`;
        const token = localStorage.getItem('access_token');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
                signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(
                    errorData.error || errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
                    response.status
                );
            }
            
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof ApiError) {
                throw error;
            }
            if (error instanceof Error && error.name === 'AbortError') {
                throw new ApiError('Zeitüberschreitung: Die Generierung hat zu lange gedauert');
            }
            throw new ApiError(`Netzwerkfehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
        }
    }

    /**
     * Check the correctness of an answer
     * 
     * @description This function is used to check the correctness of an answer.
     * 
     * @param data - The data for the check
     * 
     * @returns The response from the API
     */
    async checkAnswerCorrectness(data: CheckAnswerCorrectness): Promise<{ 
        similarity: number; 
        category: string; 
        feedback: string; 
        is_correct: boolean 
    }> {
        return this.request('/ai/check-answer/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

/**
 * The API instance
 */
export const api = new Api();