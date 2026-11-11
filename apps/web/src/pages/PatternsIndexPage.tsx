import { PATTERNS, PROBLEMS } from '@algoky/shared';
import { Link } from 'react-router';
import { PatternToc } from '../components/PatternToc.tsx';
import { PublicLayout } from '../components/PublicLayout.tsx';

export default function PatternsIndexPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Padrões de algoritmos</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {PATTERNS.length} padrões em ordem de estudo, com {PROBLEMS.length} problemas do LeetCode
          para praticar. Cada página explica a ideia, quando usar, mostra um template em Python,
          TypeScript e Java e lista os problemas essenciais.
        </p>
        <p className="mt-4 text-[15px] text-muted">
          Não sabe por onde começar?{' '}
          <Link
            to="/padroes/arrays-hashing"
            className="font-medium text-text underline decoration-border-strong underline-offset-4 hover:decoration-accent"
          >
            Comece pelo primeiro padrão
          </Link>
          .
        </p>
        <div className="mt-14">
          <PatternToc />
        </div>
      </div>
    </PublicLayout>
  );
}
