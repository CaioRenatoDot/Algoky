import { describe, expect, it } from 'vitest';
import {
  addDays,
  dateRange,
  diffDays,
  isLocalDate,
  isValidTimeZone,
  toLocalDate,
  weekday,
} from '../src/dates.ts';

describe('dates', () => {
  it('valida datas ISO reais', () => {
    expect(isLocalDate('2024-02-29')).toBe(true);
    expect(isLocalDate('2023-02-29')).toBe(false);
    expect(isLocalDate('2024-1-01')).toBe(false);
  });

  it('converte instantes respeitando o fuso', () => {
    const instant = Date.parse('2026-01-01T02:00:00Z');
    expect(toLocalDate(instant, 'UTC')).toBe('2026-01-01');
    expect(toLocalDate(instant, 'America/Sao_Paulo')).toBe('2025-12-31');
  });

  it('soma e subtrai dias atravessando meses e anos', () => {
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
    expect(diffDays('2025-12-25', '2026-01-01')).toBe(7);
  });

  it('gera intervalos inclusivos e dia da semana', () => {
    expect(dateRange('2026-01-30', '2026-02-02')).toEqual([
      '2026-01-30',
      '2026-01-31',
      '2026-02-01',
      '2026-02-02',
    ]);
    expect(weekday('2026-11-08')).toBe(0);
  });

  it('valida fusos horários', () => {
    expect(isValidTimeZone('America/Sao_Paulo')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
  });
});
