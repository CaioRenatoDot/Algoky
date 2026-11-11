import type { Pattern } from '../../types.ts';

export const twoPointers: Pattern = {
  id: 'two-pointers',
  name: 'Two Pointers',
  order: 2,
  tagline: 'Dois índices que se movem com regra clara eliminam o laço interno.',
  description: [
    'Two Pointers usa dois índices percorrendo a estrutura ao mesmo tempo. A variante clássica começa um em cada ponta de um array ordenado e aproxima os dois: a cada passo, a ordenação diz qual ponteiro mover sem perder a resposta.',
    'Outra variante usa ponteiros na mesma direção (leitura e escrita) para filtrar ou compactar um array in-place, como em "remover duplicatas" ou "mover zeros".',
    'O argumento de correção é sempre o mesmo: mostrar que o ponteiro descartado não pode fazer parte de uma resposta melhor.',
  ],
  signals: [
    'Array ou string ordenada (ou que pode ser ordenada)',
    'Procurar pares/trios com soma alvo',
    'Verificar palíndromos ou comparar as pontas',
    'Modificar o array in-place com O(1) de espaço extra',
  ],
  complexity: { time: 'O(n) (O(n log n) se precisar ordenar)', space: 'O(1)' },
  pitfalls: [
    'Usar em array não ordenado quando a lógica depende da ordem',
    'Não pular duplicatas no 3Sum e gerar respostas repetidas',
    'Condição de parada `left <= right` vs `left < right`: pense se o mesmo elemento pode ser usado duas vezes',
  ],
  prerequisites: ['arrays-hashing'],
  visualizer: 'two-pointers',
  templates: {
    python: `def pair_with_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    left, right = 0, len(nums) - 1  # nums ordenado
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return left, right
        if s < target:
            left += 1   # precisa de soma maior
        else:
            right -= 1  # precisa de soma menor
    return None`,
    typescript: `function pairWithSum(nums: number[], target: number): [number, number] | null {
  let left = 0;
  let right = nums.length - 1; // nums ordenado
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    if (sum < target) left++; // precisa de soma maior
    else right--; // precisa de soma menor
  }
  return null;
}`,
    java: `int[] pairWithSum(int[] nums, int target) {
    int left = 0, right = nums.length - 1; // nums ordenado
    while (left < right) {
        int sum = nums[left] + nums[right];
        if (sum == target) return new int[] { left, right };
        if (sum < target) left++;  // precisa de soma maior
        else right--;              // precisa de soma menor
    }
    return null;
}`,
  },
};
