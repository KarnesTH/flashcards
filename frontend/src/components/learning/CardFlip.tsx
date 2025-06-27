import { useState, useEffect } from 'react';
import type { Card } from '../../types/types';
import MarkdownPreview from '../cards/MarkdownPreview';
import { api } from '../../lib/api';

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
    const [feedback, setFeedback] = useState('');
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setUserAnswer('');
        setShowAnswer(false);
        setIsCorrect(false);
        setStartTime(Date.now());
        setIsTransitioning(false);
    }, [card.id]);

    /**
     * Handle Submit Answer
     * 
     * @description This function is used to submit the user's answer.
     * 
     */
    const handleSubmitAnswer = async () => {
        setIsLoading(true);
        if (!userAnswer.trim()) return;
        
        const normalizedUserAnswer = userAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
        const normalizedCorrectAnswer = card.back.trim().toLowerCase().replace(/\s+/g, ' ');
        
        const { is_correct, feedback } = await api.checkAnswerCorrectness({
            answer: normalizedCorrectAnswer,
            user_answer: normalizedUserAnswer,
        });

        setIsCorrect(is_correct);
        setFeedback(feedback);
        setShowAnswer(true);
        setIsLoading(false);
    };

    /**
     * handleNext
     * 
     * @description This function is used to handle the next card.
     */
    const handleNext = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        const timeTaken = Date.now() - startTime;
        
        setShowAnswer(false);

        setTimeout(() => {
            onNext(isCorrect, timeTaken);
        }, 700);
    };

    /**
     * handlePrevious
     * 
     * @description This function is used to handle the previous card.
     */
    const handlePrevious = () => {
        if (isTransitioning) return;

        if (showAnswer) {
            setIsTransitioning(true);
            setShowAnswer(false);
            setTimeout(() => {
                onPrevious();
            }, 700);
        } else {
            onPrevious();
        }
    };

    /**
     * Handle Key Press
     * 
     * @description This function is used to handle the key press event.
     * 
     * @param e - The keyboard event
     */
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !showAnswer) {
            e.preventDefault();
            handleSubmitAnswer();
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-foreground/60">
                        Karte {currentIndex + 1} von {totalCards}
                    </span>
                    <span className="text-sm text-foreground/60">
                        {Math.round(((currentIndex) / totalCards) * 100)}% abgeschlossen
                    </span>
                </div>
                <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                    <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(currentIndex / totalCards) * 100}%` }}
                    ></div>
                </div>
            </div>

             {/* Flipper */}
             <div className="[perspective:1000px] w-full h-96 mb-8">
                <div 
                    className={`relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] ${showAnswer ? '[transform:rotateY(180deg)]' : ''}`}
                >
                    {/* Front Card (Question) */}
                    <div className="absolute w-full h-full [backface-visibility:hidden]">
                        <div className="preview-card w-full h-full flex flex-col justify-center items-center p-8">
                             <div className="text-center">
                                <h3 className="text-lg font-medium text-foreground/60 mb-4">Frage</h3>
                                <div className="text-xl text-foreground leading-relaxed prose max-w-none">
                                    <MarkdownPreview markdown={card.front} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back Card (Answer) */}
                    <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <div className={`preview-card w-full h-full flex flex-col justify-center items-center p-6 border-2 ${isCorrect ? 'border-green-500/50' : 'border-red-500/50'}`}>
                            <div className="space-y-4 text-center w-full">
                                <div>
                                    <h4 className="text-sm font-medium text-foreground/60 mb-2">Deine Antwort:</h4>
                                    <p className={`font-medium text-lg px-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                        {userAnswer.trim() || <span className="text-foreground/40">(Keine Antwort)</span>}
                                    </p>
                                </div>
                                <div className="w-4/5 h-px bg-border mx-auto"></div>
                                <div>
                                    <h4 className="text-sm font-medium text-foreground/60 mb-2">Richtige Antwort:</h4>
                                    <div className="prose max-w-none text-foreground">
                                        <MarkdownPreview markdown={card.back} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Input and Result Section */}
            <div className="min-h-[160px]">
                {!showAnswer ? (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="userAnswer" className="block text-sm font-medium text-foreground mb-2 sr-only">
                                Deine Antwort:
                            </label>
                            <textarea
                                id="userAnswer"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Gib deine Antwort hier ein..."
                                className="w-full p-4 border border-border rounded-lg bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none shadow-inner"
                                rows={4}
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!userAnswer.trim()}
                            className="w-full px-6 py-3 rounded-lg font-medium transition-colors bg-primary-500 hover:bg-primary-600 text-white disabled:bg-primary-500/50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Überprüfe...
                                </>
                            ) : (
                                <>
                                    Antwort überprüfen
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                         <div className={`flex items-center justify-center gap-2 text-2xl font-bold ${
                            isCorrect ? 'text-green-500' : 'text-red-500'
                        }`}>
                            {isCorrect ? (
                                <>
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{feedback}</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{feedback}</span>
                                </>
                            )}
                        </div>
                        <p className="text-foreground/60">Drücke auf "Weiter", um fortzufahren.</p>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={handlePrevious}
                    disabled={isFirst || isTransitioning}
                    className="px-6 py-3 rounded-lg font-medium transition-colors bg-background border border-border text-foreground hover:bg-primary-500/10 disabled:bg-background/50 disabled:text-foreground/40 disabled:cursor-not-allowed"
                >
                    ← Zurück
                </button>

                <button
                    onClick={handleNext}
                    disabled={!showAnswer || isTransitioning}
                    className="px-6 py-3 rounded-lg font-medium transition-colors bg-primary-500 hover:bg-primary-600 text-white disabled:bg-primary-500/50 disabled:cursor-not-allowed"
                >
                    {isLast ? 'Beenden' : 'Weiter →'}
                </button>
            </div>
        </div>
    );
};

export default CardFlip; 