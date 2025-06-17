import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Deck, Card, Tag } from '../../types/types';

interface DeckModalProps {
    isOpen: boolean;
    onClose: () => void;
    deck?: Deck | null;
    onSave: (deck: Deck) => void;
}

interface DeckFormData {
    title: string;
    description: string;
    tags: string[];
}

const DeckModal = ({ isOpen, onClose, deck, onSave }: DeckModalProps) => {
    const [formData, setFormData] = useState<DeckFormData>({
        title: '',
        description: '',
        tags: []
    });
    const [cards, setCards] = useState<Card[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        if (deck) {
            setFormData({
                title: deck.title,
                description: deck.description,
                tags: deck.tags.map(tag => tag.name)
            });
            setCards(deck.cards);
        } else {
            setFormData({
                title: '',
                description: '',
                tags: []
            });
            setCards([]);
        }
        setError(null);
    }, [deck, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const deckData: Partial<Deck> = {
                title: formData.title,
                description: formData.description,
                tags: formData.tags.map((name, index) => ({ id: index + 1, name })),
                cards: cards
            };

            console.log('Sende Deck-Daten an API:', deckData);
            console.log('Anzahl Karten:', cards.length);

            let savedDeck: Deck;
            if (deck) {
                console.log('Aktualisiere bestehendes Deck:', deck.id);
                savedDeck = await api.updateDeck({ ...deck, ...deckData } as Deck);
            } else {
                console.log('Erstelle neues Deck');
                savedDeck = await api.createDeck(deckData as Deck);
            }

            console.log('Antwort von API:', savedDeck);
            onSave(savedDeck);
            onClose();
        } catch (err) {
            console.error('Fehler beim Speichern des Decks:', err);
            setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
        } finally {
            setIsLoading(false);
        }
    };

    const addCard = () => {
        const newCard: Card = {
            id: Date.now(),
            front: '',
            back: ''
        };
        setCards([...cards, newCard]);
    };

    const updateCard = (index: number, field: 'front' | 'back', value: string) => {
        const updatedCards = [...cards];
        updatedCards[index] = { ...updatedCards[index], [field]: value };
        setCards(updatedCards);
    };

    const removeCard = (index: number) => {
        setCards(cards.filter((_, i) => i !== index));
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, newTag.trim()]
            });
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-2xl shadow-xl border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-2xl font-bold text-foreground">
                        {deck ? 'Deck bearbeiten' : 'Neues Deck erstellen'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-foreground/60 hover:text-foreground transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                <p className="text-red-500 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Deck-Informationen */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Titel *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Beschreibung
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Tags
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="Tag hinzufügen..."
                                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                                    >
                                        Hinzufügen
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-sm"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-primary-700"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Karten */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-foreground">Karten</h3>
                                <button
                                    type="button"
                                    onClick={addCard}
                                    className="px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Karte hinzufügen
                                </button>
                            </div>

                            {cards.length === 0 ? (
                                <div className="text-center py-8 text-foreground/60">
                                    <p>Noch keine Karten hinzugefügt</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cards.map((card, index) => (
                                        <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium text-foreground">Karte {index + 1}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCard(index)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground/60 mb-1">
                                                        Vorderseite
                                                    </label>
                                                    <textarea
                                                        value={card.front}
                                                        onChange={(e) => updateCard(index, 'front', e.target.value)}
                                                        rows={3}
                                                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                                        placeholder="Frage oder Begriff..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground/60 mb-1">
                                                        Rückseite
                                                    </label>
                                                    <textarea
                                                        value={card.back}
                                                        onChange={(e) => updateCard(index, 'back', e.target.value)}
                                                        rows={3}
                                                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                                        placeholder="Antwort oder Definition..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-background/50 transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.title.trim()}
                            className="px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 disabled:cursor-not-allowed text-white font-medium transition-colors"
                        >
                            {isLoading ? 'Speichern...' : (deck ? 'Aktualisieren' : 'Erstellen')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeckModal; 