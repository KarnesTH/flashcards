import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Deck, Card, CreateCardFormData } from '../../types/types';
import MarkdownPreview from './MarkdownPreview';
import Editor from '../editor/Editor';

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
    const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
    const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
    const [editingCardType, setEditingCardType] = useState<'front' | 'back'>('front');

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
     * openEditor
     * 
     * @description openEditor is the function that opens the editor modal.
     */
    const openEditor = (cardIndex: number, cardType: 'front' | 'back') => {
        setEditingCardIndex(cardIndex);
        setEditingCardType(cardType);
        setIsEditorModalOpen(true);
    };

    /**
     * closeEditor
     * 
     * @description closeEditor is the function that closes the editor modal.
     */
    const closeEditor = () => {
        setIsEditorModalOpen(false);
        setEditingCardIndex(null);
        setEditingCardType('front');
    };

    /**
     * handleEditorSave
     * 
     * @description handleEditorSave is the function that saves the edited card.
     */
    const handleEditorSave = (text: string) => {
        if (editingCardIndex !== null) {
            updateCard(editingCardIndex, editingCardType, text);
        }
        closeEditor();
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

            {/* Card Preview */}
            <div className="md:col-span-2">
                {activeCard ? (
                    <div className="space-y-6">
                        {/* Front Card */}
                        <div className="preview-card md:w-xl w-full h-80 rounded-xl overflow-hidden relative group mx-auto">
                            <button
                                onClick={() => openEditor(activeCardIndex!, 'front')}
                                className="absolute top-4 -right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg z-10"
                                title="Frage bearbeiten"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-primary-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                            </button>
                            <div className="flex flex-col gap-4 justify-center items-center">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                                    Frage
                                </h3>
                                <div className="prose p-4">
                                    <MarkdownPreview markdown={activeCard.front} />
                                </div>
                            </div>
                        </div>

                        {/* Back Card */}
                        <div className="preview-card md:w-xl w-full h-80 rounded-xl overflow-hidden relative group mx-auto">
                            <button
                                onClick={() => openEditor(activeCardIndex!, 'back')}
                                className="absolute top-4 -right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg z-10"
                                title="Antwort bearbeiten"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-primary-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                            </button>
                            <div className="flex flex-col gap-4 justify-center items-center">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                                    Antwort
                                </h3>
                                <div className="prose p-4">
                                    <MarkdownPreview markdown={activeCard.back} />
                                </div>
                            </div>
                        </div>
                    </div>
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

            {/* Editor Modal */}
            {isEditorModalOpen && editingCardIndex !== null && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-border">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                                {editingCardType === 'front' ? 'Frage bearbeiten' : 'Antwort bearbeiten'}
                            </h2>
                            <button
                                onClick={closeEditor}
                                className="px-4 py-2 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors"
                            >
                                Schließen
                            </button>
                        </div>
                        <div className="flex-1 p-6 overflow-hidden">
                            <Editor
                                text={editingCardIndex !== null ? (editingCardType === 'front' ? cards[editingCardIndex].front : cards[editingCardIndex].back) : ''}
                                cardType={editingCardType}
                                onSave={handleEditorSave}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CardEditor; 