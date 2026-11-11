import type { Pattern } from '../../types.ts';

export const unionFind: Pattern = {
  id: 'union-find',
  name: 'Union-Find',
  order: 15,
  tagline: 'Conjuntos disjuntos que se unem em tempo quase constante.',
  description: [
    'Union-Find (Disjoint Set Union) mantém uma partição dos elementos em grupos e responde "x e y estão no mesmo grupo?" em tempo praticamente constante.',
    'Duas otimizações tornam isso rápido: compressão de caminho (no `find`, aponte direto para a raiz) e união por tamanho/rank (pendure a árvore menor na maior).',
    'É ideal para conectividade incremental: arestas chegando uma a uma, detectar a aresta que fecha um ciclo, agrupar contas por e-mail e o algoritmo de Kruskal para árvore geradora mínima.',
  ],
  signals: [
    'Número de componentes conexos com arestas chegando aos poucos',
    'Detectar a aresta redundante que cria ciclo',
    'Agrupar itens por relações de equivalência',
  ],
  complexity: { time: 'O(α(n)) por operação, praticamente O(1)', space: 'O(n)' },
  pitfalls: [
    'Comparar `parent[x]` em vez de `find(x)`',
    'Esquecer a compressão de caminho (vira O(n) por operação)',
    'Indexação 1-based vs 0-based das arestas',
  ],
  prerequisites: ['graphs'],
  templates: {
    python: `class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.size = [1] * n
        self.components = n

    def find(self, x: int) -> int:
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]  # compressão
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> bool:
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                  # já conectados
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra              # menor embaixo da maior
        self.size[ra] += self.size[rb]
        self.components -= 1
        return True`,
    typescript: `class UnionFind {
  private parent: number[];
  private size: number[];
  components: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array<number>(n).fill(1);
    this.components = n;
  }

  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]; // compressão
      x = this.parent[x];
    }
    return x;
  }

  union(a: number, b: number): boolean {
    let ra = this.find(a);
    let rb = this.find(b);
    if (ra === rb) return false; // já conectados
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra; // menor embaixo da maior
    this.size[ra] += this.size[rb];
    this.components--;
    return true;
  }
}`,
    java: `class UnionFind {
    private final int[] parent, size;
    int components;

    UnionFind(int n) {
        parent = new int[n];
        size = new int[n];
        components = n;
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    }

    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]]; // compressão
            x = parent[x];
        }
        return x;
    }

    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false; // já conectados
        if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;            // menor embaixo da maior
        size[ra] += size[rb];
        components--;
        return true;
    }
}`,
  },
};
