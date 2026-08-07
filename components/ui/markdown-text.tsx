'use client';

/**
 * MarkdownText — Renderer markdown khusus Sentry Design Language.
 * Mendukung: **bold**, *italic*, `code`, ## heading, - bullet list, 1. numbered list, paragraf.
 * Memastikan output Tutor AI tidak lagi menampilkan tanda bintang raw (**) dan mudah dibaca pengguna.
 */

interface MarkdownTextProps {
  content: string;
  className?: string;
}

function parseLine(line: string, keyPrefix: number) {
  // Process code blocks (`code`), bold (**bold**), and italic (*italic*)
  const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  const rendered = parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="font-mono text-xs text-[#c2ef4e] bg-[#1f1633] border border-[#362d59] px-1.5 py-0.5 rounded-[4px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white font-display tracking-tight text-sm">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-[#c2ef4e] font-sans text-sm">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
  return <>{rendered}</>;
}

export function MarkdownText({ content, className = '' }: MarkdownTextProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let numberedBuffer: { n: string; text: string }[] = [];

  const flushBullets = (key: string) => {
    if (bulletBuffer.length > 0) {
      elements.push(
        <ul key={key} className="list-none space-y-2 my-3">
          {bulletBuffer.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/90">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#c2ef4e] shrink-0" />
              <div className="flex-1">{parseLine(item, i)}</div>
            </li>
          ))}
        </ul>
      );
      bulletBuffer = [];
    }
  };

  const flushNumbered = (key: string) => {
    if (numberedBuffer.length > 0) {
      elements.push(
        <ol key={key} className="space-y-3 my-3">
          {numberedBuffer.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-white/90">
              <span className="shrink-0 w-6 h-6 rounded-[6px] bg-[#422082] border border-[#362d59] text-[#c2ef4e] font-mono text-xs font-bold flex items-center justify-center mt-0.5 shadow-sm">
                {item.n}
              </span>
              <div className="flex-1 pt-0.5">{parseLine(item.text, i)}</div>
            </li>
          ))}
        </ol>
      );
      numberedBuffer = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Heading ###
    if (trimmed.startsWith('### ')) {
      flushBullets(`b-${idx}`);
      flushNumbered(`n-${idx}`);
      elements.push(
        <h4 key={idx} className="font-display font-bold text-base text-white mt-4 mb-2 tracking-tight">
          {parseLine(trimmed.slice(4), idx)}
        </h4>
      );
      return;
    }
    // Heading ##
    if (trimmed.startsWith('## ')) {
      flushBullets(`b-${idx}`);
      flushNumbered(`n-${idx}`);
      elements.push(
        <h3 key={idx} className="font-display font-bold text-lg text-white mt-5 mb-2 tracking-tight border-b border-[#362d59] pb-1">
          {parseLine(trimmed.slice(3), idx)}
        </h3>
      );
      return;
    }

    // Bullet list: - atau *
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      flushNumbered(`n-${idx}`);
      bulletBuffer.push(bulletMatch[1]);
      return;
    }

    // Numbered list: 1. 2. 3.
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      flushBullets(`b-${idx}`);
      numberedBuffer.push({ n: numberedMatch[1], text: numberedMatch[2] });
      return;
    }

    // Empty line = flush buffers
    if (trimmed === '') {
      flushBullets(`b-${idx}`);
      flushNumbered(`n-${idx}`);
      return;
    }

    // Normal paragraph
    flushBullets(`b-${idx}`);
    flushNumbered(`n-${idx}`);
    elements.push(
      <p key={idx} className="text-sm leading-relaxed text-white/90 my-1 font-sans">
        {parseLine(trimmed, idx)}
      </p>
    );
  });

  // Flush remaining buffers
  flushBullets('final-b');
  flushNumbered('final-n');

  return (
    <div className={`space-y-2 font-sans ${className}`}>
      {elements}
    </div>
  );
}
