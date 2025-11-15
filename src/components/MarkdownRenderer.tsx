import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Style headings
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-5 mb-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2" {...props} />
          ),
          // Style paragraphs
          p: ({ node, ...props }) => (
            <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 mb-3" {...props} />
          ),
          // Style strong/bold text
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-900 dark:text-white" {...props} />
          ),
          // Style lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-gray-800 dark:text-gray-200" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-800 dark:text-gray-200" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-sm leading-relaxed ml-4" {...props} />
          ),
          // Style tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-blue-50 dark:bg-blue-900/30" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600" {...props} />
          ),
          // Style horizontal rules
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-t-2 border-dashed border-gray-300 dark:border-gray-600" {...props} />
          ),
          // Style code blocks
          code: ({ node, className, children, ...props }: any) => {
            const isInline = !className;
            return isInline ? (
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className="block p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-xs font-mono overflow-x-auto my-3" {...props}>
                {children}
              </code>
            );
          },
          // Style blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-400 dark:border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 my-4" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
