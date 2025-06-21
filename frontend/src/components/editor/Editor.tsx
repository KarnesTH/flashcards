import { useState } from "react";
import MarkdownPreview from "../cards/MarkdownPreview";

interface EditorProps {
    text: string;
}

const Editor = ({ text }: EditorProps) => {
    const [markdown, setMarkdown] = useState(text);

    const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMarkdown(e.target.value);
    }

    const getCursorLine = (textarea: HTMLTextAreaElement): number => {
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, cursorPosition);
        const lines = textBeforeCursor.split('\n');
        return lines.length;
    }

    const handleHeaderButtonClick = (header: string) => {
        const textarea = document.getElementById('markdown') as HTMLTextAreaElement;
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

    const handleBoldButtonClick = () => {
        const selection = window.getSelection();
        if (selection) {
            const selectedText = selection.toString();

            const lines = markdown.split('\n');

            const lineIdx = lines.findIndex((line) => line.includes(selectedText));

            const words = lines[lineIdx].split(' ');
            const wordIdx = words.findIndex((word) => word.includes(selectedText));

            const newWord = words[wordIdx].startsWith('**') && words[wordIdx].endsWith('**') ? words[wordIdx].replace('**', '').replace('**', '') : `**${words[wordIdx]}**`;
            words[wordIdx] = newWord;
            lines[lineIdx] = words.join(' ');
            setMarkdown(lines.join('\n'));
        }
    }

    return (
        <div className="flex gap-4 w-full border border-border shadow-2xl shadow-foreground/10 rounded-md justify-center items-center h-calc(100vh - 10rem)">
            <div className="border border-border rounded-md w-full p-4">
                <div className="flex gap-2 w-full mb-4">
                    <button className="bg-transparent text-primary-500 border border-primary-500 p-2 rounded-md hover:bg-primary-500/10 hover:text-white transition-colors" onClick={() => handleHeaderButtonClick('#')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501m4.501-8.627 2.25-1.5v10.126m0 0h-2.25m2.25 0h2.25" />
                        </svg>
                    </button>
                    <button className="bg-transparent text-primary-500 border border-primary-500 p-2 rounded-md hover:bg-primary-500/10 hover:text-white transition-colors" onClick={() => handleHeaderButtonClick('##')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 19.5H16.5v-1.609a2.25 2.25 0 0 1 1.244-2.012l2.89-1.445c.651-.326 1.116-.955 1.116-1.683 0-.498-.04-.987-.118-1.463-.135-.825-.835-1.422-1.668-1.489a15.202 15.202 0 0 0-3.464.12M2.243 4.492v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501" />
                        </svg>
                    </button>
                    <div className="border-r-2 border-border" />
                    <button className="bg-transparent text-primary-500 border border-primary-500 p-2 rounded-md hover:bg-primary-500/10 hover:text-white transition-colors" onClick={handleBoldButtonClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinejoin="round" d="M6.75 3.744h-.753v8.25h7.125a4.125 4.125 0 0 0 0-8.25H6.75Zm0 0v.38m0 16.122h6.747a4.5 4.5 0 0 0 0-9.001h-7.5v9h.753Zm0 0v-.37m0-15.751h6a3.75 3.75 0 1 1 0 7.5h-6m0-7.5v7.5m0 0v8.25m0-8.25h6.375a4.125 4.125 0 0 1 0 8.25H6.75m.747-15.38h4.875a3.375 3.375 0 0 1 0 6.75H7.497v-6.75Zm0 7.5h5.25a3.75 3.75 0 0 1 0 7.5h-5.25v-7.5Z" />
                        </svg>
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="markdown" className="sr-only">Text Editor</label>
                    <textarea id="markdown" value={markdown} onChange={handleMarkdownChange} />
                </div>
            </div>
            <div className="border border-border rounded-md prose w-full p-4">
                <MarkdownPreview markdown={markdown} />
            </div>
        </div>
    )
}

export default Editor;