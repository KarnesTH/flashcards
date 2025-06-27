import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Deck, User, UserLearningStats, DeckStats, GenerateDeck } from '../../types/types';
import DashboardCard from './DashboardCard';
import DashboardStats from './DashboardStats';
import DeckModal from '../modals/DeckModal';
import DeckManagementPage from '../decks/DeckManagementPage';
import DeckGenerateModal from '../modals/DeckGenerateModal';

/**
 * DashboardContent component
 * 
 * @description This component is used to display the dashboard content.
 * 
 * @returns The DashboardContent component
 */
const DashboardContent = () => {
    const [user, setUser] = useState<User | null>(null);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [learningStats, setLearningStats] = useState<UserLearningStats | undefined>(undefined);
    const [deckStats, setDeckStats] = useState<DeckStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [viewingDeckId, setViewingDeckId] = useState<number | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const deckId = params.get('deckId');
        if (deckId) {
            setViewingDeckId(Number(deckId));
        }
        loadDashboardData();
        
        const handleFocus = () => {
            loadDashboardData();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const updateURL = (deckId: number | null) => {
        const url = new URL(window.location.href);
        if (deckId) {
            url.searchParams.set('deckId', String(deckId));
        } else {
            url.searchParams.delete('deckId');
        }
        history.pushState({}, '', url);
    };

    /**
     * loadDashboardData function
     * 
     * @description This function is used to load the dashboard data.
     * 
     */
    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [userData, decksData, learningStatsData] = await Promise.all([
                api.getCurrentUser(),
                api.getDecks(),
                api.getUserLearningStats().catch(() => undefined)
            ]);
            
            const deckStatsData = await api.getDeckStats().catch(() => []);
            
            setUser(userData);
            setDecks(decksData);
            setLearningStats(learningStatsData);
            setDeckStats(deckStatsData);

        } catch (err) {
            console.error('Fehler beim Laden der Dashboard-Daten:', err);
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
            setDecks([]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle Delete Deck
     * 
     * @description This function is used to delete a deck.
     * 
     * @param deckId - The id of the deck to delete
     */
    const handleDeleteDeck = async (deckId: number) => {
        try {
            await api.deleteDeck(deckId);
            setDecks(decks.filter(deck => deck.id !== deckId));
        } catch (err) {
            console.error('Fehler beim Löschen des Decks:', err);
            alert('Fehler beim Löschen des Decks');
        }
    };

    /**
     * Handle Save Deck
     * 
     * @description This function is used to save a deck.
     * 
     * @param deck - The deck to save
     * 
     */
    const handleSaveDeck = (newDeck: Deck) => {
        setViewingDeckId(newDeck.id);
        updateURL(newDeck.id);
        loadDashboardData();
    };

    /**
     * Handle Select Deck
     * 
     * @description This function is used to select a deck.
     * 
     * @param deckId - The id of the deck to select
     */
    const handleSelectDeck = (deckId: number) => {
        setViewingDeckId(deckId);
        updateURL(deckId);
    };

    /**
     * Handle Back to Dashboard
     * 
     * @description This function is used to go back to the dashboard.
     * 
     */
    const handleBackToDashboard = () => {
        setViewingDeckId(null);
        updateURL(null);
        loadDashboardData();
    };

    const handleGenerateDeck = async (data: GenerateDeck) => {
        try {
            const response = await api.generateDeck(data);
            setDecks(prevDecks => [response.deck, ...prevDecks]);
            setIsGenerateModalOpen(false);
            
        } catch (err) {
            console.error('Fehler beim Generieren des Decks:', err);
            throw err;
        }
    }

    if (viewingDeckId) {
        return <DeckManagementPage deckId={viewingDeckId} onBack={handleBackToDashboard} />;
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-foreground/60">Fehler beim Laden der Daten: {error}</p>
                <button 
                    onClick={loadDashboardData}
                    className="mt-4 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                >
                    Erneut versuchen
                </button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-8">
                <p className="text-foreground/60">Benutzerdaten konnten nicht geladen werden</p>
                <button 
                    onClick={loadDashboardData}
                    className="mt-4 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                >
                    Erneut versuchen
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardStats 
                user={user}
                learningStats={learningStats}
            />

            <div className="bg-background rounded-2xl shadow-lg border border-border p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                            Deine Karteikarten
                        </h1>
                        <p className="text-foreground text-sm mt-1">
                            Verwalte und erstelle deine Lernkarten
                        </p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Neues Deck
                        </button>
                        <button
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                            </svg>
                            Mit AI generieren
                        </button>
                        <div className="relative flex-1 md:w-64">
                            <input 
                                type="text" 
                                placeholder="Suche..." 
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {decks.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-foreground/60">Noch keine Decks erstellt</p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors inline-block"
                        >
                            Erstelle dein erstes Deck
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {decks.map((deck) => {
                            const deckStat = deckStats.find(stat => stat.id === deck.id);
                            return (
                                <DashboardCard 
                                    key={deck.id} 
                                    {...deck} 
                                    deckStats={deckStat}
                                    onDelete={handleDeleteDeck}
                                    onEdit={handleSelectDeck}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            <DeckModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                deck={null}
                onSave={handleSaveDeck}
            />

            <DeckGenerateModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onSend={handleGenerateDeck}
            />
        </div>
    );
}

export default DashboardContent; 