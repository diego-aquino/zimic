import { Options, defineConfig } from 'tsup';

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isProductionBuild = NODE_ENV === 'production';

const sharedConfig: Options = {
  format: ['cjs', 'esm'],
  dts: true,
  bundle: true,
  splitting: false,
  sourcemap: true,
  treeshake: isProductionBuild,
  minify: false,
  clean: true,
};

export default defineConfig([
  {
    ...sharedConfig,
    entry: {
      index: 'src/index.ts',
      interceptor: 'src/interceptor/index.ts',
    },
  },
  {
    ...sharedConfig,
    platform: 'node',
    entry: {
      cli: 'src/cli/index.ts',
      'scripts/postinstall': 'scripts/postinstall.ts',
    },
    format: ['cjs'],
    dts: false,
  },
]);
