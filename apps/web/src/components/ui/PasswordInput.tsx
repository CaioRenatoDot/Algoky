import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState, type InputHTMLAttributes, type KeyboardEvent } from 'react';
import { Input } from './Field.tsx';

/** Campo de senha com botão de mostrar/ocultar e aviso de Caps Lock ativado. */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>
>(function PasswordInput({ onKeyUp, onBlur, ...rest }, ref) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const checkCaps = (e: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(e.getModifierState('CapsLock'));
  return (
    <div>
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className="pr-10"
          onKeyUp={(e) => {
            checkCaps(e);
            onKeyUp?.(e);
          }}
          onKeyDown={checkCaps}
          onBlur={(e) => {
            setCapsLock(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-subtle hover:text-text"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {capsLock && (
        <p className="mt-1.5 text-xs text-warning" role="status">
          Caps Lock está ativado.
        </p>
      )}
    </div>
  );
});
