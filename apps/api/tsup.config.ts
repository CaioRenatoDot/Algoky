import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  clean: true,
  sourcemap: true,
  // O pacote compartilhado é código-fonte TS: embutimos no bundle.
  noExternal: ['@algoky/shared'],
  // Mantém o prefixo node: (node:sqlite só existe com ele).
  removeNodeProtocol: false,
});
