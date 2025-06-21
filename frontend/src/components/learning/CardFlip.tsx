import { useState, useEffect } from 'react';
import type { Card } from '../../types/types';
import MarkdownPreview from '../cards/MarkdownPreview';

/**
 * CardFlipProps interface
 * 
 * @description This interface is used to define the props for the CardFlip component.
 */
interface CardFlipProps {
    card: Card;
    onNext: (isCorrect: boolean, timeTaken?: number) => void;
    onPrevious: () => void;
    isFirst: boolean;
    isLast: boolean;
    currentIndex: number;
    totalCards: number;
}

/**
 * CardFlip component
 * 
 * @description This component is used to display a card flip.
 * 
 * @param card - The card to display
 * @param onNext - The function to call when the user has answered the question
 * @param onPrevious - The function to call when the user wants to go back
 * @param isFirst - Whether the current card is the first card
 * @param isLast - Whether the current card is the last card
 * @param currentIndex - The index of the current card
 * @param totalCards - The total number of cards
 * 
 * @returns The CardFlip component
 */
const CardFlip = ({ 
    card, 
    onNext, 
    onPrevious, 
    isFirst, 
    isLast, 
    currentIndex, 
    totalCards 
}: CardFlipProps) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [startTime, setStartTime] = useState<number>(Date.now());

    useEffect(() => {
        setUserAnswer('');
        setShowAnswer(false);
        setIsCorrect(false);
        setStartTime(Date.now());
    }, [card.id]);

    /**
     * Handle Submit Answer
     * 
     * @description This function is used to submit the user's answer.
     * 
     */
    const handleSubmitAnswer = () => {
        if (!userAnswer.trim()) return;
        
        const normalizedUserAnswer = userAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
        const normalizedCorrectAnswer = card.back.trim().toLowerCase().replace(/\s+/g, ' ');
        
        const correct = normalizedUserAnswer === normalizedCorrectAnswer;
        setIsCorrect(correct);
        setShowAnswer(true);
    };

    /**
     * Handle Confirm Answer
     * 
     * @description This function is used to confirm the user's answer.
     * 
     */
    const handleConfirmAnswer = () => {
        const timeTaken = Date.now() - startTime;
        onNext(isCorrect, timeTaken);
    };

    /**
     * Handle Key Press
     * 
     * @description This function is used to handle the key press event.
     * 
     * @param e - The keyboard event
     */
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !showAnswer) {
            handleSubmitAnswer();
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-foreground/60">
                        Karte {currentIndex + 1} von {totalCards}
                    </span>
                    <span className="text-sm text-foreground/60">
                        {Math.round(((currentIndex + 1) / totalCards) * 100)}%
                    </span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                    <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="mb-8">
                <div className="w-full bg-background border-2 border-primary-500 rounded-2xl p-8 shadow-lg">
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-medium text-foreground/60 mb-4">Frage</h3>
                        <div className="text-xl text-foreground leading-relaxed prose">
                            <MarkdownPreview markdown={card.front} />
                        </div>
                    </div>

                    {!showAnswer ? (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="userAnswer" className="block text-sm font-medium text-foreground mb-2">
                                    Deine Antwort:
                                </label>
                                <textarea
                                    id="userAnswer"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Gib deine Antwort hier ein..."
                                    className="w-full p-4 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                    rows={4}
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={!userAnswer.trim()}
                                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                                    userAnswer.trim()
                                        ? 'bg-primary-500 hover:bg-primary-600 text-white'
                                        : 'bg-background border border-border text-foreground/40 cursor-not-allowed'
                                }`}
                            >
                                Antwort überprüfen
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* User's Answer */}
                            <div>
                                <h4 className="text-sm font-medium text-foreground/60 mb-2">Deine Antwort:</h4>
                                <div className={`p-4 rounded-lg border-2 ${
                                    isCorrect 
                                        ? 'border-green-500 bg-green-500/10' 
                                        : 'border-red-500 bg-red-500/10'
                                }`}>
                                    <p className="text-foreground">{userAnswer}</p>
                                </div>
                            </div>

                            {/* Correct Answer */}
                            <div>
                                <h4 className="text-sm font-medium text-foreground/60 mb-2">Richtige Antwort:</h4>
                                <div className="p-4 rounded-lg border-2 border-accent-500 bg-accent-500/10">
                                    <p className="text-foreground">{card.back}</p>
                                </div>
                            </div>

                            {/* Result Indicator */}
                            <div className={`text-center p-4 rounded-lg ${
                                isCorrect 
                                    ? 'bg-green-500/10 border border-green-500' 
                                    : 'bg-red-500/10 border border-red-500'
                            }`}>
                                <div className="flex items-center justify-center gap-2">
                                    {isCorrect ? (
                                        <>
                                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-green-500 font-medium">Richtig!</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            <span className="text-red-500 font-medium">Falsch</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
                <button
                    onClick={onPrevious}
                    disabled={isFirst}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        isFirst
                            ? 'bg-background border border-border text-foreground/40 cursor-not-allowed'
                            : 'bg-background border border-border text-foreground hover:bg-primary-500/10'
                    }`}
                >
                    ← Zurück
                </button>

                <button
                    onClick={handleConfirmAnswer}
                    disabled={!showAnswer}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        showAnswer
                            ? 'bg-primary-500 hover:bg-primary-600 text-white'
                            : 'bg-background border border-border text-foreground/40 cursor-not-allowed'
                    }`}
                >
                    {isLast ? 'Beenden' : 'Weiter →'}
                </button>
            </div>
        </div>
    );
};

export default CardFlip; 