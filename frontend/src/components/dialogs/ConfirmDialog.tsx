/**
 * DialogProps
 * 
 * @description This interface is used to define the props for the Dialog component.
 * 
 * @param title - The title of the dialog
 */
interface DialogProps {
    title: string;
    message: string;
    isOpen?: boolean;
    onClose?: () => void;
    onContinue?: () => void;
}

/**
 * ConfirmDialog component
 * 
 * @description This component is used to display a confirm dialog. It is used to confirm a delete action.
 * 
 * @returns The ConfirmDialog component
 */
const ConfirmDialog = ({ title, message, isOpen, onClose, onContinue }: DialogProps) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-2xl shadow-xl border border-border overflow-hidden w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-border">                            
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-primary-500 hover:text-primary-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-warning-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <h3 className="text-lg font-bold text-warning-500">Achtung!</h3>
                        </div>
                        <p className="text-foreground text-wrap">{message}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 p-6">
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onContinue}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
                        >
                            Ok
                        </button>
                        <button
                            type="button"
                            onClick={onClose} 
                            className="px-6 py-2 rounded-lg border border-border text-foreground hover:border-primary-600 transition-colors"
                        >
                            Schließen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog;