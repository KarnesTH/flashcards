import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../../lib/api';
import type { Deck, Card, CreateCardFormData } from '../../types/types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
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
                                    {card.front.split('\n')[0] || `Karte ${index + 1}`}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeCard(index);
                                    }}
                                    className="text-foreground/50 hover:text-red-500 transition-colors flex-shrink-0"
                                >
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            <p className="text-sm text-foreground/60 truncate">
                                {card.back.split('\n')[0] || 'Keine Rückseite'}
                            </p>
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
            <div className="md:col-span-2 bg-background border border-border rounded-lg overflow-hidden flex flex-col">
                {activeCard ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px-4 bg-border h-full">
                        {/* Fronte-side Editor */}
                        <div className="bg-background p-4 flex flex-col">
                             <label className="block text-sm font-medium text-foreground mb-2">Vorderseite (Markdown)</label>
                             <textarea
                                value={activeCard.front}
                                onChange={(e) => updateCard(activeCardIndex!, 'front', e.target.value)}
                                className="w-full flex-grow p-2 rounded-md border border-border bg-background/50 resize-none font-mono text-sm"
                                placeholder="## Frage im Markdown-Format..."
                            />
                             <label className="block text-sm font-medium text-foreground mt-4 mb-2">Rückseite</label>
                             <textarea
                                value={activeCard.back}
                                onChange={(e) => updateCard(activeCardIndex!, 'back', e.target.value)}
                                className="w-full p-2 rounded-md border border-border bg-background/50 resize-none font-mono text-sm"
                                placeholder="Antwort..."
                                rows={5}
                            />
                        </div>

                        {/* Preview */}
                        <div className="bg-background p-4 overflow-y-auto gap-4 hidden md:block">
                            <h3 className="text-sm font-medium text-foreground mb-2">Vorschau</h3>
                            <div className="p-2 rounded-md border border-border bg-background/50 min-h-[100px]">
                                <ReactMarkdown
                                    children={activeCard.front}
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code: ({ className, children, ...props }) => {
                                            const match = /language-(\w+)/.exec(className || '');
                                            const isInline = !match;
                                            return !isInline ? (
                                                <SyntaxHighlighter
                                                    style={dracula}
                                                    language={match[1]}
                                                    PreTag="div"
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                    } as Components}
                                >
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-foreground/60">
                        <p>Wähle eine Karte aus oder erstelle eine neue.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardEditor; 