import type { Pattern } from '../../types.ts';

export const slidingWindow: Pattern = {
  id: 'sliding-window',
  name: 'Sliding Window',
  order: 3,
  tagline: 'Uma janela contígua que cresce pela direita e encolhe pela esquerda.',
  description: [
    'Sliding Window resolve problemas sobre subarrays ou substrings contíguas. Em vez de recalcular cada janela do zero, você mantém o estado da janela atual e o atualiza quando um elemento entra pela direita ou sai pela esquerda.',
    'Na janela de tamanho variável, expanda `right` sempre e encolha `left` enquanto a janela estiver inválida. Cada índice entra e sai no máximo uma vez, por isso o custo é linear.',
    'O estado costuma ser uma soma, um contador de frequências ou um deque monotônico (para máximo/mínimo da janela).',
  ],
  signals: [
    'Subarray/substring contígua "mais longa", "mais curta" ou "com no máximo K"',
    'Janela de tamanho fixo K',
    'A validade da janela é monotônica: se uma janela é inválida, aumentá-la não a conserta',
  ],
  complexity: { time: 'O(n)', space: 'O(k) para o estado da janela' },
  pitfalls: [
    'Usar com números negativos em problemas de soma: a monotonicidade quebra (use prefix sum)',
    'Atualizar a resposta antes de restaurar a validade da janela',
    'Esquecer de remover do contador quando a frequência chega a zero',
  ],
  prerequisites: ['two-pointers'],
  visualizer: 'sliding-window',
  templates: {
    python: `def longest_valid_window(s: str) -> int:
    count: dict[str, int] = {}
    left = best = 0
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1          # entra pela direita
        while count[ch] > 1:                      # janela inválida?
            count[s[left]] -= 1                   # sai pela esquerda
            left += 1
        best = max(best, right - left + 1)
    return best`,
    typescript: `function longestValidWindow(s: string): number {
  const count = new Map<string, number>();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    count.set(ch, (count.get(ch) ?? 0) + 1); // entra pela direita
    while (count.get(ch)! > 1) {
      // janela inválida: sai pela esquerda
      count.set(s[left], count.get(s[left])! - 1);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
    java: `int longestValidWindow(String s) {
    int[] count = new int[128];
    int left = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        char ch = s.charAt(right);
        count[ch]++;                          // entra pela direita
        while (count[ch] > 1) {               // janela inválida?
            count[s.charAt(left)]--;          // sai pela esquerda
            left++;
        }
        best = Math.max(best, right - left + 1);
    }
    return best;
}`,
  },
};
