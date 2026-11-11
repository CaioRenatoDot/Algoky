import { PATTERNS_BY_ID } from '@algoky/shared';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PatternStudy, studySections } from '../components/PatternStudy.tsx';
import { PatternToc } from '../components/PatternToc.tsx';
import { PublicLayout } from '../components/PublicLayout.tsx';
import { Select } from '../components/ui/Select.tsx';
import { patternOptions } from '../lib/selectOptions.ts';
import { NotFoundPage } from './NotFoundPage.tsx';

/** Destaca no índice "Nesta página" a seção que está sendo lida. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -65% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export default function PublicPatternPage() {
  const { patternId } = useParams();
  const navigate = useNavigate();
  const pattern = patternId ? PATTERNS_BY_ID.get(patternId) : undefined;
  const sections = pattern ? studySections(pattern) : [];
  const active = useActiveSection(sections.map((s) => s.id));

  useEffect(() => {
    if (!pattern) return;
    const prev = document.title;
    document.title = `${pattern.name} · Padrões · Algoky`;
    window.scrollTo(0, 0);
    return () => {
      document.title = prev;
    };
  }, [pattern]);

  if (!pattern) return <NotFoundPage />;

  return (
    <PublicLayout>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_180px]">
        <aside className="hidden lg:block">
          <nav
            className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto py-10 pr-2"
            aria-label="Padrões"
          >
            <PatternToc compact currentId={pattern.id} />
          </nav>
        </aside>

        <div className="min-w-0 py-10 lg:py-14">
          <div className="mb-8 lg:hidden">
            <Select
              label="Ir para outro padrão"
              value={pattern.id}
              onChange={(v) => navigate(`/padroes/${v}`)}
              options={patternOptions()}
            />
          </div>
          <div className="mx-auto max-w-[44rem]">
            <PatternStudy pattern={pattern} linkBase="/padroes" />
          </div>
        </div>

        <aside className="hidden xl:block">
          <nav className="sticky top-14 py-14" aria-label="Nesta página">
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
              Nesta página
            </p>
            <ul className="mt-3 space-y-2 border-l border-border text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={
                      active === s.id
                        ? '-ml-px block border-l border-text pl-3 font-medium text-text'
                        : '-ml-px block border-l border-transparent pl-3 text-muted hover:text-text'
                    }
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </PublicLayout>
  );
}
