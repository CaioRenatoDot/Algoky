import { addDays, weekday, type HeatmapDay } from '@algoky/shared';
import { useMemo, useState } from 'react';
import { formatLocalDate, plural } from '../lib/format.ts';

const WEEKS = 53;
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Intensidade por número de atividades no dia (0 a 4). */
export function heatLevel(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

interface Cell {
  date: string;
  count: number;
  xp: number;
  future: boolean;
}

export function buildHeatmapGrid(days: HeatmapDay[], today: string): Cell[][] {
  const byDate = new Map(days.map((d) => [d.date, d]));
  // Última coluna termina no sábado da semana atual; a primeira começa no domingo.
  const end = addDays(today, 6 - weekday(today));
  const start = addDays(end, -(WEEKS * 7 - 1));
  const weeks: Cell[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const col: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      const entry = byDate.get(date);
      col.push({ date, count: entry?.count ?? 0, xp: entry?.xp ?? 0, future: date > today });
    }
    weeks.push(col);
  }
  return weeks;
}

export function Heatmap({ days, today }: { days: HeatmapDay[]; today: string }) {
  const weeks = useMemo(() => buildHeatmapGrid(days, today), [days, today]);
  const [hover, setHover] = useState<Cell | null>(null);
  const activeDays = days.filter((d) => d.count > 0).length;
  const total = days.reduce((s, d) => s + d.count, 0);

  const monthLabels = weeks.map((col, i) => {
    const first = col[0]!.date;
    const prev = i > 0 ? weeks[i - 1]![0]!.date : null;
    return !prev || first.slice(5, 7) !== prev.slice(5, 7)
      ? MONTHS[Number(first.slice(5, 7)) - 1]
      : '';
  });

  return (
    <div>
      <div className="overflow-x-auto pb-1 [scrollbar-width:thin]">
        <div
          className="relative inline-grid min-w-full gap-[3px]"
          style={{ gridTemplateColumns: `20px repeat(${WEEKS}, minmax(10px, 1fr))` }}
          role="img"
          aria-label={`Atividade no último ano: ${plural(activeDays, 'dia ativo', 'dias ativos')}, ${plural(total, 'atividade')}.`}
          onMouseLeave={() => setHover(null)}
        >
          <span />
          {monthLabels.map((m, i) => (
            <span key={i} className="h-4 text-[10px] leading-4 text-subtle">
              {m}
            </span>
          ))}
          {weeks[0]!.map((_, row) => (
            <Row key={row} row={row} weeks={weeks} onHover={setHover} />
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span className="min-h-4" aria-live="polite">
          {hover && !hover.future
            ? `${formatLocalDate(hover.date, true)}: ${hover.count ? `${plural(hover.count, 'atividade')} · ${hover.xp} XP` : 'sem atividade'}`
            : `${plural(activeDays, 'dia ativo', 'dias ativos')} no último ano`}
        </span>
        <span className="flex items-center gap-1.5">
          Menos
          {[0, 1, 2, 3, 4].map((l) => (
            <span
              key={l}
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ background: `var(--heat-${l})` }}
            />
          ))}
          Mais
        </span>
      </div>
    </div>
  );
}

const DAY_LABELS = ['', 'seg', '', 'qua', '', 'sex', ''];

function Row({
  row,
  weeks,
  onHover,
}: {
  row: number;
  weeks: Cell[][];
  onHover: (c: Cell) => void;
}) {
  return (
    <>
      <span className="text-[10px] leading-[10px] text-subtle">{DAY_LABELS[row]}</span>
      {weeks.map((col) => {
        const cell = col[row]!;
        return (
          <span
            key={cell.date}
            onMouseEnter={() => onHover(cell)}
            className="aspect-square rounded-[3px] transition-transform hover:scale-125"
            style={{
              background: cell.future ? 'transparent' : `var(--heat-${heatLevel(cell.count)})`,
            }}
          />
        );
      })}
    </>
  );
}
