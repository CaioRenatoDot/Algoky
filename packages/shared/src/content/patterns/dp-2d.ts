import type { Pattern } from '../../types.ts';

export const dp2d: Pattern = {
  id: 'dp-2d',
  name: 'Dynamic Programming 2D',
  order: 19,
  tagline: 'Dois índices no estado: grades, duas strings, mochila.',
  description: [
    'Quando o estado precisa de duas dimensões, como posição numa grade, prefixos de duas strings ou (item, capacidade) na mochila, a tabela vira uma matriz `dp[i][j]`.',
    'Em problemas de duas strings (LCS, Edit Distance), `dp[i][j]` descreve os prefixos `a[:i]` e `b[:j]`. A transição olha para a esquerda, para cima e para a diagonal, dependendo de os caracteres atuais serem iguais ou não.',
    'Como cada linha depende só da anterior, o espaço quase sempre pode cair para O(n) com uma única linha.',
  ],
  signals: [
    'Duas strings/arrays comparados entre si',
    'Caminhos numa grade com movimentos restritos',
    'Mochila: escolher itens com limite de capacidade',
  ],
  complexity: { time: 'O(m × n)', space: 'O(m × n), reduzível a O(n)' },
  pitfalls: [
    'Off-by-one entre índices da string e da tabela (tabela com +1)',
    'Sobrescrever na otimização de espaço um valor ainda necessário (diagonal)',
    'Na mochila 0/1, iterar a capacidade na ordem errada',
  ],
  prerequisites: ['dp-1d'],
  templates: {
    python: `def lcs(a: str, b: str) -> int:
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]  # dp[i][j]: a[:i] e b[:j]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
    typescript: `function lcs(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  // dp[i][j]: resposta para a[0..i) e b[0..j)
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}`,
    java: `int lcs(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m + 1][n + 1]; // dp[i][j]: a[0..i) e b[0..j)
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1)
                ? dp[i - 1][j - 1] + 1
                : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}`,
  },
};
