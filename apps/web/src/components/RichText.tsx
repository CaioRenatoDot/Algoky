import { Fragment } from 'react';
import { Link } from 'react-router';

const TOKEN = /(`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

/**
 * Renderiza texto com `código inline` e [links](/caminho). Sem HTML: seguro
 * por construção. Links internos usam o roteador; externos abrem em nova aba.
 */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code
              key={i}
              className="rounded bg-surface-2 px-1 py-px font-mono text-[0.88em] text-text"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (link) {
          const [, label, href] = link;
          const cls =
            'font-medium text-text underline decoration-border-strong underline-offset-4 hover:decoration-accent';
          return href!.startsWith('/') ? (
            <Link key={i} to={href!} className={cls}>
              {label}
            </Link>
          ) : (
            <a key={i} href={href} target="_blank" rel="noreferrer" className={cls}>
              {label}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
