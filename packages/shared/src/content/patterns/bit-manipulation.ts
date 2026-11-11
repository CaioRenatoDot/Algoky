import type { Pattern } from '../../types.ts';

export const bitManipulation: Pattern = {
  id: 'bit-manipulation',
  name: 'Bit Manipulation',
  order: 20,
  tagline: 'Operações direto nos bits: XOR, máscaras e deslocamentos.',
  description: [
    'Algumas propriedades dos bits viram soluções elegantes: `x ^ x = 0` e `x ^ 0 = x`, então o XOR de todos os elementos cancela os pares e deixa o único que sobra.',
    '`x & (x - 1)` apaga o bit 1 mais baixo, o que permite contar bits em O(número de uns). `x & -x` isola esse bit. Deslocamentos (`<<`, `>>`) multiplicam e dividem por potências de 2 e percorrem os bits um a um.',
    'Máscaras de bits também representam subconjuntos de forma compacta, base de DP sobre subconjuntos.',
  ],
  signals: [
    'Elemento que aparece uma vez entre pares',
    'Contar bits, potências de 2',
    'Restrição de O(1) de espaço em problemas de "número faltando"',
  ],
  complexity: { time: 'O(n) ou O(número de bits)', space: 'O(1)' },
  pitfalls: [
    'Deslocamento com sinal (>>) vs sem sinal (>>>) em Java e JS',
    'Python tem inteiros de tamanho arbitrário: aplique máscara de 32 bits quando necessário',
    'Precedência de operadores: use parênteses em (x & 1) == 0',
  ],
  prerequisites: ['arrays-hashing'],
  templates: {
    python: `def single_number(nums: list[int]) -> int:
    result = 0
    for x in nums:
        result ^= x      # pares se cancelam
    return result

def count_bits(x: int) -> int:
    count = 0
    while x:
        x &= x - 1       # apaga o bit 1 mais baixo
        count += 1
    return count`,
    typescript: `function singleNumber(nums: number[]): number {
  return nums.reduce((acc, x) => acc ^ x, 0); // pares se cancelam
}

function countBits(x: number): number {
  let count = 0;
  while (x !== 0) {
    x &= x - 1; // apaga o bit 1 mais baixo
    count++;
  }
  return count;
}`,
    java: `int singleNumber(int[] nums) {
    int result = 0;
    for (int x : nums) result ^= x; // pares se cancelam
    return result;
}

int countBits(int x) {
    int count = 0;
    while (x != 0) {
        x &= x - 1; // apaga o bit 1 mais baixo
        count++;
    }
    return count;
}`,
  },
};
