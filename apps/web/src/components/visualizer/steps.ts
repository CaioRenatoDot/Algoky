/**
 * Geradores de passos para os visualizadores de algoritmos. Funções puras:
 * recebem a entrada e devolvem a sequência completa de estados para animar.
 */
export type CellTone = 'default' | 'window' | 'dim' | 'found' | 'active';

export interface VizStep {
  /** Rótulos de ponteiros por índice (ex.: { 0: ['L'], 6: ['R'] }). */
  pointers: Record<number, string[]>;
  tones: Record<number, CellTone>;
  message: string;
  /** Linhas de estado auxiliares (ex.: soma atual, melhor resposta). */
  facts: Array<[label: string, value: string]>;
}

export interface VizResult {
  cells: Array<string | number>;
  steps: VizStep[];
}

const tonesFor = (n: number, fn: (i: number) => CellTone | undefined) => {
  const out: Record<number, CellTone> = {};
  for (let i = 0; i < n; i++) {
    const t = fn(i);
    if (t) out[i] = t;
  }
  return out;
};

const addPointer = (p: Record<number, string[]>, i: number, label: string) => {
  (p[i] ??= []).push(label);
  return p;
};

/** Two Pointers: par com soma alvo em array ordenado. */
export function twoPointerSteps(input: number[], target: number): VizResult {
  const nums = [...input].sort((a, b) => a - b);
  const steps: VizStep[] = [];
  let l = 0;
  let r = nums.length - 1;
  const outside = (i: number, lo: number, hi: number): CellTone | undefined =>
    i < lo || i > hi ? 'dim' : undefined;

  steps.push({
    pointers: addPointer(addPointer({}, l, 'L'), r, 'R'),
    tones: {},
    message: `Array ordenado. L começa na esquerda e R na direita. Procuramos soma = ${target}.`,
    facts: [['alvo', String(target)]],
  });

  while (l < r) {
    const sum = nums[l]! + nums[r]!;
    if (sum === target) {
      steps.push({
        pointers: addPointer(addPointer({}, l, 'L'), r, 'R'),
        tones: tonesFor(nums.length, (i) => (i === l || i === r ? 'found' : outside(i, l, r))),
        message: `${nums[l]} + ${nums[r]} = ${sum}. Encontramos o par nos índices ${l} e ${r}!`,
        facts: [
          ['soma', String(sum)],
          ['alvo', String(target)],
        ],
      });
      return { cells: nums, steps };
    }
    const moveLeft = sum < target;
    steps.push({
      pointers: addPointer(addPointer({}, l, 'L'), r, 'R'),
      tones: tonesFor(nums.length, (i) => (i === l || i === r ? 'active' : outside(i, l, r))),
      message: moveLeft
        ? `${nums[l]} + ${nums[r]} = ${sum} < ${target}: precisamos de uma soma maior, então L avança.`
        : `${nums[l]} + ${nums[r]} = ${sum} > ${target}: precisamos de uma soma menor, então R recua.`,
      facts: [
        ['soma', String(sum)],
        ['alvo', String(target)],
      ],
    });
    if (moveLeft) l++;
    else r--;
  }

  steps.push({
    pointers: l < nums.length ? addPointer({}, l, 'L=R') : {},
    tones: tonesFor(nums.length, () => 'dim'),
    message: `Os ponteiros se encontraram: não existe par com soma ${target}.`,
    facts: [['alvo', String(target)]],
  });
  return { cells: nums, steps };
}

/** Sliding Window: maior substring sem caracteres repetidos. */
export function slidingWindowSteps(s: string): VizResult {
  const chars = [...s];
  const steps: VizStep[] = [];
  const lastSeen = new Map<string, number>();
  let left = 0;
  let best = 0;
  let bestRange: [number, number] = [0, -1];
  const windowTones = (l: number, r: number, active?: number) =>
    tonesFor(chars.length, (i) =>
      i === active ? 'active' : i >= l && i <= r ? 'window' : i > r ? undefined : 'dim',
    );
  const facts = (l: number, r: number) =>
    [
      ['janela', `"${chars.slice(l, r + 1).join('')}"`],
      [
        'melhor',
        `${best}${best ? ` ("${chars.slice(bestRange[0], bestRange[1] + 1).join('')}")` : ''}`,
      ],
    ] as Array<[string, string]>;

  steps.push({
    pointers: chars.length ? addPointer({}, 0, 'L') : {},
    tones: {},
    message:
      'A janela [L, R] guarda uma substring sem repetições. R expande; L encolhe quando aparece uma repetição.',
    facts: [['melhor', '0']],
  });

  for (let right = 0; right < chars.length; right++) {
    const ch = chars[right]!;
    const seen = lastSeen.get(ch);
    if (seen !== undefined && seen >= left) {
      steps.push({
        pointers: addPointer(addPointer({}, left, 'L'), right, 'R'),
        tones: windowTones(left, right - 1, right),
        message: `'${ch}' já está na janela (índice ${seen}). L pula para ${seen + 1} para remover a repetição.`,
        facts: facts(left, right - 1),
      });
      left = seen + 1;
    }
    lastSeen.set(ch, right);
    const len = right - left + 1;
    const improved = len > best;
    if (improved) {
      best = len;
      bestRange = [left, right];
    }
    steps.push({
      pointers: addPointer(addPointer({}, left, 'L'), right, 'R'),
      tones: windowTones(left, right),
      message: improved
        ? `R inclui '${ch}'. A janela tem ${len} caracteres: novo recorde!`
        : `R inclui '${ch}'. Janela de ${len} caracteres (melhor continua ${best}).`,
      facts: facts(left, right),
    });
  }

  steps.push({
    pointers: {},
    tones: tonesFor(chars.length, (i) =>
      i >= bestRange[0] && i <= bestRange[1] ? 'found' : 'dim',
    ),
    message: `Fim. A maior substring sem repetições tem ${best} caracteres.`,
    facts: [['resposta', String(best)]],
  });
  return { cells: chars, steps };
}

/** Binary Search: busca de um valor em array ordenado. */
export function binarySearchSteps(input: number[], target: number): VizResult {
  const nums = [...input].sort((a, b) => a - b);
  const steps: VizStep[] = [];
  let lo = 0;
  let hi = nums.length - 1;
  const range = (i: number, a: number, b: number): CellTone | undefined =>
    i < a || i > b ? 'dim' : undefined;

  steps.push({
    pointers: nums.length ? addPointer(addPointer({}, lo, 'lo'), hi, 'hi') : {},
    tones: {},
    message: `Procuramos ${target}. O espaço de busca começa no array inteiro.`,
    facts: [
      ['alvo', String(target)],
      ['espaço', `${nums.length} elementos`],
    ],
  });

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const v = nums[mid]!;
    const ptrs = addPointer(addPointer(addPointer({}, lo, 'lo'), hi, 'hi'), mid, 'mid');
    if (v === target) {
      steps.push({
        pointers: ptrs,
        tones: tonesFor(nums.length, (i) => (i === mid ? 'found' : range(i, lo, hi))),
        message: `nums[${mid}] = ${v}. Encontramos o alvo no índice ${mid}!`,
        facts: [
          ['alvo', String(target)],
          ['mid', String(mid)],
        ],
      });
      return { cells: nums, steps };
    }
    const goRight = v < target;
    steps.push({
      pointers: ptrs,
      tones: tonesFor(nums.length, (i) => (i === mid ? 'active' : range(i, lo, hi))),
      message: goRight
        ? `nums[${mid}] = ${v} < ${target}: o alvo só pode estar à direita. Descartamos a metade esquerda.`
        : `nums[${mid}] = ${v} > ${target}: o alvo só pode estar à esquerda. Descartamos a metade direita.`,
      facts: [
        ['alvo', String(target)],
        ['espaço', `${hi - lo + 1} → ${goRight ? hi - mid : mid - lo} elementos`],
      ],
    });
    if (goRight) lo = mid + 1;
    else hi = mid - 1;
  }

  steps.push({
    pointers: {},
    tones: tonesFor(nums.length, () => 'dim'),
    message: `O espaço de busca ficou vazio: ${target} não está no array. (lo = ${lo} seria a posição de inserção.)`,
    facts: [['alvo', String(target)]],
  });
  return { cells: nums, steps };
}

/** Converte "1, 3, 5" em números, ignorando lixo; limita o tamanho para caber na tela. */
export function parseNumbers(text: string, max = 16): number[] {
  return text
    .split(/[\s,;]+/)
    .map((t) => Number(t))
    .filter((n) => Number.isFinite(n) && Math.abs(n) < 1000)
    .slice(0, max);
}
