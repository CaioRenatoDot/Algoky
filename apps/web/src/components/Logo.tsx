import { clsx } from 'clsx';

/** Marca do Algoky redesenhada em SVG (substitui os PNGs antigos). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 92" aria-hidden="true" className={clsx('shrink-0', className)}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M50 4 88 71Q50 61 12 71Zm0 25 17 31Q50 55 33 60Z"
      />
      <path fill="var(--accent)" d="M12 71Q50 61 88 71l7 15Q50 76 5 86Z" />
    </svg>
  );
}

export function Logo({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 font-semibold tracking-tight text-text',
        className,
      )}
    >
      <LogoMark className={size === 'lg' ? 'h-9 w-9' : size === 'sm' ? 'h-6 w-6' : 'h-7 w-7'} />
      <span className={size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg'}>
        Algoky
      </span>
    </span>
  );
}
