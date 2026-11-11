import type { Pattern } from '../../types.ts';

export const binarySearch: Pattern = {
  id: 'binary-search',
  name: 'Binary Search',
  order: 6,
  tagline: 'Descarte metade do espaço de busca a cada passo.',
  description: [
    'Busca binária não serve só para achar um valor num array ordenado. Ela funciona em qualquer espaço com um predicado monotônico: uma função que é falsa até certo ponto e verdadeira dali em diante. O objetivo é achar a fronteira.',
    'A variante "buscar na resposta" é muito cobrada: quando perguntam o menor X que satisfaz uma condição (velocidade mínima, capacidade mínima), faça busca binária sobre X e teste a condição em O(n).',
    'Use sempre o mesmo template de fronteira (`lo < hi`, `hi = mid` ou `lo = mid + 1`) para não errar condições de parada.',
  ],
  signals: [
    'Array ordenado ou rotacionado',
    '"Mínimo valor tal que..." / "máximo valor tal que..."',
    'Restrições grandes (n até 10^9) que pedem O(log n)',
    'Dá para responder "X funciona?" rapidamente, e se X funciona, X+1 também funciona',
  ],
  complexity: { time: 'O(log n), ou O(n log V) buscando na resposta', space: 'O(1)' },
  pitfalls: [
    'Overflow em (lo + hi) / 2 em Java: use lo + (hi - lo) / 2',
    'Laço infinito quando `lo = mid` com mid arredondado para baixo',
    'Limites errados do espaço de busca na busca pela resposta',
  ],
  prerequisites: ['two-pointers'],
  visualizer: 'binary-search',
  templates: {
    python: `def first_true(lo: int, hi: int, ok) -> int:
    """Menor x em [lo, hi] com ok(x) verdadeiro (ok é monotônico)."""
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid        # mid pode ser a resposta
        else:
            lo = mid + 1    # resposta está à direita
    return lo`,
    typescript: `/** Menor x em [lo, hi] com ok(x) verdadeiro (ok é monotônico). */
function firstTrue(lo: number, hi: number, ok: (x: number) => boolean): number {
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (ok(mid)) hi = mid; // mid pode ser a resposta
    else lo = mid + 1; // resposta está à direita
  }
  return lo;
}`,
    java: `/** Menor x em [lo, hi] com ok(x) verdadeiro (ok é monotônico). */
int firstTrue(int lo, int hi, IntPredicate ok) {
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (ok.test(mid)) hi = mid; // mid pode ser a resposta
        else lo = mid + 1;          // resposta está à direita
    }
    return lo;
}`,
  },
};
