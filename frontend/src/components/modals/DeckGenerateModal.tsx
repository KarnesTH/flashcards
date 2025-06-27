import { useState } from "react";
import type { GenerateDeck } from "../../types/types";

/**
 * DeckGenerateModalProps
 * 
 * @description DeckGenerateModalProps is the props for the DeckGenerateModal component.
 */
interface DeckGenerateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (data: GenerateDeck) => void;
}

/**
 * DeckGenerateData
 * 
 * @description DeckGenerateData is the data that is sent to the AI service.
 */
interface DeckGenerateData {
    prompt: string;
    language: string;
}

/**
 * DeckGenerateModal
 * 
 * @description This component is used to show a modal to generate a deck of flashcards using AI.
 * 
 * @param isOpen - Whether the modal is open
 * @param onClose - The function to call when the modal is closed
 * @param onSend - The function to call when the form is submitted
 * 
 * @returns The DeckGenerateModal component
 */
const DeckGenerateModal = ({ isOpen, onClose, onSend }: DeckGenerateModalProps) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [data, setData] = useState<DeckGenerateData>({
        prompt: "",
        language: "de",
    });

    /**
     * handleSubmit
     * 
     * @description This function is used to handle the form submission.
     * 
     * @param e - The form event
     * 
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        
        try {
            await onSend({
                prompt: data.prompt,
                language: data.language,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * handleClose
     * 
     * @description This function is used to handle the close event.
     * 
     */
    const handleClose = () => {
        if (!isLoading) {
            setError(null);
            setData({ prompt: "", language: "de" });
            onClose();
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-2xl shadow-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        AI-Karteikarten generieren
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-foreground/60 hover:text-foreground transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                <p className="text-red-500 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="prompt" className="block text-sm font-medium text-foreground mb-2">
                                    Prompt *
                                </label>
                                <textarea
                                    id="prompt"
                                    value={data.prompt}
                                    onChange={(e) => setData({ ...data, prompt: e.target.value })}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Beschreibe, welche Karteikarten du generieren möchtest..."
                                    rows={4}
                                />
                            </div>
                            
                            {isLoading && (
                                <div className="flex items-center gap-3 text-primary-500">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                                    <div className="flex items-center gap-1">
                                        <span>Generiere Karteikarten</span>
                                        <span className="animate-pulse">.</span>
                                        <span className="animate-pulse delay-100">.</span>
                                        <span className="animate-pulse delay-200">.</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="text-sm text-foreground/60">
                                <p>💡 Tipp: Sei spezifisch! Zum Beispiel:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>"Erstelle Flashcards über Python Grundlagen mit Variablen, Funktionen und Schleifen"</li>
                                    <li>"Generiere Karteikarten für die deutsche Grammatik: Artikel, Fälle und Zeitformen"</li>
                                    <li>"Flashcards über die Geschichte des Römischen Reiches"</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-border bg-background">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-background/50 transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !data.prompt.trim()}
                            className="px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Generiere...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                    </svg>
                                    Generieren
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DeckGenerateModal;