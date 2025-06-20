import { useState, useEffect } from 'react';
import type { Deck } from '../../types/types';
import { api } from '../../lib/api';
import CardEditor from '../cards/CardEditor';
import DeckModal from '../modals/DeckModal';

interface DeckManagementPageProps {
    deckId: number;
    onBack: () => void;
}

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