import { useState } from "react";

interface DashboardCardProps {
    id: number;
    title: string;
    description: string;
    tags: string[];
    cards: {
        id: number;
        front: string;
        back: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const DashboardCard = ({ title, description, tags, cards, createdAt, updatedAt }: DashboardCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    };

    return (
        <div className="bg-background rounded-2xl shadow-lg border border-border p-6 hover:border-primary-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        {title}
                    </h3>
                    <p className="text-foreground/60 text-sm mt-1">
                        {cards.length} Karten
                    </p>
                </div>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg hover:bg-primary-500/10 transition-colors"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 text-foreground/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                    >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            <p className="text-foreground text-sm mb-4 line-clamp-2">
                {description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
                    <span 
                        key={index}
                        className="text-xs px-2 py-1 rounded-md bg-primary-500/10 text-primary-500"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex justify-between items-center text-xs text-foreground/60">
                <span>Erstellt: {formatDate(createdAt)}</span>
                <span>Bearbeitet: {formatDate(updatedAt)}</span>
            </div>

            {isOpen && (
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="space-y-3">
                        {cards.map((card) => (
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
                        <button className="px-3 py-2 rounded-lg border border-border hover:bg-primary-500/10 text-foreground text-sm font-medium transition-colors">
                            Bearbeiten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardCard;