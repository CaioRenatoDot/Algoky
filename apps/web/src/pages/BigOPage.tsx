import { ALGORITHMS, CONSTRAINTS, DATA_STRUCTURES, SORTING } from '@algoky/shared';
import { DocTable } from '../components/DocTable.tsx';
import { PublicLayout } from '../components/PublicLayout.tsx';

const SECTIONS = [
  { id: 'restricoes', label: 'Pelas restrições' },
  { id: 'estruturas', label: 'Estruturas de dados' },
  { id: 'ordenacao', label: 'Ordenação' },
  { id: 'algoritmos', label: 'Algoritmos' },
];

function Notes({ rows }: { rows: Array<{ name: string; note?: string }> }) {
  const notes = rows.filter((r) => r.note);
  if (!notes.length) return null;
  return (
    <ul className="mt-3 space-y-1 text-sm text-muted">
      {notes.map((r) => (
        <li key={r.name}>
          <span className="font-medium text-text">{r.name}:</span> {r.note}
        </li>
      ))}
    </ul>
  );
}

export default function BigOPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Referência de Big-O</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          As complexidades que você precisa ter na ponta da língua, e como usar as restrições do
          enunciado para descobrir qual solução é esperada.
        </p>
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Seções">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-border px-3 py-1 text-sm text-muted hover:border-border-strong hover:text-text"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <section id="restricoes" className="mt-14 scroll-mt-20">
          <h2 className="text-xl font-semibold tracking-tight">
            Qual complexidade cabe nas restrições
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Juízes online executam algo como 10⁸ operações simples por segundo. Olhe o tamanho
            máximo de{' '}
            <code className="rounded bg-surface-2 px-1 font-mono text-[0.9em] text-text">n</code> e
            descubra a complexidade-alvo antes de pensar na solução.
          </p>
          <div className="mt-5">
            <DocTable
              head={['Tamanho de n', 'Complexidade', 'Técnicas típicas']}
              rows={CONSTRAINTS.map((c) => [c.n, c.complexity, c.examples])}
              mono
            />
          </div>
        </section>

        <section id="estruturas" className="mt-14 scroll-mt-20">
          <h2 className="text-xl font-semibold tracking-tight">Estruturas de dados</h2>
          <div className="mt-5">
            <DocTable
              head={DATA_STRUCTURES.head}
              rows={DATA_STRUCTURES.rows.map((r) => [r.name, ...r.cells])}
              mono
            />
          </div>
          <Notes rows={DATA_STRUCTURES.rows} />
        </section>

        <section id="ordenacao" className="mt-14 scroll-mt-20">
          <h2 className="text-xl font-semibold tracking-tight">Ordenação</h2>
          <div className="mt-5">
            <DocTable
              head={SORTING.head}
              rows={SORTING.rows.map((r) => [r.name, ...r.cells])}
              mono
            />
          </div>
          <p className="mt-3 text-sm text-muted">
            Na prática, use o sort da linguagem: é O(n log n) e muito otimizado.
          </p>
        </section>

        <section id="algoritmos" className="mt-14 scroll-mt-20">
          <h2 className="text-xl font-semibold tracking-tight">Algoritmos</h2>
          <div className="mt-5">
            <DocTable
              head={ALGORITHMS.head}
              rows={ALGORITHMS.rows.map((r) => [r.name, ...r.cells])}
              mono
            />
          </div>
          <p className="mt-3 text-sm text-muted">V = vértices, E = arestas.</p>
        </section>
      </div>
    </PublicLayout>
  );
}
