import { PATTERNS, PATTERNS_BY_ID, PROBLEMS } from '@algoky/shared';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { DotPattern } from '../components/DotPattern.tsx';
import { PatternRecognizer } from '../components/PatternRecognizer.tsx';
import { PatternToc } from '../components/PatternToc.tsx';
import { PublicLayout } from '../components/PublicLayout.tsx';
import { RichText } from '../components/RichText.tsx';
import { ButtonLink } from '../components/ui/Button.tsx';
import { useMe } from '../lib/queries.ts';

const sample = PATTERNS_BY_ID.get('two-pointers')!;

const TRACKING = [
  ['Meta diária e streak', 'Defina quantos problemas quer fazer por dia e acompanhe a sequência.'],
  ['Revisão espaçada', 'O que você resolveu volta para revisão antes de ser esquecido.'],
  ['Notas por problema', 'Anote a ideia-chave; ela reaparece na hora de revisar.'],
  ['Modo foco', 'Timer de sessões ligado ao problema que você está resolvendo.'],
];

export function LandingPage() {
  const { data: me } = useMe();

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border">
        <DotPattern className="text-border/80" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-5xl">
              Os padrões por trás dos problemas de entrevista.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty">
              A maioria dos problemas é uma variação de poucos padrões. Aprenda a reconhecer os
              sinais no enunciado e a aplicar a técnica certa, com {PATTERNS.length} padrões
              explicados em português e {PROBLEMS.length} problemas do LeetCode para praticar.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink
                to="/padroes/arrays-hashing"
                size="lg"
                className="flex-row-reverse"
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Começar a estudar
              </ButtonLink>
              <ButtonLink to="/padroes" size="lg" variant="secondary">
                Ver os {PATTERNS.length} padrões
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-muted">
              Sem cadastro. Nunca estudou algoritmos?{' '}
              <Link
                to="/comece-aqui"
                className="font-medium text-text underline decoration-border-strong underline-offset-4 hover:decoration-accent"
              >
                Comece aqui
              </Link>
              .
            </p>
          </div>
          <PatternRecognizer />
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1.15fr] md:items-start">
          <div>
            <p className="text-sm font-medium text-muted">Como é cada padrão</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{sample.name}</h2>
            <p className="mt-2 text-muted">{sample.tagline}</p>
            <p className="mt-6 text-sm font-medium">Quando usar</p>
            <ul className="mt-2 space-y-1.5 text-[15px] text-muted">
              {sample.signals.slice(0, 3).map((s) => (
                <li key={s}>
                  — <RichText text={s} />
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">
              Cada página também traz a explicação completa, uma visualização passo a passo, a
              complexidade, as armadilhas comuns e os problemas essenciais.
            </p>
            <Link
              to={`/padroes/${sample.id}`}
              className="mt-6 inline-flex items-center gap-1.5 font-medium text-text underline decoration-border-strong underline-offset-4 hover:decoration-accent"
            >
              Ler {sample.name} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-border bg-surface-2 p-5 font-mono text-[13px] leading-relaxed text-text">
            <code>{sample.templates.python}</code>
          </pre>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight">Sumário</h2>
        <p className="mt-2 text-muted">Siga na ordem: cada padrão se apoia nos anteriores.</p>
        <div className="mt-10">
          <PatternToc />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight">Para estudar com constância</h2>
          <p className="mt-3 leading-relaxed text-muted">
            O conteúdo é aberto para qualquer pessoa. Com uma conta (gratuita), o Algoky também
            acompanha o seu estudo:
          </p>
          <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {TRACKING.map(([title, text]) => (
              <div key={title}>
                <dt className="font-medium">{title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">{text}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10">
            {me ? (
              <ButtonLink to="/app" variant="secondary">
                Ir para o meu painel
              </ButtonLink>
            ) : (
              <ButtonLink to="/cadastro" variant="secondary">
                Criar conta
              </ButtonLink>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
