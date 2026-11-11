import { clsx } from 'clsx';

export function ProgressBar({
  value,
  max = 1,
  className,
  barClassName = 'bg-accent',
  label,
}: {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={clsx('h-2 overflow-hidden rounded-full bg-surface-3', className)}
    >
      <div
        className={clsx(
          'h-full rounded-full transition-[width] duration-700 ease-out',
          barClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  max = 1,
  size = 64,
  stroke = 6,
  className,
  trackClassName = 'stroke-surface-3',
  barClassName = 'stroke-accent',
  children,
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div
      className={clsx('relative inline-grid place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={label}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className={clsx('transition-[stroke-dashoffset] duration-700 ease-out', barClassName)}
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  );
}
