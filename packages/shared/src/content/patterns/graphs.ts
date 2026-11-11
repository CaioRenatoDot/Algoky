import type { Pattern } from '../../types.ts';

export const graphs: Pattern = {
  id: 'graphs',
  name: 'Graphs: BFS/DFS',
  order: 13,
  tagline: 'Modele como nós e arestas e marque o que já visitou.',
  description: [
    'O primeiro passo é enxergar o grafo: células de uma grade, palavras que diferem por uma letra, cidades e voos. Depois, a maioria dos problemas vira uma travessia BFS ou DFS com um conjunto de visitados.',
    'Use DFS (recursiva ou com pilha) para explorar componentes conexos: contar ilhas, inundar regiões, clonar grafos. Use BFS para o menor caminho em grafos sem peso, e BFS multi-fonte quando várias origens se espalham ao mesmo tempo (laranjas apodrecendo).',
    'Com pesos positivos, troque a fila por uma heap: isso é o Dijkstra.',
  ],
  signals: [
    'Grade 2D com regiões ou ilhas',
    'Menor número de passos/transformações',
    'Dependências, conexões, redes',
  ],
  complexity: { time: 'O(V + E), ou O(linhas × colunas) em grades', space: 'O(V)' },
  pitfalls: [
    'Marcar como visitado ao desenfileirar (gera duplicatas na fila): marque ao enfileirar',
    'Sair dos limites da grade',
    'Recursão profunda demais em grades grandes (prefira BFS/pilha explícita)',
  ],
  prerequisites: ['trees-bfs'],
  templates: {
    python: `from collections import deque

def shortest_path(grid: list[list[int]], start, target) -> int:
    rows, cols = len(grid), len(grid[0])
    queue = deque([(start, 0)])
    seen = {start}
    while queue:
        (r, c), dist = queue.popleft()
        if (r, c) == target:
            return dist
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in seen:
                seen.add((nr, nc))          # marque ao enfileirar
                queue.append(((nr, nc), dist + 1))
    return -1`,
    typescript: `function shortestPath(grid: number[][], start: [number, number], target: [number, number]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const seen = new Set([start.join(',')]);
  let queue: [number, number][] = [start];
  for (let dist = 0; queue.length; dist++) {
    const next: [number, number][] = [];
    for (const [r, c] of queue) {
      if (r === target[0] && c === target[1]) return dist;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr;
        const nc = c + dc;
        const key = nr + ',' + nc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] !== 0 || seen.has(key)) continue;
        seen.add(key); // marque ao enfileirar
        next.push([nr, nc]);
      }
    }
    queue = next;
  }
  return -1;
}`,
    java: `int shortestPath(int[][] grid, int[] start, int[] target) {
    int rows = grid.length, cols = grid[0].length;
    boolean[][] seen = new boolean[rows][cols];
    int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
    Deque<int[]> queue = new ArrayDeque<>();
    queue.offer(start);
    seen[start[0]][start[1]] = true;
    for (int dist = 0; !queue.isEmpty(); dist++) {
        for (int size = queue.size(); size > 0; size--) {
            int[] cur = queue.poll();
            if (cur[0] == target[0] && cur[1] == target[1]) return dist;
            for (int[] d : dirs) {
                int nr = cur[0] + d[0], nc = cur[1] + d[1];
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] != 0 || seen[nr][nc]) continue;
                seen[nr][nc] = true; // marque ao enfileirar
                queue.offer(new int[] { nr, nc });
            }
        }
    }
    return -1;
}`,
  },
};
