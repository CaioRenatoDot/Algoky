import { GUIDES } from '@algoky/shared';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { PublicLayout } from '../components/PublicLayout.tsx';

export default function GuidesIndexPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Guias de estudo</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Textos curtos e práticos sobre como estudar, resolver problemas e se sair bem na
          entrevista. Complementam as páginas de cada padrão.
        </p>
        <ul className="mt-12 divide-y divide-border border-y border-border">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link to={`/guias/${g.slug}`} className="group flex items-start gap-4 py-6">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold group-hover:text-accent">{g.title}</h2>
                  <p className="mt-1 text-muted">{g.summary}</p>
                  <p className="mt-2 text-xs text-subtle">{g.minutes} min de leitura</p>
                </div>
                <ArrowRight className="mt-1.5 h-5 w-5 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-text" />
              </Link>
            </li>
          ))}
          <li>
            <Link to="/big-o" className="group flex items-start gap-4 py-6">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold group-hover:text-accent">
                  Referência de Big-O
                </h2>
                <p className="mt-1 text-muted">
                  Complexidade de estruturas, ordenações e algoritmos, e qual complexidade cabe nas
                  restrições.
                </p>
                <p className="mt-2 text-xs text-subtle">Consulta</p>
              </div>
              <ArrowRight className="mt-1.5 h-5 w-5 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-text" />
            </Link>
          </li>
        </ul>
      </div>
    </PublicLayout>
  );
}
