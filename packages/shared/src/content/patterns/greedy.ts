import type { Pattern } from '../../types.ts';

export const greedy: Pattern = {
  id: 'greedy',
  name: 'Greedy',
  order: 17,
  tagline: 'A melhor escolha local, quando ela leva ao ótimo global.',
  description: [
    'Algoritmos gulosos tomam, a cada passo, a decisão que parece melhor naquele momento e nunca voltam atrás. Funcionam quando é possível provar que essa escolha nunca impede a solução ótima.',
    'A dificuldade não está no código, que costuma ser curto, mas em achar o critério certo e convencer-se de que ele está correto. Um bom teste é procurar um contraexemplo pequeno; se não achar, tente o argumento de troca: qualquer solução ótima pode ser transformada na gulosa sem piorar.',
    'Kadane (máximo subarray) e Jump Game são os exemplos clássicos: mantenha só o melhor alcance ou a melhor soma até aqui.',
  ],
  signals: [
    'Maximizar/minimizar com escolhas que não precisam ser desfeitas',
    'Alcance máximo, número mínimo de saltos',
    'Ordenar por algum critério e varrer uma vez',
  ],
  complexity: { time: 'O(n) ou O(n log n) com ordenação', space: 'O(1)' },
  pitfalls: [
    'Aplicar guloso onde é preciso DP (ex.: troco com moedas arbitrárias)',
    'Escolher o critério de ordenação sem provar',
  ],
  prerequisites: ['arrays-hashing'],
  templates: {
    python: `def max_subarray(nums: list[int]) -> int:
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)   # recomeçar ou estender?
        best = max(best, cur)
    return best

def can_jump(nums: list[int]) -> bool:
    reach = 0
    for i, jump in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + jump)
    return True`,
    typescript: `function maxSubarray(nums: number[]): number {
  let best = nums[0];
  let cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]); // recomeçar ou estender?
    best = Math.max(best, cur);
  }
  return best;
}

function canJump(nums: number[]): boolean {
  let reach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}`,
    java: `int maxSubarray(int[] nums) {
    int best = nums[0], cur = nums[0];
    for (int i = 1; i < nums.length; i++) {
        cur = Math.max(nums[i], cur + nums[i]); // recomeçar ou estender?
        best = Math.max(best, cur);
    }
    return best;
}

boolean canJump(int[] nums) {
    int reach = 0;
    for (int i = 0; i < nums.length; i++) {
        if (i > reach) return false;
        reach = Math.max(reach, i + nums[i]);
    }
    return true;
}`,
  },
};
