import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Deck, User } from '../../types/types';
import DashboardCard from './DashboardCard';
import DashboardStats from './DashboardStats';
import DeckModal from '../modals/DeckModal';

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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

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

            const [userData, decksData] = await Promise.all([
                api.getCurrentUser(),
                api.getDecks()
            ]);
            
            setUser(userData);
            setDecks(decksData);

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
    const handleSaveDeck = async (deck: Deck) => {
        if (editingDeck) {
            setDecks(decks.map(d => d.id === deck.id ? deck : d));
        } else {
            setDecks([deck, ...decks]);
        }
        setEditingDeck(null);
        
        await loadDashboardData();
    };

    /**
     * Open Create Modal
     * 
     * @description This function is used to open the create modal.
     * 
     */
    const openCreateModal = () => {
        setEditingDeck(null);
        setIsModalOpen(true);
    };

    /**
     * Open Edit Modal
     * 
     * @description This function is used to open the edit modal.
     * 
     * @param deck - The deck to edit
     * 
     */
    const openEditModal = async (deck: Deck) => {
        try {
            const deckWithCards = await api.getDeckWithCards(deck.id);
            setEditingDeck(deckWithCards);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Fehler beim Laden der Deck-Daten:', error);
            setEditingDeck(deck);
            setIsModalOpen(true);
        }
    };

    /**
     * Close Modal
     * 
     * @description This function is used to close the modal.
     * 
     */
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDeck(null);
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

    return (
        <div className="space-y-6">
            <DashboardStats 
                cards={user?.total_cards_created || 0} 
                decks={decks.length} 
                learnedCards={user?.total_cards_reviewed || 0} 
                averageScore={user?.learning_accuracy || 0} 
                learningSessions={user?.total_learning_sessions || 0}
                totalReviews={user?.total_cards_reviewed || 0}
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
                            onClick={openCreateModal}
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

                {decks.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-foreground/60">Noch keine Decks erstellt</p>
                        <button 
                            onClick={openCreateModal}
                            className="mt-4 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors inline-block"
                        >
                            Erstelle dein erstes Deck
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {decks.map((deck) => (
                            <DashboardCard 
                                key={deck.id} 
                                {...deck} 
                                onDelete={handleDeleteDeck}
                                onEdit={() => openEditModal(deck)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <DeckModal
                isOpen={isModalOpen}
                onClose={closeModal}
                deck={editingDeck}
                onSave={handleSaveDeck}
            />
        </div>
    );
}

export default DashboardContent; 