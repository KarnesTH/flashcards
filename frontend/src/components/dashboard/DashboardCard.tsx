import { useState } from "react";
import { api } from "../../lib/api";
import type { Card } from "../../types/types";
import ConfirmDialog from "../dialogs/ConfirmDialog";

/**
 * DashboardCardProps
 * 
 * @description This interface is used to define the props for the DashboardCard component.
 */
interface DashboardCardProps {
    id: number;
    title: string;
    description: string;
    cards?: Card[];
    created_at?: string;
    updated_at?: string;
    is_public?: boolean;
    card_count: number;
    onDelete?: (deckId: number) => void;
    onEdit?: (deck: any) => void;
}

/**
 * DashboardCard component
 * 
 * @description This component is used to display a deck on the dashboard.
 * 
 * @param id - The id of the deck
 * @param title - The title of the deck
 * @param description - The description of the deck
 * @param cards - The cards of the deck
 * @param created_at - The date the deck was created
 * @param updated_at - The date the deck was last updated
 * @param is_public - Whether the deck is public
 * @param card_count - The number of cards in the deck
 * @param onDelete - The function to delete the deck
 * @param onEdit - The function to edit the deck
 * 
 * @param props - The props for the DashboardCard component
 */
const DashboardCard = ({ 
    id, 
    title = '', 
    description = '', 
    cards = [], 
    created_at,
    updated_at,
    is_public = false,
    card_count = 0,
    onDelete,
    onEdit
}: DashboardCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loadedCards, setLoadedCards] = useState<Card[]>(cards);
    const [isLoadingCards, setIsLoadingCards] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    /**
     * formatDate
     * 
     * @description This function is used to format the date.
     * 
     * @param dateString - The date string to format
     * @returns The formatted date
     */
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Unbekannt';
        try {
            return new Intl.DateTimeFormat('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(new Date(dateString));
        } catch (error) {
            return 'Ungültiges Datum';
        }
    };

    /**
     * handleDelete
     * 
     * @description This function is used to delete a deck.
     * 
     */
    const handleDelete = () => {
        if (onDelete) {
            onDelete(id);
            setIsDialogOpen(false);
        }
    };

    const handleDeleteConfirm = () => {
        setIsDialogOpen(true);
    };

    /**
     * handleLearn
     * 
     * @description This function is used to navigate to the learn page.
     * 
     */
    const handleLearn = () => {
        window.location.href = `/learn?deckId=${id}`;
    };

    /**
     * handleEdit
     * 
     * @description This function is used to edit a deck.
     * 
     */
    const handleEdit = () => {
        if (onEdit) {
            onEdit({ id, title, description, cards: loadedCards, is_public });
        } else {
            window.location.href = `/decks/${id}/edit`;
        }
    };

    /**
     * handleToggle
     * 
     * @description This function is used to toggle the expansion of the deck.
     * 
     */
    const handleToggle = async () => {
        if (!isOpen && loadedCards.length === 0) {
            setIsLoadingCards(true);
            try {
                const deckWithCards = await api.getDeckWithCards(id);
                setLoadedCards(deckWithCards.cards || []);
            } catch (error) {
                console.error('Fehler beim Laden der Karten:', error);
            } finally {
                setIsLoadingCards(false);
            }
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="bg-background rounded-2xl shadow-lg border border-border p-6 hover:border-primary-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        {title}
                    </h3>
                    <p className="text-foreground/60 text-sm mt-1">
                        {card_count} {card_count === 1 ? 'Karte' : 'Karten'}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    {/* Edit Button */}
                    <button 
                        onClick={handleEdit}
                        className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-primary-500/10 transition-colors"
                        title="Bearbeiten"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    
                    {/* Delete Button */}
                    <button 
                        onClick={handleDeleteConfirm}
                        className="p-2 rounded-lg text-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Löschen"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    
                    {/* Expand/Collapse Button */}
                    <button 
                        onClick={handleToggle}
                        className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-primary-500/10 transition-colors"
                        title={isOpen ? 'Einklappen' : 'Aufklappen'}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-4 w-4 text-primary-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                            stroke="currentColor"
                        >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            <p className="text-foreground text-sm mb-4 line-clamp-2">
                {description}
            </p>

            <div className="flex justify-between items-center text-xs text-foreground/60">
                <span>Erstellt: {formatDate(created_at || '')}</span>
                <span>Bearbeitet: {formatDate(updated_at || '')}</span>
            </div>

            {isOpen && loadedCards && loadedCards.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="space-y-3">
                        {loadedCards.map((card) => (
                            <div 
                                key={card.id}
                                className="bg-background rounded-lg border border-border p-3 hover:border-primary-500/50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                                    <p className="text-sm text-foreground line-clamp-1">
                                        {card.front}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button 
                            onClick={handleLearn}
                            className="flex-1 px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
                        >
                            Lernen
                        </button>
                    </div>
                </div>
            )}

            {isOpen && isLoadingCards && (
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                    </div>
                </div>
            )}

            {isOpen && !isLoadingCards && (!loadedCards || loadedCards.length === 0) && (
                <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-foreground/60 text-sm text-center py-4">
                        Noch keine Karten in diesem Deck
                    </p>
                    <a 
                        href={`/decks/${id}/cards/new`}
                        className="block w-full px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors text-center"
                    >
                        Karte hinzufügen
                    </a>
                </div>
            )}
            {isDialogOpen && (
                <ConfirmDialog
                    title="Deck löschen"
                    message="Möchtest du dieses Deck wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    onContinue={handleDelete}
                />
            )}
        </div>
    );
}

export default DashboardCard;