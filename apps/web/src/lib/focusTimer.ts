import { useSyncExternalStore } from 'react';

/**
 * Timer de foco global, persistido no localStorage: sobrevive a navegação,
 * recarregamento da página e é sincronizado entre abas.
 */
export type FocusState =
  | { status: 'idle' }
  | { status: 'running'; endAt: number; durationMin: number; slug: string | null }
  | { status: 'paused'; remainingMs: number; durationMin: number; slug: string | null };

const KEY = 'algoky:focus';
const IDLE: FocusState = { status: 'idle' };
const listeners = new Set<() => void>();
let cache: FocusState | undefined;

function load(): FocusState {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as FocusState) : IDLE;
    return parsed && typeof parsed === 'object' && 'status' in parsed ? parsed : IDLE;
  } catch {
    return IDLE;
  }
}

function save(next: FocusState) {
  cache = next;
  try {
    if (next.status === 'idle') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* sem armazenamento: o timer vale só nesta aba */
  }
  listeners.forEach((l) => l());
}

export function getFocusState(): FocusState {
  return (cache ??= load());
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      cache = load();
      listeners.forEach((l) => l());
    }
  });
}

export const focusTimer = {
  start(durationMin: number, slug: string | null) {
    save({ status: 'running', endAt: Date.now() + durationMin * 60_000, durationMin, slug });
  },
  pause() {
    const s = getFocusState();
    if (s.status === 'running')
      save({
        status: 'paused',
        remainingMs: Math.max(0, s.endAt - Date.now()),
        durationMin: s.durationMin,
        slug: s.slug,
      });
  },
  resume() {
    const s = getFocusState();
    if (s.status === 'paused')
      save({
        status: 'running',
        endAt: Date.now() + s.remainingMs,
        durationMin: s.durationMin,
        slug: s.slug,
      });
  },
  /** Encerra e devolve os minutos efetivamente focados. */
  stop(): { minutes: number; slug: string | null } {
    const s = getFocusState();
    save(IDLE);
    if (s.status === 'idle') return { minutes: 0, slug: null };
    const remaining = s.status === 'running' ? Math.max(0, s.endAt - Date.now()) : s.remainingMs;
    return { minutes: Math.floor((s.durationMin * 60_000 - remaining) / 60_000), slug: s.slug };
  },
  /**
   * Conclui a sessão se o tempo acabou. Relê o storage antes de limpar para
   * que, com várias abas abertas, só uma registre a sessão.
   */
  claimCompletion(): { minutes: number; slug: string | null } | null {
    const s = load();
    if (s.status !== 'running' || Date.now() < s.endAt) return null;
    save(IDLE);
    return { minutes: s.durationMin, slug: s.slug };
  },
};

export function useFocusState(): FocusState {
  return useSyncExternalStore(
    (cb) => (listeners.add(cb), () => listeners.delete(cb)),
    getFocusState,
    () => IDLE,
  );
}

export function remainingMs(s: FocusState, now = Date.now()): number {
  if (s.status === 'running') return Math.max(0, s.endAt - now);
  if (s.status === 'paused') return s.remainingMs;
  return 0;
}

export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/** Bipe curto via Web Audio (sem arquivo de som). */
export function chime() {
  try {
    const ctx = new AudioContext();
    [0, 0.18, 0.36].forEach((t, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = [660, 880, 1320][i]!;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.4);
    });
    setTimeout(() => void ctx.close(), 1500);
  } catch {
    /* áudio indisponível */
  }
}
