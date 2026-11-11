import { useCallback, useSyncExternalStore } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
const KEY = 'algoky:theme';
const listeners = new Set<() => void>();

function read(): ThemePreference {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function apply(pref: ThemePreference) {
  const dark =
    pref === 'dark' || (pref === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

export function initTheme() {
  apply(read());
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (read() === 'system') {
      apply('system');
      listeners.forEach((l) => l());
    }
  });
}

export function useTheme() {
  const pref = useSyncExternalStore(
    (cb) => (listeners.add(cb), () => listeners.delete(cb)),
    read,
    () => 'system' as const,
  );
  const setPref = useCallback((next: ThemePreference) => {
    try {
      if (next === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      /* armazenamento indisponível: aplica só nesta sessão */
    }
    apply(next);
    listeners.forEach((l) => l());
  }, []);
  const resolved =
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark'
      ? 'dark'
      : 'light';
  return { pref, resolved, setPref } as const;
}
