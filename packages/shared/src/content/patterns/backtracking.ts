import type { Pattern } from '../../types.ts';

export const backtracking: Pattern = {
  id: 'backtracking',
  name: 'Backtracking',
  order: 12,
  tagline: 'Escolha, explore, desfaça.',
  description: [
    'Backtracking explora todas as soluções candidatas construindo-as passo a passo. Em cada passo você faz uma escolha, desce na recursão e depois desfaz a escolha para tentar a próxima.',
    'O formato é sempre o mesmo: uma função com o estado parcial (caminho atual) e o ponto de partida. Quando o estado é uma solução completa, registre uma cópia dele. Podas (cortar ramos que não podem dar certo) são o que torna a busca viável.',
    'Para evitar combinações repetidas, ordene a entrada e pule elementos iguais no mesmo nível da recursão.',
  ],
  signals: [
    '"Todas as combinações/permutações/subconjuntos"',
    'Restrições pequenas (n ≤ 15~20)',
    'Quebra-cabeças: N-Rainhas, Sudoku, busca de palavras em grade',
  ],
  complexity: {
    time: 'Exponencial: O(2^n) subconjuntos, O(n!) permutações',
    space: 'O(n) de profundidade',
  },
  pitfalls: [
    'Adicionar a referência do caminho em vez de uma cópia',
    'Esquecer de desfazer a escolha (pop/unmark)',
    'Não pular duplicatas no mesmo nível (gera respostas repetidas)',
  ],
  prerequisites: ['trees-dfs'],
  templates: {
    python: `def subsets(nums: list[int]) -> list[list[int]]:
    result: list[list[int]] = []
    path: list[int] = []

    def backtrack(start: int) -> None:
        result.append(path[:])          # registre uma cópia
        for i in range(start, len(nums)):
            path.append(nums[i])        # escolha
            backtrack(i + 1)            # explore
            path.pop()                  # desfaça

    backtrack(0)
    return result`,
    typescript: `function subsets(nums: number[]): number[][] {
  const result: number[][] = [];
  const path: number[] = [];
  const backtrack = (start: number) => {
    result.push([...path]); // registre uma cópia
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]); // escolha
      backtrack(i + 1); // explore
      path.pop(); // desfaça
    }
  };
  backtrack(0);
  return result;
}`,
    java: `List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {
    result.add(new ArrayList<>(path));         // registre uma cópia
    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);                     // escolha
        backtrack(nums, i + 1, path, result);  // explore
        path.remove(path.size() - 1);          // desfaça
    }
}`,
  },
};
