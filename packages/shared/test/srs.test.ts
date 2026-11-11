import { describe, expect, it } from 'vitest';
import { MAX_INTERVAL_DAYS, MIN_EASE, newCard, previewIntervals, reviewCard } from '../src/srs.ts';

const today = '2026-11-11';

describe('revisão espaçada', () => {
  it('agenda a primeira revisão conforme a confiança', () => {
    expect(newCard(today, 1).dueDate).toBe('2026-11-12');
    expect(newCard(today, 3).dueDate).toBe('2026-11-13');
    expect(newCard(today, 5).dueDate).toBe('2026-11-18');
  });

  it('"good" faz o intervalo crescer pela facilidade', () => {
    let card = newCard(today);
    card = reviewCard(card, 'good', today);
    expect(card.intervalDays).toBe(3);
    card = reviewCard(card, 'good', today);
    expect(card.intervalDays).toBe(8);
    expect(card.repetitions).toBe(2);
  });

  it('"again" reinicia e reduz a facilidade sem passar do mínimo', () => {
    let card = reviewCard(newCard(today, 5), 'good', today);
    for (let i = 0; i < 20; i++) card = reviewCard(card, 'again', today);
    expect(card).toMatchObject({
      intervalDays: 1,
      repetitions: 0,
      ease: MIN_EASE,
      dueDate: '2026-11-12',
    });
  });

  it('nunca ultrapassa o intervalo máximo', () => {
    let card = newCard(today, 5);
    for (let i = 0; i < 30; i++) card = reviewCard(card, 'easy', today);
    expect(card.intervalDays).toBe(MAX_INTERVAL_DAYS);
  });

  it('prévia é ordenada de "again" até "easy"', () => {
    const card = reviewCard(reviewCard(newCard(today), 'good', today), 'good', today);
    const p = previewIntervals(card, today);
    expect(p.again).toBeLessThan(p.hard);
    expect(p.hard).toBeLessThan(p.good);
    expect(p.good).toBeLessThan(p.easy);
  });
});
