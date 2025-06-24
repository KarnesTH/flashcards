import { useState } from "react";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import type { DeckStats } from "../../types/types";

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
    deckStats?: DeckStats;
    dueCardsCount?: number;
    averageEaseFactor?: number;
    lastSessionDate?: string;
    lastSessionAccuracy?: number;
    nextReviewDate?: string;
    onDelete: (deckId: number) => void;
    onEdit: (deckId: number) => void;
}

/**
 * DashboardCard component
 * 
 * @description This component is used to display a deck on the dashboard with SRS information.
 * 
 * @param id - The id of the deck
 * @param title - The title of the deck
 * @param description - The description of the deck
 * @param created_at - The date the deck was created
 * @param card_count - The number of cards in the deck
 * @param deckStats - SRS statistics for this deck (optional)
 * @param dueCardsCount - Number of cards due for review in this deck (fallback)
 * @param averageEaseFactor - Average ease factor of cards in this deck (fallback)
 * @param lastSessionDate - Date of the last learning session (fallback)
 * @param lastSessionAccuracy - Accuracy of the last session (fallback)
 * @param nextReviewDate - Next recommended review date (fallback)
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
    deckStats,
    dueCardsCount = 0,
    averageEaseFactor = 2.5,
    lastSessionDate,
    lastSessionAccuracy = 0,
    nextReviewDate,
    onDelete,
    onEdit
}: DashboardCardProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const dueCards = deckStats?.due_cards_count ?? dueCardsCount;
    const easeFactor = deckStats?.average_ease_factor ?? averageEaseFactor;
    const lastSession = deckStats?.last_session_date ?? lastSessionDate;
    const lastAccuracy = deckStats?.last_session_accuracy ?? lastSessionAccuracy;
    const nextReview = deckStats?.next_review_date ?? nextReviewDate;

    /**
     * formatDate
     * 
     * @description This function is used to format the date.
     * 
     * @param dateString - The date string to format
     * 
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
     * getDaysUntilReview
     * 
     * @description Get days until next review
     */
    const getDaysUntilReview = (): number => {
        if (!nextReview) return 0;
        const today = new Date();
        const reviewDate = new Date(nextReview);
        const diffTime = reviewDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    /**
     * getDifficultyColor
     * 
     * @description Get difficulty color based on ease factor
     */
    const getDifficultyColor = (easeFactor: number): string => {
        if (easeFactor >= 3.0) return 'text-green-500';
        if (easeFactor >= 2.0) return 'text-yellow-500';
        return 'text-red-500';
    };

    /**
     * getDifficultyLabel
     * 
     * @description Get difficulty label
     */
    const getDifficultyLabel = (easeFactor: number): string => {
        if (easeFactor >= 3.0) return 'Einfach';
        if (easeFactor >= 2.0) return 'Mittel';
        return 'Schwer';
    };

    /**
     * getDueCardsStatus
     * 
     * @description Get due cards status
     */
    const getDueCardsStatus = (): { text: string; color: string } => {
        if (dueCards === 0) return { text: 'Alles gelernt', color: 'text-green-500' };
        if (dueCards <= 3) return { text: `${dueCards} fällig`, color: 'text-yellow-500' };
        return { text: `${dueCards} überfällig`, color: 'text-red-500' };
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

    /**
     * handleDeleteConfirm
     * 
     * @description This function is used to confirm the deletion of a deck.
     * 
     */
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

    const dueCardsStatus = getDueCardsStatus();
    const daysUntilReview = getDaysUntilReview();

    return (
        <div className="bg-background rounded-2xl shadow-lg border border-border p-6 hover:border-primary-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
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
                        className={`p-2 rounded-lg transition-colors ${
                            dueCards > 0 
                                ? 'text-primary-500 hover:text-primary-600 hover:bg-primary-500/10' 
                                : 'text-foreground/40 cursor-not-allowed'
                        }`}
                        title={dueCards > 0 ? "Lernen" : "Keine fälligen Karten"}
                        disabled={dueCards === 0}
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

            {/* SRS Information */}
            <div className="space-y-3 mb-4">
                {/* Due Cards Badge */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground/60">Status:</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        dueCards === 0 ? 'bg-green-500/20 text-green-600' :
                        dueCards <= 3 ? 'bg-yellow-500/20 text-yellow-600' :
                        'bg-red-500/20 text-red-600'
                    }`}>
                        {dueCardsStatus.text}
                    </span>
                </div>

                {/* Difficulty Indicator */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground/60">Schwierigkeit:</span>
                    <div className="flex items-center gap-2">
                        <div className={`text-xs font-medium ${getDifficultyColor(easeFactor)}`}>
                            {getDifficultyLabel(easeFactor)}
                        </div>
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                    easeFactor >= 3.0 ? 'bg-green-500' :
                                    easeFactor >= 2.0 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min((easeFactor / 4.0) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Last Session Info */}
                {lastSession && (
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground/60">Letzte Session:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-foreground/80">
                                {formatDate(lastSession)}
                            </span>
                            <span className={`text-xs font-medium ${
                                lastAccuracy >= 80 ? 'text-green-500' :
                                lastAccuracy >= 60 ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                                {Math.round(lastAccuracy)}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Next Review */}
                {nextReview && (
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground/60">Nächste Wiederholung:</span>
                        <span className={`text-xs font-medium ${
                            daysUntilReview <= 0 ? 'text-red-500' :
                            daysUntilReview <= 3 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                            {daysUntilReview <= 0 ? 'Heute fällig' :
                             daysUntilReview === 1 ? 'Morgen' :
                             `in ${daysUntilReview} Tagen`}
                        </span>
                    </div>
                )}
            </div>

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