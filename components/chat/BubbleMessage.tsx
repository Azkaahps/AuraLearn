import { ReactNode } from 'react';
import { MarkdownText } from '@/components/ui/markdown-text';

interface BubbleMessageProps {
  role: 'user' | 'assistant';
  content: string | ReactNode;
}

export function BubbleMessage({ role, content }: BubbleMessageProps) {
  const isUser = role === 'user';
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div 
         className={`max-w-[90%] md:max-w-[80%] px-6 py-4.5 rounded-[18px] shadow-md ${
           isUser 
             ? 'bg-[#150f23] text-white border border-slate-900 dark:bg-[#422082] dark:text-white dark:border-[#6a5fc1] rounded-br-[4px]' 
             : 'bg-white dark:bg-[#150f23] text-slate-900 dark:text-white border border-slate-200 dark:border-[#362d59] rounded-bl-[4px]'
         }`}
      >
        {isUser ? (
          <div className="font-sans text-sm leading-relaxed text-white whitespace-pre-wrap font-medium">
             {typeof content === 'string' ? content : content}
          </div>
        ) : (
          <div className="text-slate-900 dark:text-white">
            {typeof content === 'string' ? (
              <MarkdownText content={content} />
            ) : (
              content
            )}
          </div>
        )}
      </div>
    </div>
  );
}
