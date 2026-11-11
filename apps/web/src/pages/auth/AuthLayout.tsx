import { PATTERNS, PROBLEMS } from '@algoky/shared';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Logo } from '../../components/Logo.tsx';

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
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,32rem)]">
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
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
        <p className="text-center text-xs text-subtle">
          Algoky · guia aberto de padrões de algoritmos
        </p>
      </div>

      <aside className="hidden border-l border-border bg-surface lg:flex lg:flex-col lg:justify-center lg:px-14">
        <p className="font-mono text-sm text-muted">
          {PATTERNS.length} padrões · {PROBLEMS.length} problemas
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance">
          O conteúdo é aberto. A conta acompanha o seu estudo.
        </h2>
        <dl className="mt-10 space-y-6">
          {BENEFITS.map(([t, d]) => (
            <div key={t} className="border-l-2 border-border pl-4">
              <dt className="font-medium">{t}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">{d}</dd>
            </div>
          ))}
        </dl>
        <Link
          to="/padroes"
          className="mt-10 inline-flex items-center gap-1.5 self-start text-sm font-medium text-text underline decoration-border-strong underline-offset-4 hover:decoration-accent"
        >
          Prefere estudar sem conta? Ver os padrões <ArrowRight className="h-4 w-4" />
        </Link>
      </aside>
    </div>
  );
}
