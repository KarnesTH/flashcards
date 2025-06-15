interface DashboardStatsProps {
    cards: number;
    decks: number;
    learnedCards: number;
    averageScore: number;
}

const DashboardStats = ({ cards, decks, learnedCards, averageScore }: DashboardStatsProps) => {
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
                <h3 className="text-sm font-medium text-foreground/60">Gelernte Karten</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                    {learnedCards}
                </p>
            </div>
            <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                <h3 className="text-sm font-medium text-foreground/60">Durchschnitt</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                    {averageScore}%
                </p>
            </div>
        </div>
    )
}

export default DashboardStats;