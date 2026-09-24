import React from 'react';

interface FormattedMessageProps {
  content: string;
  isUser?: boolean;
}

/**
 * Parses and renders rich formatted AI messages cleanly without raw markdown artifacts
 * like unparsed ** asterisks, hashtags, or messy raw bullets.
 */
export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, isUser = false }) => {
  if (!content) return null;

  // Helper to parse inline styles: bold (**text**), code (`text`), and italic (*text*)
  const parseInline = (text: string): React.ReactNode[] => {
    // Regex splits by **bold**, `code`, or *italic*
    const tokens = text.split(/(\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*)/g);

    return tokens.map((token, index) => {
      if (!token) return null;

      // Bold **text**
      if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
        const inner = token.slice(2, -2);
        return (
          <strong
            key={index}
            className={`font-bold ${isUser ? 'text-white' : 'text-slate-900'}`}
          >
            {inner}
          </strong>
        );
      }

      // Inline code `code`
      if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
        const inner = token.slice(1, -1);
        return (
          <code
            key={index}
            className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold ${
              isUser
                ? 'bg-emerald-700/60 text-emerald-100'
                : 'bg-slate-200/80 text-emerald-800'
            }`}
          >
            {inner}
          </code>
        );
      }

      // Italic *text* (single asterisk)
      if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
        const inner = token.slice(1, -1);
        return (
          <em key={index} className="italic">
            {inner}
          </em>
        );
      }

      return token;
    });
  };

  // Split content into lines and process blocks
  const rawLines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentList: { type: 'bullet' | 'number'; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;

    if (currentList.type === 'bullet') {
      blocks.push(
        <ul key={`list-${blocks.length}`} className="my-2 space-y-1 pl-1">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isUser ? 'bg-white' : 'bg-emerald-600'}`} />
              <span className="flex-1">{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      blocks.push(
        <ol key={`list-${blocks.length}`} className="my-2 space-y-1.5 pl-1">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold mt-0.5 shrink-0 ${
                isUser ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {idx + 1}
              </span>
              <span className="flex-1">{parseInline(item)}</span>
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  rawLines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Heading: ### or ##
    if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      flushList();
      const headingText = trimmed.replace(/^#+\s*/, '');
      blocks.push(
        <h4
          key={`heading-${blocks.length}`}
          className={`font-bold text-sm mt-3 mb-1.5 tracking-tight ${
            isUser ? 'text-white' : 'text-slate-900'
          }`}
        >
          {parseInline(headingText)}
        </h4>
      );
      return;
    }

    // Unordered list item: starts with * or - or •
    const bulletMatch = trimmed.match(/^([*\-•])\s+(.+)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'bullet') {
        flushList();
        currentList = { type: 'bullet', items: [] };
      }
      currentList.items.push(bulletMatch[2]);
      return;
    }

    // Ordered list item: starts with 1. or 2.
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberMatch) {
      if (!currentList || currentList.type !== 'number') {
        flushList();
        currentList = { type: 'number', items: [] };
      }
      currentList.items.push(numberMatch[2]);
      return;
    }

    // Regular paragraph
    flushList();
    blocks.push(
      <p key={`p-${blocks.length}`} className="my-1.5 leading-relaxed text-xs">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1 text-xs">{blocks}</div>;
};
