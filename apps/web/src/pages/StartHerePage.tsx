import { BASICS } from '@algoky/shared';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { GuideSectionView } from '../components/GuideSectionView.tsx';
import { PublicLayout } from '../components/PublicLayout.tsx';

/** Destaca no índice o capítulo que está sendo lido. */
function useActiveChapter(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

const IDS = BASICS.map((c) => c.slug);

export default function StartHerePage() {
  const active = useActiveChapter(IDS);
  const total = BASICS.reduce((s, c) => s + c.minutes, 0);

  return (
    <PublicLayout>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24" aria-label="Capítulos">
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Capítulos</p>
            <ol className="mt-3 space-y-1 border-l border-border text-sm">
              {BASICS.map((c, i) => (
                <li key={c.slug}>
                  <a
                    href={`#${c.slug}`}
                    className={
                      active === c.slug
                        ? '-ml-px flex gap-2 border-l border-text py-1 pl-3 font-medium text-text'
                        : '-ml-px flex gap-2 border-l border-transparent py-1 pl-3 text-muted hover:text-text'
                    }
                  >
                    <span className="font-mono text-xs leading-5 text-subtle">{i + 1}</span>
                    {c.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="min-w-0 max-w-[44rem]">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Comece aqui
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Nunca estudou algoritmos? Sem problema. Esta introdução explica o básico em {total}{' '}
            minutos de leitura: o que é um algoritmo, as estruturas de dados que mais aparecem, como
            medir eficiência e onde esse conhecimento é cobrado.
          </p>

          <div className="mt-14 space-y-20">
            {BASICS.map((chapter, i) => (
              <article key={chapter.slug} id={chapter.slug} className="scroll-mt-24">
                <p className="text-sm text-muted">
                  Capítulo {i + 1} de {BASICS.length} · {chapter.minutes} min
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {chapter.title}
                </h2>
                <p className="mt-2 text-muted">{chapter.summary}</p>
                <div className="mt-8 space-y-10">
                  {chapter.sections.map((s) => (
                    <GuideSectionView key={s.heading} section={s} level={3} />
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-20 rounded-xl border border-border bg-surface p-6">
            <p className="font-semibold">Pronto para o primeiro padrão?</p>
            <p className="mt-1 text-sm text-muted">
              Arrays & Hashing é a base de quase tudo que vem depois.
            </p>
            <Link
              to="/padroes/arrays-hashing"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              Começar pelo padrão 01 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
