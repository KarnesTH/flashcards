import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Deck, Card } from '../../types/types';

/**
 * DeckModalProps interface
 * 
 * @description This interface is used to define the props for the DeckModal component.
 */
interface DeckModalProps {
    isOpen: boolean;
    onClose: () => void;
    deck?: Deck | null;
    onSave: (deck: Deck) => void;
}

/**
 * DeckFormData interface
 * 
 * @description This interface is used to define the form data for the DeckModal component.
 */
interface DeckFormData {
    title: string;
    description: string;
}

/**
 * DeckModal component
 * 
 * @description This component is used to display the deck modal.
 * 
 * @param isOpen - Whether the modal is open
 * @param onClose - The function to close the modal
 * @param deck - The deck to edit
 * @param onSave - The function to save the deck
 * 
 * @returns The DeckModal component
 */
const DeckModal = ({ isOpen, onClose, deck, onSave }: DeckModalProps) => {
    const [formData, setFormData] = useState<DeckFormData>({
        title: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (deck) {
            setFormData({
                title: deck.title,
                description: deck.description
            });
        } else {
            setFormData({
                title: '',
                description: ''
            });
        }
        setError(null);
    }, [deck, isOpen]);

    /**
     * Handle Submit
     * 
     * @description This function is used to handle the submit of the form.
     * 
     * @param e - The form event
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const deckData = {
                title: formData.title,
                description: formData.description,
                is_public: false
            };

            let savedDeck: Deck;
            if (deck) {
                try {
                    savedDeck = await api.updateDeck(deck.id, deckData);
                } catch (err) {
                    if (err instanceof Error && err.message.includes('404')) {
                        setError('Das Deck wurde nicht gefunden. Es wurde möglicherweise gelöscht.');
                        return;
                    }
                    throw err;
                }
            } else {
                savedDeck = await api.createDeck(deckData);
            }
            
            onSave(savedDeck);
            onClose();
        } catch (err) {
            console.error('Fehler beim Speichern des Decks:', err);
            setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-2xl shadow-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
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

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                <p className="text-red-500 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Deck-Informationen */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="deckTitle" className="block text-sm font-medium text-foreground mb-2">
                                    Titel *
                                </label>
                                <input
                                    type="text"
                                    id="deckTitle"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="deckDescription" className="block text-sm font-medium text-foreground mb-2">
                                    Beschreibung
                                </label>
                                <textarea
                                    id="deckDescription"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-border bg-background">
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