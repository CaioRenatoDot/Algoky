import { GUIDES, GUIDES_BY_SLUG } from '@algoky/shared';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { GuideSectionView } from '../components/GuideSectionView.tsx';
import { PublicLayout } from '../components/PublicLayout.tsx';
import { NotFoundPage } from './NotFoundPage.tsx';

export default function GuidePage() {
  const { slug } = useParams();
  const guide = slug ? GUIDES_BY_SLUG.get(slug) : undefined;

  useEffect(() => {
    if (!guide) return;
    const prev = document.title;
    document.title = `${guide.title} · Guias · Algoky`;
    window.scrollTo(0, 0);
    return () => {
      document.title = prev;
    };
  }, [guide]);

  if (!guide) return <NotFoundPage />;
  const index = GUIDES.indexOf(guide);
  const next = GUIDES[index + 1];

  return (
    <PublicLayout>
      <article className="mx-auto max-w-[44rem] px-4 py-12 sm:px-6 sm:py-16">
        <Link
          to="/guias"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" /> Guias
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-3 text-lg text-muted">{guide.summary}</p>
        <p className="mt-3 text-sm text-subtle">{guide.minutes} min de leitura</p>

        <div className="mt-12 space-y-12">
          {guide.sections.map((s) => (
            <GuideSectionView key={s.heading} section={s} />
          ))}
        </div>

        <div className="mt-16 border-t border-border pt-8">
          {next ? (
            <Link
              to={`/guias/${next.slug}`}
              className="group block rounded-xl border border-border p-5 hover:border-border-strong"
            >
              <span className="flex items-center gap-1 text-xs text-muted">
                Próximo guia <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="mt-1 block font-medium group-hover:text-accent">{next.title}</span>
            </Link>
          ) : (
            <Link
              to="/padroes"
              className="group block rounded-xl border border-border p-5 hover:border-border-strong"
            >
              <span className="flex items-center gap-1 text-xs text-muted">
                Agora é praticar <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="mt-1 block font-medium group-hover:text-accent">
                Ir para os padrões
              </span>
            </Link>
          )}
        </div>
      </article>
    </PublicLayout>
  );
}
