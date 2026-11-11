import { clsx } from 'clsx';
import { Check, Circle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button.tsx';
import { Field, Input } from '../../components/ui/Field.tsx';
import { PasswordInput } from '../../components/ui/PasswordInput.tsx';
import { ApiError, errorMessage } from '../../lib/api.ts';
import { useAuthConfig, useRegister } from '../../lib/queries.ts';
import { AuthLayout } from './AuthLayout.tsx';

const USERNAME = /^[a-z0-9_]{3,32}$/;

/** Força estimada da senha (0 a 3) por tamanho e variedade de caracteres. */
export function passwordStrength(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length < 8) return 0;
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (pw.length >= 14 || (pw.length >= 10 && variety >= 3)) return 3;
  if (pw.length >= 10 || variety >= 3) return 2;
  return 1;
}

const STRENGTH = [
  { label: '', className: '' },
  { label: 'Fraca', className: 'bg-hard' },
  { label: 'Boa', className: 'bg-medium' },
  { label: 'Forte', className: 'bg-success' },
];

function Requirement({ id, ok, children }: { id: string; ok: boolean; children: React.ReactNode }) {
  return (
    <li id={id} className={clsx('flex items-center gap-2', ok ? 'text-success' : 'text-muted')}>
      {ok ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Circle className="h-3 w-3" />}
      {children}
    </li>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const { data: config } = useAuthConfig();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const usernameOk = USERNAME.test(username);
  const passwordOk = password.length >= 8;
  const strength = passwordStrength(password);
  const taken = register.error instanceof ApiError && register.error.code === 'username_taken';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!usernameOk || !passwordOk) return;
    register.mutate(
      {
        username,
        password,
        displayName: displayName.trim() || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      { onSuccess: () => navigate('/app', { replace: true }) },
    );
  };

  if (config?.allowRegistration === false) {
    return (
      <AuthLayout
        title="Cadastro fechado"
        subtitle="Esta instância do Algoky não aceita novos cadastros."
      >
        <p className="text-sm text-muted">
          Você ainda pode{' '}
          <Link to="/padroes" className="font-medium text-text underline underline-offset-4">
            estudar os padrões
          </Link>{' '}
          sem conta, ou{' '}
          <Link to="/entrar" className="font-medium text-text underline underline-offset-4">
            entrar
          </Link>{' '}
          se já tiver uma.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Gratuito. Seus dados ficam nesta instância e podem ser exportados quando quiser."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field
          label="Como quer ser chamado?"
          htmlFor="displayName"
          hint="Opcional. Aparece no seu painel."
        >
          <Input
            id="displayName"
            autoComplete="nickname"
            autoFocus
            maxLength={60}
            placeholder="Ex.: Caio"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </Field>

        <Field
          label="Usuário"
          htmlFor="username"
          error={taken ? errorMessage(register.error) : null}
        >
          <Input
            id="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={32}
            value={username}
            aria-invalid={(submitted && !usernameOk) || taken}
            aria-describedby="username-rules"
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
          />
        </Field>

        <Field label="Senha" htmlFor="password">
          <PasswordInput
            id="password"
            autoComplete="new-password"
            required
            value={password}
            aria-invalid={submitted && !passwordOk}
            aria-describedby="password-rules"
            onChange={(e) => setPassword(e.target.value)}
          />
          {password && (
            <div className="mt-2 flex items-center gap-3" aria-live="polite">
              <div className="grid flex-1 grid-cols-3 gap-1">
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={clsx(
                      'h-1 rounded-full',
                      strength >= i ? STRENGTH[strength]!.className : 'bg-surface-3',
                    )}
                  />
                ))}
              </div>
              <span className="w-10 text-right text-xs text-muted">
                {STRENGTH[strength]!.label}
              </span>
            </div>
          )}
        </Field>

        <ul
          className="space-y-1.5 rounded-lg bg-surface-2 px-3 py-2.5 text-xs"
          aria-label="Requisitos"
        >
          <Requirement id="username-rules" ok={usernameOk}>
            Usuário com 3 a 32 caracteres: a–z, 0–9 ou _
          </Requirement>
          <Requirement id="password-rules" ok={passwordOk}>
            Senha com pelo menos 8 caracteres
          </Requirement>
        </ul>

        {register.error && !taken && (
          <p
            className="rounded-lg border border-hard/30 bg-hard/10 px-3 py-2 text-sm text-hard-text"
            role="alert"
          >
            {errorMessage(register.error)}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={register.isPending}>
          Criar conta
        </Button>
      </form>
      <p className="mt-8 border-t border-border pt-6 text-sm text-muted">
        Já tem conta?{' '}
        <Link
          to="/entrar"
          className="font-medium text-text underline decoration-border-strong underline-offset-4 hover:decoration-accent"
        >
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
