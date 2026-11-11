import { PATTERNS } from '@algoky/shared';
import type { SelectOption } from '../components/ui/Select.tsx';

/** Opções de padrão para filtros, com "todos" opcional no topo. */
export function patternOptions(allLabel?: string): SelectOption[] {
  const items = PATTERNS.map((p) => ({
    value: p.id,
    label: `${String(p.order).padStart(2, '0')}. ${p.name}`,
    text: p.name,
  }));
  return allLabel ? [{ value: '', label: allLabel }, ...items] : items;
}
