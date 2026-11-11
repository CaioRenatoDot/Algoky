import type { Pattern } from '../../types.ts';

export const prefixSum: Pattern = {
  id: 'prefix-sum',
  name: 'Prefix Sum',
  order: 4,
  tagline: 'Pré-calcule somas acumuladas e responda intervalos em O(1).',
  description: [
    'Com `prefix[i]` = soma dos `i` primeiros elementos, a soma de qualquer intervalo `[l, r]` vira `prefix[r + 1] - prefix[l]`. Uma passada de pré-processamento troca várias somas O(n) por consultas O(1).',
    'A combinação com hash map é muito poderosa: para contar subarrays com soma K, procure quantas vezes `prefixo_atual - K` já apareceu. Funciona mesmo com negativos, onde sliding window falha.',
    'A ideia se generaliza para 2D (somas de submatrizes), para XOR e para contagens (prefixo de "quantos pares até aqui").',
  ],
  signals: [
    'Muitas consultas de soma em intervalos',
    'Contar subarrays com soma/resto/balanço específico',
    'Array com números negativos onde sliding window não funciona',
  ],
  complexity: { time: 'O(n) de pré-processamento, O(1) por consulta', space: 'O(n)' },
  pitfalls: [
    'Esquecer de inicializar o mapa com {0: 1} (subarrays que começam no índice 0)',
    'Off-by-one: use `prefix` com tamanho n + 1',
    'Resto negativo em linguagens como Java e TypeScript: normalize com ((x % k) + k) % k',
  ],
  prerequisites: ['arrays-hashing'],
  templates: {
    python: `def subarray_sum(nums: list[int], k: int) -> int:
    count = {0: 1}  # prefixo -> ocorrências
    prefix = total = 0
    for x in nums:
        prefix += x
        total += count.get(prefix - k, 0)
        count[prefix] = count.get(prefix, 0) + 1
    return total`,
    typescript: `function subarraySum(nums: number[], k: number): number {
  const count = new Map<number, number>([[0, 1]]); // prefixo -> ocorrências
  let prefix = 0;
  let total = 0;
  for (const x of nums) {
    prefix += x;
    total += count.get(prefix - k) ?? 0;
    count.set(prefix, (count.get(prefix) ?? 0) + 1);
  }
  return total;
}`,
    java: `int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>(); // prefixo -> ocorrências
    count.put(0, 1);
    int prefix = 0, total = 0;
    for (int x : nums) {
        prefix += x;
        total += count.getOrDefault(prefix - k, 0);
        count.merge(prefix, 1, Integer::sum);
    }
    return total;
}`,
  },
};
