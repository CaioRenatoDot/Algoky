import type { Pattern } from '../../types.ts';

export const arraysHashing: Pattern = {
  id: 'arrays-hashing',
  name: 'Arrays & Hashing',
  order: 1,
  tagline: 'Troque espaço por tempo: lembre do que já viu em O(1).',
  description: [
    'Muitos problemas de array ficam lineares quando você guarda informação já vista numa estrutura de busca O(1): um hash set para existência ou um hash map para contagem, índice ou agrupamento.',
    'A pergunta-chave é: "o que eu precisaria saber sobre os elementos anteriores para responder sobre o atual?". Essa informação é o que vai no mapa.',
    'Também entram aqui as técnicas de contagem (arrays de frequência para alfabetos pequenos) e de chave canônica, como ordenar as letras de uma palavra para agrupar anagramas.',
  ],
  signals: [
    'Encontrar pares ou complementos (x + y = alvo)',
    'Detectar duplicatas ou contar frequências',
    'Agrupar elementos que compartilham uma propriedade',
    'A solução força bruta é O(n²) comparando todos os pares',
  ],
  complexity: { time: 'O(n)', space: 'O(n)' },
  pitfalls: [
    'Inserir no mapa antes de checar o complemento (pode parear um elemento com ele mesmo)',
    'Usar listas como chave em Python: converta para tupla',
    'Esquecer que um array de 26 posições basta para letras minúsculas',
  ],
  prerequisites: [],
  templates: {
    python: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}  # valor -> índice
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []`,
    typescript: `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>(); // valor -> índice
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(nums[i], i);
  }
  return [];
}`,
    java: `int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>(); // valor -> índice
    for (int i = 0; i < nums.length; i++) {
        Integer j = seen.get(target - nums[i]);
        if (j != null) return new int[] { j, i };
        seen.put(nums[i], i);
    }
    return new int[0];
}`,
  },
};
