import { useState } from "react";
import type { Card, Tag, Deck } from "../../types/types";

interface DashboardCardProps {
    id: number;
    title: string;
    description: string;
    tags: Tag[];
    cards: Card[];
    created_at?: string;
    updated_at?: string;
    createdAt?: string;
    updatedAt?: string;
    is_public?: boolean;
    onEdit?: (deck: Deck) => void;
    onDelete?: (deckId: number) => void;
    onTogglePublic?: (deckId: number, isPublic: boolean) => void;
}

const DashboardCard = ({ 
    id, 
    title = '', 
    description = '', 
    tags = [], 
    cards = [], 
    created_at,
    updated_at,
    createdAt,
    updatedAt,
    is_public = false,
    onEdit,
    onDelete,
    onTogglePublic
}: DashboardCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const createdDate = created_at || createdAt || '';
    const updatedDate = updated_at || updatedAt || '';

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

    const handleEdit = () => {
        if (onEdit) {
            const deck: Deck = {
                id,
                title,
                description,
                tags: tags || [],
                cards: cards || [],
                createdAt: createdDate,
                updatedAt: updatedDate,
                is_public
            };
            onEdit(deck);
        }
    };

    const handleDelete = () => {
        if (onDelete && confirm('Möchten Sie dieses Deck wirklich löschen?')) {
            onDelete(id);
        }
    };

    const handleTogglePublic = () => {
        if (onTogglePublic) {
            onTogglePublic(id, !is_public);
        }
    };

    const safeCards = Array.isArray(cards) ? cards : [];
    const safeTags = Array.isArray(tags) ? tags : [];

    return (
        <div className="bg-background rounded-2xl shadow-lg border border-border p-6 hover:border-primary-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        {title}
                    </h3>
                    <p className="text-foreground/60 text-sm mt-1">
                        {safeCards.length} {safeCards.length === 1 ? 'Karte' : 'Karten'}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    {/* Public/Private Toggle */}
                    <button 
                        onClick={handleTogglePublic}
                        className={`p-2 rounded-lg transition-colors ${
                            is_public 
                                ? 'text-green-500 hover:bg-green-500/10' 
                                : 'text-gray-500 hover:bg-gray-500/10'
                        }`}
                        title={is_public ? 'Öffentlich' : 'Privat'}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d={is_public 
                                    ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                }
                            />
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
                        onClick={handleDelete}
                        className="p-2 rounded-lg text-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Löschen"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    
                    {/* Expand/Collapse Button */}
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-primary-500/10 transition-colors"
                        title={isOpen ? 'Einklappen' : 'Aufklappen'}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                        >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            <p className="text-foreground text-sm mb-4 line-clamp-2">
                {description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                {safeTags.map((tag, index) => (
                    <span 
                        key={index}
                        className="text-xs px-2 py-1 rounded-md bg-primary-500/10 text-primary-500"
                    >
                        {tag.name}
                    </span>
                ))}
            </div>

            <div className="flex justify-between items-center text-xs text-foreground/60">
                <span>Erstellt: {formatDate(createdDate)}</span>
                <span>Bearbeitet: {formatDate(updatedDate)}</span>
            </div>

            {isOpen && (
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="space-y-3">
                        {safeCards.map((card) => (
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
                        <button className="flex-1 px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors">
                            Lernen
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardCard;