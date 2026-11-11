import { clsx } from 'clsx';
import {
  Brain,
  Flame,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Map as MapIcon,
  Settings,
  Timer,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { Suspense } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useDashboard, useLogout, useMe } from '../lib/queries.ts';
import { FocusWatcher } from './FocusWatcher.tsx';
import { ThemeToggle } from './ThemeToggle.tsx';
import { LogoMark, Logo } from './Logo.tsx';
import { PageLoader } from './ui/Feedback.tsx';
import { ProgressBar } from './ui/Progress.tsx';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
}

const NAV: NavItem[] = [
  { to: '/app', label: 'Início', icon: LayoutDashboard, mobile: true },
  { to: '/app/trilha', label: 'Trilha', icon: MapIcon, mobile: true },
  { to: '/app/problemas', label: 'Problemas', icon: ListChecks, mobile: true },
  { to: '/app/revisao', label: 'Revisão', icon: Brain, mobile: true },
  { to: '/app/foco', label: 'Foco', icon: Timer, mobile: true },
  { to: '/app/conquistas', label: 'Conquistas', icon: Trophy },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
];

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto rounded-full bg-accent px-1.5 py-px text-[11px] font-semibold text-accent-fg tabular-nums">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function SidebarLink({ item, badge }: { item: NavItem; badge?: number }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/app'}
      className={({ isActive }) =>
        clsx(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-surface-2 text-text' : 'text-muted hover:bg-surface-2/60 hover:text-text',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={clsx(
              'h-[18px] w-[18px]',
              isActive ? 'text-accent' : 'text-subtle group-hover:text-muted',
            )}
          />
          {item.label}
          {badge !== undefined && <NavBadge count={badge} />}
        </>
      )}
    </NavLink>
  );
}

function StreakChip({ streak, activeToday }: { streak: number; activeToday: boolean }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold tabular-nums',
        activeToday ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-muted',
      )}
      title={activeToday ? 'Você já estudou hoje' : 'Estude hoje para manter o streak'}
    >
      <Flame className={clsx('h-4 w-4', activeToday && 'fill-current')} />
      {streak}
    </span>
  );
}

export function AppShell() {
  const { data: me } = useMe();
  const { data: dash } = useDashboard();
  const logout = useLogout();
  const navigate = useNavigate();
  const reviewsDue = dash?.reviewsDue ?? 0;

  const onLogout = () => logout.mutate(undefined, { onSettled: () => navigate('/') });

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-surface/60 px-3 py-5 backdrop-blur lg:flex">
        <NavLink to="/app" className="px-3">
          <Logo />
        </NavLink>
        <nav className="mt-8 flex flex-col gap-0.5" aria-label="Principal">
          {NAV.map((item) => (
            <SidebarLink
              key={item.to}
              item={item}
              badge={item.to === '/app/revisao' ? reviewsDue : undefined}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          {dash && (
            <div className="rounded-xl border border-border bg-surface p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">
                  Nível {dash.level.level} · {dash.level.title}
                </span>
                <StreakChip streak={dash.streak.current} activeToday={dash.streak.activeToday} />
              </div>
              <ProgressBar
                value={dash.level.progress}
                className="mt-2.5 h-1.5"
                label="Progresso do nível"
              />
              <p className="mt-1.5 text-[11px] text-subtle tabular-nums">
                {dash.level.xp - dash.level.currentLevelXp} /{' '}
                {dash.level.nextLevelXp - dash.level.currentLevelXp} XP
              </p>
            </div>
          )}
          <div className="flex items-center gap-3 px-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
              {me?.displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{me?.displayName}</p>
              <p className="truncate text-xs text-muted">@{me?.username}</p>
            </div>
            <ThemeToggle />
            <button
              onClick={onLogout}
              className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-text"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Topo mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/85 px-4 py-3 backdrop-blur lg:hidden">
        <NavLink to="/app" aria-label="Início">
          <LogoMark className="h-7 w-7 text-text" />
        </NavLink>
        <div className="flex items-center gap-2">
          {dash && (
            <StreakChip streak={dash.streak.current} activeToday={dash.streak.activeToday} />
          )}
          <ThemeToggle />
          <NavLink
            to="/app/conquistas"
            className="rounded-md p-2 text-muted hover:text-text"
            aria-label="Conquistas"
          >
            <Trophy className="h-5 w-5" />
          </NavLink>
          <NavLink
            to="/app/configuracoes"
            className="rounded-md p-2 text-muted hover:text-text"
            aria-label="Configurações"
          >
            <Settings className="h-5 w-5" />
          </NavLink>
        </div>
      </header>

      <main className="min-w-0 pb-24 lg:pb-0">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <FocusWatcher />

      {/* Navegação inferior mobile */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {NAV.filter((n) => n.mobile).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              clsx(
                'relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium',
                isActive ? 'text-accent' : 'text-muted',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
            {item.to === '/app/revisao' && reviewsDue > 0 && (
              <span className="absolute right-[calc(50%-18px)] top-1.5 h-2 w-2 rounded-full bg-accent" />
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 text-sm font-medium text-accent">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[15px] text-muted text-pretty">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={clsx('mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10', className)}
    >
      {children}
    </div>
  );
}
