import type { User, UserLearningStats } from '../../types/types';

/**
 * DashboardStatsProps interface
 * 
 * @description This interface is used to define the props for the DashboardStats component.
 */
interface DashboardStatsProps {
    user: User;
    learningStats?: UserLearningStats;
}

/**
 * DashboardStats component
 * 
 * @description This component is used to display the dashboard stats with SRS-specific visualizations.
 * 
 * @param user - The user object containing statistics
 * @param learningStats - SRS-specific learning statistics (optional)
 * 
 * @returns The DashboardStats component
 */
const DashboardStats = ({ 
    user,
    learningStats
}: DashboardStatsProps) => {
    const dueCardsCount = learningStats?.due_cards_count ?? 0;
    const learningStreak = learningStats?.learning_streak ?? 0;
    const averageResponseTime = learningStats?.average_response_time ?? 0;
    const recentAccuracy = learningStats?.recent_accuracy ?? 0;

    /**
     * formatTime
     * 
     * @description Format time in seconds to human readable format
     */
    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    };

    /**
     * getStreakColor
     * 
     * @description Get streak color based on length
     */
    const getStreakColor = (streak: number): string => {
        if (streak >= 7) return 'text-orange-500';
        if (streak >= 3) return 'text-yellow-500';
        return 'text-gray-500';
    };

    /**
     * getDueCardsColor
     * 
     * @description Get due cards color based on count
     */
    const getDueCardsColor = (count: number): string => {
        if (count === 0) return 'text-green-500';
        if (count <= 5) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                    <h3 className="text-sm font-medium text-foreground/60">Gesamte Karten</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        {user.total_cards_created}
                    </p>
                </div>
                <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                    <h3 className="text-sm font-medium text-foreground/60">Erstellte Decks</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        {user.total_decks_created}
                    </p>
                </div>
                <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                    <h3 className="text-sm font-medium text-foreground/60">Lern-Sessions</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        {user.total_learning_sessions}
                    </p>
                </div>
                <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                    <h3 className="text-sm font-medium text-foreground/60">Genauigkeit</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        {Math.round(user.learning_accuracy)}%
                    </p>
                </div>
            </div>

            {/* SRS-Specific Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Due Cards */}
                <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-foreground/60">Fällige Karten</h3>
                        <div className={`text-lg font-bold ${getDueCardsColor(dueCardsCount)}`}>
                            {dueCardsCount}
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                                dueCardsCount === 0 ? 'bg-green-500' : 
                                dueCardsCount <= 5 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(dueCardsCount * 10, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-foreground/40 mt-2">
                        {dueCardsCount === 0 ? 'Alles gelernt!' : 
                         dueCardsCount === 1 ? '1 Karte wartet' : 
                         `${dueCardsCount} Karten warten`}
                    </p>
                </div>

                {/* Learning Streak */}
                <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-foreground/60">Lernstreak</h3>
                        <div className={`text-lg font-bold ${getStreakColor(learningStreak)}`}>
                            {learningStreak}
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        {[...Array(Math.min(learningStreak, 7))].map((_, i) => (
                            <div 
                                key={i}
                                className={`w-3 h-3 rounded-full ${
                                    i < 3 ? 'bg-yellow-500' : 
                                    i < 7 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                            ></div>
                        ))}
                        {learningStreak === 0 && (
                            <span className="text-xs text-foreground/40">Starte deine Serie!</span>
                        )}
                    </div>
                    <p className="text-xs text-foreground/40 mt-2">
                        {learningStreak === 0 ? 'Noch keine Serie' :
                         learningStreak === 1 ? '1 Tag in Folge' :
                         `${learningStreak} Tage in Folge`}
                    </p>
                </div>

                {/* Average Response Time */}
                <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-foreground/60">Ø Antwortzeit</h3>
                        <div className="text-lg font-bold text-blue-500">
                            {formatTime(averageResponseTime)}
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                                width: `${Math.min((averageResponseTime / 60) * 100, 100)}%` 
                            }}
                        ></div>
                    </div>
                    <p className="text-xs text-foreground/40 mt-2">
                        {averageResponseTime < 30 ? 'Sehr schnell!' :
                         averageResponseTime < 60 ? 'Gute Geschwindigkeit' :
                         'Nimm dir mehr Zeit'}
                    </p>
                </div>

                {/* Recent Accuracy */}
                <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-foreground/60">Letzte Genauigkeit</h3>
                        <div className={`text-lg font-bold ${
                            recentAccuracy >= 80 ? 'text-green-500' :
                            recentAccuracy >= 60 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                            {Math.round(recentAccuracy)}%
                        </div>
                    </div>
                    {/* Circular Progress */}
                    <div className="relative w-16 h-16 mx-auto">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-gray-200"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className={`${
                                    recentAccuracy >= 80 ? 'text-green-500' :
                                    recentAccuracy >= 60 ? 'text-yellow-500' : 'text-red-500'
                                }`}
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={`${recentAccuracy}, 100`}
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-foreground">
                                {Math.round(recentAccuracy)}%
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-foreground/40 mt-2 text-center">
                        Letzte 10 Antworten
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;