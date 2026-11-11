import { Fragment } from 'react';

/** Renderiza trechos entre crases como código inline. Sem HTML: seguro por construção. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('`') && part.endsWith('`') && part.length > 2 ? (
          <code
            key={i}
            className="rounded bg-surface-2 px-1 py-px font-mono text-[0.88em] text-text"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
