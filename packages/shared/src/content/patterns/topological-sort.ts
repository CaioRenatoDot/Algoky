import type { Pattern } from '../../types.ts';

export const topologicalSort: Pattern = {
  id: 'topological-sort',
  name: 'Topological Sort',
  order: 14,
  tagline: 'Ordene tarefas respeitando dependências.',
  description: [
    'Uma ordenação topológica lista os nós de um grafo dirigido de forma que toda aresta u → v tenha u antes de v. Ela só existe se o grafo não tiver ciclos (DAG).',
    'O algoritmo de Kahn é o mais intuitivo: calcule o grau de entrada de cada nó, comece pelos que têm grau zero e, ao processar um nó, diminua o grau dos vizinhos. Se no final nem todos os nós foram processados, há um ciclo.',
  ],
  signals: [
    'Pré-requisitos, dependências, ordem de compilação',
    'Detectar ciclo em grafo dirigido',
    'Deduzir uma ordem a partir de comparações parciais',
  ],
  complexity: { time: 'O(V + E)', space: 'O(V + E)' },
  pitfalls: [
    'Inverter a direção da aresta (pré-requisito → curso)',
    'Esquecer nós isolados, sem arestas',
    'Não verificar se todos os nós foram processados (ciclo)',
  ],
  prerequisites: ['graphs'],
  templates: {
    python: `from collections import deque

def topo_sort(n: int, edges: list[tuple[int, int]]) -> list[int]:
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for u, v in edges:          # u precisa vir antes de v
        graph[u].append(v)
        indegree[v] += 1
    queue = deque(i for i in range(n) if indegree[i] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)
    return order if len(order) == n else []  # [] = há ciclo`,
    typescript: `function topoSort(n: number, edges: [number, number][]): number[] {
  const graph: number[][] = Array.from({ length: n }, () => []);
  const indegree = new Array<number>(n).fill(0);
  for (const [u, v] of edges) { graph[u].push(v); indegree[v]++; } // u antes de v
  const queue = [...indegree.keys()].filter((i) => indegree[i] === 0);
  const order: number[] = [];
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    for (const v of graph[u]) if (--indegree[v] === 0) queue.push(v);
  }
  return order.length === n ? order : []; // [] = há ciclo
}`,
    java: `int[] topoSort(int n, int[][] edges) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
    int[] indegree = new int[n];
    for (int[] e : edges) { graph.get(e[0]).add(e[1]); indegree[e[1]]++; } // e[0] antes de e[1]
    Deque<Integer> queue = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indegree[i] == 0) queue.offer(i);
    int[] order = new int[n];
    int idx = 0;
    while (!queue.isEmpty()) {
        int u = queue.poll();
        order[idx++] = u;
        for (int v : graph.get(u)) if (--indegree[v] == 0) queue.offer(v);
    }
    return idx == n ? order : new int[0]; // vazio = há ciclo
}`,
  },
};
