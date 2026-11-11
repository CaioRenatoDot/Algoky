import type { Pattern } from '../../types.ts';

export const heap: Pattern = {
  id: 'heap',
  name: 'Heap / Top K',
  order: 10,
  tagline: 'Acesso rápido ao menor (ou maior) elemento enquanto os dados mudam.',
  description: [
    'Uma heap (fila de prioridade) dá o mínimo em O(1) e insere/remove em O(log n). É a estrutura certa quando você precisa repetidamente do "melhor" elemento de um conjunto que muda.',
    'Para os K maiores, mantenha uma min-heap de tamanho K: ao passar de K, remova o menor. Sobram os K maiores, em O(n log k), melhor que ordenar tudo quando k é pequeno.',
    'O truque das duas heaps (max-heap para a metade menor, min-heap para a maior) mantém a mediana de um fluxo de dados.',
  ],
  signals: [
    '"K maiores", "K mais frequentes", "K mais próximos"',
    'Mesclar K listas ordenadas',
    'Mediana ou agendamento dinâmico de tarefas',
  ],
  complexity: { time: 'O(n log k)', space: 'O(k)' },
  pitfalls: [
    'Python só tem min-heap: negue os valores para simular max-heap',
    'Usar max-heap de tamanho n quando uma min-heap de tamanho k basta',
    'Comparar objetos sem chave de desempate em tuplas no Python',
  ],
  prerequisites: ['arrays-hashing'],
  templates: {
    python: `import heapq

def k_largest(nums: list[int], k: int) -> list[int]:
    heap: list[int] = []          # min-heap com os k maiores
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)   # remove o menor dos k+1
    return heap`,
    typescript: `// TypeScript não tem heap nativa: uma min-heap binária enxuta.
class MinHeap {
  private a: number[] = [];
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x: number) {
    const a = this.a; a.push(x);
    for (let i = a.length - 1, p; i > 0 && a[(p = (i - 1) >> 1)] > a[i]; i = p) [a[i], a[p]] = [a[p], a[i]];
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop()!;
    if (a.length) {
      a[0] = last;
      for (let i = 0; ; ) {
        let m = i; const l = 2 * i + 1, r = l + 1;
        if (l < a.length && a[l] < a[m]) m = l;
        if (r < a.length && a[r] < a[m]) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]]; i = m;
      }
    }
    return top;
  }
}

function kLargest(nums: number[], k: number): number[] {
  const heap = new MinHeap();
  for (const x of nums) { heap.push(x); if (heap.size > k) heap.pop(); }
  return Array.from({ length: heap.size }, () => heap.pop());
}`,
    java: `int[] kLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>(); // min-heap
    for (int x : nums) {
        heap.offer(x);
        if (heap.size() > k) heap.poll(); // remove o menor dos k+1
    }
    return heap.stream().mapToInt(Integer::intValue).toArray();
}`,
  },
};
