import { addDays } from './dates.ts';
import type { LocalDate, ReviewCard, ReviewRating } from './types.ts';

/**
 * Revisão espaçada baseada no SM-2, simplificada para 4 respostas.
 * A ideia: problemas que você lembra bem voltam cada vez mais tarde;
 * os que você esqueceu voltam amanhã.
 */
export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_EASE = 3.0;
export const MAX_INTERVAL_DAYS = 180;

export function newCard(today: LocalDate, confidence: 1 | 2 | 3 | 4 | 5 = 3): ReviewCard {
  // Quanto mais confiante na primeira solução, mais tarde a primeira revisão.
  const firstInterval = confidence <= 2 ? 1 : confidence === 3 ? 2 : confidence === 4 ? 4 : 7;
  return {
    ease: DEFAULT_EASE,
    intervalDays: firstInterval,
    repetitions: 0,
    dueDate: addDays(today, firstInterval),
  };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round2 = (v: number) => Math.round(v * 100) / 100;

export function reviewCard(card: ReviewCard, rating: ReviewRating, today: LocalDate): ReviewCard {
  let { ease, intervalDays, repetitions } = card;

  switch (rating) {
    case 'again':
      repetitions = 0;
      intervalDays = 1;
      ease -= 0.2;
      break;
    case 'hard':
      repetitions += 1;
      intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
      ease -= 0.15;
      break;
    case 'good':
      repetitions += 1;
      intervalDays =
        repetitions === 1 ? Math.max(intervalDays, 3) : Math.round(intervalDays * ease);
      break;
    case 'easy':
      repetitions += 1;
      intervalDays =
        repetitions === 1 ? Math.max(intervalDays, 5) : Math.round(intervalDays * ease * 1.3);
      ease += 0.15;
      break;
  }

  ease = round2(clamp(ease, MIN_EASE, MAX_EASE));
  intervalDays = clamp(intervalDays, 1, MAX_INTERVAL_DAYS);
  return { ease, intervalDays, repetitions, dueDate: addDays(today, intervalDays) };
}

/** Prévia do próximo intervalo para cada resposta, usada nos botões da UI. */
export function previewIntervals(card: ReviewCard, today: LocalDate): Record<ReviewRating, number> {
  return {
    again: reviewCard(card, 'again', today).intervalDays,
    hard: reviewCard(card, 'hard', today).intervalDays,
    good: reviewCard(card, 'good', today).intervalDays,
    easy: reviewCard(card, 'easy', today).intervalDays,
  };
}
