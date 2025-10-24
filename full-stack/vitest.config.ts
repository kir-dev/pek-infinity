import viteTsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    globals: true,
    environment: 'node',
    root: './',
  },
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
  esbuild: {
    target: 'ES2022',
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        ...({ emitDecoratorMetadata: true } as any),
      },
    },
  },
});
