import ReactMarkdown, { type Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';

/**
 * MarkdownPreviewProps
 * 
 * @description MarkdownPreviewProps is the props for the MarkdownPreview component.
 */
interface MarkdownPreviewProps {
    markdown: string;
}

/**
 * MarkdownPreview
 * 
 * @description MarkdownPreview is the component to preview markdown content.
 * 
 * @param markdown - The markdown content to preview
 * 
 * @returns - Rendered component
 */
const MarkdownPreview = ({ markdown }: MarkdownPreviewProps) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    return !isInline ? (
                        <SyntaxHighlighter
                            style={dracula}
                            language={match[1]}
                            PreTag="div"
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                }
            } as Components}
        >
            {markdown}
        </ReactMarkdown>
    )
};

export default MarkdownPreview;