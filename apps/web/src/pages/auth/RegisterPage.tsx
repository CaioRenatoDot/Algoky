import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button.tsx';
import { Field, Input } from '../../components/ui/Field.tsx';
import { ApiError, errorMessage } from '../../lib/api.ts';
import { useAuthConfig, useRegister } from '../../lib/queries.ts';
import { AuthLayout } from './AuthLayout.tsx';

const USERNAME = /^[a-z0-9_]{3,32}$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const { data: config } = useAuthConfig();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const usernameError =
    touched && username && !USERNAME.test(username)
      ? 'Use 3 a 32 caracteres: a-z, 0-9 ou _.'
      : null;
  const passwordError =
    touched && password && password.length < 8 ? 'Mínimo de 8 caracteres.' : null;
  const valid = USERNAME.test(username) && password.length >= 8;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
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
        <Link to="/entrar" className="font-medium text-accent hover:underline">
          Ir para o login
        </Link>
      </AuthLayout>
    );
  }

  const apiError = register.error;
  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle={
        <>
          Já tem conta?{' '}
          <Link to="/entrar" className="font-medium text-accent hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          label="Como quer ser chamado?"
          htmlFor="displayName"
          hint="Opcional. Aparece no seu painel."
        >
          <Input
            id="displayName"
            autoComplete="nickname"
            maxLength={60}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </Field>
        <Field
          label="Usuário"
          htmlFor="username"
          error={
            usernameError ??
            (apiError instanceof ApiError && apiError.code === 'username_taken'
              ? apiError.message
              : null)
          }
          hint="Letras minúsculas, números e _."
        >
          <Input
            id="username"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
            onBlur={() => setTouched(true)}
          />
        </Field>
        <Field
          label="Senha"
          htmlFor="password"
          error={passwordError}
          hint="Pelo menos 8 caracteres."
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(true)}
          />
        </Field>
        {apiError && !(apiError instanceof ApiError && apiError.code === 'username_taken') && (
          <p className="rounded-lg bg-hard/10 px-3 py-2 text-sm text-hard-text" role="alert">
            {errorMessage(apiError)}
          </p>
        )}
        <Button type="submit" className="w-full" loading={register.isPending}>
          Criar conta
        </Button>
        <p className="text-center text-xs text-muted">
          Seus dados ficam só nesta instância. Dá para exportar tudo a qualquer momento.
        </p>
      </form>
    </AuthLayout>
  );
}
