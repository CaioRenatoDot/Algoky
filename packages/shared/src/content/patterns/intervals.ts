import type { Pattern } from '../../types.ts';

export const intervals: Pattern = {
  id: 'intervals',
  name: 'Intervals',
  order: 11,
  tagline: 'Ordene pelo início e decida: sobrepõe ou não?',
  description: [
    'Problemas de intervalos quase sempre começam ordenando, pelo início (para mesclar) ou pelo fim (para escolher o máximo de intervalos sem sobreposição, de forma gulosa).',
    'Depois de ordenar, basta comparar cada intervalo com o último do resultado: se `atual.inicio <= ultimo.fim`, eles se sobrepõem e você estende o fim; senão, abre um intervalo novo.',
    'Para contar sobreposições simultâneas (salas de reunião), separe os eventos de início e fim e varra em ordem, ou use uma min-heap com os fins.',
  ],
  signals: [
    'Entrada é uma lista de pares [início, fim]',
    'Mesclar, inserir ou remover sobreposições',
    'Máximo de eventos simultâneos',
  ],
  complexity: { time: 'O(n log n)', space: 'O(n)' },
  pitfalls: [
    'Ordenar pelo critério errado (início vs fim)',
    'Decidir se intervalos que só se tocam ([1,2] e [2,3]) contam como sobreposição',
    'Mutar o intervalo de entrada que ainda vai ser comparado',
  ],
  prerequisites: ['arrays-hashing'],
  templates: {
    python: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    intervals.sort(key=lambda it: it[0])
    merged: list[list[int]] = []
    for start, end in intervals:
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)  # sobrepõe: estende
        else:
            merged.append([start, end])
    return merged`,
    typescript: `function merge(intervals: number[][]): number[][] {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [];
  for (const [start, end] of intervals) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end); // estende
    else merged.push([start, end]);
  }
  return merged;
}`,
    java: `int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));
    List<int[]> merged = new ArrayList<>();
    for (int[] it : intervals) {
        if (!merged.isEmpty() && it[0] <= merged.get(merged.size() - 1)[1]) {
            int[] last = merged.get(merged.size() - 1);
            last[1] = Math.max(last[1], it[1]); // sobrepõe: estende
        } else {
            merged.add(new int[] { it[0], it[1] });
        }
    }
    return merged.toArray(new int[0][]);
}`,
  },
};
