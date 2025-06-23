import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Deck, LearningSession as LearningSessionType } from '../../types/types';
import CardFlip from './CardFlip';

/**
 * LearningSession component
 * 
 * @description This component is used to display the learning session.
 * 
 * @returns The LearningSession component
 */
const LearningSession = () => {
    const [deckId, setDeckId] = useState<string | null>(null);
    const [deck, setDeck] = useState<Deck | null>(null);
    const [session, setSession] = useState<LearningSessionType | null>(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [sessionStats, setSessionStats] = useState({
        correct: 0,
        incorrect: 0,
        total: 0
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const deckIdFromUrl = urlParams.get('deckId');
        setDeckId(deckIdFromUrl);

        if (!deckIdFromUrl) {
            setError('Kein Deck ausgewählt');
            setIsLoading(false);
            return;
        }

        initializeSession(deckIdFromUrl);
    }, []);

    /**
     * Initialize Session
     * 
     * @description This function is used to initialize the learning session.
     * 
     * @param deckIdParam - The id of the deck to initialize the session for
     */
    const initializeSession = async (deckIdParam: string) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const deckData = await api.getDeckWithCards(parseInt(deckIdParam));
            setDeck(deckData);

            const sessionData = await api.createLearningSession(parseInt(deckIdParam));
            setSession(sessionData);

            setSessionStats(prev => ({ ...prev, total: deckData.cards?.length || 0 }));

        } catch (err) {
            console.error('Fehler beim Initialisieren der Lernsession:', err);
            setError(err instanceof Error ? err.message : 'Fehler beim Laden des Decks');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle Card Answer
     * 
     * @description This function is used to handle the card answer.
     * 
     * @param isCorrect - Whether the user's answer was correct
     * @param timeTaken - The time taken to answer the question
     */
    const handleCardAnswer = async (isCorrect: boolean, timeTaken?: number) => {
        if (!session || !deck || !deck.cards) return;

        try {
            const currentCard = deck.cards[currentCardIndex];
            
            await api.createCardReview(
                session.id,
                currentCard.id,
                isCorrect,
                undefined,
                timeTaken
            );

            setSessionStats(prev => ({
                ...prev,
                correct: prev.correct + (isCorrect ? 1 : 0),
                incorrect: prev.incorrect + (isCorrect ? 0 : 1)
            }));

            if (currentCardIndex < deck.cards.length - 1) {
                setCurrentCardIndex(prev => prev + 1);
            } else {
                await api.updateLearningSession(session.id, 'completed', new Date().toISOString());
                setIsCompleted(true);
            }

        } catch (err) {
            console.error('Fehler beim Speichern der Antwort:', err);
            if (currentCardIndex < (deck?.cards?.length || 0) - 1) {
                setCurrentCardIndex(prev => prev + 1);
            } else {
                try {
                    await api.updateLearningSession(session.id, 'completed', new Date().toISOString());
                } catch (sessionError) {
                    console.error('Fehler beim Beenden der Session:', sessionError);
                }
                setIsCompleted(true);
            }
        }
    };

    /**
     * Handle Previous
     * 
     * @description This function is used to handle the previous card.
     * 
     */
    const handlePrevious = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
        }
    };

    /**
     * Handle Abandon
     * 
     * @description This function is used to handle the abandon of the learning session.
     * 
     */
    const handleAbandon = async () => {
        if (!session) return;

        if (confirm('Möchten Sie diese Lernsession wirklich abbrechen?')) {
            try {
                await api.updateLearningSession(session.id, 'abandoned', new Date().toISOString());
                window.location.href = '/dashboard';
            } catch (err) {
                console.error('Fehler beim Abbrechen der Session:', err);
                window.location.href = '/dashboard';
            }
        }
    };

    /**
     * Handle Back to Dashboard
     * 
     * @description This function is used to handle the back to the dashboard.
     * 
     */
    const handleBackToDashboard = () => {
        window.location.href = '/dashboard';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-foreground/60 mb-4">{error}</p>
                <button 
                    onClick={handleBackToDashboard}
                    className="px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                >
                    Zurück zum Dashboard
                </button>
            </div>
        );
    }

    if (isCompleted) {
        const accuracy = sessionStats.total > 0 ? (sessionStats.correct / sessionStats.total) * 100 : 0;
        
        return (
            <div className="max-w-2xl mx-auto text-center py-8">
                <div className="border border-border rounded-xl shadow-2xl shadow-foreground/10 bg-background p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-6">
                        Lernsession abgeschlossen!
                    </h1>
                    
                    <p className="text-foreground/70 mb-8 text-lg">
                        Super gemacht! Hier ist deine Zusammenfassung:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-background/50 rounded-xl p-6">
                            <div className="text-4xl font-bold text-green-500">{sessionStats.correct}</div>
                            <div className="text-sm text-foreground/60 mt-2">Richtig</div>
                        </div>
                        <div className="bg-background/50 rounded-xl p-6">
                            <div className="text-4xl font-bold text-red-500">{sessionStats.incorrect}</div>
                            <div className="text-sm text-foreground/60 mt-2">Falsch</div>
                        </div>
                        <div className="bg-background/50 rounded-xl p-6">
                            <div className="text-4xl font-bold text-primary-500">{Math.round(accuracy)}%</div>
                            <div className="text-sm text-foreground/60 mt-2">Genauigkeit</div>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-sm mx-auto">
                        <button 
                            onClick={handleBackToDashboard}
                            className="w-full px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors shadow-lg shadow-primary-500/20"
                        >
                            Zurück zum Dashboard
                        </button>
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full px-6 py-3 rounded-lg bg-background/80 border border-border text-foreground hover:bg-primary-500/10 font-medium transition-colors"
                        >
                            Nochmal lernen
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!deck || !session || !deck.cards || deck.cards.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-foreground/60 mb-4">Keine Karten in diesem Deck gefunden</p>
                <button 
                    onClick={handleBackToDashboard}
                    className="px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                >
                    Zurück zum Dashboard
                </button>
            </div>
        );
    }

    const currentCard = deck.cards[currentCardIndex];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                            {deck.title}
                        </h1>
                        <p className="text-foreground/60">{deck.description}</p>
                    </div>
                    <button 
                        onClick={handleAbandon}
                        className="px-4 py-2 rounded-lg bg-background border border-border text-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                        Abbrechen
                    </button>
                </div>

                {/* Session Stats */}
                <div className="flex justify-center gap-6 text-sm">
                    <span className="text-green-500">✓ {sessionStats.correct} richtig</span>
                    <span className="text-red-500">✗ {sessionStats.incorrect} falsch</span>
                    <span className="text-foreground/60">{sessionStats.total - (sessionStats.correct + sessionStats.incorrect)} verbleibend</span>
                </div>
            </div>

            {/* Card Flip Component */}
            <CardFlip
                card={currentCard}
                onNext={handleCardAnswer}
                onPrevious={handlePrevious}
                isFirst={currentCardIndex === 0}
                isLast={currentCardIndex === deck.cards.length - 1}
                currentIndex={currentCardIndex}
                totalCards={deck.cards.length}
            />
        </div>
    );
};

export default LearningSession; 