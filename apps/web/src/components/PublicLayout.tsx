import { clsx } from 'clsx';
import { Menu, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useMe } from '../lib/queries.ts';
import { GitHubIcon, LinkedInIcon } from './BrandIcons.tsx';
import { Logo } from './Logo.tsx';
import { ThemeToggle } from './ThemeToggle.tsx';
import { ButtonLink } from './ui/Button.tsx';

const NAV = [
  { to: '/comece-aqui', label: 'Comece aqui' },
  { to: '/padroes', label: 'Padrões' },
  { to: '/problemas', label: 'Problemas' },
  { to: '/guias', label: 'Guias' },
  { to: '/big-o', label: 'Big-O' },
];

export function PublicHeader() {
  const { data: me } = useMe();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  // Fecha o menu mobile ao navegar.
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const account = me ? (
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
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" aria-label="Algoky, início">
            <Logo size="sm" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Principal">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'font-medium text-text' : 'text-muted hover:text-text'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden items-center gap-2 md:flex">{account}</div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-text md:hidden"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="menu-mobile"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div
        id="menu-mobile"
        className={clsx('border-t border-border bg-bg md:hidden', !open && 'hidden')}
      >
        <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2" aria-label="Principal (mobile)">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'rounded-md px-2 py-2.5 text-[15px]',
                  isActive ? 'font-medium text-text' : 'text-muted',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="mt-2 flex gap-2 border-t border-border pb-2 pt-4">{account}</div>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        <div>
          <Logo size="sm" />
          <p className="mt-3 max-w-xs text-muted">
            Guia aberto de padrões de algoritmos para entrevistas técnicas.
          </p>
        </div>
        <div>
          <p className="font-medium">Estudar</p>
          <ul className="mt-3 space-y-2 text-muted">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="hover:text-text">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium">Projeto</p>
          <ul className="mt-3 space-y-2 text-muted">
            <li>
              <a
                href="https://github.com/CaioRenatoDot/Algoky"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-text"
              >
                <GitHubIcon className="h-4 w-4" /> Código no GitHub
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/caiorenato/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-text"
              >
                <LinkedInIcon className="h-4 w-4" /> LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://leetcode.com/problemset/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-text"
              >
                LeetCode
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-subtle sm:px-6">
          Código aberto sob licença MIT.
        </p>
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
