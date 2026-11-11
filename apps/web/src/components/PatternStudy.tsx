import {
  PATTERNS,
  PATTERNS_BY_ID,
  PROBLEMS,
  TEMPLATE_LANGUAGES,
  leetcodeUrl,
  roadmapOrder,
  type Pattern,
  type Problem,
  type TemplateLanguage,
} from '@algoky/shared';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useMe, useProgress } from '../lib/queries.ts';
import { CodeBlock } from './CodeBlock.tsx';
import { ProblemDrawer } from './ProblemDrawer.tsx';
import { ProblemList } from './ProblemList.tsx';
import { RichText } from './RichText.tsx';
import { DifficultyBadge } from './ui/Badge.tsx';
import { Segmented } from './ui/Segmented.tsx';
import { Visualizer, VISUALIZER_TITLE } from './visualizer/Visualizer.tsx';

const LANG_LABEL: Record<TemplateLanguage, string> = {
  python: 'Python',
  typescript: 'TypeScript',
  java: 'Java',
};

/** Seções da página de estudo, na ordem de leitura (usadas também no índice lateral). */
export function studySections(pattern: Pattern) {
  return [
    { id: 'ideia', label: 'A ideia' },
    { id: 'quando-usar', label: 'Quando usar' },
    ...(pattern.visualizer ? [{ id: 'visualizacao', label: 'Visualização' }] : []),
    { id: 'template', label: 'Template' },
    { id: 'complexidade', label: 'Complexidade' },
    { id: 'armadilhas', label: 'Armadilhas' },
    { id: 'problemas', label: 'Problemas' },
  ];
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 text-[15px] leading-relaxed">
      {items.map((s) => (
        <li key={s} className="flex gap-3">
          <span
            className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-border-strong"
            aria-hidden
          />
          <span>
            <RichText text={s} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Lista de problemas sem progresso, para quem estuda sem conta. */
function PlainProblemList({ problems }: { problems: Problem[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
      {problems.map((p) => (
        <li key={p.slug}>
          <a
            href={leetcodeUrl(p.slug)}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 px-4 py-3 hover:bg-surface-2"
          >
            <span className="w-10 shrink-0 font-mono text-xs text-subtle">{p.id}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium group-hover:text-accent">
              {p.title}
            </span>
            <DifficultyBadge difficulty={p.difficulty} />
            <ExternalLink className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function PatternStudy({
  pattern,
  linkBase,
}: {
  pattern: Pattern;
  linkBase: '/padroes' | '/app/trilha';
}) {
  const { data: me } = useMe();
  const { data: progress } = useProgress(!!me);
  const [lang, setLang] = useState<TemplateLanguage | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const language = lang ?? me?.preferredLanguage ?? 'python';

  const problems = useMemo(
    () =>
      roadmapOrder(
        PROBLEMS.filter((p) => p.pattern === pattern.id),
        PATTERNS,
      ),
    [pattern],
  );
  const essentials = problems.filter((p) => p.essential);
  const others = problems.filter((p) => !p.essential);
  const prev = PATTERNS.find((p) => p.order === pattern.order - 1);
  const next = PATTERNS.find((p) => p.order === pattern.order + 1);

  const list = (items: Problem[]) =>
    me ? (
      <ProblemList problems={items} progress={progress} onOpen={setOpenSlug} showPattern={false} />
    ) : (
      <PlainProblemList problems={items} />
    );

  return (
    <article>
      <header>
        <p className="font-mono text-sm text-muted">
          Padrão {String(pattern.order).padStart(2, '0')} de {PATTERNS.length}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{pattern.name}</h1>
        <p className="mt-3 text-lg text-muted">{pattern.tagline}</p>
        {pattern.prerequisites.length > 0 && (
          <p className="mt-5 text-sm text-muted">
            Pré-requisitos:{' '}
            {pattern.prerequisites.map((id, i) => (
              <span key={id}>
                {i > 0 && ', '}
                <Link
                  to={`${linkBase}/${id}`}
                  className="font-medium text-text underline decoration-border-strong underline-offset-4 hover:decoration-accent"
                >
                  {PATTERNS_BY_ID.get(id)?.name}
                </Link>
              </span>
            ))}
          </p>
        )}
      </header>

      <div className="mt-12 space-y-14">
        <Section id="ideia" title="A ideia">
          <div className="space-y-4 text-[16px] leading-[1.75]">
            {pattern.description.map((p, i) => (
              <p key={i}>
                <RichText text={p} />
              </p>
            ))}
          </div>
        </Section>

        <Section id="quando-usar" title="Quando usar">
          <p className="mb-4 text-[15px] text-muted">
            Sinais no enunciado de que este padrão provavelmente resolve o problema:
          </p>
          <BulletList items={pattern.signals} />
        </Section>

        {pattern.visualizer && (
          <Section
            id="visualizacao"
            title={`Visualização: ${VISUALIZER_TITLE[pattern.visualizer].toLowerCase()}`}
          >
            <p className="mb-4 text-[15px] text-muted">
              Avance passo a passo ou anime. Edite a entrada para testar seus próprios casos.
            </p>
            <Visualizer kind={pattern.visualizer} />
          </Section>
        )}

        <Section id="template" title="Template">
          <p className="mb-4 text-[15px] text-muted">
            O esqueleto que se repete nos problemas do padrão. Entenda cada linha antes de decorar.
          </p>
          <div className="mb-3">
            <Segmented
              label="Linguagem do template"
              size="sm"
              value={language}
              onChange={setLang}
              options={TEMPLATE_LANGUAGES.map((l) => ({ value: l, label: LANG_LABEL[l] }))}
            />
          </div>
          <CodeBlock code={pattern.templates[language]} language={language} />
        </Section>

        <Section id="complexidade" title="Complexidade">
          <dl className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            <div className="bg-surface p-4">
              <dt className="text-sm text-muted">Tempo</dt>
              <dd className="mt-1 font-mono text-[15px]">{pattern.complexity.time}</dd>
            </div>
            <div className="bg-surface p-4">
              <dt className="text-sm text-muted">Espaço</dt>
              <dd className="mt-1 font-mono text-[15px]">{pattern.complexity.space}</dd>
            </div>
          </dl>
        </Section>

        <Section id="armadilhas" title="Armadilhas comuns">
          <BulletList items={pattern.pitfalls} />
        </Section>

        <Section id="problemas" title="Problemas para praticar">
          {!me && (
            <p className="mb-5 text-[15px] text-muted">
              Os links abrem no LeetCode.{' '}
              <Link
                to="/cadastro"
                className="font-medium text-text underline decoration-border-strong underline-offset-4 hover:decoration-accent"
              >
                Crie uma conta
              </Link>{' '}
              para marcar o que já resolveu, guardar notas e receber revisões.
            </p>
          )}
          {essentials.length > 0 && (
            <>
              <h3 className="mb-2 text-sm font-medium text-muted">Essenciais · comece por estes</h3>
              {list(essentials)}
            </>
          )}
          {others.length > 0 && (
            <>
              <h3 className="mb-2 mt-8 text-sm font-medium text-muted">Para aprofundar</h3>
              {list(others)}
            </>
          )}
        </Section>
      </div>

      <nav
        className="mt-16 grid gap-3 border-t border-border pt-8 sm:grid-cols-2"
        aria-label="Navegação entre padrões"
      >
        {prev ? (
          <Link
            to={`${linkBase}/${prev.id}`}
            className="group rounded-xl border border-border p-4 hover:border-border-strong"
          >
            <span className="flex items-center gap-1 text-xs text-muted">
              <ArrowLeft className="h-3.5 w-3.5" /> Anterior
            </span>
            <span className="mt-1 block font-medium group-hover:text-accent">{prev.name}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            to={`${linkBase}/${next.id}`}
            className="group rounded-xl border border-border p-4 text-right hover:border-border-strong"
          >
            <span className="flex items-center justify-end gap-1 text-xs text-muted">
              Próximo <ArrowRight className="h-3.5 w-3.5" />
            </span>
            <span className="mt-1 block font-medium group-hover:text-accent">{next.name}</span>
          </Link>
        )}
      </nav>

      {me && <ProblemDrawer slug={openSlug} onClose={() => setOpenSlug(null)} />}
    </article>
  );
}
