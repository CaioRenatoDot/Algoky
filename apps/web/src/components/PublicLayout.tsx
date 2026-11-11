import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import { useMe } from '../lib/queries.ts';
import { GitHubIcon, LinkedInIcon } from './BrandIcons.tsx';
import { Logo } from './Logo.tsx';
import { ButtonLink } from './ui/Button.tsx';

export function PublicHeader() {
  const { data: me } = useMe();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" aria-label="Algoky, início">
            <Logo size="sm" />
          </Link>
          <nav className="flex items-center gap-6 text-sm" aria-label="Principal">
            <NavLink
              to="/padroes"
              className={({ isActive }) =>
                isActive ? 'font-medium text-text' : 'text-muted hover:text-text'
              }
            >
              Padrões
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {me ? (
            <ButtonLink to="/app" size="sm" variant="secondary">
              Meu painel
            </ButtonLink>
          ) : (
            <>
              <ButtonLink to="/entrar" variant="ghost" size="sm">
                Entrar
              </ButtonLink>
              <ButtonLink to="/cadastro" size="sm" variant="secondary">
                Criar conta
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Algoky · guia aberto de padrões de algoritmos · MIT</p>
        <div className="flex items-center gap-4">
          <a
            href="https://leetcode.com/problemset/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-text"
          >
            LeetCode
          </a>
          <a
            href="https://github.com/CaioRenatoDot/Algoky"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 hover:text-text"
          >
            <GitHubIcon className="h-5 w-5" />
            Código no GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/caiorenato/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="hover:text-text"
          >
            <LinkedInIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
