import { clsx } from 'clsx';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { errorMessage } from '../../lib/api.ts';
import { Button } from './Button.tsx';

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={clsx('h-5 w-5 animate-spin text-muted', className)}
      aria-label="Carregando"
    />
  );
}

export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Spinner className="h-6 w-6" />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-lg bg-surface-2', className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex flex-col items-center px-6 py-12 text-center', className)}>
      {icon && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-text">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<AlertTriangle className="h-5 w-5" />}
      title="Não foi possível carregar"
      description={errorMessage(error)}
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Tentar de novo
          </Button>
        )
      }
    />
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-surface-2 px-1 text-[11px] font-medium text-muted">
      {children}
    </kbd>
  );
}
