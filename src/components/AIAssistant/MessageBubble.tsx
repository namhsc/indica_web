import React from 'react';
import { motion } from 'motion/react';
import { Message, AIConfig } from './types';

interface MessageBubbleProps {
  message: Message;
  aiConfig: AIConfig;
  onSuggestionClick?: (suggestion: string) => void;
}

// Component to render Markdown-friendly content
function MarkdownContent({ content, isUser }: { content: string; isUser: boolean }) {
  // Escape HTML to prevent XSS
  const escapeHtml = (str: string) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return str.replace(/[&<>"']/g, (m) => map[m]);
  };
  
  // Process inline markdown (bold, italic, links)
  const processInlineMarkdown = (text: string): string => {
    let html = text;
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, (match, linkText, url) => {
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="markdown-link">${escapeHtml(linkText)}</a>`;
    });
    
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/gim, '<strong class="markdown-strong">$1</strong>');
    html = html.replace(/__([^_]+)__/gim, '<strong class="markdown-strong">$1</strong>');
    
    // Italic
    html = html.replace(/\*([^*]+)\*/gim, '<em class="markdown-em">$1</em>');
    html = html.replace(/_([^_]+)_/gim, '<em class="markdown-em">$1</em>');
    
    return html;
  };
  
  // Improved markdown parser for common elements
  const parseMarkdown = (text: string) => {
    let html = text;
    
    // Code blocks (process before other markdown)
    html = html.replace(/```([\s\S]*?)```/gim, (match, code) => {
      return `<pre class="markdown-code-block"><code>${escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Inline code (process before bold/italic)
    html = html.replace(/`([^`]+)`/gim, (match, code) => {
      return `<code class="markdown-inline-code">${escapeHtml(code)}</code>`;
    });
    
    // Headers (process line by line)
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let inList = false;
    let listType: 'ul' | 'ol' | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('### ')) {
        if (inList) {
          processedLines.push(`</${listType}>`);
          inList = false;
          listType = null;
        }
        processedLines.push(`<h3 class="markdown-h3">${escapeHtml(trimmed.substring(4))}</h3>`);
        continue;
      }
      if (trimmed.startsWith('## ')) {
        if (inList) {
          processedLines.push(`</${listType}>`);
          inList = false;
          listType = null;
        }
        processedLines.push(`<h2 class="markdown-h2">${escapeHtml(trimmed.substring(3))}</h2>`);
        continue;
      }
      if (trimmed.startsWith('# ')) {
        if (inList) {
          processedLines.push(`</${listType}>`);
          inList = false;
          listType = null;
        }
        processedLines.push(`<h1 class="markdown-h1">${escapeHtml(trimmed.substring(2))}</h1>`);
        continue;
      }
      
      // Lists
      if (/^[-*] /.test(trimmed)) {
        if (!inList || listType !== 'ul') {
          if (inList && listType === 'ol') {
            processedLines.push('</ol>');
          }
          processedLines.push('<ul class="markdown-list markdown-ul">');
          inList = true;
          listType = 'ul';
        }
        const content = trimmed.substring(2);
        processedLines.push(`<li class="markdown-li">${processInlineMarkdown(content)}</li>`);
        continue;
      }
      
      if (/^\d+\. /.test(trimmed)) {
        if (!inList || listType !== 'ol') {
          if (inList && listType === 'ul') {
            processedLines.push('</ul>');
          }
          processedLines.push('<ol class="markdown-list markdown-ol">');
          inList = true;
          listType = 'ol';
        }
        const content = trimmed.replace(/^\d+\. /, '');
        processedLines.push(`<li class="markdown-li">${processInlineMarkdown(content)}</li>`);
        continue;
      }
      
      // Close list if needed
      if (inList && trimmed !== '') {
        processedLines.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
      
      // Regular paragraph
      if (trimmed !== '') {
        processedLines.push(`<p class="markdown-p">${processInlineMarkdown(trimmed)}</p>`);
      } else {
        processedLines.push('<br />');
      }
    }
    
    // Close any open list
    if (inList) {
      processedLines.push(`</${listType}>`);
    }
    
    return processedLines.join('\n');
  };

  const isUserClass = isUser ? 'markdown-user' : 'markdown-ai';
  
  return (
    <div 
      className={`markdown-content ${isUserClass}`}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
}

export const MessageBubble = React.memo(function MessageBubble({ message, aiConfig, onSuggestionClick }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <motion.div 
          className={`rounded-3xl p-4 shadow-md ${
            isUser 
              ? `bg-gradient-to-br ${aiConfig.color} text-white` 
              : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'
          }`}
        >
          <MarkdownContent content={message.content} isUser={isUser} />
        </motion.div>
        
        {message.suggestions && message.suggestions.length > 0 && (
          <SuggestionButtons 
            suggestions={message.suggestions}
            aiConfig={aiConfig}
            onSuggestionClick={onSuggestionClick}
          />
        )}
      </div>
    </motion.div>
  );
});

interface SuggestionButtonsProps {
  suggestions: string[];
  aiConfig: AIConfig;
  onSuggestionClick?: (suggestion: string) => void;
}

function SuggestionButtons({ suggestions, aiConfig, onSuggestionClick }: SuggestionButtonsProps) {
  return (
    <motion.div 
      className="flex flex-wrap gap-2 mt-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {suggestions.map((suggestion, idx) => (
        <motion.div
          key={idx}
        >
          <button
            onClick={() => onSuggestionClick?.(suggestion)}
            className={`text-xs bg-white border border-violet-200 px-3 py-1.5 rounded-lg cursor-pointer`}
          >
            {suggestion}
          </button>
        </motion.div>
      ))}
    </motion.div>
  );
}

