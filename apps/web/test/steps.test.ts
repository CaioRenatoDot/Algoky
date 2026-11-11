import { describe, expect, it } from 'vitest';
import {
  binarySearchSteps,
  parseNumbers,
  slidingWindowSteps,
  twoPointerSteps,
} from '../src/components/visualizer/steps.ts';

describe('visualizador: two pointers', () => {
  it('encontra o par e marca os índices', () => {
    const { cells, steps } = twoPointerSteps([8, 1, 15, 3, 11, 4, 6], 14);
    expect(cells).toEqual([1, 3, 4, 6, 8, 11, 15]);
    const last = steps.at(-1)!;
    expect(last.message).toMatch(/Encontramos/);
    expect(
      Object.entries(last.tones)
        .filter(([, t]) => t === 'found')
        .map(([i]) => Number(i)),
    ).toEqual([1, 5]);
  });

  it('informa quando não há par', () => {
    expect(twoPointerSteps([1, 2, 3], 100).steps.at(-1)!.message).toMatch(/não existe par/);
  });
});

describe('visualizador: sliding window', () => {
  it.each([
    ['abcabcbb', 3],
    ['bbbbb', 1],
    ['pwwkew', 3],
    ['', 0],
  ])('maior substring sem repetição de "%s" = %i', (s, expected) => {
    const last = slidingWindowSteps(s).steps.at(-1)!;
    expect(last.facts).toEqual([['resposta', String(expected)]]);
  });
});

describe('visualizador: binary search', () => {
  it('acha o alvo em O(log n) passos', () => {
    const { steps } = binarySearchSteps([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23);
    expect(steps.at(-1)!.message).toMatch(/índice 5/);
    expect(steps.length).toBeLessThanOrEqual(1 + Math.ceil(Math.log2(10)) + 1);
  });

  it('indica a posição de inserção quando não acha', () => {
    expect(binarySearchSteps([1, 3, 5], 4).steps.at(-1)!.message).toMatch(/lo = 2/);
  });
});

describe('parseNumbers', () => {
  it('aceita separadores variados e descarta lixo', () => {
    expect(parseNumbers('1, 2;3  x 4,,5')).toEqual([1, 2, 3, 4, 5]);
    expect(parseNumbers('1 '.repeat(40))).toHaveLength(16);
  });
});
