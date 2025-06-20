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
    created_at: string;
    card_count: number;
    onDelete: (deckId: number) => void;
    onEdit: (deckId: number) => void;
}

/**
 * DashboardCard component
 * 
 * @description This component is used to display a deck on the dashboard.
 * 
 * @param id - The id of the deck
 * @param title - The title of the deck
 * @param description - The description of the deck
 * @param created_at - The date the deck was created
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
    created_at = '',
    card_count = 0,
    onDelete,
    onEdit
}: DashboardCardProps) => {
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
        onEdit(id);
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
                    {/* Learn Button */}
                    <button
                        onClick={handleLearn}
                        className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-primary-500/10 transition-colors"
                        title="Lernen"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.433 7.418c.158-.103.358-.103.516 0l3.933 2.582a.5.5 0 010 .836l-3.933 2.582a.5.5 0 01-.774-.418V7.836a.5.5 0 01.258-.418z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2-1a1 1 0 00-1 1v8a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1H4z" clipRule="evenodd" />
                        </svg>
                    </button>

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
                </div>
            </div>

            <p className="text-foreground text-sm mb-4 line-clamp-2">
                {description}
            </p>

            <div className="flex justify-between items-center text-xs text-foreground/60">
                <span>Erstellt: {formatDate(created_at || '')}</span>
            </div>

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