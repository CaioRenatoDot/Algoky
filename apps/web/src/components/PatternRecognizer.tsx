import { PATTERNS_BY_ID } from '@algoky/shared';
import { clsx } from 'clsx';
import { ArrowRight } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router';

/** Trechos de enunciado; o que está entre [colchetes] é o sinal que denuncia o padrão. */
const EXAMPLES: Array<{ text: string; pattern: string }> = [
  {
    text: 'Dado um [array ordenado], encontre [dois números] cuja soma seja igual ao alvo.',
    pattern: 'two-pointers',
  },
  {
    text: 'Encontre o tamanho da [maior substring] [sem caracteres repetidos].',
    pattern: 'sliding-window',
  },
  {
    text: 'Encontre o mínimo de um array [ordenado e rotacionado] em [O(log n)].',
    pattern: 'binary-search',
  },
  {
    text: 'Dada uma lista de cursos e seus [pré-requisitos], é possível [concluir todos]?',
    pattern: 'topological-sort',
  },
  {
    text: 'De [quantas maneiras] dá para subir n degraus [dando 1 ou 2 passos]?',
    pattern: 'dp-1d',
  },
  { text: 'Conte o número de [ilhas] em uma [grade] de terra e água.', pattern: 'graphs' },
];

function Statement({ text, reveal }: { text: string; reveal: boolean }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/g).map((part, i) =>
        part.startsWith('[') ? (
          <mark
            key={i}
            className={clsx(
              'rounded px-0.5 text-inherit transition-colors duration-500',
              reveal
                ? 'bg-accent-soft underline decoration-accent decoration-2 underline-offset-4'
                : 'bg-transparent',
            )}
          >
            {part.slice(1, -1)}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * "Reconheça o padrão": mostra um enunciado, destaca os sinais e revela o padrão.
 * É a ideia central do Algoky em um exemplo, sem precisar explicá-la.
 */
export function PatternRecognizer() {
  const [index, setIndex] = useState(0);
  // Com movimento reduzido, não há animação: os sinais já aparecem destacados.
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [reveal, setReveal] = useState(reduced);
  const [paused, setPaused] = useState(false);
  const example = EXAMPLES[index]!;
  const pattern = PATTERNS_BY_ID.get(example.pattern)!;

  useEffect(() => {
    if (reduced || paused) return;
    const t = setTimeout(
      () => {
        if (!reveal) setReveal(true);
        else {
          setReveal(false);
          setIndex((i) => (i + 1) % EXAMPLES.length);
        }
      },
      reveal ? 3200 : 1400,
    );
    return () => clearTimeout(t);
  }, [reveal, paused, reduced]);

  const go = (i: number) => {
    setIndex(i);
    setReveal(true);
  };

  return (
    <div
      className="rounded-2xl border border-border bg-surface shadow-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="text-sm font-medium">Reconheça o padrão</span>
        <div className="flex gap-1.5" role="tablist" aria-label="Exemplos">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.pattern}
              role="tab"
              aria-selected={i === index}
              aria-label={`Exemplo ${i + 1}`}
              onClick={() => go(i)}
              className={clsx(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-5 bg-text' : 'w-1.5 bg-border-strong hover:bg-muted',
              )}
            />
          ))}
        </div>
      </div>
      <div className="px-5 py-6 sm:px-6">
        <p className="min-h-[5.5rem] text-lg leading-relaxed sm:text-xl" aria-live="polite">
          “<Statement text={example.text} reveal={reveal} />”
        </p>
        <div
          className={clsx(
            'mt-6 flex items-center justify-between gap-4 border-t border-dashed border-border pt-4 transition-opacity duration-500',
            reveal ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="min-w-0">
            <p className="text-xs text-muted">Padrão</p>
            <p className="truncate font-semibold">{pattern.name}</p>
          </div>
          <Link
            to={`/padroes/${pattern.id}`}
            tabIndex={reveal ? 0 : -1}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Estudar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
