import type { TemplateLanguage } from '@algoky/shared';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from './ui/Feedback.tsx';

type CM = Awaited<ReturnType<typeof loadCodeMirror>>;

/** Carrega o CodeMirror sob demanda (só quem abre o editor baixa o código dele). */
async function loadCodeMirror() {
  const [cm, state, view, language, highlight, commands, python, javascript, java] =
    await Promise.all([
      import('codemirror'),
      import('@codemirror/state'),
      import('@codemirror/view'),
      import('@codemirror/language'),
      import('@lezer/highlight'),
      import('@codemirror/commands'),
      import('@codemirror/lang-python'),
      import('@codemirror/lang-javascript'),
      import('@codemirror/lang-java'),
    ]);
  const { tags: t } = highlight;
  // Cores de sintaxe vêm de CSS variables: o editor acompanha o tema claro/escuro.
  const highlightStyle = language.HighlightStyle.define([
    {
      tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.modifier],
      color: 'var(--code-keyword)',
    },
    { tag: [t.string, t.special(t.string), t.regexp], color: 'var(--code-string)' },
    {
      tag: [t.comment, t.lineComment, t.blockComment],
      color: 'var(--code-comment)',
      fontStyle: 'italic',
    },
    { tag: [t.number, t.bool, t.null, t.atom], color: 'var(--code-number)' },
    {
      tag: [
        t.function(t.variableName),
        t.function(t.propertyName),
        t.definition(t.function(t.variableName)),
      ],
      color: 'var(--code-function)',
    },
    { tag: [t.typeName, t.className, t.namespace], color: 'var(--code-type)' },
    { tag: [t.definition(t.variableName)], color: 'var(--text)' },
  ]);
  const theme = view.EditorView.theme({
    '&': {
      height: '100%',
      backgroundColor: 'var(--surface)',
      color: 'var(--text)',
      fontSize: '13.5px',
    },
    '.cm-scroller': {
      fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace",
      lineHeight: '1.65',
    },
    '.cm-content': { padding: '14px 0', caretColor: 'var(--accent)' },
    '.cm-gutters': {
      backgroundColor: 'var(--surface)',
      color: 'var(--subtle)',
      border: 'none',
      paddingRight: '6px',
    },
    '.cm-activeLine, .cm-activeLineGutter': {
      backgroundColor: 'color-mix(in srgb, var(--surface-2) 70%, transparent)',
    },
    '.cm-cursor': { borderLeftColor: 'var(--accent)', borderLeftWidth: '2px' },
    '&.cm-focused': { outline: 'none' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
      backgroundColor: 'var(--accent-soft) !important',
    },
    '.cm-matchingBracket': {
      backgroundColor: 'var(--surface-3)',
      outline: '1px solid var(--border-strong)',
    },
    '.cm-tooltip': {
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
    },
    '.cm-tooltip-autocomplete ul li[aria-selected]': {
      backgroundColor: 'var(--surface-2)',
      color: 'var(--text)',
    },
    '.cm-panels': { backgroundColor: 'var(--surface-2)', color: 'var(--text)' },
  });
  const languages: Record<TemplateLanguage, () => import('@codemirror/state').Extension> = {
    python: () => python.python(),
    typescript: () => javascript.javascript({ typescript: true }),
    java: () => java.java(),
  };
  return { cm, state, view, language, commands, highlightStyle, theme, languages };
}

let loader: Promise<CM> | undefined;

export function CodeEditor({
  value,
  onChange,
  language,
  label = 'Editor de código',
}: {
  value: string;
  onChange: (value: string) => void;
  language: TemplateLanguage;
  label?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const viewRef = useRef<import('@codemirror/view').EditorView | null>(null);
  const langCompartment = useRef<import('@codemirror/state').Compartment | null>(null);
  const cmRef = useRef<CM | null>(null);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Cria o editor uma única vez.
  useEffect(() => {
    let destroyed = false;
    void (loader ??= loadCodeMirror()).then((cm) => {
      if (destroyed || !host.current) return;
      cmRef.current = cm;
      const compartment = new cm.state.Compartment();
      langCompartment.current = compartment;
      viewRef.current = new cm.view.EditorView({
        parent: host.current,
        state: cm.state.EditorState.create({
          doc: value,
          extensions: [
            cm.cm.basicSetup,
            cm.view.keymap.of([cm.commands.indentWithTab]),
            cm.state.EditorState.tabSize.of(4),
            compartment.of(cm.languages[language]()),
            cm.language.syntaxHighlighting(cm.highlightStyle),
            cm.theme,
            cm.view.EditorView.contentAttributes.of({ 'aria-label': label }),
            cm.view.EditorView.updateListener.of((u) => {
              if (u.docChanged) onChangeRef.current(u.state.doc.toString());
            }),
          ],
        }),
      });
      setReady(true);
    });
    return () => {
      destroyed = true;
      viewRef.current?.destroy();
      viewRef.current = null;
    };
    // O documento inicial só importa na criação; mudanças externas são tratadas abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Troca de linguagem sem recriar o editor.
  useEffect(() => {
    const view = viewRef.current;
    const cm = cmRef.current;
    if (!view || !cm || !langCompartment.current) return;
    view.dispatch({ effects: langCompartment.current.reconfigure(cm.languages[language]()) });
  }, [language, ready]);

  // Valor alterado de fora (ex.: "inserir template").
  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === value) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
  }, [value]);

  return (
    <div className="relative h-full min-h-[420px]">
      {!ready && (
        <div className="absolute inset-0 grid place-items-center">
          <Spinner />
        </div>
      )}
      <div ref={host} className="h-full" />
    </div>
  );
}
