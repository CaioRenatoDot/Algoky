import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // node:sqlite é um módulo nativo do Node: não deve passar pelo bundler.
    server: { deps: { external: [/^node:/] } },
  },
});
