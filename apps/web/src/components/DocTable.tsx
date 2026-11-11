import type { ReactNode } from 'react';
import { RichText } from './RichText.tsx';

/** Tabela de conteúdo (guias e referência), com rolagem horizontal no mobile. */
export function DocTable({
  head,
  rows,
  mono = false,
}: {
  head: string[];
  rows: Array<Array<string | ReactNode>>;
  mono?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={
                    j === 0
                      ? 'px-4 py-2.5 font-medium'
                      : `px-4 py-2.5 text-muted ${mono ? 'font-mono text-[13px]' : ''}`
                  }
                >
                  {typeof cell === 'string' ? <RichText text={cell} /> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
