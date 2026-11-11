import { Navigate, Outlet, useLocation } from 'react-router';
import { useMe } from '../lib/queries.ts';
import { ErrorState, PageLoader } from './ui/Feedback.tsx';

export function RequireAuth() {
  const { data: me, isPending, error, refetch } = useMe();
  const location = useLocation();
  if (isPending) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!me)
    return (
      <Navigate
        to={`/entrar?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  return <Outlet />;
}

/** Para telas públicas (login/cadastro): quem já está logado vai direto ao app. */
export function RedirectIfAuthed() {
  const { data: me, isPending } = useMe();
  if (isPending) return <PageLoader />;
  if (me) return <Navigate to="/app" replace />;
  return <Outlet />;
}
