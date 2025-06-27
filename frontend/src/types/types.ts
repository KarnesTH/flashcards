// User Types
export interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    last_active?: string;
    is_public: boolean;
    avatar?: string;
    avatar_url: string;
    total_cards_created: number;
    total_decks_created: number;
    total_learning_sessions: number;
    total_cards_reviewed: number;
    total_correct_answers: number;
    learning_accuracy: number;
}

// SRS-specific Types
export interface DeckStats {
    id: number;
    due_cards_count: number;
    average_ease_factor: number;
    last_session_date?: string;
    last_session_accuracy?: number;
    next_review_date?: string;
}

export interface UserLearningStats {
    due_cards_count: number;
    learning_streak: number;
    average_response_time: number;
    recent_accuracy: number;
}

// Deck Types
export interface Deck {
    id: number;
    title: string;
    description: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    owner: User;
    card_count: number;
    cards?: Card[];
}

// Card Types
export interface Card {
    id: number;
    front: string;
    back: string;
    created_at: string;
    updated_at: string;
}

// Learning Session Types
export interface LearningSession {
    id: number;
    user: User;
    deck: Deck;
    status: 'active' | 'completed' | 'abandoned';
    started_at: string;
    ended_at?: string;
    reviews_count: number;
}

export interface CardReview {
    id: number;
    session: LearningSession;
    card: Card;
    is_correct: boolean;
    time_taken: number;
    created_at: string;
}

// Form Types
export interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginFormData {
    username: string;
    password: string;
}

export interface CreateDeckFormData {
    title: string;
    description: string;
    is_public: boolean;
}

export interface CreateCardFormData {
    front: string;
    back: string;
    deck: number;
}

export interface GenerateDeck {
    prompt: string;
    language: string;
}

export interface CheckAnswerCorrectness {
    answer: string;
    user_answer: string;
}