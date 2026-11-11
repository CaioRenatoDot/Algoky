import { LogoMark } from '../components/Logo.tsx';
import { ButtonLink } from '../components/ui/Button.tsx';

export function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <LogoMark className="mx-auto h-12 w-12 text-text" />
        <p className="mt-6 font-mono text-sm text-accent">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Página não encontrada</h1>
        <p className="mt-2 text-muted">
          Esse caminho não leva a lugar nenhum (nem com backtracking).
        </p>
        <ButtonLink to="/" className="mt-6">
          Voltar ao início
        </ButtonLink>
      </div>
    </div>
  );
}
