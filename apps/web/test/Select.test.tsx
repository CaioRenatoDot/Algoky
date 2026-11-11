import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Select, type SelectOption } from '../src/components/ui/Select.tsx';

beforeAll(() => {
  // jsdom não implementa scrollIntoView.
  Element.prototype.scrollIntoView = () => {};
});
afterEach(cleanup);

const OPTIONS: SelectOption[] = [
  { value: '', label: 'Todos' },
  { value: 'two-pointers', label: 'Two Pointers', group: 'Fundamentos' },
  { value: 'sliding-window', label: 'Sliding Window', group: 'Fundamentos' },
  { value: 'trie', label: 'Trie', group: 'Estruturas' },
];

function Harness({ searchable = false }: { searchable?: boolean }) {
  const [value, setValue] = useState('');
  return (
    <>
      <Select
        label="Padrão"
        value={value}
        onChange={setValue}
        options={OPTIONS}
        searchable={searchable}
      />
      <output data-testid="value">{value}</output>
    </>
  );
}

const button = () => screen.getByRole('button', { name: 'Padrão' });
const value = () => screen.getByTestId('value').textContent;

describe('Select', () => {
  it('mostra o rótulo da opção selecionada e abre a lista com grupos', () => {
    render(<Harness />);
    expect(button().textContent).toContain('Todos');
    fireEvent.click(button());
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(screen.getByText('Fundamentos')).toBeTruthy();
    expect(button().getAttribute('aria-expanded')).toBe('true');
  });

  it('seleciona com o mouse e fecha', () => {
    render(<Harness />);
    fireEvent.click(button());
    fireEvent.click(screen.getByRole('option', { name: 'Trie' }));
    expect(value()).toBe('trie');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('navega pelo teclado: abrir, setas, Enter e Esc', () => {
    render(<Harness />);
    fireEvent.keyDown(button(), { key: 'ArrowDown' });
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    fireEvent.keyDown(list, { key: 'Enter' });
    expect(value()).toBe('sliding-window');

    fireEvent.keyDown(button(), { key: 'Enter' });
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(value()).toBe('sliding-window');
  });

  it('digitar pula para a opção que começa com o texto', () => {
    render(<Harness />);
    fireEvent.click(button());
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 't' });
    fireEvent.keyDown(list, { key: 'r' });
    fireEvent.keyDown(list, { key: 'Enter' });
    expect(value()).toBe('trie');
  });

  it('filtra pela busca, sem acento, e seleciona o primeiro resultado com Enter', () => {
    render(<Harness searchable />);
    fireEvent.click(button());
    const search = screen.getByRole('textbox', { name: 'Buscar em Padrão' });
    act(() => {
      fireEvent.change(search, { target: { value: 'slíding' } });
    });
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Sliding Window']);
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(value()).toBe('sliding-window');
  });

  it('fecha ao clicar fora', () => {
    render(<Harness />);
    fireEvent.click(button());
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
