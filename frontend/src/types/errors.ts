export interface LoginErrors {
    username?: string;
    password?: string;
    message?: string;
}

export interface RegisterErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    message?: string;
}

export interface DeckErrors {
    title?: string;
    description?: string;
    tags?: string[];
    message?: string;
}

export interface CardErrors {
    front?: string;
    back?: string;
    message?: string;
}

export interface StatsErrors {
    totalCards?: string;
    decksCreated?: string;
    cardsLearned?: string;
    averageScore?: string;
    message?: string;
}