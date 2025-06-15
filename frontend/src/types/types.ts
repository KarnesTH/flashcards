/* Types */

// User Types
export interface User {
    id: number;
    username: string;
    email: string;
}

// Deck Types
export interface Deck {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    tags: Tag[];
    cards: Card[];
}

// Card Types
export interface Card {
    id: number;
    front: string;
    back: string;
}

// Stats Types
export interface Stats {
    totalCards: number;
    decksCreated: number;
    cardsLearned: number;
    averageScore: number;
}

// Tag Types
export interface Tag {
    id: number;
    name: string;
}

/* Form Types */

// Register Form Data
export interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// Login Form Data
export interface LoginFormData {
    username: string;
    password: string;
}
