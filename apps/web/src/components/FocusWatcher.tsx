import { Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { toast } from 'sonner';
import { chime, focusTimer, formatClock, remainingMs, useFocusState } from '../lib/focusTimer.ts';
import { useLogFocus } from '../lib/queries.ts';

/**
 * Montado no shell do app: conclui sessões de foco que terminaram (mesmo
 * fora da tela de foco) e mostra um indicador flutuante do tempo restante.
 */
export function FocusWatcher() {
  const state = useFocusState();
  const logFocus = useLogFocus();
  const location = useLocation();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (state.status !== 'running') return;
    const id = setInterval(() => {
      setNow(Date.now());
      const done = focusTimer.claimCompletion();
      if (!done) return;
      chime();
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Sessão de foco concluída', {
          body: `${done.minutes} minutos registrados. Hora de uma pausa!`,
          icon: '/favicon.svg',
        });
      }
      toast.success('Sessão de foco concluída!', {
        description: `${done.minutes} minutos registrados.`,
      });
      if (done.minutes >= 1) logFocus.mutate({ minutes: done.minutes, slug: done.slug });
    }, 500);
    return () => clearInterval(id);
  }, [state, logFocus]);

  const onFocusPage = location.pathname.startsWith('/app/foco');
  if (state.status === 'idle' || onFocusPage) return null;
  return (
    <Link
      to="/app/foco"
      className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 font-mono text-sm font-semibold shadow-card hover:border-accent lg:bottom-6 lg:right-6"
      aria-label="Sessão de foco em andamento"
    >
      <Timer
        className={state.status === 'running' ? 'h-4 w-4 text-accent' : 'h-4 w-4 text-muted'}
      />
      {formatClock(remainingMs(state, now))}
      {state.status === 'paused' && (
        <span className="font-sans text-xs font-normal text-muted">pausado</span>
      )}
    </Link>
  );
}
