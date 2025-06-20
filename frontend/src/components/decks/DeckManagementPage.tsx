import { useState, useEffect } from 'react';
import type { Deck } from '../../types/types';
import { api } from '../../lib/api';
import CardEditor from '../cards/CardEditor';
import DeckModal from '../modals/DeckModal';

/**
 * DeckManagementPageProps
 * 
 * @description DeckManagementPageProps is the props for the DeckManagementPage component.
 */
interface DeckManagementPageProps {
    deckId: number;
    onBack: () => void;
}

/**
 * DeckManagementPage
 * 
 * @description DeckManagementPage is the main component for the DeckManagementPage.
 * 
 * @param deckId - The id of the deck to edit.
 * @param onBack - The function to call when the user wants to go back.
 * 
 * @returns The DeckManagementPage component.
 */
const DeckManagementPage = ({ deckId, onBack }: DeckManagementPageProps) => {
    const [deck, setDeck] = useState<Deck | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchDeck = async () => {
            try {
                setIsLoading(true);
                const fetchedDeck = await api.getDeckWithCards(deckId);
                setDeck(fetchedDeck);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Deck konnte nicht geladen werden.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDeck();
    }, [deckId]);

    /**
     * handleDeckSave
     * 
     * @description handleDeckSave is the function that saves the deck to the database.
     * 
     * @param updatedDeck - The updated deck.
     */
    const handleDeckSave = (updatedDeck: Deck) => {
        setDeck(prevDeck => ({ ...updatedDeck, cards: prevDeck!.cards }));
    };
    
    if (isLoading) {
        return <div className="text-center py-10">Lade Deck...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">Fehler: {error}</div>;
    }

    if (!deck) {
        return null;
    }

    return (
        <>
            <div className="mb-8">
                <button onClick={onBack} className="text-primary-500 hover:underline">
                    &larr; Zurück zur Übersicht
                </button>
                <div className="flex justify-between items-start mt-2">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                            {deck.title}
                        </h1>
                        {deck.description && <p className="text-foreground/80 mt-2 max-w-2xl">{deck.description}</p>}
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-background/50 transition-colors"
                    >
                        Deck-Info bearbeiten
                    </button>
                </div>
            </div>

            <CardEditor deck={deck} />

            <DeckModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                deck={deck}
                onSave={handleDeckSave}
            />
        </>
    );
};

export default DeckManagementPage; 