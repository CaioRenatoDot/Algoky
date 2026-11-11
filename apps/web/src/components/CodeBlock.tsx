import type { TemplateLanguage } from '@algoky/shared';
import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { HighlighterCore } from 'shiki/core';

let highlighter: Promise<HighlighterCore> | undefined;

/** Carrega o Shiki sob demanda, só com as linguagens e temas usados. */
function getHighlighter() {
  highlighter ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import('shiki/core'),
      import('@shikijs/engine-javascript'),
    ]);
    return createHighlighterCore({
      engine: createJavaScriptRegexEngine(),
      themes: [
        import('@shikijs/themes/github-light'),
        import('@shikijs/themes/github-dark-dimmed'),
      ],
      langs: [
        import('@shikijs/langs/python'),
        import('@shikijs/langs/typescript'),
        import('@shikijs/langs/java'),
      ],
    });
  })();
  return highlighter;
}

export function CodeBlock({ code, language }: { code: string; language: TemplateLanguage }) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    void getHighlighter().then((h) => {
      if (!alive) return;
      setHtml(
        h.codeToHtml(code, {
          lang: language,
          themes: { light: 'github-light', dark: 'github-dark-dimmed' },
          defaultColor: 'light',
        }),
      );
    });
    return () => {
      alive = false;
    };
  }, [code, language]);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative rounded-xl border border-border bg-surface-2">
      <button
        onClick={() => void copy()}
        className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-muted opacity-0 transition-opacity hover:text-text focus:opacity-100 group-hover:opacity-100"
        aria-label="Copiar código"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
      <div className="overflow-x-auto p-4 text-[13px] leading-relaxed [&_pre]:font-mono">
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="font-mono text-text">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
