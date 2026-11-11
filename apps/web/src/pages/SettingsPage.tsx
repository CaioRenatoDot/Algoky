import { TEMPLATE_LANGUAGES, type TemplateLanguage, type User } from '@algoky/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Monitor, Moon, Sun, Upload } from 'lucide-react';
import { useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Page, PageHeader } from '../components/AppShell.tsx';
import { Button, buttonClass } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Field, Input, Select } from '../components/ui/Field.tsx';
import { PageLoader } from '../components/ui/Feedback.tsx';
import { Segmented } from '../components/ui/Segmented.tsx';
import { api, errorMessage } from '../lib/api.ts';
import { keys, useMe, useUpdateSettings } from '../lib/queries.ts';
import { useTheme, type ThemePreference } from '../lib/theme.ts';

const LANG_LABEL: Record<TemplateLanguage, string> = {
  python: 'Python',
  typescript: 'TypeScript',
  java: 'Java',
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="grid gap-6 p-6 md:grid-cols-[240px_1fr]">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="min-w-0 space-y-5">{children}</div>
    </Card>
  );
}

function ProfileForm({ me }: { me: User }) {
  const update = useUpdateSettings();
  const [displayName, setDisplayName] = useState(me.displayName);
  const [leetcode, setLeetcode] = useState(me.leetcodeUsername ?? '');
  const dirty = displayName !== me.displayName || leetcode !== (me.leetcodeUsername ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    update.mutate(
      { displayName: displayName.trim(), leetcodeUsername: leetcode.trim() || null },
      {
        onSuccess: () => toast.success('Perfil atualizado'),
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Nome de exibição" htmlFor="displayName">
        <Input
          id="displayName"
          value={displayName}
          maxLength={60}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </Field>
      <Field
        label="Usuário do LeetCode"
        htmlFor="leetcode"
        hint={
          me.leetcodeUsername ? (
            <a
              href={`https://leetcode.com/u/${me.leetcodeUsername}/`}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              Ver perfil no LeetCode
            </a>
          ) : (
            'Opcional. Usado para o link do seu perfil.'
          )
        }
      >
        <Input
          id="leetcode"
          value={leetcode}
          maxLength={40}
          onChange={(e) => setLeetcode(e.target.value)}
          placeholder="seu-usuario"
        />
      </Field>
      <Button type="submit" disabled={!dirty || !displayName.trim()} loading={update.isPending}>
        Salvar perfil
      </Button>
    </form>
  );
}

function StudySettings({ me }: { me: User }) {
  const update = useUpdateSettings();
  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone');
    } catch {
      return [me.timezone];
    }
  }, [me.timezone]);
  const [goal, setGoal] = useState(me.dailyGoal);
  const commitGoal = () => {
    if (goal !== me.dailyGoal) save({ dailyGoal: goal });
  };
  const save = (patch: Parameters<typeof update.mutate>[0]) =>
    update.mutate(patch, {
      onSuccess: () => toast.success('Preferência salva'),
      onError: (err) => toast.error(errorMessage(err)),
    });

  return (
    <>
      <Field
        label="Meta diária"
        hint="Quantos problemas (resoluções + revisões) você quer fazer por dia."
      >
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={10}
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            onPointerUp={commitGoal}
            onKeyUp={commitGoal}
            onBlur={commitGoal}
            className="flex-1 accent-[var(--accent)]"
            aria-label="Meta diária"
          />
          <span className="w-8 text-right text-lg font-semibold tabular-nums">{goal}</span>
        </div>
      </Field>
      <Field label="Linguagem dos templates">
        <Segmented
          label="Linguagem dos templates"
          value={me.preferredLanguage}
          onChange={(v) => save({ preferredLanguage: v })}
          options={TEMPLATE_LANGUAGES.map((l) => ({ value: l, label: LANG_LABEL[l] }))}
        />
      </Field>
      <Field
        label="Fuso horário"
        htmlFor="tz"
        hint="Define quando o seu dia vira (streak, meta e revisões)."
      >
        <Select id="tz" value={me.timezone} onChange={(e) => save({ timezone: e.target.value })}>
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replaceAll('_', ' ')}
            </option>
          ))}
        </Select>
      </Field>
    </>
  );
}

function ThemeSetting() {
  const { pref, setPref } = useTheme();
  return (
    <Segmented<ThemePreference>
      label="Tema"
      value={pref}
      onChange={setPref}
      options={[
        {
          value: 'system',
          label: (
            <span className="inline-flex items-center gap-1.5">
              <Monitor className="h-4 w-4" /> Sistema
            </span>
          ),
        },
        {
          value: 'light',
          label: (
            <span className="inline-flex items-center gap-1.5">
              <Sun className="h-4 w-4" /> Claro
            </span>
          ),
        },
        {
          value: 'dark',
          label: (
            <span className="inline-flex items-center gap-1.5">
              <Moon className="h-4 w-4" /> Escuro
            </span>
          ),
        },
      ]}
    />
  );
}

function DataSettings() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ name: string; data: unknown } | null>(null);
  const importMut = useMutation({
    mutationFn: (data: unknown) => api.post<{ ok: true }>('/api/me/import', data),
    onSuccess: () => {
      setPending(null);
      void qc.invalidateQueries();
      toast.success('Progresso importado com sucesso');
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPending({ name: file.name, data: JSON.parse(await file.text()) });
    } catch {
      toast.error('Arquivo inválido: não é um JSON.');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <a href="/api/me/export" download className={buttonClass('secondary')}>
          <Download className="h-4 w-4" /> Exportar progresso (JSON)
        </a>
        <Button
          variant="secondary"
          icon={<Upload className="h-4 w-4" />}
          onClick={() => fileRef.current?.click()}
        >
          Importar backup
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>
      {pending && (
        <div
          className="rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm"
          role="alert"
        >
          <p className="font-medium">Importar “{pending.name}”?</p>
          <p className="mt-1 text-muted">
            Isso substitui todo o seu progresso atual pelos dados do arquivo. Não dá para desfazer.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              loading={importMut.isPending}
              onClick={() => importMut.mutate(pending.data)}
            >
              Substituir meu progresso
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const change = useMutation({
    mutationFn: () =>
      api.post<void>('/api/me/password', { currentPassword: current, newPassword: next }),
    onSuccess: () => {
      setCurrent('');
      setNext('');
      toast.success('Senha alterada', { description: 'As outras sessões foram encerradas.' });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        change.mutate();
      }}
      className="space-y-4"
    >
      <Field label="Senha atual" htmlFor="current-password">
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </Field>
      <Field label="Nova senha" htmlFor="new-password" hint="Pelo menos 8 caracteres.">
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </Field>
      <Button
        type="submit"
        variant="secondary"
        disabled={!current || next.length < 8}
        loading={change.isPending}
      >
        Alterar senha
      </Button>
    </form>
  );
}

function DeleteAccount() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const del = useMutation({
    mutationFn: () => api.delete<void>('/api/me', { password }),
    onSuccess: () => {
      qc.clear();
      qc.setQueryData(keys.me, null);
      navigate('/', { replace: true });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  if (!open)
    return (
      <Button variant="danger" onClick={() => setOpen(true)}>
        Excluir minha conta
      </Button>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        del.mutate();
      }}
      className="space-y-3 rounded-xl border border-hard/40 bg-hard/5 p-4"
    >
      <p className="text-sm">
        Todo o seu progresso, notas e conquistas serão apagados <strong>permanentemente</strong>.
        Considere exportar antes.
      </p>
      <Field label="Confirme com sua senha" htmlFor="delete-password">
        <Input
          id="delete-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" variant="danger" disabled={!password} loading={del.isPending}>
          Excluir definitivamente
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const { data: me } = useMe();
  if (!me) return <PageLoader />;
  return (
    <Page className="max-w-4xl">
      <PageHeader
        eyebrow="Configurações"
        title="Sua conta"
        description={`Conectado como @${me.username}.`}
      />
      <div className="mt-8 space-y-6">
        <Section title="Perfil">
          <ProfileForm me={me} />
        </Section>
        <Section title="Estudo" description="Ajuste a plataforma ao seu ritmo.">
          <StudySettings me={me} />
        </Section>
        <Section title="Aparência">
          <ThemeSetting />
        </Section>
        <Section
          title="Seus dados"
          description="Faça backup do seu progresso ou leve-o para outra instância."
        >
          <DataSettings />
        </Section>
        <Section title="Segurança">
          <PasswordForm />
        </Section>
        <Section title="Zona de perigo">
          <DeleteAccount />
        </Section>
      </div>
    </Page>
  );
}
