import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '../../components/ui/Button.tsx';
import { Field, Input } from '../../components/ui/Field.tsx';
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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate(
      { username, password },
      { onSuccess: () => navigate(safeNext(params.get('next')), { replace: true }) },
    );
  };

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle={
        config?.allowRegistration !== false ? (
          <>
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="font-medium text-accent hover:underline">
              Cadastre-se
            </Link>
          </>
        ) : (
          'Entre para continuar seus estudos.'
        )
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Usuário" htmlFor="username">
          <Input
            id="username"
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>
        <Field label="Senha" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {login.error && (
          <p className="rounded-lg bg-hard/10 px-3 py-2 text-sm text-hard-text" role="alert">
            {errorMessage(login.error)}
          </p>
        )}
        <Button
          type="submit"
          className="w-full"
          loading={login.isPending}
          disabled={!username || !password}
        >
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
}
