import type { GuideSection } from '@algoky/shared';
import { CodeBlock } from './CodeBlock.tsx';
import { DocTable } from './DocTable.tsx';
import { RichText } from './RichText.tsx';

/** Renderiza uma seção de guia: parágrafos, passos numerados, lista, tabela e código. */
export function GuideSectionView({
  section: s,
  level = 2,
}: {
  section: GuideSection;
  level?: 2 | 3;
}) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <section>
      <Heading
        className={
          level === 2
            ? 'text-xl font-semibold tracking-tight'
            : 'text-lg font-semibold tracking-tight'
        }
      >
        {s.heading}
      </Heading>
      <div className="mt-4 space-y-4 text-[16px] leading-[1.75]">
        {s.paragraphs?.map((p, i) => (
          <p key={i}>
            <RichText text={p} />
          </p>
        ))}
        {s.steps && (
          <ol className="space-y-5">
            {s.steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border-strong font-mono text-xs font-semibold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="mt-1 text-muted">
                    <RichText text={step.text} />
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
        {s.list && (
          <ul className="space-y-2.5">
            {s.list.map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-border-strong"
                  aria-hidden
                />
                <span>
                  <RichText text={item} />
                </span>
              </li>
            ))}
          </ul>
        )}
        {s.table && <DocTable head={s.table.head} rows={s.table.rows} />}
        {s.code && <CodeBlock code={s.code.source} language={s.code.language} />}
      </div>
    </section>
  );
}
