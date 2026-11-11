import type { Pattern } from '../../types.ts';

export const treesBfs: Pattern = {
  id: 'trees-bfs',
  name: 'Árvores: BFS',
  order: 9,
  tagline: 'Percorra nível por nível com uma fila.',
  description: [
    'A busca em largura visita a árvore por níveis usando uma fila. O truque é processar exatamente `len(fila)` nós por iteração: assim você sabe onde cada nível começa e termina.',
    'Use BFS quando a resposta depende do nível (visão lateral, média por nível, zigue-zague) ou quando você quer a menor profundidade, porque a BFS para no primeiro nó folha que encontra.',
  ],
  signals: [
    '"Por nível", "visão da direita", "zigue-zague"',
    'Profundidade mínima ou nós mais próximos da raiz',
    'Conectar nós do mesmo nível',
  ],
  complexity: { time: 'O(n)', space: 'O(w), a largura máxima da árvore' },
  pitfalls: [
    'Ler o tamanho da fila dentro do laço (ele muda enquanto você insere)',
    'Usar list.pop(0) em Python (O(n)); use collections.deque',
    'Enfileirar filhos nulos sem filtrar',
  ],
  prerequisites: ['trees-dfs'],
  templates: {
    python: `from collections import deque

def level_order(root) -> list[list[int]]:
    if not root:
        return []
    levels, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):   # exatamente um nível
            node = queue.popleft()
            level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        levels.append(level)
    return levels`,
    typescript: `function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const levels: number[][] = [];
  let queue: TreeNode[] = [root];
  while (queue.length) {
    const next: TreeNode[] = [];
    levels.push(queue.map((n) => n.val)); // exatamente um nível
    for (const node of queue) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    queue = next;
  }
  return levels;
}`,
    java: `List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> levels = new ArrayList<>();
    if (root == null) return levels;
    Deque<TreeNode> queue = new ArrayDeque<>(List.of(root));
    while (!queue.isEmpty()) {
        List<Integer> level = new ArrayList<>();
        for (int size = queue.size(); size > 0; size--) { // um nível
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        levels.add(level);
    }
    return levels;
}`,
  },
};
