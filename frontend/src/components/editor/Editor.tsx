import { useState, useEffect } from "react";
import MarkdownPreview from "../cards/MarkdownPreview";

/**
 * EditorProps
 * 
 * @description EditorProps is the type for the Editor component.
 */
interface EditorProps {
    text: string;
    cardType: 'front' | 'back';
    onSave?: (text: string) => void;
}

/**
 * Editor
 * 
 * @description Editor is the component for the editor.
 * 
 * @param text - The text to be edited.
 * @param cardType - The type of card to be edited.
 * @param onSave - Callback function to save the edited text.
 * 
 * @returns The Editor component.
 */
const Editor = ({ text, cardType, onSave }: EditorProps) => {
    const [markdown, setMarkdown] = useState(text);

    /**
     * handleMarkdownChange
     * 
     * @description handleMarkdownChange is the function to handle the markdown change.
     * 
     * @param e - The event object.
     */
    const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMarkdown(e.target.value);
    }

    /**
     * handleSave
     * 
     * @description handleSave is the function to save the markdown.
     */
    const handleSave = () => {
        if (onSave) {
            onSave(markdown);
        }
    };

    /**
     * getCursorLine
     * 
     * @description getCursorLine is the function to get the cursor line.
     * 
     * @param textarea - The textarea element.
     * 
     * @returns The cursor line index.
     */
    const getCursorLine = (textarea: HTMLTextAreaElement): number => {
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, cursorPosition);
        const lines = textBeforeCursor.split('\n');
        return lines.length;
    }

    /**
     * handleHeaderButtonClick
     * 
     * @description handleHeaderButtonClick is the function to handle the header button click.
     * 
     * @param header - The header to be added.
     */
    const handleHeaderButtonClick = (header: string) => {
        const textarea = document.querySelector('#markdown') as HTMLTextAreaElement;
        const lineIdx = getCursorLine(textarea);

        const lines = markdown.split('\n');
        const newLines = lines.map((line, index) => {
            if (index === lineIdx - 1) {
                if (line.startsWith(header)) {
                    return line.replace(header, '').trim();
                } else {
                    return `${header} ${line}`;
                }
            }

            return line;
        });
        setMarkdown(newLines.join('\n'));
    }

    /**
     * handleTextDecorationButtonClick
     * 
     * @description handleTextDecorationButtonClick is the function to handle the text decoration button click.
     * 
     * @param decoration - The decoration to be added.
     */
    const handleTextDecorationButtonClick = (decoration: string) => {
        const selection = window.getSelection();
        if (selection) {
            const selectedText = selection.toString();

            const lines = markdown.split('\n');

            const lineIdx = lines.findIndex((line) => line.includes(selectedText));

            const words = lines[lineIdx].split(' ');
            const wordIdx = words.findIndex((word) => word.includes(selectedText));

            if (decoration.startsWith('<') && decoration.endsWith('>')) {
                let tag = decoration.slice(1, -1);
                let startTag = `<${tag}>`;
                let endTag = `</${tag}>`;

                if (words[wordIdx].startsWith(startTag) && words[wordIdx].endsWith(endTag)) {
                    words[wordIdx] = words[wordIdx].replace(startTag, '').replace(endTag, '');
                } else {
                    words[wordIdx] = `${startTag}${words[wordIdx]}${endTag}`;
                }
            } else {
                const newWord = words[wordIdx].startsWith(decoration) && words[wordIdx].endsWith(decoration) ? words[wordIdx].replace(decoration, '').replace(decoration, '') : `${decoration}${words[wordIdx]}${decoration}`;
                words[wordIdx] = newWord;
            }
            
            lines[lineIdx] = words.join(' ');
            setMarkdown(lines.join('\n'));
        }
    }

    /**
     * handleCodeBlockButtonClick
     * 
     * @description handleCodeBlockButtonClick is the function to handle the code block button click.
     * 
     * @returns The code block button click.
     */
    const handleCodeBlockButtonClick = () => {
        const textarea = document.querySelector('#markdown') as HTMLTextAreaElement;
        const lineIdx = getCursorLine(textarea);

        const lines = markdown.split('\n');
        const newLines = lines.map((line, index) => {
            if (index === lineIdx - 1) {
                return `\`\`\`\n${line}\`\`\``;
            }
            return line;
        });
        setMarkdown(newLines.join('\n'));
    }

    useEffect(() => {
        setMarkdown(text);
    }, [text]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-border shadow-2xl shadow-foreground/10 rounded-md justify-center items-center max-h-screen h-full">
            <div className="border border-border rounded-md w-full p-4 h-full">
                <div className="flex gap-2 w-full mb-4 border-b flex-wrap border-border pb-4">
                    <button 
                        className="bg-transparent text-primary-500 border border-primary-500 p-2 rounded-md hover:bg-primary-500/10 hover:text-foreground transition-colors" 
                        onClick={() => handleHeaderButtonClick('#')}
                        title="Heading 1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501m4.501-8.627 2.25-1.5v10.126m0 0h-2.25m2.25 0h2.25" />
                        </svg>
                    </button>
                    <button 
                        className="bg-transparent text-primary-500 border border-primary-500 p-2 rounded-md hover:bg-primary-500/10 hover:text-foreground transition-colors" 
                        onClick={() => handleHeaderButtonClick('##')}
                        title="Heading 2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 19.5H16.5v-1.609a2.25 2.25 0 0 1 1.244-2.012l2.89-1.445c.651-.326 1.116-.955 1.116-1.683 0-.498-.04-.987-.118-1.463-.135-.825-.835-1.422-1.668-1.489a15.202 15.202 0 0 0-3.464.12M2.243 4.492v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501" />
                        </svg>
                    </button>
                    <button 
                        className="bg-transparent text-primary-500 border border-primary-500 p-2 rounded-md hover:bg-primary-500/10 hover:text-foreground transition-colors" 
                        onClick={() => handleHeaderButtonClick('###')}
                        title="Heading 3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.905 14.626a4.52 4.52 0 0 1 .738 3.603c-.154.695-.794 1.143-1.504 1.208a15.194 15.194 0 0 1-3.639-.104m4.405-4.707a4.52 4.52 0 0 0 .738-3.603c-.154-.696-.794-1.144-1.504-1.209a15.19 15.19 0 0 0-3.639.104m4.405 4.708H18M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501" />
                        </svg>
                    </button>

                    <div className="border-r-2 border-border" />

                    <button
                        className="bg-transparent text-primary-500 border border-primary-500 p-2 rounded-md hover:bg-primary-500/10 hover:text-foreground transition-colors"
                        onClick={() => handleTextDecorationButtonClick('**')}
                        title="Bold"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinejoin="round" d="M6.75 3.744h-.753v8.25h7.125a4.125 4.125 0 0 0 0-8.25H6.75Zm0 0v.38m0 16.122h6.747a4.5 4.5 0 0 0 0-9.001h-7.5v9h.753Zm0 0v-.37m0-15.751h6a3.75 3.75 0 1 1 0 7.5h-6m0-7.5v7.5m0 0v8.25m0-8.25h6.375a4.125 4.125 0 0 1 0 8.25H6.75m.747-15.38h4.875a3.375 3.375 0 0 1 0 6.75H7.497v-6.75Zm0 7.5h5.25a3.75 3.75 0 0 1 0 7.5h-5.25v-7.5Z" />
                        </svg>
                    </button>
                    <button 
                        className="bg-transparent text-primary-500 border border-primary-500 p-2 rounded-md hover:bg-primary-500/10 hover:text-foreground transition-colors" 
                        onClick={() => handleTextDecorationButtonClick('*')}
                        title="Italic"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.248 20.246H9.05m0 0h3.696m-3.696 0 5.893-16.502m0 0h-3.697m3.697 0h3.803" />
                        </svg>
                    </button>
                    <button 
                        className="bg-transparent disabled:opacity-50 text-foreground/50 border border-foreground/50 p-2 rounded-md" 
                        onClick={() => handleTextDecorationButtonClick('<u>')}
                        title="Underline"
                        disabled={true}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.995 3.744v7.5a6 6 0 1 1-12 0v-7.5m-2.25 16.502h16.5" />
                        </svg>
                    </button>
                    <button 
                        className="bg-transparent text-primary-500 border border-primary-500 p-2 rounded-md hover:bg-primary-500/10 hover:text-foreground transition-colors" 
                        onClick={() => handleTextDecorationButtonClick('~~')}
                        title="Strikethrough"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a8.912 8.912 0 0 1-.318-.079c-1.585-.424-2.904-1.247-3.76-2.236-.873-1.009-1.265-2.19-.968-3.301.59-2.2 3.663-3.29 6.863-2.432A8.186 8.186 0 0 1 16.5 5.21M6.42 17.81c.857.99 2.176 1.812 3.761 2.237 3.2.858 6.274-.23 6.863-2.431.233-.868.044-1.779-.465-2.617M3.75 12h16.5" />
                        </svg>
                    </button>
                    <button 
                        className="bg-transparent text-primary-500 border border-primary-500 p-2 rounded-md hover:bg-primary-500/10 hover:text-foreground transition-colors" 
                        onClick={() => handleTextDecorationButtonClick('`')}
                        title="Code Snippet"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                        </svg>
                    </button>

                    <div className="border-r-2 border-border" />

                    <button 
                        className="bg-transparent text-primary-500 border border-primary-500 p-2 rounded-md hover:bg-primary-500/10 hover:text-foreground transition-colors" 
                        onClick={handleCodeBlockButtonClick}
                        title="Code Block"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                        </svg>
                    </button>

                    <div className="border-r-2 border-border" />

                    {onSave && (
                        <button 
                            className="bg-primary-500 text-foreground/50 border border-primary-500 p-2 rounded-md hover:bg-primary-600 transition-colors" 
                            onClick={handleSave}
                            title="Speichern"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                        </button>
                    )}
                </div>
                <div className="flex flex-col">
                    <label htmlFor="markdown" className="sr-only">Text Editor</label>
                    <textarea 
                        className="w-full h-80 resize-none focus:outline-primary-500 border border-border rounded-md p-2" 
                        id="markdown" 
                        value={markdown} 
                        onChange={handleMarkdownChange}
                    />
                </div>
            </div>
            <div className="preview-card md:w-lg w-full h-80 rounded-xl overflow-hidden relative group mx-auto">
                <div className="flex flex-col gap-4 justify-center items-center p-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        {cardType === 'front' ? 'Frage' : 'Antwort'}
                    </h3>
                    <div className="prose p-4">
                        <MarkdownPreview markdown={markdown} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Editor;