import { PATTERNS, PROBLEMS } from '@algoky/shared';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { DotPattern } from '../../components/DotPattern.tsx';
import { Logo } from '../../components/Logo.tsx';
import { AuthShowcase } from './AuthShowcase.tsx';

const BENEFITS = [
  ['Progresso por padrão', 'Marque o que resolveu e veja quanto falta em cada parte da trilha.'],
  ['Revisão espaçada', 'Problemas resolvidos voltam para revisão antes de serem esquecidos.'],
  ['Meta diária e streak', 'Um ritmo que você escolhe, com o histórico do ano à vista.'],
  ['Notas e modo foco', 'Guarde a ideia-chave de cada problema e estude com timer.'],
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] xl:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Algoky, início">
            <Logo size="sm" />
          </Link>
          <Link
            to="/padroes"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" /> Padrões
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-[21rem] flex-1 flex-col justify-center py-10">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        <p className="text-center text-xs text-subtle">
          Algoky · guia aberto de padrões de algoritmos
        </p>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-border bg-surface-2/60 lg:flex lg:flex-col lg:justify-center lg:px-12 xl:px-20">
        <DotPattern />
        <div className="relative mx-auto w-full max-w-md">
          <p className="font-mono text-sm text-muted">
            {PATTERNS.length} padrões · {PROBLEMS.length} problemas
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-balance">
            O conteúdo é aberto. A conta acompanha o seu estudo.
          </h2>
          <div className="mt-8">
            <AuthShowcase />
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5">
            {BENEFITS.map(([t, d]) => (
              <div key={t}>
                <dt className="text-sm font-medium">{t}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-muted">{d}</dd>
              </div>
            ))}
          </dl>
          <Link
            to="/padroes"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-text underline decoration-border-strong underline-offset-4 hover:decoration-accent"
          >
            Prefere estudar sem conta? Ver os padrões <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
