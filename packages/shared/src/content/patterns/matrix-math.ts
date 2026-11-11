import type { Pattern } from '../../types.ts';

export const matrixMath: Pattern = {
  id: 'matrix-math',
  name: 'Matriz & Matemática',
  order: 21,
  tagline: 'Índices bem controlados e um pouco de matemática.',
  description: [
    'Problemas de matriz testam controle de índices: percorrer em espiral, rotacionar in-place, marcar linhas e colunas. Vale definir limites (top, bottom, left, right) e encolhê-los a cada volta.',
    'Rotacionar 90° no sentido horário equivale a transpor e depois inverter cada linha. Para economizar espaço, use a primeira linha/coluna da própria matriz como marcador.',
    'Problemas matemáticos (potência rápida, ciclos de dígitos, multiplicação de strings) pedem atenção a overflow e a casos de borda como zero e negativos.',
  ],
  signals: [
    'Rotação, espiral ou transposição de matriz',
    'Restrições de O(1) de espaço extra em matrizes',
    'Operações aritméticas sobre dígitos ou potências',
  ],
  complexity: { time: 'O(m × n)', space: 'O(1) quando feito in-place' },
  pitfalls: [
    'Trocar linhas e colunas em matrizes não quadradas',
    'Elementos visitados duas vezes na espiral quando sobra uma linha/coluna',
    'Overflow em potências e multiplicações',
  ],
  prerequisites: ['arrays-hashing'],
  templates: {
    python: `def spiral(matrix: list[list[int]]) -> list[int]:
    out = []
    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        out += [matrix[top][c] for c in range(left, right + 1)]
        out += [matrix[r][right] for r in range(top + 1, bottom + 1)]
        if top < bottom:
            out += [matrix[bottom][c] for c in range(right - 1, left - 1, -1)]
        if left < right:
            out += [matrix[r][left] for r in range(bottom - 1, top, -1)]
        top, bottom, left, right = top + 1, bottom - 1, left + 1, right - 1
    return out`,
    typescript: `function spiral(matrix: number[][]): number[] {
  const out: number[] = [];
  let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(matrix[top][c]);
    for (let r = top + 1; r <= bottom; r++) out.push(matrix[r][right]);
    if (top < bottom) for (let c = right - 1; c >= left; c--) out.push(matrix[bottom][c]);
    if (left < right) for (let r = bottom - 1; r > top; r--) out.push(matrix[r][left]);
    top++; bottom--; left++; right--;
  }
  return out;
}`,
    java: `List<Integer> spiral(int[][] matrix) {
    List<Integer> out = new ArrayList<>();
    int top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) out.add(matrix[top][c]);
        for (int r = top + 1; r <= bottom; r++) out.add(matrix[r][right]);
        if (top < bottom) for (int c = right - 1; c >= left; c--) out.add(matrix[bottom][c]);
        if (left < right) for (int r = bottom - 1; r > top; r--) out.add(matrix[r][left]);
        top++; bottom--; left++; right--;
    }
    return out;
}`,
  },
};
