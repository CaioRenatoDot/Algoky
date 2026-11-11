import { clsx } from 'clsx';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

export const inputClass =
  'w-full rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-subtle transition-colors hover:border-border-strong focus:border-accent focus:outline-none';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={clsx(inputClass, 'h-10', className)} {...rest} />;
  },
);

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx(inputClass, 'h-10 cursor-pointer pr-8', className)} {...rest}>
      {children}
    </select>
  );
}

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={clsx(inputClass, 'min-h-28 py-2 leading-relaxed', className)}
      {...rest}
    />
  );
});

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-text">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-hard-text" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}
