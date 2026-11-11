import type {
  Dashboard,
  DueReview,
  FocusSession,
  MutationResponse,
  ProblemState,
  ProblemStatus,
  ReviewRating,
  TemplateLanguage,
  User,
} from '@algoky/shared';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, api } from './api.ts';
import { celebrate } from './celebrate.ts';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
    },
  },
});

export const keys = {
  me: ['me'] as const,
  authConfig: ['auth-config'] as const,
  dashboard: ['dashboard'] as const,
  progress: ['progress'] as const,
  reviews: ['reviews-due'] as const,
};

// ------------------------------------------------------------------ auth

export function useMe() {
  return useQuery({
    queryKey: keys.me,
    queryFn: async () => {
      try {
        return (await api.get<{ user: User }>('/api/auth/me')).user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 5 * 60_000,
  });
}

export function useAuthConfig() {
  return useQuery({
    queryKey: keys.authConfig,
    queryFn: () => api.get<{ allowRegistration: boolean }>('/api/auth/config'),
    staleTime: Infinity,
  });
}

function useAuthMutation<V>(path: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: V) => api.post<{ user: User }>(path, body),
    onSuccess: ({ user }) => {
      qc.clear();
      qc.setQueryData(keys.me, user);
    },
  });
}

export const useLogin = () =>
  useAuthMutation<{ username: string; password: string }>('/api/auth/login');
export const useRegister = () =>
  useAuthMutation<{ username: string; password: string; displayName?: string; timezone?: string }>(
    '/api/auth/register',
  );

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>('/api/auth/logout'),
    onSettled: () => {
      qc.clear();
      qc.setQueryData(keys.me, null);
    },
  });
}

// ----------------------------------------------------------------- dados

export function useDashboard() {
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: () => api.get<Dashboard>('/api/dashboard'),
  });
}

/** Progresso indexado por slug. */
export function useProgress(enabled = true) {
  return useQuery({
    queryKey: keys.progress,
    enabled,
    queryFn: async () => {
      const { problems } = await api.get<{ problems: ProblemState[] }>('/api/progress');
      return new Map(problems.map((p) => [p.slug, p]));
    },
  });
}

export function useDueReviews() {
  return useQuery({
    queryKey: keys.reviews,
    queryFn: async () => (await api.get<{ reviews: DueReview[] }>('/api/reviews/due')).reviews,
  });
}

// -------------------------------------------------------------- mutações

function useStudyMutation<V, T>(
  fn: (vars: V) => Promise<MutationResponse<T>>,
  after?: (data: T) => void,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (res) => {
      const before = qc.getQueryData<Dashboard>(keys.dashboard)?.level.level;
      celebrate(res, before);
      after?.(res.data);
      void qc.invalidateQueries({ queryKey: keys.dashboard });
      void qc.invalidateQueries({ queryKey: keys.reviews });
    },
  });
}

export interface ProblemPatch {
  status?: ProblemStatus;
  notes?: string;
  confidence?: number | null;
  starred?: boolean;
  code?: string;
  codeLanguage?: TemplateLanguage | null;
}

export function useUpdateProblem() {
  const qc = useQueryClient();
  return useStudyMutation(
    ({ slug, patch }: { slug: string; patch: ProblemPatch }) =>
      api.patch<MutationResponse<ProblemState>>(`/api/progress/${slug}`, patch),
    (state) =>
      qc.setQueryData<Map<string, ProblemState>>(keys.progress, (prev) =>
        new Map(prev).set(state.slug, state),
      ),
  );
}

/**
 * Salvamento silencioso de rascunhos (código, linguagem, notas): atualiza o
 * cache do progresso sem invalidar o dashboard nem disparar comemorações.
 */
export function useSaveDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug,
      patch,
    }: {
      slug: string;
      patch: Pick<ProblemPatch, 'code' | 'codeLanguage' | 'notes'>;
    }) => api.patch<MutationResponse<ProblemState>>(`/api/progress/${slug}`, patch),
    onSuccess: ({ data }) =>
      qc.setQueryData<Map<string, ProblemState>>(keys.progress, (prev) =>
        new Map(prev).set(data.slug, data),
      ),
  });
}

export function useReview() {
  const qc = useQueryClient();
  return useStudyMutation(
    ({ slug, rating }: { slug: string; rating: ReviewRating }) =>
      api.post<MutationResponse<ProblemState>>(`/api/reviews/${slug}`, { rating }),
    (state) =>
      qc.setQueryData<Map<string, ProblemState>>(keys.progress, (prev) =>
        new Map(prev).set(state.slug, state),
      ),
  );
}

export function useLogFocus() {
  return useStudyMutation((body: { minutes: number; slug?: string | null }) =>
    api.post<MutationResponse<FocusSession>>('/api/focus', body),
  );
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Omit<User, 'id' | 'username' | 'createdAt'>>) =>
      api.patch<{ user: User }>('/api/me/settings', patch),
    onSuccess: ({ user }) => {
      qc.setQueryData(keys.me, user);
      void qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}
