import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Deck, Stats, User } from '../../types/types';
import DashboardCard from './DashboardCard';
import DashboardStats from './DashboardStats';
import DeckModal from '../modals/DeckModal';

const DashboardContent = () => {
    const [user, setUser] = useState<User | null>(null);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const userData = await api.getCurrentUser();
            setUser(userData);

            const decksData = await api.getDecks();
            setDecks(Array.isArray(decksData) ? decksData : []);

        } catch (err) {
            console.error('Fehler beim Laden der Dashboard-Daten:', err);
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
            setDecks([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateDeck = () => {
        setEditingDeck(null);
        setIsModalOpen(true);
    };

    const handleEditDeck = (deck: Deck) => {
        setEditingDeck(deck);
        setIsModalOpen(true);
    };

    const handleSaveDeck = (savedDeck: Deck) => {
        if (editingDeck) {
            setDecks(decks.map(deck => deck.id === savedDeck.id ? savedDeck : deck));
        } else {
            setDecks([...decks, savedDeck]);
        }
    };

    const handleDeleteDeck = async (deckId: number) => {
        if (confirm('Möchten Sie dieses Deck wirklich löschen?')) {
            try {
                await api.deleteDeck(deckId);
                setDecks(decks.filter(deck => deck.id !== deckId));
            } catch (err) {
                console.error('Fehler beim Löschen des Decks:', err);
                alert('Fehler beim Löschen des Decks');
            }
        }
    };

    const handleTogglePublic = async (deckId: number, isPublic: boolean) => {
        try {
            const deckToUpdate = decks.find(deck => deck.id === deckId);
            if (!deckToUpdate) return;

            const updatedDeck = await api.updateDeck({
                ...deckToUpdate,
                is_public: isPublic
            });

            setDecks(decks.map(deck => deck.id === deckId ? updatedDeck : deck));
        } catch (err) {
            console.error('Fehler beim Ändern des Public-Status:', err);
            alert('Fehler beim Ändern des Public-Status');
        }
    };

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

    const stats: Stats = {
        totalCardsCreated: user?.stats?.totalCardsCreated || 0,
        totalCardsReviewed: user?.stats?.totalCardsReviewed || 0,
        totalLearningSessions: user?.stats?.totalLearningSessions || 0,
        averageAccuracy: user?.stats?.averageAccuracy || 0,
        lastActive: user?.stats?.lastActive || new Date().toISOString()
    };

    // Sicherheitsüberprüfung für decks
    const safeDecks = Array.isArray(decks) ? decks : [];

    return (
        <div className="space-y-6">
            <DashboardStats 
                cards={stats.totalCardsCreated} 
                decks={stats.totalLearningSessions} 
                learnedCards={stats.totalCardsReviewed} 
                averageScore={stats.averageAccuracy} 
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
                            onClick={handleCreateDeck}
                            className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Neues Deck
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

                <div className="flex flex-wrap gap-2 mb-6">
                    <button className="px-3 py-1 rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-colors">
                        Alle
                    </button>
                    <button className="px-3 py-1 rounded-lg bg-background border border-border text-foreground hover:bg-primary-500/10 transition-colors">
                        Zuletzt bearbeitet
                    </button>
                    <button className="px-3 py-1 rounded-lg bg-background border border-border text-foreground hover:bg-primary-500/10 transition-colors">
                        Meist gelernt
                    </button>
                </div>

                {safeDecks.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-foreground/60">Noch keine Decks erstellt</p>
                        <button 
                            onClick={handleCreateDeck}
                            className="mt-4 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                        >
                            Erstelle dein erstes Deck
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {safeDecks.map((deck) => (
                            <DashboardCard 
                                key={deck.id} 
                                {...deck} 
                                onEdit={handleEditDeck}
                                onDelete={handleDeleteDeck}
                                onTogglePublic={handleTogglePublic}
                            />
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <DeckModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveDeck}
                    deck={editingDeck}
                />
            )}
        </div>
    );
};

export default DashboardContent; 