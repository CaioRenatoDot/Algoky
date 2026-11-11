import { clsx } from 'clsx';
import { Check, ChevronDown, Search } from 'lucide-react';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

export interface SelectOption<T extends string = string> {
  value: T;
  label: ReactNode;
  /** Texto usado na busca e na navegação por digitação (padrão: o label, se for string). */
  text?: string;
  /** Rótulo do grupo; opções consecutivas com o mesmo grupo ficam juntas. */
  group?: string;
  hint?: ReactNode;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<SelectOption<T>>;
  /** Rótulo acessível (obrigatório quando não há <label> associado). */
  label: string;
  id?: string;
  placeholder?: string;
  /** Mostra um campo de busca no topo da lista (para listas longas). */
  searchable?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const optionText = <T extends string>(o: SelectOption<T>) =>
  o.text ?? (typeof o.label === 'string' ? o.label : o.value);
const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/**
 * Select com a estética do site: lista suspensa própria, grupos, busca
 * opcional e navegação completa por teclado (padrão ARIA listbox).
 */
export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  id,
  placeholder = 'Selecione',
  searchable = false,
  size = 'md',
  className,
}: SelectProps<T>) {
  const autoId = useId();
  const buttonId = id ?? `${autoId}-button`;
  const listId = `${autoId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const typeahead = useRef({ text: '', at: 0 });

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return q ? options.filter((o) => norm(optionText(o)).includes(q)) : options;
  }, [options, query]);
  const selected = options.find((o) => o.value === value);

  const openList = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect)
      setPlacement(
        window.innerHeight - rect.bottom < 320 && rect.top > window.innerHeight - rect.bottom
          ? 'top'
          : 'bottom',
      );
    setQuery('');
    setActive(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
  };
  const close = (focusButton = true) => {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  };
  const choose = (o: SelectOption<T> | undefined) => {
    if (!o) return;
    onChange(o.value);
    close();
  };

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Foco inicial e rolagem até a opção ativa.
  useEffect(() => {
    if (!open) return;
    if (searchable) searchRef.current?.focus();
    else listRef.current?.focus();
  }, [open, searchable]);
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onListKey = (e: KeyboardEvent) => {
    const last = filtered.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((a) => Math.min(last, a + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
        break;
      case 'Home':
        if (!searchable) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case 'End':
        if (!searchable) {
          e.preventDefault();
          setActive(last);
        }
        break;
      case 'Enter':
        e.preventDefault();
        choose(filtered[active]);
        break;
      case ' ':
        if (!searchable) {
          e.preventDefault();
          choose(filtered[active]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        // Digitar pula para a opção que começa com o texto (sem busca visível).
        if (!searchable && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
          const now = Date.now();
          const t = typeahead.current;
          t.text = now - t.at > 600 ? e.key : t.text + e.key;
          t.at = now;
          const i = filtered.findIndex((o) =>
            norm(optionText(o))
              .replace(/^\d+\.\s*/, '')
              .startsWith(norm(t.text)),
          );
          if (i >= 0) setActive(i);
        }
    }
  };

  const onButtonKey = (e: KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  };

  return (
    <div ref={rootRef} className={clsx('relative', className)}>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onButtonKey}
        className={clsx(
          'flex w-full items-center justify-between gap-2 rounded-lg border bg-surface px-3 text-left text-text transition-colors',
          'hover:border-border-strong focus-visible:border-accent/60 focus-visible:shadow-[0_0_0_3px_var(--accent-soft)]',
          open ? 'border-accent/60 shadow-[0_0_0_3px_var(--accent-soft)]' : 'border-border',
          size === 'sm' ? 'h-9 text-xs' : 'h-10 text-sm',
        )}
      >
        <span className={clsx('min-w-0 truncate', !selected && 'text-subtle')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={clsx(
            'h-4 w-4 shrink-0 text-subtle transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          className={clsx(
            'absolute z-50 w-full min-w-[12rem] overflow-hidden rounded-xl border border-border bg-surface shadow-card animate-pop',
            placement === 'bottom'
              ? 'top-full mt-1.5 origin-top'
              : 'bottom-full mb-1.5 origin-bottom',
          )}
        >
          {searchable && (
            <div className="relative border-b border-border">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onListKey}
                placeholder="Buscar…"
                aria-label={`Buscar em ${label}`}
                aria-controls={listId}
                aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
                className="h-10 w-full bg-transparent pl-9 pr-3 text-sm text-text outline-none placeholder:text-subtle focus-visible:shadow-none"
              />
            </div>
          )}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={buttonId}
            aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
            onKeyDown={searchable ? undefined : onListKey}
            className="max-h-72 overflow-y-auto overscroll-contain p-1 outline-none focus-visible:shadow-none"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted">Nada encontrado.</li>
            )}
            {filtered.map((o, i) => {
              const showGroup = o.group && o.group !== filtered[i - 1]?.group;
              const isSelected = o.value === value;
              return (
                <li key={o.value} role="presentation">
                  {showGroup && (
                    <div
                      className="px-2.5 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wide text-subtle"
                      role="presentation"
                    >
                      {o.group}
                    </div>
                  )}
                  <div
                    id={`${listId}-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={isSelected}
                    onMouseMove={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(o)}
                    className={clsx(
                      'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm',
                      i === active ? 'bg-surface-2 text-text' : 'text-muted',
                      isSelected && 'font-medium text-text',
                    )}
                  >
                    <span className="min-w-0 flex-1 leading-snug">{o.label}</span>
                    {o.hint && <span className="shrink-0 text-xs text-subtle">{o.hint}</span>}
                    <Check
                      className={clsx('h-4 w-4 shrink-0 text-accent', !isSelected && 'invisible')}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
