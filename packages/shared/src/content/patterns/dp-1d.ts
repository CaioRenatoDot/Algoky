import type { Pattern } from '../../types.ts';

export const dp1d: Pattern = {
  id: 'dp-1d',
  name: 'Dynamic Programming 1D',
  order: 18,
  tagline: 'Defina o estado, escreva a recorrência e reutilize subproblemas.',
  description: [
    'Programação dinâmica resolve problemas que se decompõem em subproblemas sobrepostos. O roteiro é: (1) definir o estado, ex.: `dp[i]` = melhor resposta considerando os `i` primeiros elementos; (2) escrever a transição a partir de estados menores; (3) definir os casos base; (4) escolher a ordem de cálculo.',
    'Comece com recursão + memoização (top-down), que é mais natural de pensar, e depois converta para tabela (bottom-up). Se a transição depende só dos últimos estados, dá para reduzir o espaço para O(1).',
    'Em DP 1D o estado é um índice ou um valor-alvo (como no Coin Change, onde `dp[v]` = menor número de moedas para formar `v`).',
  ],
  signals: [
    '"Número de maneiras", "mínimo/máximo custo", "é possível?"',
    'Escolhas em sequência onde decisões passadas afetam as futuras',
    'A força bruta recursiva recalcula os mesmos subproblemas',
  ],
  complexity: { time: 'O(n × transições)', space: 'O(n), muitas vezes reduzível a O(1)' },
  pitfalls: [
    'Estado ambíguo: escreva em português o que dp[i] significa',
    'Casos base errados (dp[0] para "nenhum elemento")',
    'Ordem de iteração que lê estados ainda não calculados',
  ],
  prerequisites: ['backtracking'],
  templates: {
    python: `def coin_change(coins: list[int], amount: int) -> int:
    INF = float("inf")
    dp = [0] + [INF] * amount       # dp[v] = mínimo de moedas para v
    for v in range(1, amount + 1):
        for c in coins:
            if c <= v:
                dp[v] = min(dp[v], dp[v - c] + 1)
    return dp[amount] if dp[amount] != INF else -1`,
    typescript: `function coinChange(coins: number[], amount: number): number {
  // dp[v] = mínimo de moedas para formar v
  const dp = new Array<number>(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let v = 1; v <= amount; v++) {
    for (const c of coins) if (c <= v) dp[v] = Math.min(dp[v], dp[v - c] + 1);
  }
  return Number.isFinite(dp[amount]) ? dp[amount] : -1;
}`,
    java: `int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1]; // dp[v] = mínimo de moedas para v
    Arrays.fill(dp, amount + 1);    // "infinito"
    dp[0] = 0;
    for (int v = 1; v <= amount; v++) {
        for (int c : coins) if (c <= v) dp[v] = Math.min(dp[v], dp[v - c] + 1);
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
  },
};
