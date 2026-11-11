import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Painel lateral (desktop) / folha inferior (mobile) sobre o <dialog> nativo:
 * foco preso, Esc para fechar e backdrop de graça.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={clsx(
        'm-0 ml-auto h-dvh max-h-dvh w-full max-w-lg border-l border-border bg-surface p-0 text-text shadow-2xl',
        'backdrop:bg-black/40 backdrop:backdrop-blur-[2px] open:animate-fade-up',
        'max-sm:mt-auto max-sm:h-[88dvh] max-sm:rounded-t-2xl max-sm:border-l-0 max-sm:border-t',
      )}
    >
      {open && (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0 flex-1">{title}</div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-text"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
