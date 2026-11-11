import { PATTERNS, PROBLEMS } from '@algoky/shared';
import { clsx } from 'clsx';
import {
  ArrowRight,
  Brain,
  CalendarDays,
  Code2,
  Flame,
  ListChecks,
  Map as MapIcon,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router';
import { GitHubIcon, LinkedInIcon } from '../components/BrandIcons.tsx';
import { Logo } from '../components/Logo.tsx';
import { ButtonLink } from '../components/ui/Button.tsx';
import { ProgressRing } from '../components/ui/Progress.tsx';
import { useMe } from '../lib/queries.ts';

const essentials = PROBLEMS.filter((p) => p.essential).length;

const FEATURES = [
  {
    icon: MapIcon,
    title: 'Trilha guiada',
    text: `${PATTERNS.length} padrões em ordem pedagógica, do hashing à programação dinâmica, com pré-requisitos claros.`,
  },
  {
    icon: ListChecks,
    title: 'Problemas curados',
    text: `${PROBLEMS.length} problemas gratuitos do LeetCode, ${essentials} marcados como essenciais para não se perder.`,
  },
  {
    icon: Brain,
    title: 'Revisão espaçada',
    text: 'Cada problema resolvido volta no momento certo para você não esquecer a solução na entrevista.',
  },
  {
    icon: Flame,
    title: 'Streak, XP e níveis',
    text: 'Meta diária, sequência de dias e 18 conquistas para transformar estudo em hábito.',
  },
  {
    icon: Code2,
    title: 'Templates prontos',
    text: 'Cada padrão vem com explicação, sinais de quando usar, armadilhas e código em Python, TypeScript e Java.',
  },
  {
    icon: Timer,
    title: 'Modo foco',
    text: 'Timer de sessões ligado ao problema que você está resolvendo, contando para a meta do dia.',
  },
];

const STEPS = [
  {
    title: 'Aprenda o padrão',
    text: 'Leia a explicação, veja o visualizador e entenda o template antes de codar.',
  },
  {
    title: 'Pratique no LeetCode',
    text: 'Resolva os problemas da trilha e registre o status, as notas e a sua confiança.',
  },
  {
    title: 'Revise no momento certo',
    text: 'O Algoky agenda revisões e mantém seu streak vivo. Constância vence intensidade.',
  },
];

// Heatmap ilustrativo e determinístico para a prévia do produto.
const PREVIEW_HEAT = Array.from({ length: 7 * 18 }, (_, i) => {
  const v = Math.sin(i * 12.9898) * 43758.5453;
  const r = v - Math.floor(v);
  const ramp = i / (7 * 18); // mais atividade nas semanas recentes
  if (r < 0.55 - ramp * 0.35) return 0;
  return Math.min(4, 1 + Math.floor(((r - 0.2) / 0.8) * 2 + ramp * 1.5));
});

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-accent/15 via-transparent to-easy/10 blur-2xl" />
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted">Boa noite</p>
            <p className="font-semibold">Seu progresso hoje</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-sm font-semibold text-accent">
            <Flame className="h-4 w-4 fill-current" /> 12 dias
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-xl bg-surface-2 p-3">
            <ProgressRing value={2} max={3} size={56} stroke={6}>
              <span className="text-sm font-semibold">2/3</span>
            </ProgressRing>
            <span className="mt-2 text-xs text-muted">Meta diária</span>
          </div>
          <div className="flex flex-col justify-center rounded-xl bg-surface-2 p-3">
            <span className="text-2xl font-semibold tabular-nums">47</span>
            <span className="text-xs text-muted">resolvidos</span>
          </div>
          <div className="flex flex-col justify-center rounded-xl bg-surface-2 p-3">
            <span className="text-2xl font-semibold tabular-nums">Nv 6</span>
            <span className="text-xs text-muted">Explorador</span>
          </div>
        </div>
        <div className="mt-5 grid grid-flow-col grid-rows-7 gap-[3px]">
          {PREVIEW_HEAT.map((l, i) => (
            <span
              key={i}
              className="aspect-square rounded-[3px]"
              style={{ background: `var(--heat-${l})` }}
            />
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between rounded-xl border border-border p-3">
          <div>
            <p className="text-xs text-muted">Próximo da trilha · Two Pointers</p>
            <p className="font-medium">15. 3Sum</p>
          </div>
          <span className="rounded-md bg-medium/14 px-2 py-0.5 text-xs font-medium text-medium-text">
            Medium
          </span>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-4 hidden animate-fade-up items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-card sm:flex">
        <Trophy className="h-4 w-4 text-medium" />{' '}
        <span className="font-medium">Semana perfeita</span>
      </div>
      <div className="absolute -right-3 -top-4 hidden animate-fade-up items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-success shadow-card sm:flex">
        +20 XP
      </div>
    </div>
  );
}

export function LandingPage() {
  const { data: me } = useMe();
  const cta = me
    ? { to: '/app', label: 'Ir para o painel' }
    : { to: '/cadastro', label: 'Começar agora' };

  return (
    <div className="overflow-x-clip">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Algoky, início">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted md:flex" aria-label="Seções">
            <a href="#recursos" className="hover:text-text">
              Recursos
            </a>
            <a href="#como-funciona" className="hover:text-text">
              Como funciona
            </a>
            <a href="#padroes" className="hover:text-text">
              Padrões
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {!me && (
              <ButtonLink to="/entrar" variant="ghost" size="sm">
                Entrar
              </ButtonLink>
            )}
            <ButtonLink to={cta.to} size="sm">
              {me ? 'Abrir app' : 'Criar conta'}
            </ButtonLink>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              {PATTERNS.length} padrões · {PROBLEMS.length} problemas · revisão espaçada
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
              Transforme LeetCode em <span className="text-accent">hábito</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted text-pretty">
              O Algoky organiza os padrões de algoritmos que aparecem nas entrevistas, diz o que
              estudar a seguir e acompanha sua constância com metas, streak e revisões no momento
              certo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                to={cta.to}
                size="lg"
                icon={<ArrowRight className="h-4 w-4" />}
                className="flex-row-reverse"
              >
                {cta.label}
              </ButtonLink>
              <a
                href="#padroes"
                className="inline-flex h-12 items-center rounded-lg px-5 font-medium text-muted hover:text-text"
              >
                Ver os padrões
              </a>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                [String(PATTERNS.length), 'padrões'],
                [String(PROBLEMS.length), 'problemas'],
                ['3', 'linguagens'],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-2xl font-semibold tabular-nums">{n}</dd>
                  <dd className="text-sm text-muted">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ProductPreview />
        </section>

        <section id="recursos" className="border-y border-border bg-surface/50">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight">
                Tudo o que você precisa para estudar com constância
              </h2>
              <p className="mt-3 text-muted">
                Menos tempo decidindo o que fazer, mais tempo resolvendo problemas.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-card"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">Como funciona</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="relative rounded-2xl border border-border bg-surface p-6"
              >
                <span className="font-mono text-sm font-semibold text-accent">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Target, text: 'Meta diária ajustável' },
              { icon: CalendarDays, text: 'Heatmap de 12 meses' },
              { icon: Trophy, text: '18 conquistas' },
            ].map((x) => (
              <div
                key={x.text}
                className="flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-3 text-sm font-medium"
              >
                <x.icon className="h-4 w-4 text-accent" /> {x.text}
              </div>
            ))}
          </div>
        </section>

        <section id="padroes" className="border-t border-border bg-surface/50">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight">A trilha completa</h2>
            <p className="mt-3 max-w-2xl text-muted">
              Os padrões que resolvem a grande maioria dos problemas de entrevista, na ordem em que
              fazem sentido.
            </p>
            <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PATTERNS.map((p) => (
                <li
                  key={p.id}
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
                >
                  <span
                    className={clsx(
                      'grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-xs font-semibold',
                      p.order <= 7
                        ? 'bg-easy/12 text-easy-text'
                        : p.order <= 15
                          ? 'bg-medium/14 text-medium-text'
                          : 'bg-hard/12 text-hard-text',
                    )}
                  >
                    {p.order}
                  </span>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="mt-0.5 text-sm text-muted">{p.tagline}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Um problema por dia muda tudo.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Crie sua conta, defina sua meta e comece pela trilha. Seu eu da entrevista agradece.
          </p>
          <ButtonLink to={cta.to} size="lg" className="mt-8">
            {cta.label}
          </ButtonLink>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span>© {new Date().getFullYear()} · Código aberto (MIT)</span>
          </div>
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
              aria-label="GitHub"
              className="hover:text-text"
            >
              <GitHubIcon className="h-5 w-5" />
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
    </div>
  );
}
