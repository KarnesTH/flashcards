import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Deck, LearningSession as LearningSessionType } from '../../types/types';
import CardFlip from './CardFlip';

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

    const handlePrevious = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
        }
    };

    const completeSession = async () => {
        if (!session) return;

        try {
            await api.updateLearningSession(session.id, 'completed', new Date().toISOString());
            
            setIsCompleted(true);
        } catch (err) {
            console.error('Fehler beim Beenden der Session:', err);
            setIsCompleted(true);
        }
    };

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
            <div className="max-w-2xl mx-auto text-center">
                <div className="bg-background rounded-2xl shadow-lg border border-border p-8 mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-6">
                        Lernsession abgeschlossen!
                    </h1>
                    
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">{sessionStats.correct}</div>
                            <div className="text-sm text-foreground/60">Richtig</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-500">{sessionStats.incorrect}</div>
                            <div className="text-sm text-foreground/60">Falsch</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary-500">{Math.round(accuracy)}%</div>
                            <div className="text-sm text-foreground/60">Genauigkeit</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={handleBackToDashboard}
                            className="w-full px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                        >
                            Zurück zum Dashboard
                        </button>
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full px-6 py-3 rounded-lg bg-background border border-border text-foreground hover:bg-primary-500/10 font-medium transition-colors"
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