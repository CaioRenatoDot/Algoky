import { PATTERNS_BY_ID, type Difficulty } from '@algoky/shared';

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const patternName = (id: string) => PATTERNS_BY_ID.get(id)?.name ?? id;

export function plural(n: number, singular: string, pluralForm = `${singular}s`) {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });
const longDateFmt = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** Formata uma data local YYYY-MM-DD sem deslocamento de fuso. */
export function formatLocalDate(date: string, long = false) {
  const [y, m, d] = date.split('-').map(Number);
  return (long ? longDateFmt : dateFmt).format(new Date(y!, m! - 1, d!));
}

const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

export function relativeTime(iso: string, now = Date.now()) {
  const diff = (new Date(iso).getTime() - now) / 1000;
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unit, secs] of units)
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  return 'agora';
}

export function inDays(days: number) {
  if (days <= 0) return 'hoje';
  if (days === 1) return 'amanhã';
  if (days < 30) return `em ${days} dias`;
  const months = Math.round(days / 30);
  return months === 1 ? 'em 1 mês' : `em ${months} meses`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function formatMinutes(total: number) {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}
