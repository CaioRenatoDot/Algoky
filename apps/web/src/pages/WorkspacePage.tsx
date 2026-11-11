import {
  PATTERNS_BY_ID,
  PROBLEMS_BY_SLUG,
  TEMPLATE_LANGUAGES,
  leetcodeUrl,
  type ProblemState,
  type ProblemStatus,
  type TemplateLanguage,
} from '@algoky/shared';
import { clsx } from 'clsx';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Eye,
  FileCode2,
  Lightbulb,
  Timer,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { CodeEditor } from '../components/CodeEditor.tsx';
import { RichText } from '../components/RichText.tsx';
import { DifficultyBadge } from '../components/ui/Badge.tsx';
import { Button, buttonClass } from '../components/ui/Button.tsx';
import { PageLoader } from '../components/ui/Feedback.tsx';
import { Textarea } from '../components/ui/Field.tsx';
import { Segmented } from '../components/ui/Segmented.tsx';
import { useMe, useProgress, useSaveDraft, useUpdateProblem } from '../lib/queries.ts';
import { NotFoundPage } from './NotFoundPage.tsx';

const LANG_LABEL: Record<TemplateLanguage, string> = {
  python: 'Python',
  typescript: 'TypeScript',
  java: 'Java',
};
const SAVE_DELAY = 1000;

/** Salva com atraso enquanto a pessoa digita; devolve o estado do salvamento. */
function useAutosave(save: (value: string) => Promise<unknown>, initial: string) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle');
  const last = useRef(initial);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const schedule = (value: string) => {
    clearTimeout(timer.current);
    if (value === last.current) return;
    setStatus('pending');
    timer.current = setTimeout(async () => {
      setStatus('saving');
      try {
        await save(value);
        last.current = value;
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    }, SAVE_DELAY);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return { status, schedule };
}

function SaveStatus({ status }: { status: ReturnType<typeof useAutosave>['status'] }) {
  const text = {
    idle: '',
    pending: 'Alterações não salvas',
    saving: 'Salvando…',
    saved: 'Salvo',
    error: 'Erro ao salvar',
  }[status];
  return (
    <span
      className={clsx('text-xs', status === 'error' ? 'text-hard-text' : 'text-muted')}
      aria-live="polite"
    >
      {text}
    </span>
  );
}

function Hint({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium"
      >
        {title}
        {!open && (
          <span className="inline-flex items-center gap-1 text-xs font-normal text-muted">
            <Eye className="h-3.5 w-3.5" /> Revelar
          </span>
        )}
      </button>
      {open && (
        <div className="animate-fade-up border-t border-border px-3 py-3 text-sm text-muted">
          {children}
        </div>
      )}
    </div>
  );
}

export default function WorkspacePage() {
  const { slug } = useParams();
  const problem = slug ? PROBLEMS_BY_SLUG.get(slug) : undefined;
  const { data: me } = useMe();
  const { data: progress, isPending } = useProgress();
  if (!problem) return <NotFoundPage />;
  if (isPending || !me) return <PageLoader />;
  return (
    <Workspace
      key={problem.slug}
      slug={problem.slug}
      initialState={progress?.get(problem.slug)}
      preferred={me.preferredLanguage}
    />
  );
}

function Workspace({
  slug,
  initialState,
  preferred,
}: {
  slug: string;
  initialState: ProblemState | undefined;
  preferred: TemplateLanguage;
}) {
  const problem = PROBLEMS_BY_SLUG.get(slug)!;
  const pattern = PATTERNS_BY_ID.get(problem.pattern)!;
  const { data: progress } = useProgress();
  const state = progress?.get(slug) ?? initialState;
  const update = useUpdateProblem();
  const saveDraft = useSaveDraft();

  const [language, setLanguage] = useState<TemplateLanguage>(
    initialState?.codeLanguage ?? preferred,
  );
  const [code, setCode] = useState(initialState?.code ?? '');
  const [notes, setNotes] = useState(initialState?.notes ?? '');
  const [copied, setCopied] = useState(false);

  const codeSave = useAutosave(
    (value) => saveDraft.mutateAsync({ slug, patch: { code: value, codeLanguage: language } }),
    initialState?.code ?? '',
  );
  const notesSave = useAutosave(
    (value) => saveDraft.mutateAsync({ slug, patch: { notes: value } }),
    initialState?.notes ?? '',
  );

  const changeLanguage = (next: TemplateLanguage) => {
    setLanguage(next);
    void saveDraft.mutateAsync({ slug, patch: { codeLanguage: next } });
  };
  const insertTemplate = () => {
    const template = pattern.templates[language];
    const next = code.trim() ? `${code.trimEnd()}\n\n${template}\n` : `${template}\n`;
    setCode(next);
    codeSave.schedule(next);
  };
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const setStatus = (status: ProblemStatus) => update.mutate({ slug, patch: { status } });

  useEffect(() => {
    const prev = document.title;
    document.title = `${problem.title} · Algoky`;
    return () => {
      document.title = prev;
    };
  }, [problem.title]);

  return (
    <div className="flex min-h-[calc(100dvh-57px)] flex-col lg:h-dvh lg:min-h-0">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/app/problemas"
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-text"
            aria-label="Voltar aos problemas"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-semibold">
              {problem.id}. {problem.title}
            </h1>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
              <DifficultyBadge difficulty={problem.difficulty} />
              <Link to={`/app/trilha/${pattern.id}`} className="hover:text-text">
                {pattern.name}
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Status"
            size="sm"
            value={state?.status ?? 'todo'}
            onChange={setStatus}
            options={[
              { value: 'todo', label: 'A fazer' },
              { value: 'attempted', label: 'Tentado' },
              { value: 'solved', label: 'Resolvido' },
            ]}
          />
          <a
            href={leetcodeUrl(slug)}
            target="_blank"
            rel="noreferrer"
            className={buttonClass('primary', 'sm')}
          >
            Enunciado e envio <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
        <aside className="space-y-6 overflow-y-auto border-b border-border p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <section>
            <h2 className="text-sm font-semibold">Como usar</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Leia o enunciado no LeetCode, planeje e escreva sua solução aqui. O código e as notas
              são salvos automaticamente; para enviar, copie o código para o LeetCode.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-medium" /> Dicas
            </h2>
            <p className="text-xs text-muted">Revele só o necessário. Tente primeiro sem ajuda.</p>
            <Hint title="1. Qual padrão?">
              <p>
                <span className="font-medium text-text">{pattern.name}</span>: {pattern.tagline}
              </p>
            </Hint>
            <Hint title="2. Sinais do padrão">
              <ul className="space-y-1.5">
                {pattern.signals.map((s) => (
                  <li key={s}>
                    • <RichText text={s} />
                  </li>
                ))}
              </ul>
            </Hint>
            <Hint title="3. Complexidade esperada">
              <p className="font-mono text-[13px] text-text">
                {pattern.complexity.time} · {pattern.complexity.space}
              </p>
            </Hint>
            <Hint title="4. Template do padrão">
              <p>Insira o esqueleto do padrão no editor e adapte ao problema.</p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                icon={<FileCode2 className="h-4 w-4" />}
                onClick={insertTemplate}
              >
                Inserir template ({LANG_LABEL[language]})
              </Button>
            </Hint>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <label htmlFor="ws-notes" className="text-sm font-semibold">
                Notas
              </label>
              <SaveStatus status={notesSave.status} />
            </div>
            <Textarea
              id="ws-notes"
              className="mt-2 min-h-36 font-mono text-[13px]"
              placeholder="Ideia-chave, complexidade, o que fez você errar…"
              value={notes}
              maxLength={20_000}
              onChange={(e) => {
                setNotes(e.target.value);
                notesSave.schedule(e.target.value);
              }}
            />
          </section>

          <Link to={`/app/foco?problema=${slug}`} className={buttonClass('ghost', 'sm', 'w-full')}>
            <Timer className="h-4 w-4" /> Iniciar sessão de foco
          </Link>
        </aside>

        <section className="flex min-h-[480px] min-w-0 flex-col" aria-label="Editor">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2 sm:px-6">
            <Segmented
              label="Linguagem"
              size="sm"
              value={language}
              onChange={changeLanguage}
              options={TEMPLATE_LANGUAGES.map((l) => ({ value: l, label: LANG_LABEL[l] }))}
            />
            <div className="flex items-center gap-2">
              <SaveStatus status={codeSave.status} />
              <Button
                size="sm"
                variant="ghost"
                icon={<FileCode2 className="h-4 w-4" />}
                onClick={insertTemplate}
              >
                Template
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={
                  copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />
                }
                onClick={() => void copy()}
                disabled={!code.trim()}
              >
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <CodeEditor
              value={code}
              language={language}
              onChange={(value) => {
                setCode(value);
                codeSave.schedule(value);
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
