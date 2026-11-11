import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme.ts';

/** Alterna entre claro e escuro (a opção "sistema" fica nas configurações). */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolved, setPref } = useTheme();
  const dark = resolved === 'dark';
  return (
    <button
      type="button"
      onClick={() => setPref(dark ? 'light' : 'dark')}
      className={`grid h-8 w-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-text ${className}`}
      aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={dark ? 'Modo claro' : 'Modo escuro'}
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
