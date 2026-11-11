import type { Pattern } from '../../types.ts';

export const stack: Pattern = {
  id: 'stack',
  name: 'Stack & Monotonic Stack',
  order: 5,
  tagline: 'O último que entra é o primeiro a ser resolvido.',
  description: [
    'Pilhas modelam estruturas aninhadas (parênteses, expressões, caminhos) e qualquer situação em que o elemento mais recente é o próximo a ser resolvido.',
    'A pilha monotônica mantém os elementos em ordem crescente ou decrescente. Ao inserir um novo elemento, você desempilha todos que ele "resolve". É assim que se acha o próximo maior/menor elemento de todos os índices em O(n).',
    'Guarde índices em vez de valores: com o índice você recupera o valor e ainda calcula distâncias e larguras.',
  ],
  signals: [
    'Parênteses, tags ou estruturas aninhadas',
    '"Próximo elemento maior/menor", "quantos dias até..."',
    'Avaliar expressões ou desfazer operações',
    'Maior retângulo/área delimitada por alturas',
  ],
  complexity: { time: 'O(n): cada elemento entra e sai uma vez', space: 'O(n)' },
  pitfalls: [
    'Acessar o topo de uma pilha vazia',
    'Escolher a monotonicidade errada (crescente vs decrescente)',
    'Esquecer de processar o que sobrou na pilha no final',
  ],
  prerequisites: ['arrays-hashing'],
  templates: {
    python: `def next_greater(nums: list[int]) -> list[int]:
    result = [-1] * len(nums)
    stack: list[int] = []  # índices com valores decrescentes
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            result[stack.pop()] = x  # x resolve quem está no topo
        stack.append(i)
    return result`,
    typescript: `function nextGreater(nums: number[]): number[] {
  const result = new Array<number>(nums.length).fill(-1);
  const stack: number[] = []; // índices com valores decrescentes
  nums.forEach((x, i) => {
    while (stack.length && nums[stack[stack.length - 1]] < x) {
      result[stack.pop()!] = x; // x resolve quem está no topo
    }
    stack.push(i);
  });
  return result;
}`,
    java: `int[] nextGreater(int[] nums) {
    int[] result = new int[nums.length];
    Arrays.fill(result, -1);
    Deque<Integer> stack = new ArrayDeque<>(); // índices com valores decrescentes
    for (int i = 0; i < nums.length; i++) {
        while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
            result[stack.pop()] = nums[i]; // nums[i] resolve o topo
        }
        stack.push(i);
    }
    return result;
}`,
  },
};
