import {
  PROBLEM_STATUSES,
  REVIEW_RATINGS,
  TEMPLATE_LANGUAGES,
  isValidTimeZone,
} from '@algoky/shared';
import { z } from 'zod';

export const username = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,32}$/, 'Use de 3 a 32 caracteres: letras minúsculas, números ou _.');

export const password = z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.').max(128);

export const timezone = z.string().refine(isValidTimeZone, 'Fuso horário inválido.');

export const displayName = z.string().trim().min(1).max(60);

export const registerBody = z.object({
  username,
  password,
  displayName: displayName.optional(),
  timezone: timezone.optional(),
});

export const loginBody = z.object({
  username: z.string().trim().toLowerCase().min(1).max(64),
  password: z.string().min(1).max(128),
});

export const settingsBody = z
  .object({
    displayName,
    timezone,
    dailyGoal: z.number().int().min(1).max(20),
    preferredLanguage: z.enum(TEMPLATE_LANGUAGES),
    leetcodeUsername: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9_-]{1,40}$/, 'Usuário do LeetCode inválido.')
      .nullable(),
  })
  .partial()
  .strict();

export const passwordChangeBody = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: password,
});

export const deleteAccountBody = z.object({ password: z.string().min(1).max(128) });

export const slugParams = z.object({ slug: z.string().regex(/^[a-z0-9-]{1,120}$/) });

export const problemPatchBody = z
  .object({
    status: z.enum(PROBLEM_STATUSES),
    notes: z.string().max(20_000),
    confidence: z.number().int().min(1).max(5).nullable(),
    starred: z.boolean(),
  })
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, 'Envie ao menos um campo.');

export const reviewBody = z.object({ rating: z.enum(REVIEW_RATINGS) });

export const focusBody = z.object({
  minutes: z.number().int().min(1).max(180),
  slug: z
    .string()
    .regex(/^[a-z0-9-]{1,120}$/)
    .nullable()
    .optional(),
});
