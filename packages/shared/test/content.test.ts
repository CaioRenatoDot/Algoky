import { describe, expect, it } from 'vitest';
import { PATTERNS, PATTERNS_BY_ID } from '../src/content/patterns/index.ts';
import { PROBLEMS } from '../src/content/problems.ts';
import { TEMPLATE_LANGUAGES } from '../src/types.ts';

describe('conteúdo: padrões', () => {
  it('ids e ordens são únicos e a ordem é contínua', () => {
    expect(new Set(PATTERNS.map((p) => p.id)).size).toBe(PATTERNS.length);
    expect(PATTERNS.map((p) => p.order)).toEqual(PATTERNS.map((_, i) => i + 1));
  });

  it('pré-requisitos existem e vêm antes na trilha', () => {
    for (const p of PATTERNS) {
      for (const req of p.prerequisites) {
        const dep = PATTERNS_BY_ID.get(req);
        expect(dep, `${p.id} → ${req}`).toBeDefined();
        expect(dep!.order).toBeLessThan(p.order);
      }
    }
  });

  it('todo padrão tem conteúdo completo e templates nas 3 linguagens', () => {
    for (const p of PATTERNS) {
      expect(p.description.length, p.id).toBeGreaterThan(0);
      expect(p.signals.length, p.id).toBeGreaterThan(0);
      expect(p.pitfalls.length, p.id).toBeGreaterThan(0);
      for (const lang of TEMPLATE_LANGUAGES)
        expect(p.templates[lang].trim().length, `${p.id}/${lang}`).toBeGreaterThan(50);
    }
  });
});

describe('conteúdo: problemas', () => {
  it('slugs e números são únicos', () => {
    expect(new Set(PROBLEMS.map((p) => p.slug)).size).toBe(PROBLEMS.length);
    expect(new Set(PROBLEMS.map((p) => p.id)).size).toBe(PROBLEMS.length);
  });

  it('slugs têm formato válido do LeetCode', () => {
    for (const p of PROBLEMS) expect(p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('todo problema aponta para um padrão existente e todo padrão tem problemas essenciais', () => {
    for (const p of PROBLEMS) expect(PATTERNS_BY_ID.has(p.pattern), p.slug).toBe(true);
    for (const pattern of PATTERNS) {
      const own = PROBLEMS.filter((p) => p.pattern === pattern.id);
      expect(own.length, pattern.id).toBeGreaterThanOrEqual(5);
      expect(
        own.some((p) => p.essential),
        pattern.id,
      ).toBe(true);
    }
  });

  it('catálogo tem tamanho de uma trilha completa', () => {
    expect(PROBLEMS.length).toBeGreaterThanOrEqual(180);
  });
});
