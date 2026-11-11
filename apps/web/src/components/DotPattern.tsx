import { useId } from 'react';

/** Textura de pontos em SVG (sem gradiente), para dar profundidade a superfícies lisas. */
export function DotPattern({ className = 'text-border-strong/60' }: { className?: string }) {
  const id = useId();
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
