import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Deck, Card, CreateCardFormData } from '../../types/types';
import MarkdownPreview from './MarkdownPreview';

/**
 * CardEditorProps
 * 
 * @description CardEditorProps is the props for the CardEditor component.
 */
interface CardEditorProps {
    deck: Deck;
}

/**
 * CardEditor
 * 
 * @description CardEditor is the main component for the CardEditor.
 * 
 * @param deck - The deck to edit.
 * 
 * @returns The CardEditor component.
 */
const CardEditor = ({ deck }: CardEditorProps) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

    useEffect(() => {
        setCards(deck.cards || []);
        if (deck.cards && deck.cards.length > 0) {
            setActiveCardIndex(0);
        } else {
            setActiveCardIndex(null);
        }
    }, [deck]);

    /**
     * handleSave
     * 
     * @description handleSave is the function that saves the cards to the database.
     */
    const handleSave = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const existingCards = await api.getCards(deck.id);
            for (const card of existingCards) {
                await api.deleteCard(card.id);
            }

            for (const card of cards) {
                if (card.front.trim() || card.back.trim()) {
                    const newCard: CreateCardFormData = {
                        deck: deck.id,
                        front: card.front,
                        back: card.back,
                    };
                    await api.createCard(newCard);
                }
            }
        } catch (err) {
            console.error('Fehler beim Speichern der Karten:', err);
            setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * addCard
     * 
     * @description addCard is the function that adds a new card to the deck.
     */
    const addCard = () => {
        const newCard: Card = {
            id: Date.now(),
            front: '',
            back: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const newCards = [...cards, newCard];
        setCards(newCards);
        setActiveCardIndex(newCards.length - 1);
    };

    /**
     * removeCard
     * 
     * @description removeCard is the function that removes a card from the deck.
     */
    const removeCard = (index: number) => {
        const newCards = cards.filter((_, i) => i !== index);
        setCards(newCards);
        if (activeCardIndex === index) {
            setActiveCardIndex(newCards.length > 0 ? Math.max(0, index - 1) : null);
        } else if (activeCardIndex !== null && activeCardIndex > index) {
            setActiveCardIndex(activeCardIndex - 1);
        }
    };

    /**
     * updateCard
     * 
     * @description updateCard is the function that updates a card in the deck.
     */
    const updateCard = (index: number, field: 'front' | 'back', value: string) => {
        const newCards = [...cards];
        newCards[index] = { ...newCards[index], [field]: value };
        setCards(newCards);
    };

    /**
     * activeCard
     * 
     * @description activeCard is the function that returns the active card.
     */
    const activeCard = activeCardIndex !== null ? cards[activeCardIndex] : null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full mb-6">
            {/* Card List */}
            <div className="md:col-span-1 bg-background border border-border rounded-lg p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Karten</h2>
                    <button onClick={addCard} className="px-3 py-1.5 rounded-md bg-accent-500 text-white hover:bg-accent-600 transition-colors text-sm font-medium">
                        Neue Karte
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow">
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => setActiveCardIndex(index)}
                            className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                                activeCardIndex === index ? 'bg-primary-500/10' : 'hover:bg-background/50'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <p className="font-medium text-foreground truncate pr-2">
                                    {card.front.split('\n')[0].replace(/^#+ /, '') || `Karte ${index + 1}`}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeCard(index);
                                    }}
                                    className="text-foreground/50 hover:text-red-500 transition-colors flex-shrink-0"
                                >
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 md:size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                     <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-medium transition-colors"
                    >
                        {isLoading ? 'Speichern...' : 'Alle Änderungen speichern'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            </div>

            {/* Editor */}
            <div className="md:col-span-2 space-y-6">
                {activeCard ? (
                    <>
                        {/* Front side of the card */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="px-6 py-3">
                                <h3 
                                    className="text-lg font-semibold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent"
                                >
                                    Vorderseite (Frage)
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <textarea
                                    value={activeCard.front}
                                    onChange={(e) => updateCard(activeCardIndex!, 'front', e.target.value)}
                                    className="w-full p-4 rounded-lg border border-gray-300 bg-gray-50 resize-none font-mono text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="## Frage im Markdown-Format..."
                                />
                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 prose">
                                    <h4 className="text-sm font-medium text-gray-600 mb-3">Vorschau:</h4>
                                    <MarkdownPreview markdown={activeCard.front} />
                                </div>
                            </div>
                        </div>

                        {/* Back side of the card */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="px-6 py-3">
                                <h3 
                                    className="text-lg font-semibold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent"
                                >
                                    Rückseite (Antwort)
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <textarea
                                    value={activeCard.back}
                                    onChange={(e) => updateCard(activeCardIndex!, 'back', e.target.value)}
                                    className="w-full p-4 rounded-lg border border-gray-300 bg-gray-50 resize-none font-mono text-sm min-h-[120px] focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Antwort..."
                                />
                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                    <h4 className="text-sm font-medium text-gray-600 mb-3">Vorschau:</h4>
                                    <div className="text-gray-800">
                                        {activeCard.back || <span className="text-gray-400 italic">Keine Antwort eingegeben</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 text-lg">Wähle eine Karte aus oder erstelle eine neue.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardEditor; 