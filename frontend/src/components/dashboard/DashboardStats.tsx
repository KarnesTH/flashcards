
/**
 * DashboardStatsProps interface
 * 
 * @description This interface is used to define the props for the DashboardStats component.
 */
interface DashboardStatsProps {
    cards: number;
    decks: number;
    learnedCards: number;
    averageScore: number;
    learningSessions?: number;
    totalReviews?: number;
}

/**
 * DashboardStats component
 * 
 * @description This component is used to display the dashboard stats.
 * 
 * @param cards - The number of cards.
 * @param decks - The number of decks.
 * @param learnedCards - The number of learned cards.
 * @param averageScore - The average score.
 * @param learningSessions - The number of learning sessions.
 * @param totalReviews - The number of total reviews.
 * 
 * @returns The DashboardStats component
 */
const DashboardStats = ({ 
    cards, 
    decks, 
    learnedCards, 
    averageScore, 
    learningSessions = 0,
    totalReviews = 0
}: DashboardStatsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                <h3 className="text-sm font-medium text-foreground/60">Gesamte Karten</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                    {cards}
                </p>
            </div>
            <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                <h3 className="text-sm font-medium text-foreground/60">Erstellte Decks</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                    {decks}
                </p>
            </div>
            <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                <h3 className="text-sm font-medium text-foreground/60">Lern-Sessions</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                    {learningSessions}
                </p>
            </div>
            <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                <h3 className="text-sm font-medium text-foreground/60">Genauigkeit</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                    {Math.round(averageScore)}%
                </p>
            </div>
        </div>
    )
}

export default DashboardStats;