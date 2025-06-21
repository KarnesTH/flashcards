import { useState } from "react";
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
                        className="p-2 rounded-lg text-primary-500 hover:text-primary-600 hover:bg-primary-500/10 transition-colors"
                        title="Lernen"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 md:size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                        </svg>
                    </button>

                    {/* Edit Button */}
                    <button 
                        onClick={handleEdit}
                        className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-primary-500/10 transition-colors"
                        title="Bearbeiten"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 md:size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>
                    
                    {/* Delete Button */}
                    <button 
                        onClick={handleDeleteConfirm}
                        className="p-2 rounded-lg text-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Löschen"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 md:size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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