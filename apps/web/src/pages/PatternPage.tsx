import { PATTERNS_BY_ID } from '@algoky/shared';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { Page } from '../components/AppShell.tsx';
import { PatternStudy } from '../components/PatternStudy.tsx';
import { ProgressBar } from '../components/ui/Progress.tsx';
import { useStatuses } from '../lib/useStatuses.ts';
import { NotFoundPage } from './NotFoundPage.tsx';

/** Página do padrão dentro do app: o mesmo conteúdo da página pública, com o progresso no topo. */
export default function PatternPage() {
  const { patternId } = useParams();
  const pattern = patternId ? PATTERNS_BY_ID.get(patternId) : undefined;
  const { byPattern } = useStatuses();
  if (!pattern) return <NotFoundPage />;
  const prog = byPattern.get(pattern.id);

  return (
    <Page className="max-w-3xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/app/trilha"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" /> Trilha
        </Link>
        <div className="w-56">
          <div className="flex justify-between text-xs text-muted">
            <span>Seu progresso</span>
            <span className="tabular-nums">
              {prog?.solved ?? 0}/{prog?.total ?? 0}
            </span>
          </div>
          <ProgressBar value={prog?.solved ?? 0} max={prog?.total || 1} className="mt-1.5 h-1.5" />
        </div>
      </div>
      <PatternStudy pattern={pattern} linkBase="/app/trilha" />
    </Page>
  );
}
