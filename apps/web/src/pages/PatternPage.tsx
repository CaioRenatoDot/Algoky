import {
  PATTERNS,
  PATTERNS_BY_ID,
  PROBLEMS,
  roadmapOrder,
  TEMPLATE_LANGUAGES,
  type TemplateLanguage,
} from '@algoky/shared';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Eye,
  HardDrive,
  Lightbulb,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Page } from '../components/AppShell.tsx';
import { CodeBlock } from '../components/CodeBlock.tsx';
import { ProblemDrawer } from '../components/ProblemDrawer.tsx';
import { ProblemList } from '../components/ProblemList.tsx';
import { RichText } from '../components/RichText.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Segmented } from '../components/ui/Segmented.tsx';
import { ProgressBar } from '../components/ui/Progress.tsx';
import { Visualizer, VISUALIZER_TITLE } from '../components/visualizer/Visualizer.tsx';
import { useMe, useProgress } from '../lib/queries.ts';
import { useStatuses } from '../lib/useStatuses.ts';
import { NotFoundPage } from './NotFoundPage.tsx';

const LANG_LABEL: Record<TemplateLanguage, string> = {
  python: 'Python',
  typescript: 'TypeScript',
  java: 'Java',
};

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        {icon}
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function PatternPage() {
  const { patternId } = useParams();
  const pattern = patternId ? PATTERNS_BY_ID.get(patternId) : undefined;
  const { data: me } = useMe();
  const { data: progress } = useProgress();
  const { byPattern } = useStatuses();
  const [lang, setLang] = useState<TemplateLanguage | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const problems = useMemo(
    () =>
      pattern
        ? roadmapOrder(
            PROBLEMS.filter((p) => p.pattern === pattern.id),
            PATTERNS,
          )
        : [],
    [pattern],
  );

  if (!pattern) return <NotFoundPage />;

  const language = lang ?? me?.preferredLanguage ?? 'python';
  const prog = byPattern.get(pattern.id);
  const prev = PATTERNS.find((p) => p.order === pattern.order - 1);
  const next = PATTERNS.find((p) => p.order === pattern.order + 1);
  const essentials = problems.filter((p) => p.essential);
  const others = problems.filter((p) => !p.essential);

  return (
    <Page className="max-w-5xl">
      <Link
        to="/app/trilha"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" /> Trilha
      </Link>

      <header className="mt-4">
        <p className="font-mono text-sm text-accent">
          Padrão {String(pattern.order).padStart(2, '0')}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{pattern.name}</h1>
        <p className="mt-2 text-lg text-muted">{pattern.tagline}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="w-56">
            <div className="flex justify-between text-xs text-muted">
              <span>Progresso</span>
              <span className="tabular-nums">
                {prog?.solved ?? 0}/{prog?.total ?? problems.length}
              </span>
            </div>
            <ProgressBar value={prog?.solved ?? 0} max={prog?.total ?? 1} className="mt-1.5" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            <Clock className="h-4 w-4" /> {pattern.complexity.time}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            <HardDrive className="h-4 w-4" /> {pattern.complexity.space}
          </span>
        </div>
        {pattern.prerequisites.length > 0 && (
          <p className="mt-4 text-sm text-muted">
            Antes, vale dominar:{' '}
            {pattern.prerequisites.map((id, i) => (
              <span key={id}>
                {i > 0 && ', '}
                <Link
                  to={`/app/trilha/${id}`}
                  className="font-medium text-text underline decoration-border underline-offset-4 hover:decoration-accent"
                >
                  {PATTERNS_BY_ID.get(id)?.name}
                </Link>
              </span>
            ))}
          </p>
        )}
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-10">
          <Section title="A ideia">
            <div className="space-y-3 text-[15px] leading-relaxed text-text/90">
              {pattern.description.map((p, i) => (
                <p key={i}>
                  <RichText text={p} />
                </p>
              ))}
            </div>
          </Section>

          {pattern.visualizer && (
            <Section
              title={`Veja funcionando: ${VISUALIZER_TITLE[pattern.visualizer]}`}
              icon={<Eye className="h-5 w-5 text-accent" />}
            >
              <Visualizer kind={pattern.visualizer} />
            </Section>
          )}

          <Section title="Template">
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

          <Section title="Pratique">
            {essentials.length > 0 && (
              <>
                <h3 className="mb-2 text-sm font-medium text-muted">Essenciais</h3>
                <ProblemList
                  problems={essentials}
                  progress={progress}
                  onOpen={setOpenSlug}
                  showPattern={false}
                />
              </>
            )}
            {others.length > 0 && (
              <>
                <h3 className="mb-2 mt-6 text-sm font-medium text-muted">Para aprofundar</h3>
                <ProblemList
                  problems={others}
                  progress={progress}
                  onOpen={setOpenSlug}
                  showPattern={false}
                />
              </>
            )}
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-medium" /> Quando usar
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {pattern.signals.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span>
                    <RichText text={s} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-hard" /> Armadilhas
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {pattern.pitfalls.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-hard" aria-hidden />
                  <span>
                    <RichText text={s} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      <nav
        className="mt-14 grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
        aria-label="Navegação entre padrões"
      >
        {prev ? (
          <Link
            to={`/app/trilha/${prev.id}`}
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
            to={`/app/trilha/${next.id}`}
            className="group rounded-xl border border-border p-4 text-right hover:border-border-strong"
          >
            <span className="flex items-center justify-end gap-1 text-xs text-muted">
              Próximo <ArrowRight className="h-3.5 w-3.5" />
            </span>
            <span className="mt-1 block font-medium group-hover:text-accent">{next.name}</span>
          </Link>
        )}
      </nav>

      <ProblemDrawer slug={openSlug} onClose={() => setOpenSlug(null)} />
    </Page>
  );
}
