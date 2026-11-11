import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

/** Checkbox padronizado: input nativo (acessível) com aparência do site. */
export function Checkbox({
  checked,
  onChange,
  children,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={clsx(
        'group inline-flex cursor-pointer items-start gap-2.5',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span className="relative mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 cursor-pointer appearance-none rounded-[5px] border border-border-strong bg-surface transition-colors checked:border-accent-solid checked:bg-accent-solid hover:border-muted focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] disabled:cursor-not-allowed"
        />
        <Check
          className="pointer-events-none relative h-3 w-3 text-accent-fg opacity-0 transition-opacity peer-checked:opacity-100"
          strokeWidth={3.5}
        />
      </span>
      <span className="text-sm">
        <span className="text-text">{children}</span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
}
