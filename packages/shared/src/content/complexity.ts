/** Dados da página de referência de Big-O. */

export interface ComplexityRow {
  name: string;
  cells: string[];
  note?: string;
}

export const DATA_STRUCTURES: { head: string[]; rows: ComplexityRow[] } = {
  head: ['Estrutura', 'Acesso', 'Busca', 'Inserção', 'Remoção', 'Espaço'],
  rows: [
    {
      name: 'Array',
      cells: ['O(1)', 'O(n)', 'O(n)', 'O(n)', 'O(n)'],
      note: 'Inserir/remover no fim de um array dinâmico é O(1) amortizado.',
    },
    {
      name: 'Lista ligada',
      cells: ['O(n)', 'O(n)', 'O(1)', 'O(1)', 'O(n)'],
      note: 'Inserção/remoção O(1) quando você já tem o nó.',
    },
    { name: 'Pilha / Fila', cells: ['O(n)', 'O(n)', 'O(1)', 'O(1)', 'O(n)'] },
    {
      name: 'Hash map / set',
      cells: ['—', 'O(1)*', 'O(1)*', 'O(1)*', 'O(n)'],
      note: '* Médio. O pior caso é O(n) com muitas colisões.',
    },
    {
      name: 'Heap binária',
      cells: ['O(1) topo', 'O(n)', 'O(log n)', 'O(log n)', 'O(n)'],
      note: 'Construir a heap a partir de um array é O(n).',
    },
    {
      name: 'Árvore de busca balanceada',
      cells: ['O(log n)', 'O(log n)', 'O(log n)', 'O(log n)', 'O(n)'],
      note: 'TreeMap (Java), SortedList, std::map.',
    },
    {
      name: 'Trie',
      cells: ['—', 'O(L)', 'O(L)', 'O(L)', 'O(total)'],
      note: 'L = tamanho da palavra.',
    },
    {
      name: 'Union-Find',
      cells: ['—', 'O(α(n))', 'O(α(n))', '—', 'O(n)'],
      note: 'Com compressão de caminho e união por tamanho.',
    },
  ],
};

export const SORTING: { head: string[]; rows: ComplexityRow[] } = {
  head: ['Algoritmo', 'Melhor', 'Médio', 'Pior', 'Espaço', 'Estável'],
  rows: [
    { name: 'Merge sort', cells: ['O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'Sim'] },
    { name: 'Quick sort', cells: ['O(n log n)', 'O(n log n)', 'O(n²)', 'O(log n)', 'Não'] },
    { name: 'Heap sort', cells: ['O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)', 'Não'] },
    { name: 'Timsort (sort nativo)', cells: ['O(n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'Sim'] },
    { name: 'Counting sort', cells: ['O(n + k)', 'O(n + k)', 'O(n + k)', 'O(k)', 'Sim'] },
    { name: 'Insertion sort', cells: ['O(n)', 'O(n²)', 'O(n²)', 'O(1)', 'Sim'] },
  ],
};

export const ALGORITHMS: { head: string[]; rows: ComplexityRow[] } = {
  head: ['Algoritmo', 'Tempo', 'Espaço'],
  rows: [
    { name: 'Busca binária', cells: ['O(log n)', 'O(1)'] },
    { name: 'BFS / DFS', cells: ['O(V + E)', 'O(V)'] },
    { name: 'Dijkstra (com heap)', cells: ['O((V + E) log V)', 'O(V)'] },
    { name: 'Ordenação topológica', cells: ['O(V + E)', 'O(V)'] },
    { name: 'Kruskal / Prim', cells: ['O(E log E)', 'O(V)'] },
    { name: 'Subconjuntos (backtracking)', cells: ['O(2ⁿ · n)', 'O(n)'] },
    { name: 'Permutações (backtracking)', cells: ['O(n! · n)', 'O(n)'] },
  ],
};

/** Qual complexidade cabe no limite de ~10⁸ operações por segundo. */
export const CONSTRAINTS: Array<{ n: string; complexity: string; examples: string }> = [
  { n: 'n ≤ 10', complexity: 'O(n!)', examples: 'Permutações, força bruta total' },
  { n: 'n ≤ 20', complexity: 'O(2ⁿ)', examples: 'Subconjuntos, backtracking, bitmask' },
  { n: 'n ≤ 500', complexity: 'O(n³)', examples: 'DP com três índices, Floyd-Warshall' },
  { n: 'n ≤ 5.000', complexity: 'O(n²)', examples: 'Pares, DP 2D' },
  {
    n: 'n ≤ 10⁶',
    complexity: 'O(n log n)',
    examples: 'Ordenação, heap, busca binária na resposta',
  },
  {
    n: 'n ≤ 10⁸',
    complexity: 'O(n)',
    examples: 'Uma passada: two pointers, sliding window, hashing',
  },
  { n: 'n > 10⁸', complexity: 'O(log n) ou O(1)', examples: 'Matemática, busca binária' },
];
