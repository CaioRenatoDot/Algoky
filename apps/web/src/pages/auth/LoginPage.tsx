import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '../../components/ui/Button.tsx';
import { Field, Input } from '../../components/ui/Field.tsx';
import { PasswordInput } from '../../components/ui/PasswordInput.tsx';
import { errorMessage } from '../../lib/api.ts';
import { useAuthConfig, useLogin } from '../../lib/queries.ts';
import { AuthLayout } from './AuthLayout.tsx';

/** Só aceita redirecionar para caminhos internos (evita open redirect). */
export function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/app';
}

export default function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const login = useLogin();
  const { data: config } = useAuthConfig();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const fromProtected = params.has('next');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate(
      { username, password },
      { onSuccess: () => navigate(safeNext(params.get('next')), { replace: true }) },
    );
  };

  return (
    <AuthLayout
      title="Entrar no Algoky"
      subtitle={
        fromProtected
          ? 'Faça login para continuar de onde parou.'
          : 'Continue sua trilha de estudos.'
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="Usuário" htmlFor="username">
          <Input
            id="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>
        <Field label="Senha" htmlFor="password">
          <PasswordInput
            id="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {login.error && (
          <p
            className="rounded-lg border border-hard/30 bg-hard/10 px-3 py-2 text-sm text-hard-text"
            role="alert"
          >
            {errorMessage(login.error)}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={login.isPending}
          disabled={!username || !password}
        >
          Entrar
        </Button>
      </form>
      {config?.allowRegistration !== false && (
        <p className="mt-8 border-t border-border pt-6 text-sm text-muted">
          Primeira vez aqui?{' '}
          <Link
            to="/cadastro"
            className="font-medium text-text underline decoration-border-strong underline-offset-4 hover:decoration-accent"
          >
            Crie sua conta
          </Link>
          . Leva menos de um minuto.
        </p>
      )}
    </AuthLayout>
  );
}
