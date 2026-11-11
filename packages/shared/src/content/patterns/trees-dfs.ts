import type { Pattern } from '../../types.ts';

export const treesDfs: Pattern = {
  id: 'trees-dfs',
  name: 'Árvores: DFS',
  order: 8,
  tagline: 'Confie na recursão: resolva para os filhos e combine.',
  description: [
    'Quase todo problema de árvore binária é uma DFS recursiva: defina o que a função retorna para um nó, assuma que ela já funciona para os filhos e combine os resultados. O caso base é o nó nulo.',
    'Distinga dois fluxos de informação: o que desce (parâmetros, como limites válidos de uma BST ou a soma até aqui) e o que sobe (retorno, como altura ou maior caminho). Problemas difíceis costumam usar os dois ao mesmo tempo, atualizando uma resposta global.',
    'Em BSTs, a travessia in-order visita os valores em ordem crescente, e isso resolve validação, k-ésimo menor e afins.',
  ],
  signals: [
    'Entrada é uma árvore binária ou BST',
    'Altura, diâmetro, caminho, ancestral comum',
    'A resposta de um nó depende das respostas dos filhos',
  ],
  complexity: { time: 'O(n)', space: 'O(h), a altura da árvore (pilha de recursão)' },
  pitfalls: [
    'Confundir o valor retornado com a resposta global (ex.: diâmetro vs altura)',
    'Validar BST comparando só com os filhos diretos, sem limites herdados',
    'Estouro de pilha em árvores degeneradas muito profundas',
  ],
  prerequisites: ['stack'],
  templates: {
    python: `def diameter(root) -> int:
    best = 0

    def height(node) -> int:
        nonlocal best
        if not node:
            return 0
        left, right = height(node.left), height(node.right)
        best = max(best, left + right)  # resposta global
        return 1 + max(left, right)     # o que sobe para o pai

    height(root)
    return best`,
    typescript: `function diameter(root: TreeNode | null): number {
  let best = 0;
  const height = (node: TreeNode | null): number => {
    if (!node) return 0;
    const left = height(node.left);
    const right = height(node.right);
    best = Math.max(best, left + right); // resposta global
    return 1 + Math.max(left, right); // o que sobe para o pai
  };
  height(root);
  return best;
}`,
    java: `private int best;

int diameter(TreeNode root) {
    best = 0;
    height(root);
    return best;
}

private int height(TreeNode node) {
    if (node == null) return 0;
    int left = height(node.left), right = height(node.right);
    best = Math.max(best, left + right); // resposta global
    return 1 + Math.max(left, right);    // o que sobe para o pai
}`,
  },
};
