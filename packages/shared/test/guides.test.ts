import { describe, expect, it } from 'vitest';
import { BASICS } from '../src/content/basics.ts';
import { ALGORITHMS, CONSTRAINTS, DATA_STRUCTURES, SORTING } from '../src/content/complexity.ts';
import { GUIDES } from '../src/content/guides.ts';
import { PATTERNS_BY_ID } from '../src/content/patterns/index.ts';

const INTERNAL_LINK = /\]\((\/[^)\s]*)\)/g;
const KNOWN_ROUTES = [
  /^\/$/,
  /^\/comece-aqui$/,
  /^\/padroes$/,
  /^\/problemas$/,
  /^\/guias$/,
  /^\/big-o$/,
  /^\/padroes\/[a-z0-9-]+$/,
  /^\/guias\/[a-z0-9-]+$/,
];

function allText(guides: typeof GUIDES): string[] {
  return guides.flatMap((g) =>
    g.sections.flatMap((s) => [
      ...(s.paragraphs ?? []),
      ...(s.list ?? []),
      ...(s.steps ?? []).map((x) => x.text),
    ]),
  );
}

describe('conteúdo: guias e "Comece aqui"', () => {
  it('slugs são únicos entre guias e capítulos', () => {
    const slugs = [...GUIDES, ...BASICS].map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('toda seção tem conteúdo', () => {
    for (const g of [...GUIDES, ...BASICS]) {
      expect(g.sections.length, g.slug).toBeGreaterThan(0);
      for (const s of g.sections) {
        const hasContent =
          s.paragraphs?.length || s.list?.length || s.steps?.length || s.table || s.code;
        expect(hasContent, `${g.slug} / ${s.heading}`).toBeTruthy();
      }
    }
  });

  it('tabelas têm o mesmo número de colunas no cabeçalho e nas linhas', () => {
    for (const g of [...GUIDES, ...BASICS]) {
      for (const s of g.sections) {
        if (!s.table) continue;
        for (const row of s.table.rows)
          expect(row.length, `${g.slug} / ${s.heading}`).toBe(s.table.head.length);
      }
    }
  });

  it('links internos apontam para rotas, padrões e guias que existem', () => {
    const guideSlugs = new Set(GUIDES.map((g) => g.slug));
    for (const text of allText([...GUIDES, ...BASICS])) {
      for (const [, href] of text.matchAll(INTERNAL_LINK)) {
        expect(
          KNOWN_ROUTES.some((r) => r.test(href!)),
          href,
        ).toBe(true);
        if (href!.startsWith('/padroes/'))
          expect(PATTERNS_BY_ID.has(href!.slice(9)), href).toBe(true);
        if (href!.startsWith('/guias/')) expect(guideSlugs.has(href!.slice(7)), href).toBe(true);
      }
    }
  });
});

describe('conteúdo: referência de Big-O', () => {
  it('linhas das tabelas batem com os cabeçalhos', () => {
    for (const t of [DATA_STRUCTURES, SORTING, ALGORITHMS]) {
      for (const r of t.rows) expect(1 + r.cells.length, r.name).toBe(t.head.length);
    }
    expect(CONSTRAINTS.length).toBeGreaterThan(5);
  });
});
