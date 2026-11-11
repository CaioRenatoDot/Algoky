import { PATTERNS } from '@algoky/shared';
import { Brain, Flame, Map as MapIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Logo } from '../../components/Logo.tsx';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link to="/" className="self-start" aria-label="Algoky, início">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <aside className="relative hidden overflow-hidden border-l border-border bg-surface lg:flex lg:flex-col lg:justify-center lg:px-16">
        <blockquote className="relative max-w-md">
          <p className="text-2xl font-medium leading-snug tracking-tight text-balance">
            “Não é sobre resolver 500 problemas. É sobre reconhecer os {PATTERNS.length} padrões por
            trás deles.”
          </p>
        </blockquote>
        <ul className="relative mt-10 space-y-4 text-sm text-muted">
          <li className="flex items-center gap-3">
            <MapIcon className="h-4 w-4 text-accent" /> Trilha guiada do básico ao avançado
          </li>
          <li className="flex items-center gap-3">
            <Brain className="h-4 w-4 text-accent" /> Revisões agendadas automaticamente
          </li>
          <li className="flex items-center gap-3">
            <Flame className="h-4 w-4 text-accent" /> Streak e metas para manter o ritmo
          </li>
        </ul>
      </aside>
    </div>
  );
}
