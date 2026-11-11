import type { LocalDate } from './types.ts';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

export function isLocalDate(value: string): value is LocalDate {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Converte um instante para a data local (YYYY-MM-DD) do fuso informado. */
export function toLocalDate(instant: Date | number, timeZone: string): LocalDate {
  // en-CA formata como YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

function toUtcMs(date: LocalDate): number {
  return Date.parse(`${date}T00:00:00Z`);
}

export function addDays(date: LocalDate, days: number): LocalDate {
  return new Date(toUtcMs(date) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Número de dias de `from` até `to` (positivo se `to` for depois). */
export function diffDays(from: LocalDate, to: LocalDate): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / DAY_MS);
}

/** 0 = domingo ... 6 = sábado. */
export function weekday(date: LocalDate): number {
  return new Date(toUtcMs(date)).getUTCDay();
}

/** Lista inclusiva de datas entre `from` e `to`. */
export function dateRange(from: LocalDate, to: LocalDate): LocalDate[] {
  const days = diffDays(from, to);
  const out: LocalDate[] = [];
  for (let i = 0; i <= days; i++) out.push(addDays(from, i));
  return out;
}
