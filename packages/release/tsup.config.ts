import { defineConfig } from 'tsup';

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isProduction = NODE_ENV === 'production';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli/entry.ts',
  },
  env: {
    NODE_ENV,
  },
  format: ['cjs'],
  dts: true,
  sourcemap: !isProduction,
  treeshake: isProduction,
  minify: isProduction,
  clean: true,
});
